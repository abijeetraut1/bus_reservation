document.addEventListener('DOMContentLoaded', function() {
    const socket = io('http://localhost:8000');
    let driverMap, userMarkers = {}, routeControl, currentRoute = null;

    // Initialize map for drivers/conductors
    function initDriverMap() {
        if (typeof L === 'undefined') {
            return setTimeout(initDriverMap, 100);
        }
        
        driverMap = L.map('driverMap').setView([0, 0], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(driverMap);

        // Add Routing Machine
        L.Routing.control({
            waypoints: [],
            routeWhileDragging: true,
            showAlternatives: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            lineOptions: {styles: [{color: 'green', opacity: 0.7, weight: 5}]}
        }).addTo(driverMap);
    }

    initDriverMap();

    // Handle geolocation for driver/conductor
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            position => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                
                // Update driver's own marker
                if (!window.driverMarker) {
                    window.driverMarker = L.marker([location.lat, location.lng], {
                        icon: L.divIcon({
                            className: 'driver-marker',
                            html: '<div style="background-color: green; width: 20px; height: 20px; border-radius: 50%;"></div>',
                            iconSize: [20, 20]
                        })
                    }).addTo(driverMap).bindPopup("Your Vehicle");
                    
                    // Center map on first location
                    driverMap.setView([location.lat, location.lng], 13);
                } else {
                    window.driverMarker.setLatLng([location.lat, location.lng]);
                }

                // Send update to server
                socket.emit('locationUpdate', {
                    location: location
                });
            },
            error => {
                console.error("Geolocation error:", error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 5000
            }
        );
    }

    // Handle incoming user locations
    socket.on('userLocationUpdate', data => {
        if (!driverMap) return;
        
        const position = [data.location.lat, data.location.lng];
        
        // Update or create user marker
        if (!userMarkers[data.userId]) {
            userMarkers[data.userId] = L.marker(position, {
                icon: L.divIcon({
                    className: 'user-marker',
                    html: '<div style="background-color: blue; border-radius: 50%; width: 15px; height: 15px;"></div>',
                    iconSize: [15, 15]
                })
            }).addTo(driverMap)
              .bindPopup(`${data.name} (User)`)
              .on('click', () => showRouteToUser(data.userId));
        } else {
            userMarkers[data.userId].setLatLng(position);
        }
    });

    // Show route to a specific user
    function showRouteToUser(userId) {
        if (!window.driverMarker || !userMarkers[userId]) return;
        
        // Remove existing route if any
        if (routeControl) {
            driverMap.removeControl(routeControl);
        }
        
        const driverPos = window.driverMarker.getLatLng();
        const userPos = userMarkers[userId].getLatLng();
        
        routeControl = L.Routing.control({
            waypoints: [driverPos, userPos],
            routeWhileDragging: true,
            showAlternatives: false,
            lineOptions: {
                styles: [{color: 'green', opacity: 0.7, weight: 5}]
            }
        }).addTo(driverMap);
        
        currentRoute = userId;
    }

    // Handle user disconnections
    socket.on('userDisconnected', ({ userId }) => {
        if (userMarkers[userId]) {
            driverMap.removeLayer(userMarkers[userId]);
            delete userMarkers[userId];
            
            // Remove route if it was to this user
            if (currentRoute === userId && routeControl) {
                driverMap.removeControl(routeControl);
                routeControl = null;
                currentRoute = null;
            }
        }
    });

    // Center map controls
    document.getElementById('centerMeBtn')?.addEventListener('click', () => {
        if (window.driverMarker) {
            driverMap.setView(window.driverMarker.getLatLng(), 13);
        }
    });

    document.getElementById('centerAllBtn')?.addEventListener('click', () => {
        const markers = Object.values(userMarkers);
        if (markers.length > 0 && window.driverMarker) {
            const group = new L.featureGroup([window.driverMarker, ...markers]);
            driverMap.fitBounds(group.getBounds().pad(0.2));
        }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        if (routeControl) {
            driverMap.removeControl(routeControl);
        }
    });
});
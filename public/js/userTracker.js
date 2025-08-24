document.addEventListener('DOMContentLoaded', () => {
    const socket = io('http://localhost:8000');
    let map;
    let busMarker;
    let userMarker;
    let routeControl; // Declare routeControl

    const bus_slug_to_track = document.body.dataset.busSlug;

    if (!bus_slug_to_track) {
        console.error('Bus slug is not defined. Tracking cannot start.');
        const mapDiv = document.getElementById('map');
        if (mapDiv) {
            mapDiv.innerHTML = '<p style="text-align: center; padding-top: 50px;">Could not identify the bus to track. Please go back and try again.</p>';
        }
        return;
    }

    socket.on('connect', () => {
        console.log("Socket connected");
        console.log(`Attempting to track bus: ${bus_slug_to_track}`);
        socket.emit('trackBus', bus_slug_to_track);
    });

    function initMap(lat, lng) {
        if (!map) {
            map = L.map('map').setView([lat, lng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            showUserLocation();
        }
    }

    function showUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(position => { // Use watchPosition for continuous updates
                const userPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                if (!userMarker) {
                    userMarker = L.marker([userPos.lat, userPos.lng], {
                        icon: L.divIcon({
                            className: 'user-marker',
                            html: '<div style="background-color: blue; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
                            iconSize: [22, 22]
                        })
                    }).addTo(map)
                      .bindPopup('Your Location')
                      .openPopup();
                } else {
                    userMarker.setLatLng([userPos.lat, userPos.lng]);
                }

                // Emit user location to the server
                socket.emit('userLocationUpdate', { busId: bus_slug_to_track, location: userPos });

                updateRoute();

            }, () => {
                console.log('Could not get user location.');
            }, {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 5000
            });
        }
    }

    function updateRoute() {
        if (busMarker && userMarker) {
            if (routeControl) {
                map.removeControl(routeControl);
            }
            routeControl = L.Routing.control({
                waypoints: [
                    L.latLng(userMarker.getLatLng().lat, userMarker.getLatLng().lng),
                    L.latLng(busMarker.getLatLng().lat, busMarker.getLatLng().lng)
                ],
                routeWhileDragging: true,
                showAlternatives: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: false, // We will manage fitting the bounds manually
                lineOptions: {styles: [{color: 'blue', opacity: 0.6, weight: 6}]}
            }).addTo(map);

            // Center map between user and bus
            const group = new L.featureGroup([busMarker, userMarker]);
            map.fitBounds(group.getBounds().pad(0.5));
        }
    }

    socket.on('busLocationUpdate', (data) => {
        if (data.busId === bus_slug_to_track) {
            const { busId, location } = data;
            console.log(`Received update for Bus ${busId}:`, location);

            if (!map) {
                initMap(location.lat, location.lng);
            }

            const busPosition = [location.lat, location.lng];

            if (!busMarker) {
                busMarker = L.marker(busPosition, {
                    icon: L.divIcon({
                        className: 'bus-marker',
                        html: '<div style="background-color: red; width: 25px; height: 25px; border-radius: 50%;"></div>',
                        iconSize: [25, 25]
                    })
                }).addTo(map)
                  .bindPopup(`Bus ${busId}`)
                  .openPopup();
            } else {
                busMarker.setLatLng(busPosition);
            }

            updateRoute();
        }
    });

    setTimeout(() => {
        if (!map) {
            console.log("Initializing map with default location.");
            initMap(27.7172, 85.3240);
        }
    }, 2000);
});
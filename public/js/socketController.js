const socket = io('http://localhost:8000');

let mapInitialized = false;
let map;
let marker;
let locationData = [];

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(position => {
        const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        socket.emit('locationUpdate', location);
        console.log("My location:", location);
    }, error => {
        console.error("Geolocation error:", error);
    }, {
        enableHighAccuracy: true
    });
} else {
    alert("Geolocation is not supported by your browser.");
}

socket.on('connect', () => {
    console.log("Socket connected");
});

socket.on('broadcastLocation', data => {
    console.log("Live Location:", data);
    

    if (!mapInitialized) {
        map = L.map('map').setView([data.lat, data.lng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        marker = L.marker([data.lat, data.lng]).addTo(map);
        mapInitialized = true;
    } else {
        marker.setLatLng([data.lat, data.lng]);
        map.panTo([data.lat, data.lng]);
    }
});

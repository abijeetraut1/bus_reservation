navigator.geolocation.getCurrentPosition(getCurrentLocation);

function getCurrentLocation(position) {
    
    let {
        longitude,
        latitude
    } = position.coords;

    // let longitude = 26.4803;
    // let latitude = 87.2901;

    console.log(longitude, latitude);

    // var map = L.map('map').setView([latitude, longitude], 13);
    var map = L.map('map').setView([51.505, -0.09], 50);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // var marker = L.marker([latitude, longitude]).addTo(map);     // not important

    map.on('click', function (e) {
        let useCount = 1;
        console.log(e)
        // var newMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        if (useCount === 1) {
            L.Routing.control({
                    waypoints: [
                        // L.latLng(26.811869665166828, 87.28527786902535),  // dharan location   
                        L.latLng(latitude, longitude),
                        L.latLng(26.4803, 87.2901) // birathnagar location
                    ]
                })
                .addTo(map);
            useCount++;

        } else {
            alert('it sa')
            setTimeout(() => {
                L.Routing.control({
                        waypoints: [
                            L.latLng(26.811869665166828, 87.28527786902535), // dharan location   
                            L.latLng(latitude, longitude),
                            L.latLng(26.4803, 87.2901) // birathnagar location
                        ]
                    })
                    // .on('routesfound', function (e) {
                    //     var routes = e.routes;
                    //     console.log(routes);

                    //     // e.routes[0].coordinates.forEach(function (coord, index) {
                    //     //     setTimeout(function () {
                    //     //         // marker.setLatLng([coord.lat, coord.lng]);
                    //     //     }, 100 * index)
                    //     // })

                    // })
                    .addTo(map);
            }, 500);
        }
    });
}

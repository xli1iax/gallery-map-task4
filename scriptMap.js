var map = L.map('myMap').setView([51.505, -0.09], 5); // Initial center and zoom level
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let routeLine = null;
let currentWaypointIndex = 0;
let animationInterval = null;

fetch('photos.json')
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
    .then(data => {
        const photos = data.photos;

        function getIconPath(markerType) {
            switch (markerType) {
                case "food":
                    return 'icons/food.svg';
                case "street":
                    return 'icons/road.svg';
                case "church":
                    return 'icons/church.svg';
                case "palace":
                case "castle":
                    return 'icons/palace.svg';
                case "tower":
                    return 'icons/tower.svg';
                case "casino":
                    return 'icons/casino.svg';
                case "hotel":
                    return 'icons/hotel.svg';
                case "port":
                    return 'icons/port.svg';
                case "airport":
                    return 'icons/airport.svg';
                case "school":
                    return 'icons/school.svg';
                case "building":
                    return 'icons/building.svg';
                case "river":
                    return 'icons/river.svg';
                case "nature":
                    return 'icons/nature.svg';
                default:
                    return 'icons/building.svg';
            }
        }

        //масив з координатами та датами
        const photosWithCoordinates = photos.map(photo => {
            const coordinates = photo.gps_coordinates.split(",");
            return {
                lat: parseFloat(coordinates[0]),
                lng: parseFloat(coordinates[1]),
                date: photo.date_time,
                photo: photo
            };
        });

        // Сортуємо за датою
        photosWithCoordinates.sort((a, b) => a.date - b.date);

        const sortedWaypoints = photosWithCoordinates.map(photo => L.latLng(photo.lat, photo.lng));

        const photosByLocation = {};

        photosWithCoordinates.forEach(photoData => {
            const key = `${photoData.lat},${photoData.lng}`;

            if (!photosByLocation[key]) {
                photosByLocation[key] = [];
            }
            photosByLocation[key].push(photoData.photo);
        });

        for (const key in photosByLocation) {
            if (photosByLocation.hasOwnProperty(key)) {
                const photosAtLocation = photosByLocation[key];
                const coordinates = key.split(",");
                const lat = parseFloat(coordinates[0]);
                const lng = parseFloat(coordinates[1]);

                const markerType = photosAtLocation[0].marker;

                const iconPath = getIconPath(markerType);

                // кастомна іконка
                const customIcon = L.icon({
                    iconUrl: iconPath,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                });


                let popupContent = `
            <div style="max-height: 125px; max-width: 150px; overflow-y: auto;">
                <div class="photos">
        `;

                photosAtLocation.forEach(photo => {
                    popupContent += `
                <h6>${photo.title}</h6>
                <p>${photo.short_description}</p>
                <img src="${photo.path}" alt="${photo.title}" style="width: 100px; height: auto; margin: 5px;">
                <p>${photo.date_time}</p> 
                <hr>   
            `;
                });

                popupContent += `
                </div>
            </div>
        `;

                //  маркер з кастомною іконкою на карту
                const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
                marker.bindPopup(popupContent);
            }
        }


        function startRouteAnimation() {
            if (currentWaypointIndex >= sortedWaypoints.length) {
                clearInterval(animationInterval);
                alert("Finished route");
                return;
            }

            if (!routeLine) {
                routeLine = L.polyline([], { color: 'blue', opacity: 0.7, weight: 5 }).addTo(map);
            }

            const newLatLng = sortedWaypoints[currentWaypointIndex];
            routeLine.addLatLng(newLatLng);

            currentWaypointIndex++;
        }

        function animateRoute() {
            animationInterval = setInterval(startRouteAnimation, 300); // 300 мс між точками
        }

        let isAnimating = false;
        document.getElementById("routeControlBtn").addEventListener("click", () => {
            if (isAnimating) {
                clearInterval(animationInterval);
                document.getElementById("routeControlBtn").textContent = "Start route";
            } else {
                animateRoute();
                document.getElementById("routeControlBtn").textContent = "Stop route";
            }
            isAnimating = !isAnimating;
        });

        document.getElementById("deleteRouteBtn").addEventListener("click", () => {
            if (routeLine) {
                map.removeLayer(routeLine);
                routeLine = null;
                currentWaypointIndex = 0;
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });


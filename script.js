fetch('photos.json')
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
    .then(data => {
        const photos = data.photos;
        let output = "";
        const captions = [];
        const datas = [];
        photos.forEach((item, index) => {
            captions[index] = item.description;
            datas[index] = item.date_time;
            output += `
                <a class="photo ${item.image_type} fancybox item col-sm-6 col-md-4 mb-3" 
                    data-fancybox="gallery1" href="${item.path}" 
                    data-caption="${item.title}" data-index="${index}" data-coordinates="${item.gps_coordinates}">
                    <img src="${item.path}" alt="${item.title}">
                </a>
            `;
        });

        document.querySelector(".gallery").innerHTML = output;
        $.fancybox.defaults.btnTpl.mapButton = `
    <button data-fancybox-map class="fancybox-button fancybox-button--map" title="Show Map">
        <img src="icons/marker.png" alt="Map Icon" style="width: 24px; height: 24px;">
    </button>
`;
        $("[data-fancybox]").fancybox({
            buttons: [
                "zoom",
                "fullScreen",
                "share",
                "download",
                "thumbs",
                "slideShow",
                "close",
                "mapButton"
            ],
            afterShow: function (instance, current) {
                $(".fancybox-button--map").off("click").on("click", function () {
                    const coordinates = current.opts.$orig.data("coordinates");
                    if (coordinates) {
                        const [lat, lng] = coordinates.split(",");

                        $.fancybox.open({
                            src: `<div id="map" style="width: 50%; height: 50%;"></div>`,
                            type: "html",
                            opts: {
                                afterShow: function () {
                                    const map = L.map('map').setView([lat, lng], 14);
                                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    }).addTo(map);
                                    L.marker([lat, lng]).addTo(map).bindPopup(current.opts.$orig.find("img").attr("alt")).openPopup();
                                }
                            }
                        });
                    } else {
                        alert("No coordinates available for this image.");
                    }
                });
            },
            loop: true,
            slideShow: {
                autoStart: false,
                speed: 3000
            },
            transitionDuration: 600,
            caption: function(instance, item) {
                const index = item.index;
                const title = item.opts.caption;

                return `
                    <div class="caption-content">
                        <div class="caption-header">
                            <h3 class="title">${title}|${datas[index]}</h3>
                            <p class="toggle-description">&#709;</p>
                        </div>
                        <p class="description">${captions[index]}</p>
                    </div>
                `;
            }
        });

        $(document).on("click", ".toggle-description", function() {
            const description = $(this).closest(".caption-content").find(".description");
            const isVisible = description.is(":visible");

            description.toggle();

            $(this).html(isVisible ? "&#709;" : "&#708;");
        });

        const searchInput = document.getElementById("search");

        searchInput.addEventListener("input", function() {
            const searchQuery = searchInput.value.toLowerCase();

            const photosElements = document.querySelectorAll('.photo');

            photosElements.forEach(item => {
                const title = item.querySelector('img').alt.toLowerCase(); // Назва картинки (alt атрибут)
                if (title.includes(searchQuery)) {
                    item.setAttribute("data-fancybox", "true");
                    item.style.display = "";// Покажемо картинку
                } else {
                    item.setAttribute("data-fancybox", "false");
                    item.style.display = "none";// Сховаємо картинку
                }

            });
        });

    })
    .catch(error => {
        console.error('Error:', error);
    });


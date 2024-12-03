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
        const captions = []; // Масив для збереження описів

        photos.forEach((item, index) => {
            // Додаємо опис у масив
            captions[index] = item.description;

            output += `
                <a class="photo ${item.image_type} fancybox item col-sm-6 col-md-4 mb-3" 
                    data-fancybox="gallery1" href="${item.path}" 
                    data-caption="${item.title} - ${item.description}" data-index="${index}">
                    <img src="${item.path}" alt="${item.title}">
                    <span class="toggle-description">&#8595;</span>
                    <p class="description">${item.description}</p>
                </a>
            `;
        });

        document.querySelector(".gallery").innerHTML = output;

        // Ініціалізація Fancybox для нових елементів
        $("[data-fancybox]").fancybox({
            buttons: [
                "zoom",
                "fullScreen",
                "share",
                "download",
                "thumbs",
                "slideShow", // Додаємо кнопку слайд-шоу
                "close"
            ],
            loop: true,
            slideShow: {
                autoStart: false, // Чи починати слайд-шоу автоматично
                speed: 3000 // Інтервал у мілісекундах між переходами слайдів
            },
            transitionDuration: 600,
            caption: function(instance, item) {
                const index = item.index; // Отримуємо індекс поточної картинки
                return `
                    <div class="caption-content">
                        <div class="caption-header">
                            <p class="title">${item.opts.caption.split(" - ")[0]}</p>
                            <span class="toggle-description">&#709;</span> <!-- Стрілочка для відкриття -->
                        </div>
                        <p class="description">${captions[index]}</p>
                    </div>
                `;
            }
        });

        // Подія після завантаження Fancybox
        $(document).on("click", ".toggle-description", function() {
            const description = $(this).closest(".caption-content").find(".description");
            const isVisible = description.is(":visible");

            // Перемикаємо видимість опису
            description.toggle();

            // Змінюємо стрілочку
            $(this).html(isVisible ? "&#709;" : "&#708;");
        });

        const searchInput = document.getElementById("search");

        searchInput.addEventListener("input", function() {
            const searchQuery = searchInput.value.toLowerCase(); // Перетворюємо введений текст в нижній регістр

            // Перебираємо всі елементи галереї та перевіряємо, чи містить назва картки пошукове слово
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


// Анимация появления элементов при скролле
document.addEventListener('DOMContentLoaded', function () {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Плавная прокрутка для якорей
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ====== ИНИЦИАЛИЗАЦИЯ КАРУСЕЛЕЙ ======
    initCarousels();

    // ====== ТЕМНАЯ ТЕМА ======
    const themeToggle = document.createElement('button');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.className = 'theme-toggle';
    themeToggle.title = 'Переключить тему';
    document.body.appendChild(themeToggle);

    themeToggle.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        const icon = this.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });

    const style = document.createElement('style');
    style.textContent = `
        .theme-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            color: var(--text-color);
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            transition: var(--transition);
        }
        .theme-toggle:hover {
            transform: scale(1.1);
            box-shadow: var(--shadow);
        }
    `;
    document.head.appendChild(style);
});

// ====== ФУНКЦИЯ КАРУСЕЛЕЙ ======
function initCarousels() {
    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const wrapper = carousel.querySelector('.carousel-track-wrapper');
        const indicatorsContainer = carousel.querySelector('.carousel-indicators');
        const images = track.querySelectorAll('img');
        const total = images.length;
        let currentIndex = 0;
        let intervalId = null;
        const AUTOPLAY_DELAY = 4000; // 4 секунды

        // Создаём индикаторы
        images.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-indicator' + (i === 0 ? ' active' : '');
            dot.setAttribute('data-index', i);
            dot.setAttribute('aria-label', `Перейти к слайду ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            indicatorsContainer.appendChild(dot);
        });

        const indicators = indicatorsContainer.querySelectorAll('.carousel-indicator');

        // Создаём кликабельные зоны
        const prevZone = document.createElement('button');
        prevZone.className = 'carousel-zone prev';
        prevZone.setAttribute('aria-label', 'Предыдущий слайд');
        prevZone.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevZone.addEventListener('click', (e) => { e.stopPropagation(); goTo(currentIndex - 1); });

        const nextZone = document.createElement('button');
        nextZone.className = 'carousel-zone next';
        nextZone.setAttribute('aria-label', 'Следующий слайд');
        nextZone.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextZone.addEventListener('click', (e) => { e.stopPropagation(); goTo(currentIndex + 1); });

        wrapper.appendChild(prevZone);
        wrapper.appendChild(nextZone);

        // Клик по пустому месту — следующий слайд
        wrapper.addEventListener('click', (e) => {
            if (e.target === wrapper || e.target.closest('.carousel-track')) {
                goTo(currentIndex + 1);
            }
        });

        // Функция перехода
        function goTo(index) {
            // Нормализуем индекс (зацикливание)
            if (index < 0) index = total - 1;
            if (index >= total) index = 0;

            currentIndex = index;
            const offset = -currentIndex * 100;
            track.style.transform = `translateX(${offset}%)`;

            // Обновляем индикаторы
            indicators.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });

            resetAutoplay();
        }

        // Автопрокрутка
        function startAutoplay() {
            if (total <= 1) return;
            stopAutoplay();
            intervalId = setInterval(() => {
                goTo(currentIndex + 1);
            }, AUTOPLAY_DELAY);
        }

        function stopAutoplay() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }

        function resetAutoplay() {
            startAutoplay();
        }

        // Останавливаем автопрокрутку при наведении на карусель
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);

        // Для touch-устройств — останавливаем при касании
        carousel.addEventListener('touchstart', stopAutoplay);
        carousel.addEventListener('touchend', () => {
            setTimeout(startAutoplay, 3000);
        });

        // Запускаем
        startAutoplay();

        // Сохраняем функцию для возможности перезапуска (если понадобится)
        carousel._goTo = goTo;
        carousel._stopAutoplay = stopAutoplay;
        carousel._startAutoplay = startAutoplay;
    });
}
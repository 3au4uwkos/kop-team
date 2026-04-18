# Kopeykin — RDP сайта тренера по самбо

Rapid Design Prototype для сайта Копейкина Павла Сергеевича.

## Что это

Одностраничный HTML-прототип с плейсхолдерами. Все 10 секций, soft-snap скролл, адаптив, анимации на чистом CSS + vanilla JS. Тяжёлых зависимостей нет, шрифты — с Google Fonts (без роялти).

## Архитектура

**Стек:**
- HTML5 семантический
- CSS (custom properties, grid, clip-path, intersection-observer-driven animations)
- Vanilla JS (без фреймворков)
- Google Fonts: Oswald (display) + Manrope (body)

**Дизайн-токены** — в `:root`:
- Палитра: графит `#0E0E10` / бумага `#F7F7F8` / алый `#E4002B` / лазурь `#0033A0`
- Типографика: Oswald со skew(-6deg) для плакатного эффекта
- Ритм: `--section-pad: clamp(60px, 10vh, 140px)`

## Секции

1. **Hero** — тренер, цитата, ФИО, регалии, полутень за фото
2. **Stats** (добавлена) — 25+ / 500+ / 180+ / 12+ с анимированными счётчиками
3. **Legends** — карусель учеников с видео-фоном (плейсхолдер)
4. **Directions** — круг 120°×3 (SVG), ховер окрашивает сектор
5. **Combat** — боевое самбо (диагональный разрез →)
6. **Sambo** — спортивное самбо (диагональ ←, reverse)
7. **Striking** — ударная техника (диагональ →)
8. **Morning** — утренняя зарядка (диагональ ←, reverse)
9. **Youth** — подростки + выездные сборы (две карточки на тёмном фоне)
10. **Contacts** — четыре соцсети + футер

## Интерактив

- **Navbar** скрывается при скролле вниз, возвращается при скролле вверх
- **Burger** открывает правый drawer на мобильных
- **Reveal** — появление блоков через IntersectionObserver
- **Stat-counters** — easeOutQuart анимация от 0 до таргета
- **Legends carousel** — нативный scroll-snap + кнопки + счётчик
- **Directions** — ховер на SVG-сектор подсвечивает его и label

## Где подменить контент

| Элемент | Где в коде | Что подставить |
|---|---|---|
| Фото тренера | `.hero__photo-placeholder` с `<svg class="hero__silhouette">` | `<img src="...">` вырезанного фото |
| Видео-фон легенд | `.legends__video-bg` | `<video autoplay muted loop>` с нарезкой схваток |
| Фото учеников | `.legend-card__ph` | `<img>` или `background-image` на div |
| Видео секторов в "Направлениях" | внутри `<path>` SVG | `<foreignObject>` с `<video>` или mask-image |
| Фото/видео split-секций | `.split__media-inner` | `<img>` или `<video>` с object-fit: cover |
| Контакты | `.social` href="#" | Реальные ссылки Telegram / WhatsApp / VK / Instagram |
| Регалии/числа | `.hero__regalia`, `.stat[data-target]` | Реальные цифры тренера |
| Имена учеников | `.legend-card__name`, `.legend-card__title` | Реальные ФИО и регалии |

## Что дописать в продакшн-версии (для следующего чата)

1. **AJAX lazy-loading** — сейчас весь HTML в одном файле. В продакшн:
    - Каркас (Hero + nav + preloader) inline
    - Секции 2–10 подгружать через `fetch()` с IntersectionObserver (rootMargin: 200px)
    - Критический CSS inline, остальное через `<link rel="preload">`

2. **Разбить на модули:**
   ```
   /
   ├── index.html          (каркас + Hero)
   ├── /sections/
   │   ├── legends.html
   │   ├── directions.html
   │   ├── combat.html
   │   └── ...
   ├── /css/
   │   ├── tokens.css
   │   ├── base.css
   │   ├── nav.css
   │   └── sections/*.css
   ├── /js/
   │   ├── main.js
   │   ├── lazy-loader.js
   │   ├── nav.js
   │   ├── carousel.js
   │   └── counters.js
   └── /assets/
       ├── /img/
       ├── /video/
       └── /fonts/
   ```

3. **Доработки:**
    - Lenis для ультра-плавной прокрутки (вместо `scroll-behavior: smooth`)
    - Swiper.js для тач-свайпов карусели (сейчас нативный scroll-snap)
    - Настоящее видео в секторах "Направлений" через `<foreignObject>` в SVG
    - Форма записи (пока CTA "Записаться" ведёт на #contacts)
    - SEO-теги, OpenGraph, schema.org Person/SportsClub
    - Оптимизация изображений: AVIF/WebP + responsive `<picture>`

4. **Дизайн-решения на утверждение:**
    - Проверить читаемость цитаты на hero (сейчас красная, крупная)
    - Возможно увеличить интерактивность секторов: реально встроить видео в SVG-сектор при ховере
    - Решить, нужен ли блок "Расписание" отдельной секцией или достаточно spec-полей

## Как запустить

Открыть `index.html` в любом современном браузере. Никакой сборки, никакого npm. Шрифты грузятся с Google Fonts — нужен интернет для первого запуска.
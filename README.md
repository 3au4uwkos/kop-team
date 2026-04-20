# Копейкин Самбо — сайт-визитка

Single-page application для тренера по самбо Копейкина П. С.
Реализация по PRD.md (версия 1.0).

## Стек

- HTML5 (семантические теги, ARIA)
- CSS3 (custom properties, Grid, Flexbox, clip-path)
- JavaScript ES6+ modules (vanilla, без транспиляции)
- Lenis (~3KB gzip) — плавная soft-snap прокрутка (CDN)
- Swiper (~40KB gzip) — карусели (CDN)
- Шрифты Oswald + Manrope (Google Fonts)

Сборка не требуется — проект работает открытием `index.html`.

## Структура

```
kopeykin-sambo/
├── index.html             # Каркас: preloader, nav, hero, плейсхолдеры секций
├── robots.txt             # SEO
├── sitemap.xml            # SEO
├── PRD.md                 # Product Requirements
├── README.md              # Этот файл
│
├── /sections/             # HTML-партиалы для AJAX-подгрузки
│   ├── stats.html
│   ├── legends.html
│   ├── directions.html    # ✅ PRD 6.1 исправлено: SVG-текст в центроидах, увеличенный круг, декор
│   ├── combat.html
│   ├── sambo.html
│   ├── striking.html
│   ├── morning.html       # ✅ PRD 6.2 исправлено: muted палитра вместо оранжевого
│   ├── youth.html
│   └── contacts.html
│
├── /css/
│   ├── tokens.css         # :root CSS-переменные
│   ├── base.css           # Reset + утилиты + preloader
│   ├── nav.css            # Navbar + drawer
│   ├── animations.css     # reveal + keyframes + reduced-motion
│   └── /sections/         # Стили для каждой секции, подгружаются lazy
│
├── /js/                   # ES6-модули
│   ├── main.js            # Точка входа
│   ├── utils.js
│   ├── lazy-loader.js     # IntersectionObserver → fetch('/sections/*.html')
│   ├── smooth-scroll.js   # Lenis init
│   ├── nav.js             # Автоскрытие, drawer, scroll-spy
│   ├── reveal.js
│   ├── counters.js
│   ├── legends-carousel.js # Swiper + fallback
│   ├── directions.js      # Hover на сектор + видео через foreignObject
│   └── split-gallery.js   # Swiper в split-секциях
│
└── /assets/
    ├── /img/              # WebP/AVIF/JPEG фото (по папкам секций)
    ├── /video/            # MP4/WebM короткие ролики
    └── /icons/            # Favicon (SVG/PNG), social icons
```

## Исправления по PRD

### 6.1 — Секция «Направления подготовки»

- Текстовые подписи размещены SVG-элементами `<text>` в геометрических центроидах секторов — не съезжают при любом размере экрана.
- Круг увеличен до `min(720px, 78vh)` на desktop.
- Добавлена декоративная пунктирная окружность, радиальные линии-оси на границах секторов, нумерация 01/02/03, фоновое слово «ВЫБОР».

### 6.2 — Цветовой ритм

Применена рекомендованная последовательность:

```
#hero       → paper
#stats      → ink
#legends    → paper-alt
#directions → paper
#combat     → ink media / paper content
#sambo      → paper-alt media / paper content
#striking   → ink media / paper content
#morning    → paper-alt media / paper content (muted палитра вместо оранжевого)
#youth      → ink
#contacts   → paper
```

## Доступность

- Клавиатурная навигация по всему сайту
- Фокус-кольца (`outline 2px` алый с offset 3px)
- ARIA-атрибуты (aria-label, aria-current, aria-expanded)
- Семантика: `<main>`, `<h1>` только в Hero, `<h2>` на секциях
- `prefers-reduced-motion: reduce` — все анимации 0.01ms

## Запуск

1. Открыть `index.html` в современном браузере, ИЛИ
2. Запустить локальный сервер (требуется для работы AJAX-подгрузки секций):

```bash
# Python 3
python -m http.server 8000

# Node (http-server)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Затем перейти по адресу `http://localhost:8000`.

> ⚠️ Открытие `index.html` напрямую (file://) в Chrome работать НЕ будет — браузер заблокирует `fetch()` для локальных файлов (CORS). В Firefox можно, в Chrome — только через локальный сервер.

## Что осталось дополнить для продакшна

- Заменить плейсхолдеры фото/видео на реальные ассеты
- Оптимизация изображений: WebP + AVIF через `<picture>` + адаптивные размеры
- Реальные контакты в `sections/contacts.html`
- Favicon PNG-версии 16/32/180
- Превью для OG-тегов
- Минификация CSS/JS (опционально, через terser + csso) — см. `/dist/`
- Форма записи с валидацией (модальное окно)

# Копейкин Самбо — сайт-визитка

Сайт тренера по самбо Копейкина Павла Сергеевича, город **Тула**.
Одностраничник со всеми секциями плюс служебные страницы.

## Стек

- **Astro 5**, статическая генерация (SSG). В браузер уезжает готовый HTML —
  весь текст виден поисковикам и читателям без единой строчки JS.
- CSS3: custom properties, Grid, Flexbox, clip-path, scroll-driven animations.
- Vanilla ES-модули для интерактива (~6 КБ на всю страницу).
  Ни одного стороннего рантайма: Swiper и Lenis заменены нативными
  scroll-snap и `scroll-behavior: smooth`.
- Шрифты Oswald + Manrope — self-hosted WOFF2, только latin и cyrillic.

## Команды

```bash
npm install
npm run dev       # локальная разработка, http://localhost:4321
npm run build     # сборка в dist/
npm run preview   # предпросмотр собранной статики
```

> `npm run dev` инжектит стили инлайном ради HMR, а meta-CSP их запрещает —
> в dev-режиме страница выглядит неоформленной. Проверять вёрстку нужно
> на `npm run build && npm run preview`.

## Структура

```
kopeykin-sambo/
├── astro.config.mjs          # site, sitemap, запрет инлайна стилей и скриптов
├── lighthouserc.json         # бюджет производительности для CI
│
├── public/                   # копируется в dist/ как есть
│   ├── CNAME                 # kopeykin-sambo.ru
│   ├── robots.txt
│   ├── assets/icons/
│   └── fonts/files/          # 6 woff2: latin + cyrillic, обе гарнитуры
│
├── src/
│   ├── data/
│   │   ├── site.ts           # контакты, адрес, реквизиты — единый источник
│   │   ├── schema.ts         # сборка JSON-LD из site.ts
│   │   └── faq.ts            # вопросы и ответы (и страница, и FAQPage)
│   │
│   ├── layouts/Base.astro    # head-мета, CSP, шрифты, навбар, футер
│   │
│   ├── components/
│   │   ├── Nav / Footer / Preloader / Socials / Crumbs / Requisites
│   │   ├── Split.astro       # каркас секции-направления
│   │   └── sections/         # по компоненту на секцию главной
│   │
│   ├── pages/
│   │   ├── index.astro       # главная: все 12 секций статически
│   │   ├── faq.astro         # 20 вопросов + разметка FAQPage
│   │   ├── contacts.astro
│   │   ├── privacy.astro
│   │   ├── terms.astro
│   │   └── 404.astro
│   │
│   ├── scripts/              # reveal, counters, nav, carousel, directions
│   └── styles/               # tokens, base, nav, animations, decor, page,
│                             # fonts + sections/*
└── docs/
    ├── mobile-checklist.md   # ручная проверка на реальных устройствах
    └── lighthouse-ci.md      # бюджет производительности
```

## Где что менять

| Задача | Файл |
|---|---|
| Телефон, мессенджеры, адрес, координаты зала | `src/data/site.ts` |
| Реквизиты исполнителя (статус, ИНН, ОГРНИП) | `src/data/site.ts` → `REQUISITES` |
| Вопросы и ответы | `src/data/faq.ts` |
| Тексты направлений | `src/components/sections/*.astro` |
| Пункты меню | `src/data/site.ts` → `NAV_LINKS` |
| Ритм анимаций | `src/styles/tokens.css` → моушн-токены |

## Деплой

Push в `master` запускает `.github/workflows/deploy.yml`:
сборка Astro → бюджет Lighthouse → публикация на GitHub Pages.
Сборка, не уложившаяся в бюджет, до прода не доезжает.

В настройках репозитория: **Settings → Pages → Source = GitHub Actions**.

Зеркало на GitVerse собирается своим workflow из `.gitverse/workflows/`.

## Доступность и приватность

- Клавиатурная навигация везде, фокус-кольца, focus-trap в мобильном меню.
- `prefers-reduced-motion: reduce` отключает всё движение.
- Тап-цели не меньше 48×48 px.
- Персональные данные не собираются: форм, cookies и аналитики нет,
  запись — только переходом в мессенджеры.

## Что делает владелец отдельно

Полный список — `docs/owner-checklist.md` (токен, DNS, Вебмастер, реквизиты).
Коротко:

- Фото и видео вместо градиентов-плейсхолдеров, OG-изображение,
  PNG-иконки 16/32/180.
- Реальные карточки воспитанников в секции «Легенды ковра»
  (сейчас там заглушки).
- Налоговый статус и ИНН для блока реквизитов.
- Адрес зала и координаты для карточки на картах.
- Вычитка черновых текстов направлений и ответов FAQ.

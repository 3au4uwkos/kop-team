// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Base: основной сайт живёт в корне kop-team.ru, зеркало на GitVerse
// Pages — в подкаталоге /kop-team/ (свои домены там не поддерживаются).
// Workflow зеркала собирает с SITE_BASE=/kop-team, GitHub — без него.
const BASE = process.env.SITE_BASE || '/';
const MIRROR = BASE !== '/';

// Статическая генерация (SSG) — на выходе чистый HTML/CSS без JS-фреймворка.
export default defineConfig({
    // site остаётся основным доменом и на зеркале: canonical и JSON-LD
    // указывают поисковикам на kop-team.ru, дублей не будет.
    site: 'https://kop-team.ru',
    base: BASE,
    trailingSlash: 'always',
    integrations: [
        // Карта сайта — только для основного домена: на зеркале она
        // перечисляла бы несуществующие адреса вида kop-team.ru/kop-team/….
        ...(MIRROR ? [] : [sitemap({
            // 404 не индексируется — в карту сайта не попадает.
            filter: (page) => !page.includes('/404'),
            changefreq: 'monthly',
            lastmod: new Date('2026-09-01'),
        })]),
    ],
    build: {
        // CSP `style-src 'self'` запрещает инлайновые <style> — только внешние файлы.
        inlineStylesheets: 'never',
        format: 'directory',
    },
    vite: {
        build: {
            // Один CSS-бандл на сайт: меньше запросов, лучше кеш между страницами.
            cssCodeSplit: false,
            // 0 — запрещаем инлайнить мелкие скрипты: CSP script-src 'self'
            // не пропускает инлайновый JS.
            assetsInlineLimit: 0,
        },
    },
});

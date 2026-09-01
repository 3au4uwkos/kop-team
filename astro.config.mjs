// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Статическая генерация (SSG) — на выходе чистый HTML/CSS без JS-фреймворка.
export default defineConfig({
    site: 'https://kopeykin-sambo.ru',
    trailingSlash: 'always',
    integrations: [
        sitemap({
            // 404 не индексируется — в карту сайта не попадает.
            filter: (page) => !page.includes('/404'),
            changefreq: 'monthly',
            lastmod: new Date('2026-09-01'),
        }),
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

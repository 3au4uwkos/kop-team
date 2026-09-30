// ================================================================
// sitemap.xml — карта сайта, собирается вместе со страницами.
//
// Своя вместо @astrojs/sitemap: одна карта по стандартному адресу
// /sitemap.xml вместо индекса ради единственной карты, и честный
// lastmod — дата последнего коммита, менявшего содержимое страницы,
// а не одна дата на всех. Поисковики учитывают lastmod, только пока
// он совпадает с реальными изменениями.
//
// Для дат нужна полная история git: в CI checkout с fetch-depth: 0,
// иначе у всех страниц окажется дата последнего коммита.
//
// На зеркале GitVerse карта тоже собирается, но адреса в ней —
// основного домена (SITE_URL), так что дублей она не создаёт.
// ================================================================
import { execFileSync } from 'node:child_process';
import type { APIRoute } from 'astro';
import { SITE_URL } from '../data/site';

/**
 * Страницы в карте и файлы, из которых собирается их содержимое.
 * Вёрстка, стили и общий каркас (Base, Nav, Footer) сюда не входят:
 * их правка — не повод для переобхода.
 */
const PAGES: { path: string; sources: string[] }[] = [
    {
        path: '/',
        sources: [
            'src/pages/index.astro',
            'src/components/sections',
            'src/data/hero.ts',
            'src/data/media.json',
            'src/data/site.ts',
        ],
    },
    {
        path: '/contacts/',
        sources: [
            'src/pages/contacts.astro',
            'src/components/Venues.astro',
            'src/components/Requisites.astro',
            'src/components/Socials.astro',
            'src/data/site.ts',
        ],
    },
    { path: '/faq/', sources: ['src/pages/faq.astro', 'src/data/faq.ts'] },
    { path: '/privacy/', sources: ['src/pages/privacy.astro', 'src/data/site.ts'] },
    { path: '/terms/', sources: ['src/pages/terms.astro', 'src/data/site.ts'] },
];

/** Служебные страницы, которым в карте не место (у них noindex). */
const EXCLUDED = ['404'];

/** Дата последнего коммита, трогавшего файлы, в ISO 8601 — или undefined без git. */
function lastCommitDate(paths: string[]): string | undefined {
    try {
        const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...paths], {
            encoding: 'utf8',
        });
        return out.trim() || undefined;
    } catch {
        return undefined;
    }
}

export const GET: APIRoute = () => {
    // Новая страница без записи в PAGES — ошибка сборки, а не тихая дыра в карте.
    const routes = Object.keys(import.meta.glob('./*.astro'))
        .map((file) => file.replace(/^\.\/|\.astro$/g, ''))
        .filter((name) => !EXCLUDED.includes(name))
        .map((name) => (name === 'index' ? '/' : `/${name}/`));
    const missing = routes.filter((route) => !PAGES.some((page) => page.path === route));
    if (missing.length) {
        throw new Error(`sitemap.xml: страницы не внесены в PAGES: ${missing.join(', ')}`);
    }

    const urls = PAGES.map(({ path, sources }) => {
        const lastmod = lastCommitDate(sources);
        return [
            '  <url>',
            `    <loc>${SITE_URL}${path}</loc>`,
            ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
            '  </url>',
        ].join('\n');
    });

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls,
        '</urlset>',
        '',
    ].join('\n');

    return new Response(xml, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
};

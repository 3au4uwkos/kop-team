// ================================================================
// url.ts — внутренние ссылки и пути к файлам с учётом base.
//
// Основной сайт (kopeykin-sambo.ru) живёт в корне домена, а зеркало
// на GitVerse Pages — в подкаталоге: https://3au4uwkos.gitverse.site/kop-team/
// (свои домены GitVerse не поддерживает). Base задаёт переменная
// SITE_BASE при сборке (astro.config.mjs), поэтому любой путь от корня
// сайта — '/assets/…', '/faq/' — пропускаем через url().
// ================================================================
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** '/faq/' → '/faq/' в корне или '/kop-team/faq/' на зеркале. */
export const url = (path: string) => `${BASE}${path}`;

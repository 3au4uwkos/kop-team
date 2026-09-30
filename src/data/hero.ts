// ================================================================
// hero.ts — портрет первого экрана. Один источник для <picture>
// в Hero.astro и для <link rel="preload"> в head главной: иначе
// preload и картинка разошлись бы в выборе файла и он скачался бы дважды.
// ================================================================
import MEDIA from './media.json';

export const HERO_SIZES = '(min-width: 961px) 520px, 380px';

const hero = (MEDIA as Record<string, { widths: number[] }>)['hero/coach'];

/** srcset AVIF-версий портрета — для responsive preload. */
export const HERO_AVIF_SRCSET = hero.widths
    .map((w) => `/assets/img/hero/coach-${w}.avif ${w}w`)
    .join(', ');

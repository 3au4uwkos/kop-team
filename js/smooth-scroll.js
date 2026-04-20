// ================================================================
// smooth-scroll.js — Lenis init + anchor-click handling с lazy-load sections.
// Anchor handler всегда активен (даже без Lenis), чтобы клик по навбару
// умел дождаться подгрузки секции и после этого проскроллить.
// ================================================================
import { prefersReducedMotion } from './utils.js';
import { ensureSectionLoaded } from './lazy-loader.js';

function getNavOffset() {
    const nav = document.getElementById('nav');
    return nav ? -nav.offsetHeight : 0;
}

function scrollToTarget(target, lenis) {
    const offset = getNavOffset();
    if (lenis) {
        lenis.scrollTo(target, { offset });
    } else {
        const top = target.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
}

function initAnchorHandler(lenis) {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const href = link.getAttribute('href');
        if (href === '#' || href.length < 2) return;

        const id = href.slice(1);
        const existing = document.getElementById(id);
        if (existing) {
            e.preventDefault();
            scrollToTarget(existing, lenis);
            return;
        }

        // Target not in DOM yet — likely a lazy-loaded section. Force-load it.
        const placeholder = document.querySelector(`[data-section-id="${CSS.escape(id)}"]`);
        if (!placeholder) return; // unknown id — let default behavior handle it
        e.preventDefault();
        ensureSectionLoaded(id).then((el) => {
            if (el) scrollToTarget(el, lenis);
        });
    });
}

export function initSmoothScroll() {
    // Уважаем предпочтения пользователя: Lenis выключен, но anchor-handler нужен
    // для поддержки lazy-sections.
    if (prefersReducedMotion()) {
        initAnchorHandler(null);
        return null;
    }

    // Lenis не загружен — нативный скролл + anchor-handler
    if (typeof window.Lenis !== 'function') {
        console.warn('[smooth-scroll] Lenis not available, falling back to native scroll');
        initAnchorHandler(null);
        return null;
    }

    // smoothWheel: false — нативная прокрутка сохраняет CSS scroll-snap.
    // Lenis остаётся для плавного scrollTo() по якорям навигации.
    const lenis = new window.Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: false,
        smoothTouch: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    initAnchorHandler(lenis);

    window.__lenis = lenis;
    return lenis;
}

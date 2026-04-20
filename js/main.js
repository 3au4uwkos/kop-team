// ================================================================
// main.js — точка входа
// ================================================================
import { initNav, initScrollSpy } from './nav.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { initLazyLoader, onSectionReady } from './lazy-loader.js';
import { initReveal } from './reveal.js';
import { initCounters } from './counters.js';
import { initLegendsCarousel } from './legends-carousel.js';
import { initDirections } from './directions.js';
import { initSplitGallery } from './split-gallery.js';

// 1. Preloader — уходит после полной загрузки
window.addEventListener('load', () => {
    setTimeout(() => {
        const p = document.getElementById('preloader');
        if (p) p.classList.add('is-hidden');
    }, 1200);
});

// 2. Init core
initNav();
initSmoothScroll();
initReveal();
initCounters();

// 3. Регистрация per-section callbacks ДО запуска lazy-loader
onSectionReady('legends', (el) => initLegendsCarousel(el));
onSectionReady('directions', (el) => initDirections(el));
onSectionReady('combat', (el) => initSplitGallery(el));
onSectionReady('sambo', (el) => initSplitGallery(el));
onSectionReady('striking', (el) => initSplitGallery(el));
onSectionReady('morning', (el) => initSplitGallery(el));

// 4. Lazy-loader запускает AJAX-подгрузку всех секций
initLazyLoader();

// 5. Scroll-spy переинициализируется при загрузке новых секций
let spyInited = false;
window.addEventListener('section:loaded', () => {
    if (!spyInited) {
        initScrollSpy();
        spyInited = true;
    }
    // Уведомляем Lenis о новой высоте (если есть)
    if (window.__lenis && typeof window.__lenis.resize === 'function') {
        window.__lenis.resize();
    }
});

// Первичная инициализация spy — для Hero, который уже в DOM
initScrollSpy();

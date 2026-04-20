// ================================================================
// nav.js — автоскрытие navbar + drawer + scroll-spy
// ================================================================
import { $, $$, throttleRAF } from './utils.js';

export function initNav() {
    const nav = $('#nav');
    const burger = $('#burger');
    const drawer = $('#drawer');
    if (!nav) return;

    // 1. Автоскрытие при скролле
    let lastScroll = 0;
    const onScroll = throttleRAF(() => {
        const y = window.scrollY;
        nav.classList.toggle('is-scrolled', y > 20);

        if (y > lastScroll && y > 120) {
            nav.classList.add('is-hidden');
        } else {
            nav.classList.remove('is-hidden');
        }
        lastScroll = y;
    });
    window.addEventListener('scroll', onScroll, { passive: true });

    // 2. Бургер + drawer
    if (burger && drawer) {
        burger.addEventListener('click', () => {
            const open = !drawer.classList.contains('is-open');
            burger.classList.toggle('is-open', open);
            drawer.classList.toggle('is-open', open);
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
            document.body.style.overflow = open ? 'hidden' : '';
        });

        drawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('is-open');
                drawer.classList.remove('is-open');
                burger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Esc для закрытия drawer
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
                burger.click();
            }
        });
    }
}

// Scroll-spy (вызывается после того, как секции загружены)
export function initScrollSpy() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav__link');
    if (!sections.length || !navLinks.length) return;

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            navLinks.forEach(link => {
                const active = link.getAttribute('href') === '#' + id;
                link.classList.toggle('is-active', active);
                if (active) {
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        });
    }, { threshold: 0.5 });

    sections.forEach(sec => navObserver.observe(sec));
}

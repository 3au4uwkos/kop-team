// ================================================================
// nav.js — автоскрытие шапки, мобильный drawer и scroll-spy.
//
// Дровер: блокировка фонового скролла, закрытие по Esc и тапу вне,
// focus-trap внутри, возврат фокуса на бургер, синхронный aria-expanded.
// ================================================================
import { $, $$, throttleRAF, focusables } from './utils.js';

export function initNav() {
    const nav = $('#nav');
    const burger = $('#burger');
    const drawer = $('#drawer');
    const scrim = $('#drawerScrim');
    if (!nav) return;

    const isOpen = () => !!drawer && drawer.classList.contains('is-open');

    // ---------- 1. Автоскрытие при скролле вниз ----------
    let lastScroll = 0;
    const onScroll = throttleRAF(() => {
        const y = window.scrollY;
        nav.classList.toggle('is-scrolled', y > 20);
        // При открытом меню шапку не прячем — бургер должен остаться доступен.
        if (!isOpen()) {
            nav.classList.toggle('is-hidden', y > lastScroll && y > 120);
        }
        lastScroll = y;
    });
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!burger || !drawer) {
        initScrollSpy();
        return;
    }

    // ---------- 2. Дровер ----------
    /** @param {boolean} open @param {boolean} moveFocus — переносить ли фокус */
    function setOpen(open, moveFocus = true) {
        drawer.classList.toggle('is-open', open);
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
        // inert снимает фокус и скрывает закрытое меню от скринридеров.
        drawer.toggleAttribute('inert', !open);
        if (scrim) scrim.hidden = !open;
        // Блокировка скролла фона — классом, а не инлайн-стилем (CSP style-src 'self').
        document.documentElement.classList.toggle('is-drawer-open', open);

        if (!moveFocus) return;
        if (open) {
            nav.classList.remove('is-hidden');
            focusables(drawer)[0]?.focus();
        } else {
            burger.focus();
        }
    }

    burger.addEventListener('click', () => setOpen(!isOpen()));
    scrim?.addEventListener('click', () => setOpen(false));

    drawer.querySelectorAll('a').forEach((link) => {
        // Фокус не возвращаем: пользователь уходит к целевой секции.
        link.addEventListener('click', () => setOpen(false, false));
    });

    document.addEventListener('keydown', (e) => {
        if (!isOpen()) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
            return;
        }

        // Focus-trap: цикл по бургеру + содержимому дровера.
        if (e.key === 'Tab') {
            const items = [burger, ...focusables(drawer)];
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    // Тап вне дровера — например по шапке, которую затемнение не перекрывает.
    document.addEventListener('pointerdown', (e) => {
        if (!isOpen()) return;
        if (drawer.contains(e.target) || burger.contains(e.target)) return;
        setOpen(false, false);
    });

    // Переход на десктопную ширину при открытом меню — закрыть и разблокировать скролл.
    const wide = window.matchMedia('(min-width: 961px)');
    wide.addEventListener('change', (e) => {
        if (e.matches && isOpen()) setOpen(false, false);
    });

    setOpen(false, false);
    initScrollSpy();
}

// Подсветка активного пункта меню.
export function initScrollSpy() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav__link');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            navLinks.forEach((link) => {
                const active = (link.getAttribute('href') || '').endsWith('#' + id);
                link.classList.toggle('is-active', active);
                if (active) link.setAttribute('aria-current', 'true');
                else link.removeAttribute('aria-current');
            });
        });
    }, { threshold: 0.5 });

    sections.forEach((s) => observer.observe(s));
}

// ================================================================
// legends-scroll.js — «Легенды ковра»: колесо мыши ведёт ленту вбок.
//
// Секция вытягивается по высоте на длину ленты, её рамка закреплена
// (position: sticky), а лента сдвигается вслед за прокруткой страницы:
// вниз — карточки едут влево, вверх — обратно. SPEED > 1 — лента едет
// быстрее колеса, чтобы длинную ленту не приходилось крутить экранами.
// Работает только с настоящим курсором и на широком экране; на таче
// остаётся нативная лента, которую листают пальцем. При «Уменьшении
// движения» — тоже нативная лента со стрелками.
// ================================================================
import { prefersReducedMotion } from './utils.js';

const SPEED = 1.5;

export function initLegendsScroll(root = document) {
    const section = root.querySelector('.legends');
    const track = section?.querySelector('.legends__carousel');
    if (!section || !track) return;

    const mq = window.matchMedia('(min-width: 961px) and (hover: hover) and (pointer: fine)');
    let on = false;
    let travel = 0;
    let frame = 0;

    const update = () => {
        frame = 0;
        if (!on || !travel) return;
        const passed = -section.getBoundingClientRect().top;
        const p = Math.min(Math.max((passed * SPEED) / travel, 0), 1);
        track.style.transform = `translate3d(${(-p * travel).toFixed(1)}px, 0, 0)`;
    };

    const measure = () => {
        on = mq.matches && !prefersReducedMotion();
        section.classList.toggle('is-pinned', on);
        if (!on) {
            track.style.transform = '';
            section.style.removeProperty('--legends-travel');
            return;
        }
        track.style.transform = '';
        // Класс уже переключил ленту в overflow: visible — ширина
        // содержимого минус ширина рамки и есть путь, который ей ехать.
        travel = Math.max(0, track.scrollWidth - track.clientWidth);
        section.style.setProperty('--legends-travel', `${Math.ceil(travel / SPEED)}px`);
        update();
    };

    window.addEventListener('scroll', () => {
        if (!frame) frame = requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    mq.addEventListener('change', measure);
    measure();
}

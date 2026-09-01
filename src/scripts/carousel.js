// ================================================================
// carousel.js — карусели на нативном CSS scroll-snap.
// Заменяет Swiper: свайп и инерция — от браузера, JS только
// синхронизирует точки/счётчик и обрабатывает стрелки.
//
// Разметка:
//   [data-carousel]
//     [data-carousel-track] > слайды
//     [data-carousel-prev] / [data-carousel-next]   (необязательно)
//     [data-carousel-dot] ×N                        (необязательно)
//     [data-carousel-count]                         (необязательно)
// ================================================================
import { prefersReducedMotion } from './utils.js';

const pad = (n) => String(n).padStart(2, '0');

export function initCarousel(root) {
    const track = root.querySelector('[data-carousel-track]');
    if (!track) return;

    const slides = Array.from(track.children);
    if (slides.length < 2) return;

    const dots = Array.from(root.querySelectorAll('[data-carousel-dot]'));
    const countEl = root.querySelector('[data-carousel-count]');
    const prev = root.querySelector('[data-carousel-prev]');
    const next = root.querySelector('[data-carousel-next]');

    let index = -1;

    function render(i) {
        if (i === index) return;
        index = i;
        dots.forEach((d, n) => {
            const active = n === i;
            d.classList.toggle('is-active', active);
            // aria-current, а не aria-selected: последний допустим только
            // у role="tab", которого у обычной кнопки нет.
            if (active) d.setAttribute('aria-current', 'true');
            else d.removeAttribute('aria-current');
        });
        if (countEl) countEl.textContent = `${pad(i + 1)} / ${pad(slides.length)}`;
        if (prev) prev.disabled = i === 0;
        if (next) next.disabled = i === slides.length - 1;
    }

    // Текущий слайд — тот, чей левый край ближе всего к левому краю трека.
    function sync() {
        const base = track.getBoundingClientRect().left;
        let best = 0;
        let min = Infinity;
        slides.forEach((s, i) => {
            const d = Math.abs(s.getBoundingClientRect().left - base);
            if (d < min) { min = d; best = i; }
        });
        render(best);
    }

    let frame = 0;
    track.addEventListener('scroll', () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(sync);
    }, { passive: true });

    function go(i) {
        const target = slides[Math.max(0, Math.min(i, slides.length - 1))];
        if (!target) return;
        const delta = target.getBoundingClientRect().left - track.getBoundingClientRect().left;
        track.scrollBy({ left: delta, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }

    prev?.addEventListener('click', () => go(index - 1));
    next?.addEventListener('click', () => go(index + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));

    // Стрелки клавиатуры внутри трека.
    track.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    });

    sync();
    render(index < 0 ? 0 : index);
}

export function initCarousels(root = document) {
    root.querySelectorAll('[data-carousel]').forEach(initCarousel);
}

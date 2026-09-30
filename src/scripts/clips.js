// ================================================================
// clips.js — видео-петли (components/Clip.astro).
//
// Ролик играет, только пока виден хотя бы наполовину: в карусели
// это значит «текущий слайд» — IntersectionObserver учитывает обрезку
// треком прокрутки. Файл подгружается при первом появлении.
// Пауза, поставленная пользователем, не снимается автоматически.
// ================================================================
import { prefersReducedMotion } from './utils.js';

export function initClips(root = document) {
    const videos = root.querySelectorAll('video[data-clip]');
    if (!videos.length) return;

    const reduced = prefersReducedMotion();
    const userPaused = new WeakSet();

    const play = (v) => {
        if (!v.getAttribute('src')) v.setAttribute('src', v.dataset.src);
        const p = v.play();
        if (p && typeof p.catch === 'function') p.catch(() => { /* autoplay blocked */ });
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach(({ target: v, isIntersecting }) => {
            if (isIntersecting && !reduced && !userPaused.has(v)) play(v);
            else v.pause();
        });
    }, { threshold: 0.5 });

    videos.forEach((v) => {
        io.observe(v);
        const btn = v.parentElement?.querySelector('[data-clip-toggle]');
        if (!btn) return;

        const sync = () => {
            const playing = !v.paused;
            btn.classList.toggle('is-playing', playing);
            btn.setAttribute('aria-label', playing ? 'Поставить видео на паузу' : 'Воспроизвести видео');
        };
        v.addEventListener('play', sync);
        v.addEventListener('pause', sync);

        btn.addEventListener('click', () => {
            if (v.paused) {
                userPaused.delete(v);
                play(v);
            } else {
                userPaused.add(v);
                v.pause();
            }
        });
    });
}

// ================================================================
// legends-video.js — фоновая нарезка схваток в «Легендах ковра».
//
// Ролик не грузится вместе со страницей: src ставится, только когда
// секция доезжает до экрана, а вне экрана видео стоит на паузе.
// При «Уменьшении движения» не запускается вовсе — остаётся вуаль.
// ================================================================
import { prefersReducedMotion } from './utils.js';

export function initLegendsVideo(root = document) {
    const video = root.querySelector('.legends__video');
    if (!video || prefersReducedMotion()) return;

    const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            if (!video.getAttribute('src')) video.setAttribute('src', video.dataset.src);
            const p = video.play();
            if (p && typeof p.catch === 'function') p.catch(() => { /* autoplay blocked */ });
        } else {
            video.pause();
        }
    }, { rootMargin: '200px 0px' });

    io.observe(video.closest('section') ?? video);
}

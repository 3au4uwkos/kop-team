// ================================================================
// directions.js — 3 полноэкранных клиновидных сектора.
// На hover/focus подгружаем видео (preload=none) и проигрываем;
// на leave/blur ставим на паузу. Клик = переход по href якорю.
// ================================================================

export function initDirections(root) {
    const sectors = root.querySelectorAll('.direction-sector');
    if (!sectors.length) return;

    sectors.forEach((sector) => {
        const videoSrc = sector.dataset.video;
        const video = sector.querySelector('video.direction-sector__media--video');

        const activate = () => {
            if (!video || !videoSrc) return;
            if (!video.src) video.src = videoSrc;   // lazy-set
            const p = video.play();
            if (p && typeof p.catch === 'function') p.catch(() => { /* autoplay blocked */ });
        };

        const deactivate = () => {
            if (!video) return;
            video.pause();
        };

        sector.addEventListener('mouseenter', activate);
        sector.addEventListener('mouseleave', deactivate);
        sector.addEventListener('focus', activate);
        sector.addEventListener('blur', deactivate);
        sector.addEventListener('touchstart', activate, { passive: true });
    });
}

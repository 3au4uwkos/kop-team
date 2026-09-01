// ================================================================
// directions.js — три сектора «Направления».
//
// Мышь: наведение подгружает и запускает видео, уход — ставит паузу.
// Тач: первое касание раскрывает сектор (видео + подпись),
//      второе — выполняет переход по якорю.
// ================================================================

export function initDirections(root = document) {
    const sectors = root.querySelectorAll('.direction-sector');
    if (!sectors.length) return;

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let armed = null; // сектор, раскрытый первым касанием

    sectors.forEach((sector) => {
        const videoSrc = sector.dataset.video;
        const video = sector.querySelector('video.direction-sector__media--video');

        const activate = () => {
            sector.classList.add('is-active');
            if (!video || !videoSrc) return;
            if (!video.getAttribute('src')) video.setAttribute('src', videoSrc);
            const p = video.play();
            if (p && typeof p.catch === 'function') p.catch(() => { /* autoplay blocked */ });
        };

        const deactivate = () => {
            sector.classList.remove('is-active');
            video?.pause();
        };

        if (canHover) {
            sector.addEventListener('mouseenter', activate);
            sector.addEventListener('mouseleave', deactivate);
        }
        sector.addEventListener('focus', activate);
        sector.addEventListener('blur', deactivate);

        if (!canHover) {
            sector.addEventListener('click', (e) => {
                if (armed === sector) return;   // второе касание — обычный переход
                e.preventDefault();
                if (armed) armed.classList.remove('is-active');
                armed = sector;
                activate();
            });
        }
    });

    if (!canHover) {
        document.addEventListener('pointerdown', (e) => {
            if (armed && !armed.contains(e.target)) {
                armed.classList.remove('is-active');
                armed.querySelector('video')?.pause();
                armed = null;
            }
        }, { passive: true });
    }
}

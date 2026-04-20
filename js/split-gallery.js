// ================================================================
// split-gallery.js — Swiper для медиа в split-секциях (fallback: dots)
// ================================================================

export function initSplitGallery(root) {
    const splits = root.matches('.split') ? [root] : root.querySelectorAll('.split');
    splits.forEach(initOne);
}

function initOne(split) {
    const media = split.querySelector('.split__media');
    if (!media) return;
    const swiperEl = media.querySelector('.swiper');
    const dots = split.querySelectorAll('.split__media-dot');

    if (swiperEl && typeof window.Swiper === 'function') {
        const swiper = new window.Swiper(swiperEl, {
            slidesPerView: 1,
            grabCursor: true,
            speed: 600,
            loop: false,
            on: {
                slideChange: (sw) => {
                    dots.forEach((d, i) => d.classList.toggle('is-active', i === sw.realIndex));
                },
            },
        });
        dots.forEach((d, i) => {
            d.addEventListener('click', () => swiper.slideTo(i));
        });
    } else if (dots.length) {
        // Fallback click — just updates dots (no actual slide)
        dots.forEach((d, i) => {
            d.addEventListener('click', () => {
                dots.forEach(x => x.classList.remove('is-active'));
                d.classList.add('is-active');
            });
        });
    }

    // Play button → try to play a <video> in media
    const play = split.querySelector('.split__play');
    if (play) {
        play.addEventListener('click', () => {
            const video = media.querySelector('video');
            if (video) {
                if (video.paused) video.play().catch(() => {});
                else video.pause();
            }
        });
    }
}

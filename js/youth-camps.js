// ================================================================
// youth-camps.js — Swiper-карусель лагерных смен (insta-style swipe).
// Фоллбек при отсутствии Swiper — нативный scroll-snap (CSS handles it).
// ================================================================
export function initYouthCamps(root) {
    const el = root.querySelector('.youth-camps__swiper');
    if (!el) return;

    if (typeof window.Swiper !== 'function') {
        // Оставляем CSS-фоллбек (`:not(.swiper-initialized)` стили).
        return;
    }

    new window.Swiper(el, {
        slidesPerView: 'auto',
        spaceBetween: 20,
        grabCursor: true,
        freeMode: { enabled: true, sticky: true, momentumBounce: false },
        speed: 520,
        navigation: {
            prevEl: root.querySelector('.youth-camps__btn--prev'),
            nextEl: root.querySelector('.youth-camps__btn--next'),
            disabledClass: 'swiper-button-disabled',
        },
        pagination: {
            el: root.querySelector('.youth-camps__pagination'),
            clickable: true,
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active',
        },
        keyboard: { enabled: true },
        a11y: {
            prevSlideMessage: 'Предыдущая смена',
            nextSlideMessage: 'Следующая смена',
        },
    });
}

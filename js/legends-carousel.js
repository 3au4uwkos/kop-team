// ================================================================
// legends-carousel.js — Swiper для карусели учеников (fallback: native scroll)
// ================================================================

export function initLegendsCarousel(root) {
    const carousel = root.querySelector('#legendsCarousel');
    if (!carousel) return;

    const cards = carousel.querySelectorAll('.legend-card');
    const total = cards.length;
    const countEl = root.querySelector('#legCount');
    const prev = root.querySelector('#legPrev');
    const next = root.querySelector('#legNext');

    function updateCount(idx) {
        if (!countEl) return;
        countEl.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    }

    // Try Swiper first
    if (typeof window.Swiper === 'function') {
        carousel.classList.add('swiper');
        // Wrap cards in swiper-wrapper + swiper-slide
        const wrap = document.createElement('div');
        wrap.className = 'swiper-wrapper';
        cards.forEach(card => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.appendChild(card);
            wrap.appendChild(slide);
        });
        carousel.innerHTML = '';
        carousel.appendChild(wrap);

        const swiper = new window.Swiper(carousel, {
            slidesPerView: 'auto',
            spaceBetween: 24,
            grabCursor: true,
            speed: 600,
            on: {
                slideChange: (sw) => updateCount(sw.realIndex),
                init: (sw) => updateCount(sw.realIndex || 0),
            },
        });

        if (prev) prev.addEventListener('click', () => swiper.slidePrev());
        if (next) next.addEventListener('click', () => swiper.slideNext());
        return;
    }

    // Fallback: native scroll
    function getCurrentIndex() {
        if (!cards.length) return 0;
        const cardWidth = cards[0].offsetWidth + 24;
        return Math.round(carousel.scrollLeft / cardWidth);
    }

    function scrollUpdate() {
        updateCount(Math.min(getCurrentIndex(), total - 1));
    }

    if (prev) prev.addEventListener('click', () => {
        const cardWidth = cards[0].offsetWidth + 24;
        carousel.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    });
    if (next) next.addEventListener('click', () => {
        const cardWidth = cards[0].offsetWidth + 24;
        carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
    });
    carousel.addEventListener('scroll', () => requestAnimationFrame(scrollUpdate));
    updateCount(0);
}

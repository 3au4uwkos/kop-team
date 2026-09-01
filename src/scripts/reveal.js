// ================================================================
// reveal.js — IntersectionObserver для появления блоков
// ================================================================

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

export function observeReveal(root = document) {
    root.querySelectorAll('.reveal').forEach(el => {
        if (!el.classList.contains('is-visible')) {
            revealObserver.observe(el);
        }
    });
}

export function initReveal() {
    observeReveal(document);
}

// ================================================================
// counters.js — анимация цифр в блоке достижений
// ================================================================
import { easeOutQuart, prefersReducedMotion } from './utils.js';

const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);

        if (prefersReducedMotion()) {
            el.textContent = target;
            countObserver.unobserve(el);
            return;
        }

        const duration = 1600;
        const start = performance.now();

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = easeOutQuart(progress);
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
    });
}, { threshold: 0.6 });

export function observeCounters(root = document) {
    root.querySelectorAll('.stat-count').forEach(el => countObserver.observe(el));
}

export function initCounters() {
    observeCounters(document);
}

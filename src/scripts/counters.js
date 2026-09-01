// ================================================================
// counters.js — анимация цифр в блоке достижений.
// В HTML сразу лежит финальное значение (важно для поисковиков и
// пользователей без JS); при инициализации сбрасываем в 0 и
// досчитываем, когда блок попадает во вьюпорт.
// ================================================================
import { easeOutQuart, prefersReducedMotion } from './utils.js';

const DURATION = 1600;

const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        countObserver.unobserve(el);

        const target = parseInt(el.dataset.target, 10);
        if (Number.isNaN(target)) return;

        if (prefersReducedMotion()) {
            el.textContent = String(target);
            return;
        }

        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / DURATION, 1);
            el.textContent = String(Math.round(easeOutQuart(progress) * target));
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    });
}, { threshold: 0.6 });

export function observeCounters(root = document) {
    root.querySelectorAll('.stat-count').forEach((el) => {
        if (!prefersReducedMotion()) el.textContent = '0';
        countObserver.observe(el);
    });
}

export function initCounters() {
    observeCounters(document);
}

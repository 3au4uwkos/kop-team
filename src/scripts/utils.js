// ================================================================
// utils.js — вспомогательные функции
// ================================================================

export function $(sel, root = document) {
    return root.querySelector(sel);
}

export function $$(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
}

export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

export function throttleRAF(fn) {
    let queued = false;
    return (...args) => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
            queued = false;
            fn(...args);
        });
    };
}

/** Элементы, на которые может встать фокус (для focus-trap в дровере). */
export function focusables(root) {
    return $$(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        root,
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

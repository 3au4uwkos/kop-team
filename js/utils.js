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

// Load a stylesheet once, returns a promise
const loadedStyles = new Set();
export function loadStyle(href) {
    if (loadedStyles.has(href)) return Promise.resolve();
    loadedStyles.add(href);
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve();
        link.onerror = reject;
        document.head.appendChild(link);
    });
}

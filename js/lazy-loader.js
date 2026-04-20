// ================================================================
// lazy-loader.js — AJAX-подгрузка секций при приближении viewport
// ================================================================
import { loadStyle } from './utils.js';
import { observeReveal } from './reveal.js';
import { observeCounters } from './counters.js';

// Map of section-id -> styles that should be loaded when the section enters viewport
const SECTION_CONFIG = {
    stats:      { styles: ['css/sections/stats.css'] },
    legends:    { styles: ['css/sections/legends.css'] },
    directions: { styles: ['css/sections/directions.css'] },
    combat:     { styles: ['css/sections/split.css'] },
    sambo:      { styles: ['css/sections/split.css'] },
    striking:   { styles: ['css/sections/split.css'] },
    morning:    { styles: ['css/sections/split.css'] },
    youth:      { styles: ['css/sections/youth.css'] },
    contacts:   { styles: ['css/sections/contacts.css'] },
};

// Callbacks to run after a specific section is inserted
const sectionReadyCallbacks = {};
export function onSectionReady(id, cb) {
    if (!sectionReadyCallbacks[id]) sectionReadyCallbacks[id] = [];
    sectionReadyCallbacks[id].push(cb);
}

// Track in-flight loads so concurrent requests (observer + anchor click) resolve to the same promise
const loadingPromises = new Map();

async function loadSection(placeholder) {
    const id = placeholder.dataset.sectionId;
    const url = placeholder.dataset.sectionUrl || `sections/${id}.html`;
    const cfg = SECTION_CONFIG[id] || {};

    try {
        // Parallel: styles + html
        const stylePromises = (cfg.styles || []).map(loadStyle);
        const htmlPromise = fetch(url, { credentials: 'same-origin' })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); });

        const [html] = await Promise.all([htmlPromise, ...stylePromises]);

        // Wrap + insert
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html.trim();
        const fragment = document.createDocumentFragment();
        while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
        placeholder.replaceWith(fragment);

        // Re-scan for reveal/counters
        const newSection = document.getElementById(id);
        if (newSection) {
            observeReveal(newSection);
            observeCounters(newSection);
        }

        // Fire callbacks
        if (sectionReadyCallbacks[id]) {
            sectionReadyCallbacks[id].forEach(cb => {
                try { cb(newSection); } catch (e) { console.error(e); }
            });
        }

        // Notify global (for scroll-spy re-init, Lenis resize, etc.)
        window.dispatchEvent(new CustomEvent('section:loaded', { detail: { id, element: newSection } }));
        return newSection;
    } catch (err) {
        console.error(`[lazy-loader] Failed to load ${id}:`, err);
        placeholder.dataset.error = '1';
        return null;
    }
}

// Force-load a section by id. Returns the inserted element, or null if not found.
// Safe to call repeatedly — de-dupes concurrent loads and no-ops if already loaded.
export function ensureSectionLoaded(id) {
    const existing = document.getElementById(id);
    if (existing) return Promise.resolve(existing);

    if (loadingPromises.has(id)) return loadingPromises.get(id);

    const placeholder = document.querySelector(`[data-section-id="${id}"]`);
    if (!placeholder) return Promise.resolve(null);

    const p = loadSection(placeholder).finally(() => loadingPromises.delete(id));
    loadingPromises.set(id, p);
    return p;
}

export function initLazyLoader() {
    const placeholders = document.querySelectorAll('[data-section-id]');
    if (!placeholders.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const ph = entry.target;
            observer.unobserve(ph);
            ensureSectionLoaded(ph.dataset.sectionId);
        });
    }, { rootMargin: '300px 0px 300px 0px' });

    placeholders.forEach(ph => observer.observe(ph));
}

export const root = document.documentElement;
export const FINE_POINTER = matchMedia('(hover: hover) and (pointer: fine)');
export const CALM = matchMedia('(prefers-reduced-motion: reduce)');
export const INTERACTIVE = 'a, button, summary, input, select, [role="menuitem"], .st-row';

export const themeConfig = id => (globalThis.SITE_THEMES || []).find(theme => theme.id === id) || {};

export function onThemeChange(run) {
  run(root.dataset.theme);
  document.addEventListener('themechange', event => run(event.detail));
}

export function load(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch (e) {
    return fallback;
  }
}

export function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

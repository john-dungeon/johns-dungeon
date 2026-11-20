export const root = document.documentElement;
export const FINE_POINTER = matchMedia('(hover: hover) and (pointer: fine)');
export const CALM = matchMedia('(prefers-reduced-motion: reduce)');

const INTERACTIVE = globalThis.SITE_INTERACTIVE;

export const hoverableFrom = node => {
  const hit = node.closest?.(INTERACTIVE);
  return hit && !hit.closest('#gate') ? hit : null;
};

export const waiting = () => root.dataset.gate === 'pending';
export const announce = (type, detail) => document.dispatchEvent(new CustomEvent(type, { detail }));

export const themeConfig = id => (globalThis.SITE_THEMES || []).find(theme => theme.id === id) || {};

export const cssVar = name => getComputedStyle(root).getPropertyValue(name).trim();

export function onThemeChange(run) {
  run(root.dataset.theme);
  document.addEventListener('themechange', event => run(event.detail));
}

const store = globalThis.SiteStore;
export const load = store.local.get;
export const save = store.local.set;
export const session = store.session;

export const posterize = (value, levels) => (value <= 0 ? 0 : Math.round(value * levels) / levels);

export const fadeOut = (age, hold, fade) => Math.min(1, Math.max(0, 1 - (age - hold) / fade));

export function bringToFront(node) {
  try { node.hidePopover(); } catch (e) {}
  try { node.showPopover(); } catch (e) {}
}

export function wireDialog(dialog) {
  dialog.addEventListener('close', () => announce('popupclose'));
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
}

export function openDialog(dialog) {
  dialog.showModal();
  announce('popupopen');
}

export function perFrame(run) {
  let frame = 0;
  const call = () => {
    frame ||= requestAnimationFrame(() => { frame = 0; run(); });
  };
  call.cancel = () => { cancelAnimationFrame(frame); frame = 0; };
  return call;
}

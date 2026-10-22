const STRINGS = globalThis.SITE_STRINGS || {};

export function t(key, vars = {}) {
  return (STRINGS[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
}

export function intOr(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

export const NUMBER = '-?\\d+(?:\\.\\d+)?';
const SPAN = new RegExp(`^(${NUMBER})(?:\\s*-\\s*(${NUMBER}))?$`);

export function toNumber(text) {
  const n = parseFloat(text);
  return Number.isNaN(n) ? null : n;
}

export function parseSpan(text) {
  const match = SPAN.exec(String(text).trim());
  if (!match) return null;
  const from = parseFloat(match[1]);
  return [from, match[2] === undefined ? from : parseFloat(match[2])];
}

export const compareText = (a, b) => a.localeCompare(b, undefined, { numeric: true });

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function markUnlisted(node, kindKey = 'unlisted_value') {
  node.classList.add('st-unlisted');
  node.dataset.tooltip = t('unlisted', { kind: t(kindKey) });
  return node;
}

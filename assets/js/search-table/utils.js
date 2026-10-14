export function intOr(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

export function toNumber(text) {
  if (text === null || text === undefined || text === '') return null;
  const n = parseFloat(text);
  return Number.isNaN(n) ? null : n;
}

export function compareText(a, b) {
  return a.localeCompare(b, undefined, { numeric: true });
}

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function markUnlisted(node, values) {
  node.classList.add('st-unlisted');
  node.dataset.tooltip = `Unlisted Tag`;
  return node;
}

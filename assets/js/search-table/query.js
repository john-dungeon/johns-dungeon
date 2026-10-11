import { isExcluded } from './records.js';

export function createQueryParser(columns, nameKey) {
  const fieldPattern = ['tag', ...columns.map(col => col.key)].join('|');
  const halfTyped = new RegExp(`^(${fieldPattern}):$`);

  return function parseQuery(text) {
    const terms = [];
    const pattern = new RegExp(`(-?)(?:(${fieldPattern}):)?(?:"([^"]*)"|(\\S+))`, 'gi');
    let match;
    while ((match = pattern.exec(text)) !== null) {
      let field = match[2] ? match[2].toLowerCase() : nameKey;
      let value = (match[3] !== undefined ? match[3] : match[4]).toLowerCase();
      if (!match[2] && value.startsWith('#')) {
        field = 'tag';
        value = value.slice(1);
      }
      if (!match[2] && (value === '-' || halfTyped.test(value))) continue;
      if (value) terms.push({ negate: match[1] === '-', field, value });
    }
    return terms;
  };
}

function matchNumber(actual, query) {
  const single = /^(>=|<=|>|<|=)?\s*(-?\d+(?:\.\d+)?)$/.exec(query);
  if (single) {
    if (actual === null) return false;
    const n = parseFloat(single[2]);
    switch (single[1]) {
      case '>': return actual > n;
      case '>=': return actual >= n;
      case '<': return actual < n;
      case '<=': return actual <= n;
      default: return actual === n;
    }
  }
  const range = /^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/.exec(query);
  if (range) {
    if (actual === null) return false;
    return actual >= parseFloat(range[1]) && actual <= parseFloat(range[2]);
  }
  return null;
}

function termTest(col, term) {
  const exact = col.match ? col.match === 'exact' : col.type === 'rank';
  return value => (exact ? value === term.value : value.includes(term.value));
}

function matchesTerm(rec, term, byKey) {
  if (term.field === 'tag') {
    return rec.tags.some(tag => tag.includes(term.value));
  }
  const col = byKey[term.field];
  if (col.type === 'number') {
    const numeric = matchNumber(rec.num[col.key], term.value);
    if (numeric !== null) return numeric;
    if (/[a-z]/.test(term.value)) return rec.text[col.key].includes(term.value);
    return null;
  }
  return rec.values[col.key].some(termTest(col, term));
}

export function matchesQuery(rec, terms, byKey) {
  for (const term of terms) {
    const col = byKey[term.field];
    if (term.negate && col && col.type !== 'number') {
      if (isExcluded(rec, col.key, termTest(col, term))) return false;
      continue;
    }
    const hit = matchesTerm(rec, term, byKey);
    if (hit === null) continue;
    if (hit === term.negate) return false;
  }
  return true;
}

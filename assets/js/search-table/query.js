import { NUMBER, parseSpan } from './utils.js';
import { TAG } from './columns.js';
import { isExcluded } from './records.js';

export function createQueryParser(columns, nameKey) {
  const fieldPattern = columns.map(col => col.key).join('|');
  const halfTyped = new RegExp(`^(${fieldPattern}):$`);

  return function parseQuery(text) {
    const terms = [];
    const pattern = new RegExp(`(-?)(?:(${fieldPattern}):)?(?:"([^"]*)"|(\\S+))`, 'gi');
    let match;
    while ((match = pattern.exec(text)) !== null) {
      let field = match[2] ? match[2].toLowerCase() : nameKey;
      let value = (match[3] !== undefined ? match[3] : match[4]).toLowerCase();
      if (!match[2] && value.startsWith('#')) {
        field = TAG;
        value = value.slice(1);
      }
      if (!match[2] && (value === '-' || halfTyped.test(value))) continue;
      if (value) terms.push({ negate: match[1] === '-', field, value });
    }
    return terms;
  };
}

const COMPARE = {
  '>': (a, n) => a > n,
  '>=': (a, n) => a >= n,
  '<': (a, n) => a < n,
  '<=': (a, n) => a <= n,
  '=': (a, n) => a === n
};
const COMPARISON = new RegExp(`^(>=|<=|>|<|=)\\s*(${NUMBER})$`);

function matchNumber(actual, query) {
  const comparison = COMPARISON.exec(query);
  const span = comparison ? null : parseSpan(query);
  if (!comparison && !span) return null;
  if (actual === null) return false;
  if (comparison) return COMPARE[comparison[1]](actual, parseFloat(comparison[2]));
  return actual >= span[0] && actual <= span[1];
}

const textTest = (col, term) =>
  value => (col.exact ? value === term.value : value.includes(term.value));

function matchesTerm(rec, term, col) {
  if (col.numeric) {
    const numeric = matchNumber(rec.num[col.key], term.value);
    if (numeric !== null) return numeric;
    if (/[a-z]/.test(term.value)) return rec.text[col.key].includes(term.value);
    return null;
  }
  return rec.values[col.key].some(textTest(col, term));
}

export function matchesQuery(rec, terms, byKey) {
  for (const term of terms) {
    const col = byKey[term.field];
    if (term.negate && !col.numeric) {
      if (isExcluded(rec, col.key, textTest(col, term))) return false;
      continue;
    }
    const hit = matchesTerm(rec, term, col);
    if (hit === null) continue;
    if (hit === term.negate) return false;
  }
  return true;
}

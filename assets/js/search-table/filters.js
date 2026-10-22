import { isExcluded } from './records.js';

export const newFilters = () => ({ cats: {}, ranges: {}, any: false });

export const NEXT_STATE = { off: 'include', include: 'exclude', exclude: 'off' };
export const readState = (map, value) => map[value] || 'off';

export function writeState(map, value, state) {
  if (state === 'off') delete map[value];
  else map[value] = state;
}

const valuesWithState = (map, state) => Object.keys(map).filter(value => map[value] === state);

export function matchesFilters(rec, filters, byKey) {
  for (const [key, states] of Object.entries(filters.cats)) {
    const buckets = rec.buckets[key];
    const have = buckets || rec.values[key];
    const included = valuesWithState(states, 'include');
    const excluded = valuesWithState(states, 'exclude');
    const isOut = value => excluded.includes(value);
    const hasValue = value => have.includes(value);

    if (included.length) {
      const all = byKey[key].requireAll && !filters.any;
      if (!(all ? included.every(hasValue) : included.some(hasValue))) return false;
    }
    if (excluded.length && (buckets ? buckets.some(isOut) : isExcluded(rec, key, isOut))) return false;
  }

  for (const [key, range] of Object.entries(filters.ranges)) {
    if (range.min === null && range.max === null) continue;
    const low = range.min === null ? -Infinity : range.min;
    const high = range.max === null ? Infinity : range.max;
    if (!rec.spans[key].some(([from, to]) => from <= high && to >= low)) return false;
  }
  return true;
}

export function activeFilterCount(filters) {
  let total = 0;
  for (const states of Object.values(filters.cats)) total += Object.keys(states).length;
  for (const range of Object.values(filters.ranges)) {
    if (range.min !== null || range.max !== null) total++;
  }
  return total;
}

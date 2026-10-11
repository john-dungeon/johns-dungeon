import { el, compareText, toNumber } from './utils.js';
import { isExcluded } from './records.js';

const NEXT_STATE = { off: 'include', include: 'exclude', exclude: 'off' };

export function newFilters() {
  return { tags: {}, any: false, cats: {}, ranges: {} };
}

const readState = (map, value) => map[value] || 'off';

function writeState(map, value, state) {
  if (state === 'off') delete map[value];
  else map[value] = state;
}

const valuesWithState = (map, state) =>
  Object.keys(map).filter(value => map[value] === state);

// Matching
export function matchesFilters(rec, filters) {
  const hasTag = tag => rec.tags.includes(tag);
  const tagsIn = valuesWithState(filters.tags, 'include');
  const tagsOut = valuesWithState(filters.tags, 'exclude');
  if (tagsIn.length) {
    const tagOk = filters.any ? tagsIn.some(hasTag) : tagsIn.every(hasTag);
    if (!tagOk) return false;
  }
  if (tagsOut.some(hasTag)) return false;

  for (const [key, states] of Object.entries(filters.cats)) {
    const have = rec.values[key];
    const included = valuesWithState(states, 'include');
    const excluded = valuesWithState(states, 'exclude');
    if (included.length && !included.some(value => have.includes(value))) return false;
    if (excluded.length && isExcluded(rec, key, value => excluded.includes(value))) return false;
  }

  for (const [key, range] of Object.entries(filters.ranges)) {
    if (range.min === null && range.max === null) continue;
    const actual = rec.num[key];
    if (actual === null || actual === undefined) return false;
    if (range.min !== null && actual < range.min) return false;
    if (range.max !== null && actual > range.max) return false;
  }
  return true;
}

export function activeFilterCount(filters) {
  let total = Object.keys(filters.tags).length;
  for (const states of Object.values(filters.cats)) total += Object.keys(states).length;
  for (const range of Object.values(filters.ranges)) {
    if (range.min !== null || range.max !== null) total++;
  }
  return total;
}

// Panel
function wantsFilter(col, optionLabels) {
  if (col.filter === false) return false;
  if (col.filter === true) return true;
  if (col.in_table === false) return false;
  if (col.type === 'number') return true;
  const distinct = Object.keys(optionLabels[col.key] || {}).length;
  return distinct > 1 && distinct <= 30;
}

function optionGroup(title, entries, getState, setState, onChange) {
  const group = el('div', 'st-filter-group');
  group.appendChild(el('div', 'st-filter-title', title));
  const wrap = el('div', 'st-filter-options');

  entries.forEach(entry => {
    const button = el('button', 'st-opt', entry.label);
    button.type = 'button';

    const paint = () => {
      const state = getState(entry.value);
      const words = state === 'include' ? 'included' : state === 'exclude' ? 'excluded' : 'not filtered';
      button.setAttribute('data-state', state);
      button.setAttribute('aria-pressed', state === 'off' ? 'false' : 'true');
      button.setAttribute('aria-label', `${entry.label}, ${words}`);
    };

    paint();
    button.addEventListener('click', () => {
      setState(entry.value, NEXT_STATE[getState(entry.value)]);
      paint();
      onChange();
    });
    wrap.appendChild(button);
  });

  group.appendChild(wrap);
  return group;
}

function rangeInput(label, placeholder, value) {
  const input = el('input', 'st-range-input');
  input.type = 'number';
  input.step = 'any';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', label);
  if (value !== null && value !== undefined) input.value = value;
  return input;
}

function rangeGroup(col, { state, onChange }) {
  const group = el('div', 'st-filter-group');
  const unit = col.suffix ? ` (${col.suffix.trim()})` : '';
  group.appendChild(el('div', 'st-filter-title', col.label + unit));

  const current = state.filters.ranges[col.key] || { min: null, max: null };
  const minInput = rangeInput(`${col.label} minimum`, 'Min', current.min);
  const maxInput = rangeInput(`${col.label} maximum`, 'Max', current.max);
  const update = () => {
    state.filters.ranges[col.key] = { min: toNumber(minInput.value), max: toNumber(maxInput.value) };
    onChange();
  };
  minInput.addEventListener('input', update);
  maxInput.addEventListener('input', update);

  const row = el('div', 'st-range');
  row.append(minInput, el('span', 'st-range-to', 'to'), maxInput);
  group.appendChild(row);
  return group;
}

const rankOf = (col, value) => {
  const index = col.rankList.indexOf(value);
  return index === -1 ? 999 : index;
};

function categoryGroup(col, { optionLabels, state, onChange }) {
  const labels = optionLabels[col.key] || {};
  const values = Object.keys(labels).sort((a, b) => {
    if (col.type === 'rank') {
      const rankA = rankOf(col, a);
      const rankB = rankOf(col, b);
      if (rankA !== rankB) return rankA - rankB;
    }
    return compareText(labels[a], labels[b]);
  });
  const entries = values.map(value => ({ value, label: labels[value] }));

  return optionGroup(col.label, entries,
    value => readState(state.filters.cats[col.key] || {}, value),
    (value, next) => {
      state.filters.cats[col.key] = state.filters.cats[col.key] || {};
      writeState(state.filters.cats[col.key], value, next);
    },
    onChange);
}

function limitGroup({ state, limits, onChange }) {
  const group = el('div', 'st-filter-group');
  group.appendChild(el('div', 'st-filter-title', 'Results shown'));

  const slider = el('input', 'st-limit-slider');
  slider.type = 'range';
  slider.min = limits.min;
  slider.max = limits.max;
  slider.step = limits.step;
  slider.value = state.limit;
  slider.setAttribute('aria-label', 'Number of results shown');

  const output = el('output', 'st-limit-value', String(state.limit));
  slider.addEventListener('input', () => {
    state.limit = parseInt(slider.value, 10);
    output.textContent = String(state.limit);
    onChange();
  });

  const row = el('div', 'st-limit');
  row.append(slider, output);
  group.appendChild(row);
  return group;
}

export function buildPanel(panel, ctx) {
  const { columns, optionLabels, tagLabels, showTags, state, onChange } = ctx;
  panel.textContent = '';

  panel.appendChild(el('p', 'st-filter-hint',
    'Click a tag or category once to include it, twice to exclude it, and a third time to clear it.'));

  columns.forEach(col => {
    if (col.index === 0 || !wantsFilter(col, optionLabels)) return;
    panel.appendChild(col.type === 'number' ? rangeGroup(col, ctx) : categoryGroup(col, ctx));
  });

  const tagValues = showTags ? Object.keys(tagLabels) : [];
  if (tagValues.length) {
    tagValues.sort((a, b) => compareText(tagLabels[a], tagLabels[b]));
    const entries = tagValues.map(value => ({ value, label: tagLabels[value] }));
    panel.appendChild(optionGroup('Tags', entries,
      value => readState(state.filters.tags, value),
      (value, next) => writeState(state.filters.tags, value, next),
      onChange));
  }

  panel.appendChild(limitGroup(ctx));

  const footer = el('div', 'st-filter-footer');
  if (tagValues.length) {
    const label = el('label', 'st-filter-match');
    const box = el('input');
    box.type = 'checkbox';
    box.checked = state.filters.any;
    box.addEventListener('change', () => {
      state.filters.any = box.checked;
      onChange();
    });
    label.append(box, 'Match any included tag (instead of all).');
    footer.appendChild(label);
  }

  const clear = el('button', 'st-filter-clear', 'Clear filters');
  clear.type = 'button';
  clear.addEventListener('click', () => {
    state.filters = newFilters();
    buildPanel(panel, ctx);
    onChange();
  });
  footer.appendChild(clear);
  panel.appendChild(footer);
}

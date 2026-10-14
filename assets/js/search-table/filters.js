import { el, toNumber } from './utils.js';
import { isExcluded } from './records.js';

const NEXT_STATE = { off: 'include', include: 'exclude', exclude: 'off' };
const STATE_WORDS = { off: 'not filtered', include: 'included', exclude: 'excluded' };

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
function amountOf(rec, col) {
  const number = rec.num[col.key];
  if (number !== null && number !== undefined) return number;
  if (!col.slider) return null;
  const text = rec.text[col.key];
  if (text === col.slider.min_label.toLowerCase()) return 0;
  return text === col.slider.max_label.toLowerCase() ? Infinity : null;
}

export function matchesFilters(rec, filters, byKey) {
  const hasTag = tag => rec.tags.includes(tag);
  const tagsIn = valuesWithState(filters.tags, 'include');
  const tagsOut = valuesWithState(filters.tags, 'exclude');
  if (tagsIn.length) {
    const tagOk = filters.any ? tagsIn.some(hasTag) : tagsIn.every(hasTag);
    if (!tagOk) return false;
  }
  if (tagsOut.some(hasTag)) return false;

  for (const [key, states] of Object.entries(filters.cats)) {
    const buckets = rec.buckets[key];
    const have = buckets || rec.values[key];
    const included = valuesWithState(states, 'include');
    const excluded = valuesWithState(states, 'exclude');
    const isOut = value => excluded.includes(value);
    if (included.length && !included.some(value => have.includes(value))) return false;
    if (excluded.length && (buckets ? buckets.some(isOut) : isExcluded(rec, key, isOut))) return false;
  }

  for (const [key, range] of Object.entries(filters.ranges)) {
    if (range.min === null && range.max === null) continue;
    const actual = amountOf(rec, byKey[key]);
    if (actual === null) return false;
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
function wantsFilter(col) {
  if (col.filter === false) return false;
  return col.type === 'number' || col.choices.length > 0;
}

function filterTitle(col) {
  const suffix = col.format === 'money' ? ' GP' : col.suffix;
  return suffix ? `${col.label} (${suffix.trim()})` : col.label;
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
      button.setAttribute('aria-label', `${entry.label}, ${STATE_WORDS[state]}`);
      button.setAttribute('data-state', state);
      button.setAttribute('aria-pressed', state === 'off' ? 'false' : 'true');
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
  group.appendChild(el('div', 'st-filter-title', filterTitle(col)));

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

const THUMB_REM = 1;

const positionLabel = ({ max, min_label, max_label }, pos) =>
  pos === 0 ? min_label : pos > max ? max_label : pos.toLocaleString('en-US');

function parsePosition(text, { max, min_label, max_label }) {
  const typed = text.trim().toLowerCase();
  if (typed === min_label.toLowerCase()) return 0;
  if (typed === max_label.toLowerCase()) return max + 1;
  const n = toNumber(typed.replace(/,/g, ''));
  if (n === null) return null;
  if (n <= 0) return 0;
  return n > max ? max + 1 : Math.max(1, Math.round(n));
}

function sliderBox(label) {
  const box = el('input', 'st-range-input st-slider-box');
  box.type = 'text';
  box.inputMode = 'numeric';
  box.setAttribute('aria-label', label);
  return box;
}

function sliderThumb(label, top) {
  const thumb = el('input', 'st-slider-thumb');
  thumb.type = 'range';
  thumb.min = 0;
  thumb.max = top;
  thumb.step = 1;
  thumb.setAttribute('aria-label', label);
  return thumb;
}

function sliderGroup(col, { state, onChange }) {
  const spec = col.slider;
  const top = spec.max + 1;
  const saved = state.filters.ranges[col.key] || { min: null, max: null };
  let low = saved.min === null ? 0 : saved.min;
  let high = saved.max === null ? top : saved.max;

  const lowBox = sliderBox(`${col.label} minimum`);
  const highBox = sliderBox(`${col.label} maximum`);
  const lowThumb = sliderThumb(`${col.label} minimum`, top);
  const highThumb = sliderThumb(`${col.label} maximum`, top);
  const fill = el('span', 'st-slider-fill');
  const slider = el('div', 'st-slider');
  slider.append(fill, lowThumb, highThumb);

  function paint() {
    lowThumb.value = low;
    highThumb.value = high;
    lowBox.value = positionLabel(spec, low);
    highBox.value = positionLabel(spec, high);
    lowThumb.setAttribute('aria-valuetext', lowBox.value);
    highThumb.setAttribute('aria-valuetext', highBox.value);
    lowThumb.classList.toggle('st-on-top', low > top / 2);
    const edge = share => `calc(${THUMB_REM / 2}rem + (100% - ${THUMB_REM}rem) * ${share})`;
    fill.style.left = edge(low / top);
    fill.style.right = edge(1 - high / top);
  }

  function commit(nextLow, nextHigh) {
    low = nextLow;
    high = nextHigh;
    state.filters.ranges[col.key] = {
      min: low === 0 ? null : low,
      max: high === top ? null : high
    };
    paint();
    onChange();
  }

  const typed = (box, fallback) => {
    const pos = parsePosition(box.value, spec);
    return pos === null ? fallback : pos;
  };
  lowThumb.addEventListener('input', () => commit(Math.min(+lowThumb.value, high), high));
  highThumb.addEventListener('input', () => commit(low, Math.max(+highThumb.value, low)));
  lowBox.addEventListener('change', () => commit(Math.min(typed(lowBox, low), high), high));
  highBox.addEventListener('change', () => commit(low, Math.max(typed(highBox, high), low)));

  const row = el('div', 'st-slider-row');
  row.append(lowBox, slider, highBox);
  const group = el('div', 'st-filter-group');
  group.append(el('div', 'st-filter-title', filterTitle(col)), row);
  paint();
  return group;
}

function categoryGroup(col, { state, onChange }) {
  return optionGroup(col.label, col.choices,
    value => readState(state.filters.cats[col.key] || {}, value),
    (value, next) => {
      state.filters.cats[col.key] = state.filters.cats[col.key] || {};
      writeState(state.filters.cats[col.key], value, next);
    },
    onChange);
}

function groupFor(col, ctx) {
  if (col.type !== 'number') return categoryGroup(col, ctx);
  return col.slider ? sliderGroup(col, ctx) : rangeGroup(col, ctx);
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
  const { columns, tags, state, onChange } = ctx;
  panel.textContent = '';

  panel.appendChild(el('p', 'st-filter-hint',
    'Click a tag or category once to include it, twice to exclude it, and a third time to clear it.'));

  columns.forEach(col => {
    if (col.index === 0 || !wantsFilter(col)) return;
    panel.appendChild(groupFor(col, ctx));
  });

  if (tags.choices.length) {
    panel.appendChild(optionGroup('Tags', tags.choices,
      value => readState(state.filters.tags, value),
      (value, next) => writeState(state.filters.tags, value, next),
      onChange));
  }

  panel.appendChild(limitGroup(ctx));

  const footer = el('div', 'st-filter-footer');
  if (tags.choices.length) {
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

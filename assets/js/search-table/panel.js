import { el, t, toNumber } from './utils.js';
import { newFilters, NEXT_STATE, readState, writeState } from './filters.js';

function filterGroup(title, ...content) {
  const group = el('div', 'st-filter-group');
  group.append(el('div', 'st-filter-title', title), ...content);
  return group;
}

// Column Filter
const wantsFilter = col => col.filter !== false && (col.numeric || col.choices.length > 0);

// Numerical Column
function filterTitle(col) {
  const unit = col.unit || (col.suffix && col.suffix.trim());
  return unit ? `${col.label} (${unit})` : col.label;
}

// Category Buttons
function categoryGroup(col, { state, onChange }) {
  const wrap = el('div', 'st-filter-options');
  const states = () => (state.filters.cats[col.key] ||= {});
  const stateOf = choice => readState(states(), choice.value);

  function makeOption(choice, text, { label = choice.label, rivals = [], refresh } = {}) {
    const button = el('button', 'st-opt', text);
    button.type = 'button';

    const paint = () => {
      const current = stateOf(choice);
      button.setAttribute('aria-label', t('option_label', { label, state: t('state_' + current) }));
      button.dataset.state = current;
      button.setAttribute('aria-pressed', String(current !== 'off'));
    };

    button.addEventListener('click', () => {
      writeState(states(), choice.value, NEXT_STATE[stateOf(choice)]);
      if (stateOf(choice) !== 'off') {
        rivals.forEach(rival => writeState(states(), rival.value, 'off'));
      }
      (refresh || paint)();
      onChange();
    });

    paint();
    return { button, paint };
  }

  function makeGroup(node) {
    const header = el('button', 'st-opt st-opt-group');
    header.type = 'button';
    header.setAttribute('aria-label', t('option_more', { label: node.label }));
    const menu = el('div', 'st-filter-options st-opt-menu');
    menu.hidden = true;

    const options = [
      makeOption(node, t('filter_any'), {
        label: `${node.label}: ${t('filter_any')}`,
        rivals: node.subs,
        refresh: repaint
      }),
      ...node.subs.map(sub => makeOption(sub, sub.text, { rivals: [node], refresh: repaint }))
    ];
    menu.append(...options.map(option => option.button));

    function repaint() {
      options.forEach(option => option.paint());
      const picked = node.subs.filter(sub => stateOf(sub) !== 'off').length;
      header.dataset.state = stateOf(node);
      header.dataset.partial = String(picked > 0);
      header.setAttribute('aria-expanded', String(!menu.hidden));
      header.replaceChildren(
        node.label + (picked ? ` · ${picked}` : ''),
        el('span', 'st-caret', menu.hidden ? '▾' : '▴')
      );
    }

    header.addEventListener('click', () => {
      menu.hidden = !menu.hidden;
      repaint();
    });

    repaint();
    return [header, menu];
  }

  col.tree.forEach(node => {
    if (node.subs.length) wrap.append(...makeGroup(node));
    else wrap.append(makeOption(node, node.label).button);
  });

  return filterGroup(col.label, wrap);
}

// Min, Max
function rangeGroup(col, { state, onChange }) {
  const current = state.filters.ranges[col.key] || { min: null, max: null };
  const makeInput = (labelKey, placeholderKey, value) => {
    const input = el('input', 'st-range-input');
    input.type = 'number';
    input.step = 'any';
    input.placeholder = t(placeholderKey);
    input.setAttribute('aria-label', t(labelKey, { label: col.label }));
    if (value !== null && value !== undefined) input.value = value;
    return input;
  };
  const minInput = makeInput('filter_min_label', 'filter_min', current.min);
  const maxInput = makeInput('filter_max_label', 'filter_max', current.max);
  const update = () => {
    state.filters.ranges[col.key] = { min: toNumber(minInput.value), max: toNumber(maxInput.value) };
    onChange();
  };
  minInput.addEventListener('input', update);
  maxInput.addEventListener('input', update);

  const row = el('div', 'st-range');
  row.append(minInput, el('span', 'st-range-to', t('filter_to')), maxInput);
  return filterGroup(filterTitle(col), row);
}

// Double-Ended Slider
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

function sliderGroup(col, { state, onChange }) {
  const spec = col.slider;
  const top = spec.max + 1;
  const saved = state.filters.ranges[col.key] || { min: null, max: null };
  let low = saved.min === null ? 0 : saved.min;
  let high = saved.max === null ? top : saved.max;

  const makeBox = labelKey => {
    const box = el('input', 'st-range-input st-slider-box');
    box.type = 'text';
    box.inputMode = 'numeric';
    box.setAttribute('aria-label', t(labelKey, { label: col.label }));
    return box;
  };
  const makeThumb = labelKey => {
    const thumb = el('input', 'st-slider-thumb');
    thumb.type = 'range';
    thumb.min = 0;
    thumb.max = top;
    thumb.step = 1;
    thumb.setAttribute('aria-label', t(labelKey, { label: col.label }));
    return thumb;
  };

  const lowBox = makeBox('filter_min_label');
  const highBox = makeBox('filter_max_label');
  const lowThumb = makeThumb('filter_min_label');
  const highThumb = makeThumb('filter_max_label');
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
    slider.style.setProperty('--low', low / top);
    slider.style.setProperty('--high', high / top);
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
  paint();
  return filterGroup(filterTitle(col), row);
}

function limitGroup({ state, limits, onChange }) {
  const slider = el('input', 'st-limit-slider');
  slider.type = 'range';
  slider.min = limits.min;
  slider.max = limits.max;
  slider.step = limits.step;
  slider.value = state.limit;
  slider.setAttribute('aria-label', t('filter_limit_label'));

  const output = el('output', 'st-limit-value', String(state.limit));
  slider.addEventListener('input', () => {
    state.limit = parseInt(slider.value, 10);
    output.textContent = String(state.limit);
    onChange();
  });

  const row = el('div', 'st-limit');
  row.append(slider, output);
  return filterGroup(t('filter_limit'), row);
}

const groupFor = (col, ctx) => {
  if (!col.numeric) return categoryGroup(col, ctx);
  return col.slider ? sliderGroup(col, ctx) : rangeGroup(col, ctx);
};

export function buildPanel(panel, ctx) {
  const { columns, state, onChange } = ctx;
  panel.textContent = '';
  panel.appendChild(el('p', 'st-filter-hint', t('filter_hint')));

  columns.forEach(col => {
    if (col.index === 0 || !wantsFilter(col)) return;
    panel.appendChild(groupFor(col, ctx));
  });
  panel.appendChild(limitGroup(ctx));

  const footer = el('div', 'st-filter-footer');
  if (columns.some(col => col.requireAll && col.filter !== false && col.choices.length)) {
    const label = el('label', 'st-filter-match');
    const box = el('input');
    box.type = 'checkbox';
    box.checked = state.filters.any;
    box.addEventListener('change', () => {
      state.filters.any = box.checked;
      onChange();
    });
    label.append(box, t('filter_match_any'));
    footer.appendChild(label);
  }

  const clear = el('button', 'st-filter-clear', t('filter_clear'));
  clear.type = 'button';
  clear.addEventListener('click', () => {
    state.filters = newFilters();
    buildPanel(panel, ctx);
    onChange();
  });
  footer.appendChild(clear);
  panel.appendChild(footer);
}

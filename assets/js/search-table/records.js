import { toNumber, el, markUnlisted } from './utils.js';

const AMOUNTS = '...';

function bucketChoices(col) {
  return col.buckets.map(bucket => {
    const named = typeof bucket === 'string';
    const spec = named ? { label: bucket } : bucket;
    return {
      value: spec.label.toLowerCase(),
      label: spec.label,
      named,
      upTo: spec.up_to ? toAmount(col, spec.up_to.toLowerCase()) : Infinity
    };
  });
}

function bucketsFor(col, text) {
  if (!text) return [];
  const exact = col.choices.find(choice => choice.named && choice.value === text);
  if (exact) return [exact.value];
  const amount = toAmount(col, text);
  const fit = amount === null
    ? null
    : col.choices.find(choice => !choice.named && amount <= choice.upTo);
  return fit ? [fit.value] : [];
}

export function prepareColumns(config) {
  const columns = config.columns;
  columns.forEach((col, index) => {
    col.type = col.type || 'text';
    col.index = index;
    col.byRank = ['rank', 'number', 'measure'].includes(col.type);

    const items = (col.order || []).map(String);
    const slot = items.indexOf(AMOUNTS);
    const named = items.filter(item => item !== AMOUNTS);
    col.listed = new Set(named.map(item => item.toLowerCase()));
    col.choices = col.buckets
      ? bucketChoices(col)
      : named.map(item => {
          const value = item.toLowerCase();
          return { value, label: (col.labels && col.labels[value]) || item };
        });

    const after = slot === -1 ? [] : items.slice(slot + 1);
    col.lead = (slot === -1 ? named : items.slice(0, slot)).map(item => item.toLowerCase());
    col.trail = new Set(after.map(item => item.toLowerCase()));
  });
  const byKey = Object.fromEntries(columns.map(col => [col.key, col]));
  return { columns, byKey, nameKey: columns[0].key };
}

export function prepareTags(config) {
  const shown = config.tags !== false;
  const list = shown && Array.isArray(config.tags) ? config.tags : [];
  const choices = list.map(tag => ({ value: String(tag).toLowerCase(), label: String(tag) }));
  const listed = new Set(choices.map(choice => choice.value));
  return { shown, choices, isListed: tag => listed.has(tag.toLowerCase()) };
}

function toAmount(col, text) {
  if (col.type === 'number') return toNumber(text);
  const match = /^(\d[\d,]*(?:\.\d+)?)\s*([a-z]+)$/.exec(text);
  if (!match || !col.units) return null;
  const size = col.units[match[2]] ?? col.units[match[2].replace(/s$/, '')];
  return size === undefined ? null : parseFloat(match[1].replace(/,/g, '')) * size;
}

function sortKey(col, text) {
  if (!text) return null;
  if (!col.byRank) return { group: 0, amount: null, text };
  const named = col.lead.indexOf(text);
  if (named !== -1) return { group: named, amount: null, text };
  const amount = toAmount(col, text);
  if (amount !== null) return { group: col.lead.length, amount, text };
  return col.trail.has(text) ? { group: col.lead.length + 1, amount: null, text } : null;
}

const SPAN = /^(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?$/;

function spansFor(col, raw, optionsRaw) {
  const spans = [];
  const own = toNumber(raw);
  if (own !== null) spans.push([own, own]);
  else if (col.slider && raw === col.slider.min_label.toLowerCase()) spans.push([0, 0]);
  else if (col.slider && raw === col.slider.max_label.toLowerCase()) spans.push([Infinity, Infinity]);

  (optionsRaw ? optionsRaw.split(', ') : []).forEach(part => {
    const match = SPAN.exec(part.trim());
    if (!match) return;
    const from = parseFloat(match[1]);
    spans.push([from, match[2] ? parseFloat(match[2]) : from]);
  });
  return spans;
}

export function readRecords(body, columns) {
  return [...body.rows].map(row => {
    const tagNameText = row.getAttribute('data-tag-names');
    const rec = {
      row,
      tags: tagNameText ? tagNameText.toLowerCase().split(',') : [],
      text: {}, num: {}, sort: {},
      own: {}, extra: {}, values: {}, buckets: {}, spans: {}
    };

    columns.forEach(col => {
      const raw = row.getAttribute('data-v-' + col.key) || '';
      rec.text[col.key] = raw;

      const blank = col.blank_as === undefined ? [] : [String(col.blank_as).toLowerCase()];
      const own = raw === '' ? blank : (col.type === 'list' ? raw.split(', ') : [raw]);
      const extraRaw = col.type === 'number' ? null : row.getAttribute('data-o-' + col.key);
      const extra = extraRaw ? extraRaw.split(', ') : [];
      const values = [...own];
      extra.forEach(label => {
        const lower = label.toLowerCase();
        if (!values.includes(lower)) values.push(lower);
      });
      rec.own[col.key] = own;
      rec.extra[col.key] = extra;
      rec.values[col.key] = values;

      if (col.type === 'number') {
        rec.num[col.key] = toNumber(raw);
        rec.spans[col.key] = spansFor(col, raw, row.getAttribute('data-o-' + col.key));
      }

      const sortText = col.byRank ? (row.getAttribute('data-s-' + col.key) || own[0]) : raw;
      rec.sort[col.key] = sortKey(col, sortText);
      if (col.buckets) rec.buckets[col.key] = bucketsFor(col, sortText);
    });
    return rec;
  });
}

function flagListItems(cell, isKnown) {
  const items = cell.textContent.trim().split(', ');
  cell.textContent = '';
  items.forEach((item, i) => {
    if (i > 0) cell.append(', ');
    cell.append(isKnown(item) ? item : markUnlisted(el('span', '', item), item));
  });
}

export function flagUnlisted(records, columns) {
  records.forEach(rec => {
    columns.forEach(col => {
      if (col.index === 0 || col.listed.size === 0) return;
      const cell = rec.row.cells[col.index];
      const isKnown = text => col.listed.has(text.toLowerCase()) || toAmount(col, text.toLowerCase()) !== null;
      const badOwn = rec.own[col.key].filter(value => !isKnown(value));
      const badExtra = rec.extra[col.key].filter(value => !isKnown(value));

      if (col.type === 'list') {
        if (badOwn.length) flagListItems(cell, isKnown);
        if (badExtra.length) markUnlisted(cell, badExtra);
      } else if (badOwn.length || badExtra.length) {
        markUnlisted(cell, [...badOwn, ...badExtra]);
      }
    });
  });
}

export function isExcluded(rec, key, test) {
  if (rec.own[key].some(test)) return true;
  const extra = rec.extra[key].map(label => label.toLowerCase());
  return extra.length > 0 && extra.every(test);
}

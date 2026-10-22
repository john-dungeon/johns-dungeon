import { toNumber, parseSpan, compareText, el, markUnlisted } from './utils.js';
import { amountOf, TAG } from './columns.js';

function bucketsFor(col, text) {
  if (!text) return [];
  const exact = col.choices.find(choice => choice.named && choice.value === text);
  if (exact) return [exact.value];
  const amount = amountOf(col, text);
  const fit = amount === null
    ? null
    : col.choices.find(choice => !choice.named && amount <= choice.upTo);
  return fit ? [fit.value] : [];
}

function sortKey(col, text) {
  if (!text) return null;
  if (!col.ranked) return { group: 0, amount: null, text };
  const named = col.lead.indexOf(text);
  if (named !== -1) return { group: named, amount: null, text };
  const amount = amountOf(col, text);
  if (amount !== null) return { group: col.lead.length, amount, text };
  const tail = col.trail.indexOf(text);
  return tail === -1 ? null : { group: col.lead.length + 1 + tail, amount: null, text };
}

function spansFor(col, raw, optionsRaw) {
  const spans = [];
  const own = toNumber(raw);
  if (own !== null) spans.push([own, own]);
  else if (col.slider && raw === col.slider.min_label.toLowerCase()) spans.push([0, 0]);
  else if (col.slider && raw === col.slider.max_label.toLowerCase()) spans.push([Infinity, Infinity]);

  (optionsRaw ? optionsRaw.split(', ') : []).forEach(part => {
    const span = parseSpan(part);
    if (span) spans.push(span);
  });
  return spans;
}

function rawValue(row, col) {
  if (col.key === TAG) return (row.getAttribute('data-tag-names') || '').toLowerCase().replace(/,/g, ', ');
  return row.getAttribute('data-v-' + col.key) || '';
}

function readColumn(rec, row, col) {
  const key = col.key;
  const raw = rawValue(row, col);
  const optionsRaw = row.getAttribute('data-o-' + key);

  const blank = col.blank_as === undefined ? [] : [String(col.blank_as).toLowerCase()];
  const own = raw === '' ? blank : (col.multi ? raw.split(', ') : [raw]);
  const extra = optionsRaw && !col.numeric ? optionsRaw.split(', ') : [];
  const values = [...own];
  extra.forEach(label => {
    const lower = label.toLowerCase();
    if (!values.includes(lower)) values.push(lower);
  });

  rec.text[key] = raw;
  rec.own[key] = own;
  rec.extra[key] = extra;
  rec.values[key] = values;

  if (col.numeric) {
    rec.num[key] = toNumber(raw);
    rec.spans[key] = spansFor(col, raw, optionsRaw);
  }

  const sortText = col.ranked ? (row.getAttribute('data-s-' + key) || own[0]) : raw;
  rec.sort[key] = sortKey(col, sortText);
  if (col.buckets) rec.buckets[key] = bucketsFor(col, sortText);
}

export function readRecords(body, columns) {
  return [...body.rows].map(row => {
    const rec = { row, text: {}, num: {}, sort: {}, own: {}, extra: {}, values: {}, buckets: {}, spans: {} };
    columns.forEach(col => readColumn(rec, row, col));
    return rec;
  });
}

export function compareRecords(a, b, key, dir, nameKey) {
  const ka = a.sort[key];
  const kb = b.sort[key];
  const tie = compareText(a.text[nameKey], b.text[nameKey]);
  if (ka === null && kb === null) return tie;
  if (ka === null) return 1;
  if (kb === null) return -1;
  const result = ka.group - kb.group
    || (ka.amount || 0) - (kb.amount || 0)
    || compareText(ka.text, kb.text);
  return result === 0 ? tie : result * dir;
}

function flagListItems(cell, isKnown) {
  const items = cell.textContent.trim().split(', ');
  cell.textContent = '';
  items.forEach((item, i) => {
    if (i > 0) cell.append(', ');
    cell.append(isKnown(item) ? item : markUnlisted(el('span', '', item)));
  });
}

export function flagUnlisted(records, columns) {
  records.forEach(rec => {
    columns.forEach(col => {
      if (col.virtual || col.index === 0 || col.listed.size === 0) return;
      const cell = rec.row.cells[col.index];
      const isKnown = text => col.listed.has(text.toLowerCase()) || amountOf(col, text.toLowerCase()) !== null;
      const badOwn = rec.own[col.key].filter(value => !isKnown(value));
      const badExtra = rec.extra[col.key].filter(value => !isKnown(value));

      if (col.multi) {
        if (badOwn.length) flagListItems(cell, isKnown);
        if (badExtra.length) markUnlisted(cell);
      } else if (badOwn.length || badExtra.length) {
        markUnlisted(cell);
      }
    });
  });
}

export function isExcluded(rec, key, test) {
  if (rec.own[key].some(test)) return true;
  const extra = rec.extra[key].map(label => label.toLowerCase());
  return extra.length > 0 && extra.every(test);
}

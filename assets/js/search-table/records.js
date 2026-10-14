import { toNumber, el, markUnlisted } from './utils.js';

export function prepareColumns(config) {
  const columns = config.columns;
  columns.forEach((col, index) => {
    col.type = col.type || 'text';
    col.index = index;
    col.choices = (col.order || []).map(item => {
      const value = String(item).toLowerCase();
      return { value, label: (col.labels && col.labels[value]) || String(item) };
    });
    col.listed = new Set(col.choices.map(choice => choice.value));
    if (col.type === 'rank') col.rankList = col.choices.map(choice => choice.value);
  });
  const byKey = Object.fromEntries(columns.map(col => [col.key, col]));
  return { columns, byKey, nameKey: columns[0].key };
}

export function readRecords(body, columns) {
  return [...body.rows].map(row => {
    const tagNameText = row.getAttribute('data-tag-names');
    const rec = {
      row,
      tags: tagNameText ? tagNameText.toLowerCase().split(',') : [],
      text: {}, num: {}, rank: {},
      own: {}, extra: {}, values: {}
    };

    columns.forEach(col => {
      const raw = row.getAttribute('data-v-' + col.key) || '';
      rec.text[col.key] = raw;

      const own = raw === '' ? [] : (col.type === 'list' ? raw.split(', ') : [raw]);
      const extraRaw = col.type === 'number' ? null : row.getAttribute('data-o-' + col.key);
      const extra = extraRaw ? extraRaw.split(', ') : [];
      if (raw === '' && col.blank_as !== undefined) extra.push(String(col.blank_as));
      const values = [...own];
      extra.forEach(label => {
        const lower = label.toLowerCase();
        if (!values.includes(lower)) values.push(lower);
      });
      rec.own[col.key] = own;
      rec.extra[col.key] = extra;
      rec.values[col.key] = values;

      if (col.type === 'number') rec.num[col.key] = toNumber(raw);
      if (col.type === 'rank') {
        const index = col.rankList.indexOf(raw);
        rec.rank[col.key] = index === -1 ? null : index + 1;
      }
    });
    return rec;
  });
}

export function prepareTags(config) {
  const shown = config.tags !== false;
  const list = shown && Array.isArray(config.tags) ? config.tags : [];
  const choices = list.map(tag => ({ value: String(tag).toLowerCase(), label: String(tag) }));
  const listed = new Set(choices.map(choice => choice.value));
  return { shown, choices, isListed: tag => listed.has(tag.toLowerCase()) };
}

function flagListItems(cell, isListed) {
  const items = cell.textContent.trim().split(', ');
  cell.textContent = '';
  items.forEach((item, i) => {
    if (i > 0) cell.append(', ');
    cell.append(isListed(item) ? item : markUnlisted(el('span', '', item)));
  });
}

export function flagUnlisted(records, columns) {
  records.forEach(rec => {
    columns.forEach(col => {
      if (col.index === 0 || col.type === 'number' || col.listed.size === 0) return;
      const cell = rec.row.cells[col.index];
      const isListed = text => col.listed.has(text.toLowerCase());
      const badOwn = rec.own[col.key].filter(value => !isListed(value));
      const badExtra = rec.extra[col.key].filter(value => !isListed(value));

      if (col.type === 'list') {
        if (badOwn.length) flagListItems(cell, isListed);
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

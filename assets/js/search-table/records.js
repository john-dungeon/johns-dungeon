import { toNumber } from './utils.js';

export function prepareColumns(config) {
  const columns = config.columns;
  columns.forEach((col, index) => {
    col.type = col.type || 'text';
    col.index = index;
    if (col.type === 'rank') {
      col.rankList = (col.order || []).map(item => String(item).toLowerCase());
    }
  });
  const byKey = Object.fromEntries(columns.map(col => [col.key, col]));
  return { columns, byKey, nameKey: columns[0].key };
}

export function readRecords(body, columns) {
  return [...body.rows].map(row => {
    const tagNameText = row.getAttribute('data-tag-names');
    const tagNames = tagNameText ? tagNameText.split(',') : [];
    const rec = {
      row,
      tagNames,
      tags: tagNames.map(tag => tag.toLowerCase()),
      text: {}, num: {}, rank: {},
      own: {}, extra: {}, values: {}
    };

    columns.forEach(col => {
      const raw = row.getAttribute('data-v-' + col.key) || '';
      rec.text[col.key] = raw;

      const own = raw === '' ? [] : (col.type === 'list' ? raw.split(', ') : [raw]);
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

      if (col.type === 'number') rec.num[col.key] = toNumber(raw);
      if (col.type === 'rank') {
        const index = col.rankList.indexOf(raw);
        rec.rank[col.key] = index === -1 ? null : index + 1;
      }
    });
    return rec;
  });
}

export function collectLabels(records, columns) {
  const tagLabels = {};
  const optionLabels = {};

  const setLabel = (key, value, label) => {
    optionLabels[key] = optionLabels[key] || {};
    if (!optionLabels[key][value]) optionLabels[key][value] = label;
  };

  records.forEach(rec => {
    rec.tags.forEach((tag, i) => {
      if (!tagLabels[tag]) tagLabels[tag] = rec.tagNames[i] || tag;
    });
    columns.forEach(col => {
      if (col.index === 0 || col.type === 'number') return;
      const cell = rec.row.cells[col.index];
      const cellText = (cell.getAttribute('data-text') || cell.textContent).trim();
      const ownLabels = col.type === 'list' ? cellText.split(', ') : [cellText];
      rec.own[col.key].forEach((value, i) => setLabel(col.key, value, ownLabels[i] || value));
      rec.extra[col.key].forEach(label => setLabel(col.key, label.toLowerCase(), label));
    });
  });

  return { tagLabels, optionLabels };
}

export function isExcluded(rec, key, test) {
  if (rec.own[key].some(test)) return true;
  const extra = rec.extra[key].map(label => label.toLowerCase());
  return extra.length > 0 && extra.every(test);
}

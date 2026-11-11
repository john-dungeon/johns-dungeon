import { t, toNumber } from './utils.js';
import { TAG, splitTag, expandTags } from './tags.js';

const TYPES = {
  text: {},
  list: { multi: true },
  rank: { ranked: true, exact: true },
  measure: { ranked: true },
  number: { ranked: true, numeric: true }
};

const AMOUNTS = '...';

export function amountOf(col, text) {
  if (col.numeric) return toNumber(text);
  const match = /^(\d[\d,]*(?:\.\d+)?)\s*([a-z]+)$/.exec(text);
  if (!match || !col.units) return null;
  const size = col.units[match[2]] ?? col.units[match[2].replace(/s$/, '')];
  return size === undefined ? null : parseFloat(match[1].replace(/,/g, '')) * size;
}

function bucketChoices(col) {
  return col.buckets.map(bucket => {
    const named = typeof bucket === 'string';
    const spec = named ? { label: bucket } : bucket;
    return {
      value: spec.label.toLowerCase(),
      label: spec.label,
      named,
      upTo: spec.up_to ? amountOf(col, spec.up_to.toLowerCase()) : Infinity
    };
  });
}

function buildTree(col) {
  const nodes = new Map();
  col.choices.forEach(choice => {
    const [group, sub] = col.nested ? splitTag(choice.label) : [choice.label, ''];
    if (!sub) {
      nodes.set(choice.value, { ...choice, subs: [] });
      return;
    }
    const parent = nodes.get(group.toLowerCase());
    if (parent) parent.subs.push({ ...choice, text: sub });
    else console.warn(`Subtag "${choice.label}" has no parent listed before it in column "${col.key}"`);
  });
  return [...nodes.values()];
}

function prepareColumn(col, index, lists) {
  col.type = col.type || 'text';
  col.index = index;
  Object.assign(col, TYPES[col.type]);
  if (col.match) col.exact = col.match === 'exact';

  const shared = typeof col.order === 'string';
  const source = shared ? lists[col.order] : col.order;
  if (shared && !source) console.warn(`Unknown list "${col.order}" in column "${col.key}"`);
  const items = (source || []).map(String);

  const slot = items.indexOf(AMOUNTS);
  const named = items.filter(item => item !== AMOUNTS);
  col.listed = new Set(named.map(item => item.toLowerCase()));
  col.choices = col.buckets
    ? bucketChoices(col)
    : named.map(item => {
        const value = item.toLowerCase();
        return { value, label: (col.labels && col.labels[value]) || item };
      });
  col.lead = (slot === -1 ? named : items.slice(0, slot)).map(item => item.toLowerCase());
  col.trail = (slot === -1 ? [] : items.slice(slot + 1)).map(item => item.toLowerCase());
  col.tree = buildTree(col);
  col.groups = new Set(col.tree.filter(node => node.subs.length).map(node => node.value));
}

export function prepareColumns(config, lists = {}) {
  const columns = config.columns;
  columns.forEach((col, index) => prepareColumn(col, index, lists));
  const nameKey = columns[0].key;

  const tagCol = {
    key: TAG,
    label: t('filter_tags'),
    type: 'list',
    order: Array.isArray(config.tags) ? expandTags(config.tags, lists) : [],
    filter: config.tags !== false,
    requireAll: true,
    nested: true,
    virtual: true
  };
  prepareColumn(tagCol, columns.length, lists);
  columns.push(tagCol);

  const byKey = Object.fromEntries(columns.map(col => [col.key, col]));
  return { columns, byKey, nameKey, tagCol };
}

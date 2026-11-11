import { t, toNumber } from './utils.js';

const TYPES = {
  text: {},
  list: { multi: true },
  rank: { ranked: true, exact: true },
  measure: { ranked: true },
  number: { ranked: true, numeric: true }
};

const AMOUNTS = '...';
export const TAG = 'tag';
export const SUBTAG = ':';

export function splitTag(tag) {
  const at = tag.indexOf(SUBTAG);
  return at === -1 ? [tag, ''] : [tag.slice(0, at), tag.slice(at + 1)];
}

export const withGroups = tags => [...new Set(tags.flatMap(tag => [splitTag(tag)[0], tag]))];

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
    if (!sub) nodes.set(choice.value, { ...choice, subs: [] });
    else nodes.get(group.toLowerCase())?.subs.push({ ...choice, text: sub });
  });
  return [...nodes.values()];
}

function expandTags(tags, lists) {
  const groups = Object.fromEntries(
    Object.entries(lists.tag_groups || {}).map(([name, sources]) => [name.toLowerCase(), sources])
  );
  return tags.flatMap(tag => {
    const subtags = (groups[tag.toLowerCase()] || []).flatMap(source => {
      if (!lists[source]) console.warn(`Unknown list "${source}" in tag group "${tag}"`);
      return lists[source] || [];
    });
    return [tag, ...subtags.map(sub => tag + SUBTAG + sub)];
  });
}

function prepareColumn(col, index, lists) {
  col.type = col.type || 'text';
  col.index = index;
  Object.assign(col, TYPES[col.type]);
  if (col.match) col.exact = col.match === 'exact';

  // "order" is a list, or the name of a shared list in _data/lists.yml.
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
  // The tags that have subtags, used by the search box shortcut (see query.js).
  tagCol.groups = new Set(tagCol.tree.filter(node => node.subs.length).map(node => node.value));
  columns.push(tagCol);

  const byKey = Object.fromEntries(columns.map(col => [col.key, col]));
  return { columns, byKey, nameKey, tagCol };
}

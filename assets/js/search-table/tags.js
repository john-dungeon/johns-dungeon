export const TAG = 'tag';
export const SUBTAG = ':';
const UNIVERSAL = 'universal';

export function splitTag(tag) {
  const at = tag.indexOf(SUBTAG);
  return at === -1 ? [tag, ''] : [tag.slice(0, at), tag.slice(at + 1)];
}

export const withGroups = tags => [...new Set(tags.flatMap(tag => [splitTag(tag)[0], tag]))];

export function groupTags(names) {
  const groups = new Map();
  names.forEach(name => {
    const [head, sub] = splitTag(name);
    const key = head.toLowerCase();
    if (!groups.has(key)) groups.set(key, { name: head, subs: [] });
    if (sub) groups.get(key).subs.push(sub);
  });
  return [...groups.values()];
}

function withUniversal(tags, lists) {
  if (tags.some(tag => tag.toLowerCase() === UNIVERSAL) && !lists[UNIVERSAL]) {
    console.warn(`Unknown list "${UNIVERSAL}" used in a table's tags`);
  }
  return tags.flatMap(tag => (tag.toLowerCase() === UNIVERSAL ? lists[UNIVERSAL] || [] : [tag]));
}

function unique(tags) {
  const seen = new Set();
  return tags.filter(tag => {
    const key = tag.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function expandTags(tags, lists) {
  const groups = Object.fromEntries(
    Object.entries(lists.tag_groups || {}).map(([name, sources]) => [name.toLowerCase(), sources])
  );
  return unique(withUniversal(tags, lists)).flatMap(tag => {
    const subtags = (groups[tag.toLowerCase()] || []).flatMap(source => {
      if (!lists[source]) console.warn(`Unknown list "${source}" in tag group "${tag}"`);
      return lists[source] || [];
    });
    return [tag, ...subtags.map(sub => tag + SUBTAG + sub)];
  });
}

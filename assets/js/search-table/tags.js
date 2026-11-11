export const TAG = 'tag';
export const SUBTAG = ':';

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

export function expandTags(tags, lists) {
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

import { el, t, markUnlisted } from './utils.js';
import { SUBTAG, splitTag } from './columns.js';

const announce = type => document.dispatchEvent(new CustomEvent(type));

function groupTags(names) {
  const groups = new Map();
  names.forEach(name => {
    const [head, sub] = splitTag(name);
    const key = head.toLowerCase();
    if (!groups.has(key)) groups.set(key, { name: head, subs: [] });
    if (sub) groups.get(key).subs.push(sub);
  });
  return [...groups.values()];
}

const tagLabel = (text, full, tagCol) =>
  tagCol.listed.has(full.toLowerCase()) ? text : markUnlisted(el('span', '', text), 'unlisted_tag');

function appendJoined(parent, items) {
  items.forEach((item, i) => {
    if (i > 0) {
      const isLast = i === items.length - 1;
      parent.append(isLast ? `${items.length > 2 ? ',' : ''} ${t('word_and')} ` : ', ');
    }
    parent.append(item);
  });
}

function showTags(tagLine, names, tagCol) {
  const groups = groupTags(names);
  tagLine.append(t(groups.length === 1 ? 'tag_one' : 'tag_many'));
  groups.forEach((group, i) => {
    if (i > 0) tagLine.append(', ');
    tagLine.append(tagLabel(group.name, group.name, tagCol));
    if (!group.subs.length) return;
    tagLine.append(' (');
    appendJoined(tagLine, group.subs.map(sub => tagLabel(sub, group.name + SUBTAG + sub, tagCol)));
    tagLine.append(')');
  });
}

export function createDialog(root, tagCol) {
  const dialog = root.querySelector('.st-dialog');
  const title = dialog.querySelector('.st-dialog-title');
  const tagLine = dialog.querySelector('.st-dialog-tags');
  const content = dialog.querySelector('.st-dialog-body');

  dialog.querySelector('.st-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => announce('popupclose'));
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  return function openItem(row) {
    const source = root.querySelector(`.st-details [data-for="${row.id}"]`);

    title.textContent = row.querySelector('.st-name').textContent;
    dialog.setAttribute('aria-label', title.textContent);

    tagLine.textContent = '';
    const tagNames = row.dataset.tagNames;
    if (tagNames && tagCol.filter) showTags(tagLine, tagNames.split(','), tagCol);

    content.innerHTML = source ? source.innerHTML : '';
    dialog.showModal();
    announce('popupopen');
  };
}

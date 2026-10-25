import { el, t, markUnlisted } from './utils.js';

const announce = type => document.dispatchEvent(new CustomEvent(type));

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
    if (tagNames && tagCol.filter) {
      const list = tagNames.split(',');
      tagLine.append(t(list.length === 1 ? 'tag_one' : 'tag_many'));
      list.forEach((name, i) => {
        if (i > 0) tagLine.append(', ');
        tagLine.append(tagCol.listed.has(name.toLowerCase())
          ? name
          : markUnlisted(el('span', '', name), 'unlisted_tag'));
      });
    }

    content.innerHTML = source ? source.innerHTML : '';
    dialog.showModal();
    announce('popupopen');
  };
}

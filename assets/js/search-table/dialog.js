import { el, markUnlisted } from './utils.js';

export function createDialog(root, tags) {
  const dialog = root.querySelector('.st-dialog');
  const title = dialog.querySelector('.st-dialog-title');
  const tagLine = dialog.querySelector('.st-dialog-tags');
  const content = dialog.querySelector('.st-dialog-body');

  dialog.querySelector('.st-dialog-close').addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  return function openItem(row) {
    const source = root.querySelector(`.st-details [data-for="${row.dataset.id}"]`);

    title.textContent = row.querySelector('.st-name').textContent;
    dialog.setAttribute('aria-label', title.textContent);

    tagLine.textContent = '';
    const tagNames = row.dataset.tagNames;
    if (tagNames && tags.shown) {
      const list = tagNames.split(',');
      tagLine.append(list.length === 1 ? 'Tag: ' : 'Tags: ');
      list.forEach((name, i) => {
        if (i > 0) tagLine.append(', ');
        tagLine.append(tags.isListed(name) ? name : markUnlisted(el('span', '', name), 'Tag'));
      });
    }

    content.innerHTML = source ? source.innerHTML : '';
    dialog.showModal();
  };
}

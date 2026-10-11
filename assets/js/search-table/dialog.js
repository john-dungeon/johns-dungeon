import { el } from './utils.js';

export function createDialog(root, config) {
  const dialog = root.querySelector('.st-dialog');
  const title = dialog.querySelector('.st-dialog-title');
  const tags = dialog.querySelector('.st-dialog-tags');
  const facts = dialog.querySelector('.st-dialog-facts');
  const content = dialog.querySelector('.st-dialog-body');

  dialog.querySelector('.st-dialog-close').addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  return function openItem(row) {
    const source = root.querySelector(`.st-details [data-for="${row.dataset.id}"]`);

    title.textContent = row.querySelector('.st-name').textContent;
    dialog.setAttribute('aria-label', title.textContent);

    facts.textContent = '';
    if (config.popup_facts !== false) {
      Array.from(row.cells).slice(1).forEach(cell => {
        const text = (cell.getAttribute('data-text') || cell.textContent).trim();
        if (!text || text === '\u2014') return;
        facts.append(el('dt', '', cell.dataset.label), el('dd', '', text));
      });
    }

    tags.textContent = '';
    const tagNames = row.dataset.tagNames;
    if (tagNames && config.tags !== false) {
      const list = tagNames.split(',');
      tags.textContent = `${list.length === 1 ? 'Tag' : 'Tags'}: ${list.join(', ')}`;
    }

    content.innerHTML = source ? source.innerHTML : '';
    dialog.showModal();
  };
}

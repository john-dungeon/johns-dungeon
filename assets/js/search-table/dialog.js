export function createDialog(root, config) {
  const dialog = root.querySelector('.st-dialog');
  const title = dialog.querySelector('.st-dialog-title');
  const tags = dialog.querySelector('.st-dialog-tags');
  const content = dialog.querySelector('.st-dialog-body');

  dialog.querySelector('.st-dialog-close').addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  return function openItem(row) {
    const source = root.querySelector(`.st-details [data-for="${row.dataset.id}"]`);

    title.textContent = row.querySelector('.st-name').textContent;
    dialog.setAttribute('aria-label', title.textContent);

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

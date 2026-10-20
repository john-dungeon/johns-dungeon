export function watchHash(root, records, openItem) {
  const dialog = root.querySelector('.st-dialog');
  const target = () => records.find(rec => rec.row.id === location.hash.slice(1));

  function openFromHash() {
    const rec = target();
    if (rec) openItem(rec.row);
  }

  dialog.addEventListener('close', () => {
    if (target()) history.replaceState(null, '', location.pathname + location.search);
  });

  window.addEventListener('hashchange', openFromHash);
  openFromHash();
}

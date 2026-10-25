const dock = document.getElementById('dock');
const items = [...dock.querySelectorAll('.dock-item')];
const menuOf = item => item.querySelector('.dock-menu');

function setOpen(item, open) {
  menuOf(item).hidden = !open;
  item.querySelector('.dock-button').setAttribute('aria-expanded', String(open));
}

const closeAll = except => items.forEach(item => item !== except && setOpen(item, false));

dock.addEventListener('click', event => {
  const item = event.target.closest('.dock-item');
  if (!item) return;
  if (event.target.closest('.dock-button')) {
    closeAll(item);
    setOpen(item, menuOf(item).hidden);
  } else if (event.target.closest('[role="menuitem"]')) {
    setOpen(item, false);
  }
});

document.addEventListener('pointerdown', event => {
  if (!dock.contains(event.target)) closeAll();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeAll();
});

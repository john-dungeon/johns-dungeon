import { root, FINE_POINTER, INTERACTIVE, themeConfig, onThemeChange } from './shared.js';

const torch = document.getElementById('site-cursor');
let x = 0;
let y = 0;
let frame = 0;

const place = () => {
  frame = 0;
  torch.style.transform = `translate3d(${x}px, ${y}px, 0)`;
};

function layer(on) {
  if (!torch.showPopover) return;
  if (torch.matches(':popover-open')) torch.hidePopover();
  if (on) torch.showPopover();
}

onThemeChange(id => {
  const kind = FINE_POINTER.matches && themeConfig(id).cursor;
  if (kind) root.dataset.cursor = kind;
  else delete root.dataset.cursor;
  layer(Boolean(kind));
});

document.addEventListener('pointermove', event => {
  if (!root.dataset.cursor || event.pointerType !== 'mouse') return;
  x = event.clientX;
  y = event.clientY;
  torch.classList.add('is-live');
  frame ||= requestAnimationFrame(place);
});

document.addEventListener('pointerover', event => {
  if (root.dataset.cursor) torch.classList.toggle('is-pointer', Boolean(event.target.closest(INTERACTIVE)));
});

root.addEventListener('pointerleave', () => torch.classList.remove('is-live'));
document.addEventListener('popupopen', () => root.dataset.cursor && layer(true));

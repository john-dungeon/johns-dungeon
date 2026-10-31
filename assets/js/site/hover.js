import { root, hoverableFrom, announce } from './shared.js';

let over = false;

export const isHovering = () => over;

function set(next) {
  if (next === over) return;
  over = next;
  announce(next ? 'hoverstart' : 'hoverend');
}

document.addEventListener('pointerover', event => {
  if (event.pointerType === 'touch') return;
  set(Boolean(hoverableFrom(event.target)));
});

root.addEventListener('pointerleave', () => set(false));

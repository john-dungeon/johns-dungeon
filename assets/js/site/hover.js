import { root, INTERACTIVE, announce } from './shared.js';

let over = false;

export const isHovering = () => over;

function set(next) {
  if (next === over) return;
  over = next;
  announce(next ? 'hoverstart' : 'hoverend');
}

document.addEventListener('pointerover', event => {
  if (event.pointerType === 'touch') return;
  set(Boolean(event.target.closest?.(INTERACTIVE)));
});

root.addEventListener('pointerleave', () => set(false));

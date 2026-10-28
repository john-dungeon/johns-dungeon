import { root } from '../shared.js';

export const calmSafe = true;

export default function torchGlow({ options }) {
  root.style.setProperty('--fx-torch-glow-x', (options.x ?? 16) + 'px');
  root.style.setProperty('--fx-torch-glow-y', (options.y ?? 6) + 'px');
  root.classList.add('fx-torch-glow');

  return () => {
    root.classList.remove('fx-torch-glow');
    root.style.removeProperty('--fx-torch-glow-x');
    root.style.removeProperty('--fx-torch-glow-y');
  };
}

import { root, FINE_POINTER, CALM, perFrame } from './shared.js';

if (FINE_POINTER.matches && !CALM.matches) {
  let x = 0;
  let y = 0;

  const paint = perFrame(() => {
    root.style.setProperty('--parallax-x', x);
    root.style.setProperty('--parallax-y', y);
  });

  document.addEventListener('pointermove', event => {
    x = (event.clientX / innerWidth - 0.5) * 2;
    y = (event.clientY / innerHeight - 0.5) * 2;
    paint();
  });
}

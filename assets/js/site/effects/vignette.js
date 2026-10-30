import { root, posterize } from '../shared.js';

export const calmSafe = true;
export const gateSafe = true;

// Options (optionally set per theme in themes.yml).
const DEFAULTS = {
  cell: 32, // Width, Height
  levels: 8,// Bands of Darkness
  start: 0.7, // Darkness Edge (0 = center, 1 = corner)
  strength: 0.9 // Corner Opacity
};

export default function vignette({ options, on }) {
  const { cell, levels, start, strength } = { ...DEFAULTS, ...options };
  const color = getComputedStyle(root).getPropertyValue('--vignette-color').trim();

  const canvas = document.createElement('canvas');
  const pen = canvas.getContext('2d');

  function draw() {
    const cols = Math.ceil(root.clientWidth / cell);
    const rows = Math.ceil(root.clientHeight / cell);
    canvas.width = cols;
    canvas.height = rows;
    pen.fillStyle = color;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const dx = ((col + 0.5) / cols) * 2 - 1;
        const dy = ((row + 0.5) / rows) * 2 - 1;
        const distance = Math.hypot(dx, dy) / Math.SQRT2;

        const dark = Math.min(1, Math.max(0, (distance - start) / (1 - start)));
        const alpha = strength * posterize(dark * dark, levels);
        if (alpha <= 0) continue;
        pen.globalAlpha = alpha;
        pen.fillRect(col, row, 1, 1);
      }
    }
    return `url("${canvas.toDataURL()}")`;
  }

  const show = () => root.style.setProperty('--fx-vignette-image', draw());

  let frame = 0;
  on(window, 'resize', () => {
    frame ||= requestAnimationFrame(() => { frame = 0; show(); });
  });

  show();
  root.classList.add('fx-vignette');

  return () => {
    cancelAnimationFrame(frame);
    root.classList.remove('fx-vignette');
    root.style.removeProperty('--fx-vignette-image');
  };
}

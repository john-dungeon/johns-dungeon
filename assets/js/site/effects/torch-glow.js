import { root } from '../shared.js';

export const calmSafe = true;
export const gateSafe = true;

// Options (optionally set per theme).
const DEFAULTS = {
  pixels: 16,
  levels: 4,
  core: 0.4,
  outerAlpha: 0.3,
  coreAlpha: 0.6
};

const posterize = (value, levels) => (value <= 0 ? 0 : Math.round(value * levels) / levels);

function makeSprite({ pixels, levels, core, outerAlpha, coreAlpha }) {
  const style = getComputedStyle(root);
  const outerColor = style.getPropertyValue('--torch-glow-color').trim();
  const coreColor = style.getPropertyValue('--torch-glow-core-color').trim();

  const canvas = document.createElement('canvas');
  canvas.width = pixels;
  canvas.height = pixels;
  const pen = canvas.getContext('2d');
  const half = pixels / 2;

  function paintLayer(color, strength, radius) {
    pen.fillStyle = color;
    for (let row = 0; row < pixels; row++) {
      for (let col = 0; col < pixels; col++) {
        const distance = Math.hypot(col + 0.5 - half, row + 0.5 - half) / (half * radius);
        const alpha = strength * posterize(1 - distance, levels);
        if (alpha <= 0) continue;
        pen.globalAlpha = alpha;
        pen.fillRect(col, row, 1, 1);
      }
    }
  }

  paintLayer(outerColor, outerAlpha, 1);
  paintLayer(coreColor, coreAlpha, core);
  return `url("${canvas.toDataURL()}")`;
}

export default function torchGlow({ options }) {
  const settings = { ...DEFAULTS };
  Object.keys(DEFAULTS).forEach(key => { settings[key] = options[key] ?? DEFAULTS[key]; });

  root.style.setProperty('--fx-torch-glow-x', (options.x ?? 16) + 'px');
  root.style.setProperty('--fx-torch-glow-y', (options.y ?? 16) + 'px');
  root.style.setProperty('--fx-torch-glow-image', makeSprite(settings));
  root.classList.add('fx-torch-glow');

  return () => {
    root.classList.remove('fx-torch-glow');
    root.style.removeProperty('--fx-torch-glow-x');
    root.style.removeProperty('--fx-torch-glow-y');
    root.style.removeProperty('--fx-torch-glow-image');
  };
}

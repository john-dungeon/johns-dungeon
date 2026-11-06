import { root, CALM, posterize, cssVar } from '../shared.js';
import { isHovering } from '../hover.js';

export const calmSafe = true;
export const gateSafe = true;

// Options (optionally set per theme in themes.yml).
const DEFAULTS = {
  pixels: 32, // Height, Width
  levels: 3, // Bands of Brightness
  core: 0.4, // Core Radius Ratio
  outerAlpha: 0.4, // Outer Opacity
  coreAlpha: 0.6, // Core Opacity
  fps: 6 // Frames Per Second
};

const FRAMES = [
  { scale: 1, opacity: 0.85 },
  { scale: 0.92, opacity: 0.6 },
  { scale: 1.06, opacity: 1 },
  { scale: 0.95, opacity: 0.7 },
  { scale: 1.1, opacity: 0.95 },
  { scale: 0.9, opacity: 0.65 },
  { scale: 1.03, opacity: 0.9 }
];
const BIGGEST = Math.max(...FRAMES.map(frame => frame.scale));

function makeDrawer({ pixels, levels, core, outerAlpha, coreAlpha }) {
  const palettes = {
    normal: { outer: cssVar('--torch-glow-color'), core: cssVar('--torch-glow-core-color') },
    link: { outer: cssVar('--torch-glow-link-color'), core: cssVar('--torch-glow-link-core-color') }
  };

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

  return ({ scale, opacity }, linked) => {
    const colors = linked ? palettes.link : palettes.normal;
    pen.clearRect(0, 0, pixels, pixels);
    const radius = scale / BIGGEST;
    paintLayer(colors.outer, outerAlpha * opacity, radius);
    paintLayer(colors.core, coreAlpha * opacity, radius * core);
    return `url("${canvas.toDataURL()}")`;
  };
}

export default function torchGlow({ options, on, timer, random }) {
  const settings = { ...DEFAULTS, ...options };
  const draw = makeDrawer(settings);

  let frame = FRAMES[0];
  let linked = isHovering();
  const show = () => root.style.setProperty('--fx-torch-glow-image', draw(frame, linked));

  root.style.setProperty('--fx-torch-glow-x', (options.x ?? 16) + 'px');
  root.style.setProperty('--fx-torch-glow-y', (options.y ?? 16) + 'px');
  show();
  root.classList.add('fx-torch-glow');

  const sync = () => {
    linked = isHovering();
    show();
  };
  on(document, 'hoverstart', sync);
  on(document, 'hoverend', sync);

  if (!CALM.matches) {
    let last = 0;
    timer(() => {
      let next;
      do { next = Math.floor(random(0, FRAMES.length)); } while (next === last);
      last = next;
      frame = FRAMES[next];
      show();
    }, 1 / settings.fps, 1 / settings.fps);
  }

  return () => {
    root.classList.remove('fx-torch-glow');
    root.style.removeProperty('--fx-torch-glow-x');
    root.style.removeProperty('--fx-torch-glow-y');
    root.style.removeProperty('--fx-torch-glow-image');
  };
}

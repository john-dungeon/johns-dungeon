import { root, posterize, cssVar } from '../shared.js';

// Options (optionally set per theme in themes.yml).
const DEFAULTS = {
  min: 120, // Min Time Between Triggers (s)
  max: 300, // Max Time Between Triggers (s)
  duration: 2, // Effect Duration (s)
  stones: 36, // Stones per Trigger
  stoneSize: 32, // Average Stone Width (px)
  dust: 20, // Dust per Trigger
  dustSize: 360, // Average Dust Width (px)
  dustFadeIn: 0.5, // Average Dust Fade In Time (s)
  dustFadeOut: 5, // Average Dust Fade Out Time (s)
  shake: 6 // Strongest Shake (px)
};
const JOLT = 50; // Time Between Jolts (ms)
const STONE_SHAPES = 8; // Stone Sprite Variants
const CLOUD_SHAPES = 5; // Dust Sprite Variants

function sprite(cells, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = cells;
  canvas.height = cells;
  const pen = canvas.getContext('2d');
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) paint(pen, col, row);
  }
  return `url("${canvas.toDataURL()}")`;
}

function inside(x, y, corners) {
  let hit = false;
  for (let i = 0, j = corners.length - 1; i < corners.length; j = i++) {
    const [xi, yi] = corners[i];
    const [xj, yj] = corners[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function stoneSprite(random, colors, cells) {
  const half = cells / 2;
  const count = Math.round(random(5, 8));
  const corners = Array.from({ length: count }, (_, i) => {
    const angle = ((i + random(-0.3, 0.3)) / count) * Math.PI * 2;
    const reach = half * random(0.6, 1);
    return [half + Math.cos(angle) * reach, half + Math.sin(angle) * reach];
  });
  const filled = (col, row) =>
    col >= 0 && row >= 0 && col < cells && row < cells && inside(col + 0.5, row + 0.5, corners);

  const url = sprite(cells, (pen, col, row) => {
    if (!filled(col, row)) return;
    const lit = !filled(col - 1, row) || !filled(col, row - 1);
    const shaded = !filled(col + 1, row) || !filled(col, row + 1);
    const speckle = random(0, 1) < 0.15;
    pen.fillStyle = shaded ? colors.dark : lit ? colors.light : speckle ? colors.dark : colors.mid;
    pen.fillRect(col, row, 1, 1);
  });
  return { cells, url };
}

function cloudSprite(random, cells, color) {
  const blobs = Array.from({ length: 6 }, () => ({
    x: random(0.35, 0.65) * cells,
    y: random(0.35, 0.65) * cells,
    reach: random(0.15, 0.3) * cells
  }));
  return sprite(cells, (pen, col, row) => {
    const density = Math.max(...blobs.map(b => 1 - Math.hypot(col + 0.5 - b.x, row + 0.5 - b.y) / b.reach));
    const alpha = Math.min(1, posterize(density + random(-0.15, 0.15), 4));
    if (alpha <= 0) return;
    pen.fillStyle = color;
    pen.globalAlpha = alpha;
    pen.fillRect(col, row, 1, 1);
  });
}

export default function stoneCrumble({ options, layer, random, timer, sound }) {
  const settings = { ...DEFAULTS, ...options };
  const pixel = parseFloat(cssVar('--effect-pixel'));
  const colors = { light: cssVar('--stone-light'), mid: cssVar('--stone-mid'), dark: cssVar('--stone-dark') };

  const baseCells = settings.stoneSize / pixel / 2;
  const stones = Array.from({ length: STONE_SHAPES }, () =>
    stoneSprite(random, colors, Math.max(3, Math.round(baseCells * random(0.5, 1.5)))));
  const cloudCells = Math.round(settings.dustSize / pixel);
  const clouds = Array.from({ length: CLOUD_SHAPES }, () => cloudSprite(random, cloudCells, cssVar('--dust-color')));

  const pick = list => list[Math.floor(random(0, list.length))];
  const sign = () => (random(0, 1) < 0.5 ? -1 : 1);
  const spin = (min, max) => `${sign() * random(min, max) * 360}deg`;
  let jolting = 0;

  function spawn(className, style, last) {
    const node = document.createElement('div');
    node.className = className;
    Object.entries(style).forEach(([name, value]) => node.style.setProperty(name, value));
    node.addEventListener('animationend', event => {
      if (event.animationName === last) node.remove();
    });
    layer.appendChild(node);
  }

  function stone() {
    const shape = pick(stones);
    const size = shape.cells * pixel * (1 + Math.floor(random(0, 3)));
    spawn('fx-stone', {
      left: `${random(0, innerWidth - size)}px`,
      top: `${-size}px`,
      width: `${size}px`,
      height: `${size}px`,
      '--sprite': shape.url,
      '--drift': `${random(-0.3, 0.3) * innerWidth}px`,
      '--lift': `${random(-80, 10)}px`,
      '--fall': `${innerHeight + size}px`,
      '--spin': spin(0.5, 3),
      '--time': `${random(0.45, 0.8) * settings.duration}s`,
      '--delay': `${random(0, 0.4) * settings.duration}s`
    }, 'stone-fall');
  }

  function dust(edge, along) {
    const size = settings.dustSize * random(0.7, 1.3);
    const inset = random(-0.1, 0.3) * size;
    const [x, y] = [
      [along * innerWidth, inset],
      [innerWidth - inset, along * innerHeight],
      [along * innerWidth, innerHeight - inset],
      [inset, along * innerHeight]
    ][edge];
    spawn('fx-dust', {
      left: `${x - size / 2}px`,
      top: `${y - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      '--sprite': pick(clouds),
      '--spin': spin(0.25, 1),
      '--in': `${settings.dustFadeIn * random(0.8, 1.2)}s`,
      '--out': `${settings.dustFadeOut * random(0.8, 1.2)}s`,
      '--delay': `${random(0, 0.5) * settings.duration}s`
    }, 'dust-out');
  }

  function stopShake() {
    clearInterval(jolting);
    root.classList.remove('shaking');
    root.style.removeProperty('--shake-x');
    root.style.removeProperty('--shake-y');
  }

  function shake() {
    stopShake();
    const total = settings.duration * 1000;
    const end = performance.now() + total;
    root.classList.add('shaking');
    jolting = setInterval(() => {
      const left = (end - performance.now()) / total;
      if (left <= 0) return stopShake();
      const reach = settings.shake * left;
      root.style.setProperty('--shake-x', `${Math.round(random(-reach, reach))}px`);
      root.style.setProperty('--shake-y', `${Math.round(random(-reach, reach))}px`);
    }, JOLT);
  }

  function crumble() {
    sound('crumble');
    shake();

    const perEdge = Math.ceil(settings.dust / 4);
    for (let i = 0; i < settings.dust; i++) {
      dust(i % 4, (Math.floor(i / 4) + random(0.1, 0.9)) / perEdge);
    }
    for (let i = 0; i < settings.stones; i++) stone();
  }

  timer(crumble, settings.min, settings.max);
  return stopShake;
}

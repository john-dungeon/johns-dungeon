import { root, posterize } from '../shared.js';

// Options (optionally set per theme in themes.yml).
const DEFAULTS = {
  min: 60, // Fewest Seconds Between Triggers
  max: 300, // Most Seconds Between Triggers
  duration: 2, // Effect Duration
  stones: 18, // Particles per Trigger
  dust: 7, // Dust Clouds per Trigger
  shake: 6 // Strongest Screen Shake (px)
};
const JOLT = 50;

export default function stoneCrumble({ options, layer, random, timer, sound }) {
  const settings = { ...DEFAULTS, ...options };
  const pixel = parseFloat(getComputedStyle(root).getPropertyValue('--effect-pixel'));
  let jolting = 0;

  function spawn(className, style) {
    const node = document.createElement('div');
    node.className = className;
    Object.entries(style).forEach(([name, value]) => node.style.setProperty(name, value));
    node.addEventListener('animationend', () => node.remove(), { once: true });
    layer.appendChild(node);
  }

  function stone(x) {
    const size = Math.round(random(2, 4)) * pixel;
    spawn('fx-stone', {
      left: `${x}px`,
      top: `${-size}px`,
      width: `${size}px`,
      height: `${size}px`,
      '--tone': posterize(random(0, 1), 3),
      '--drift': `${random(-40, 40)}px`,
      '--fall': `${innerHeight + size}px`,
      '--time': `${random(0.4, 0.6) * settings.duration}s`,
      '--delay': `${random(0, 0.4) * settings.duration}s`
    });
  }

  function dust(x) {
    const radius = Math.round(random(2, 4));
    const puffs = [];
    for (let row = -radius; row <= radius; row++) {
      for (let col = -radius; col <= radius; col++) {
        if (Math.hypot(col, row) <= radius + random(-0.7, 0.3)) {
          puffs.push(`${col * pixel}px ${row * pixel}px`);
        }
      }
    }
    spawn('fx-dust', {
      left: `${x}px`,
      top: `${random(0, 0.15) * innerHeight}px`,
      'box-shadow': puffs.join(', '),
      '--time': `${random(0.5, 0.9)}s`,
      '--delay': `${random(0, 0.5) * settings.duration}s`
    });
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
    const center = random(0.2, 0.8) * innerWidth;
    const spread = innerWidth * 0.25;
    const at = () => Math.min(innerWidth, Math.max(0, center + random(-spread, spread)));

    sound('crumble');
    shake();
    for (let i = 0; i < settings.stones; i++) stone(at());
    for (let i = 0; i < settings.dust; i++) dust(at());
  }

  timer(crumble, settings.min, settings.max);
  return stopShake;
}

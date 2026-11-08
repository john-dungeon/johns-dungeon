import { root, cssVar, fadeOut } from '../shared.js';

// Options (optionally set per theme in themes.yml).
const DEFAULTS = {
  idle: 1.5, // Start Timer (s)
  min: 1, // Shortest Time Between Drops (s)
  max: 2.5, // Longest Time Between Drops (s)
  slop: 4, // Ignore Shaky Hand (px)
  dropSize: 3, // Drop Radius (px)
  fallMin: 24, // Shortest Fall (px)
  fallMax: 48, // Longest Fall (px)
  fallTime: 0.35, // Fall Duration (s)
  poolStart: 5, // Initial Pool Radius (px)
  poolGrow: 2, // Radius Added Per Drop (px)
  poolMax: 24, // Largest Pool Radius (px)
  hold: 4, // Pool Duration (s)
  fade: 3 // Pool Fade Out (s)
};
const SETTLE = 8; // How Fast Pools Spread To Their Size
const TAU = Math.PI * 2;

export default function inkDrip({ options, random, on, topLayer, painter }) {
  const { idle, min, max, slop, dropSize, fallMin, fallMax, fallTime, poolStart, poolGrow, poolMax, hold, fade } =
    { ...DEFAULTS, ...options };
  const fallMs = fallTime * 1000;
  const holdMs = hold * 1000;
  const fadeMs = fade * 1000;
  const color = cssVar('--ink-color');

  let drops = [];
  let pools = [];
  let before = 0;

  function land(drop, now) {
    const x = drop.x;
    const y = drop.y + drop.fall;
    const near = pools.find(pool => Math.hypot(x - pool.x, y - pool.y) <= pool.target + dropSize);
    if (near) {
      near.target = Math.min(poolMax, near.target + poolGrow);
      near.hit = now;
    } else {
      pools.push({ x, y, r: 0, target: poolStart, hit: now, squash: random(0.7, 0.95), tilt: random(0, Math.PI) });
    }
  }

  function paint(pen, now) {
    const dt = Math.min((now - before) / 1000, 0.1);
    before = now;
    pen.fillStyle = color;

    const falling = [];
    drops.forEach(drop => (now - drop.t >= fallMs ? land(drop, now) : falling.push(drop)));
    drops = falling;
    pools = pools.filter(pool => now - pool.hit < holdMs + fadeMs);

    pools.forEach(pool => {
      pool.r += (pool.target - pool.r) * (1 - Math.exp(-SETTLE * dt));
      pen.globalAlpha = fadeOut(now - pool.hit, holdMs, fadeMs);
      pen.beginPath();
      pen.ellipse(pool.x, pool.y, pool.r, pool.r * pool.squash, pool.tilt, 0, TAU);
      pen.fill();
    });
    drops.forEach(drop => {
      const u = Math.max(0, (now - drop.t) / fallMs);
      pen.globalAlpha = 1;
      pen.beginPath();
      pen.ellipse(drop.x, drop.y + drop.fall * u * u, dropSize, dropSize * (1 + u), 0, 0, TAU);
      pen.fill();
    });

    return drops.length > 0 || pools.length > 0;
  }

  const wake = painter(paint);
  topLayer();

  let anchor = null;
  let waiting = 0;

  function drip() {
    if (!document.hidden) {
      drops.push({ x: anchor.x + random(-1.5, 1.5), y: anchor.y, fall: random(fallMin, fallMax), t: performance.now() });
      wake();
    }
    waiting = setTimeout(drip, random(min, max) * 1000);
  }

  on(document, 'pointermove', event => {
    if (event.pointerType === 'touch') return;
    const { clientX: x, clientY: y } = event;
    if (anchor && Math.hypot(x - anchor.x, y - anchor.y) < slop) return;
    anchor = { x, y };
    clearTimeout(waiting);
    waiting = setTimeout(drip, idle * 1000);
  });

  on(root, 'pointerleave', () => {
    clearTimeout(waiting);
    anchor = null;
  });

  return () => clearTimeout(waiting);
}

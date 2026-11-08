import { cssVar, fadeOut } from '../shared.js';

export const calmSafe = true;

// Options (optionally set per theme in themes.yml).
const DEFAULTS = {
  width: 3, // Pen Width (px)
  hold: 1, // Time Ink Stays Fully Dark (s)
  fade: 3, // Time Ink Takes To Fade Away (s)
  gap: 2 // Smallest Distance Between Trail Points (px)
};
const LEVELS = 24; // Opacity Steps

export default function inkWriting({ options, on, topLayer, painter }) {
  const { width, hold, fade, gap } = { ...DEFAULTS, ...options };
  const holdMs = hold * 1000;
  const fadeMs = fade * 1000;
  const color = cssVar('--ink-color');

  let strokes = [];
  let stroke = null;

  function paint(pen, now) {
    pen.strokeStyle = color;
    pen.lineWidth = width;
    pen.lineJoin = 'round';

    strokes.forEach(points => {
      while (points.length && now - points[0].t >= holdMs + fadeMs) points.shift();

      let level = 0;
      const finish = () => {
        if (!level) return;
        pen.globalAlpha = level / LEVELS;
        pen.stroke();
      };
      for (let i = 1; i < points.length; i++) {
        const next = Math.ceil(fadeOut(now - points[i].t, holdMs, fadeMs) * LEVELS);
        if (next !== level) {
          finish();
          level = next;
          pen.beginPath();
          pen.moveTo(points[i - 1].x, points[i - 1].y);
        }
        pen.lineTo(points[i].x, points[i].y);
      }
      finish();
    });

    strokes = strokes.filter(points => points.length > 1 || points === stroke);
    return strokes.some(points => points.length > 1);
  }

  const wake = painter(paint);
  topLayer();

  function add(x, y) {
    const last = stroke[stroke.length - 1];
    if (last && Math.hypot(x - last.x, y - last.y) < gap) return;
    stroke.push({ x, y, t: performance.now() });
  }

  on(document, 'pointerdown', event => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    stroke = [];
    strokes.push(stroke);
    add(event.clientX, event.clientY);
  });

  on(document, 'pointermove', event => {
    if (!stroke) return;
    if (!(event.buttons & 1)) {
      stroke = null;
      return;
    }
    const moves = event.getCoalescedEvents?.() || [];
    (moves.length ? moves : [event]).forEach(move => add(move.clientX, move.clientY));
    wake();
  });
}

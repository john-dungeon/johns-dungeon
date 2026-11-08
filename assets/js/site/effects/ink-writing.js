import { root, cssVar, fadeOut } from '../shared.js';

export const calmSafe = true;

// Options (optionally set per theme in themes.yml).
const DEFAULTS = {
  width: 3, // Pen Width (px)
  hold: 1, // Ink Duration (s)
  fade: 3, // Ink Fade Out (s)
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
  let writing = false;

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
    if (!stroke) {
      stroke = [];
      strokes.push(stroke);
    }
    const last = stroke[stroke.length - 1];
    if (last && Math.hypot(x - last.x, y - last.y) < gap) return;
    stroke.push({ x, y, t: performance.now() });
  }

  on(document, 'dblclick', event => {
    writing = !writing;
    stroke = null;
    if (writing) add(event.clientX, event.clientY);
  });

  on(document, 'pointermove', event => {
    if (!writing || event.pointerType === 'touch') return;
    const moves = event.getCoalescedEvents?.() || [];
    (moves.length ? moves : [event]).forEach(move => add(move.clientX, move.clientY));
    wake();
  });

  on(root, 'pointerleave', () => { stroke = null; });

  on(document, 'mousedown', event => {
    if (event.detail > 1 && !event.target.closest('input, textarea')) event.preventDefault();
  });

  on(document, 'selectstart', event => {
    if (writing) event.preventDefault();
  });
}

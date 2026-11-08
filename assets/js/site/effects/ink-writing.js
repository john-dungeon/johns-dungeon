import { cssVar, fadeOut } from '../shared.js';

export const calmSafe = true;

// Options (optionally set per theme in themes.yml).
const DEFAULTS = {
  width: 3, // Pen Width (px)
  hold: 1, // Ink Duration (s)
  fade: 3, // Ink Fade Out (s)
  gap: 2 // Smallest Distance Between Trail Points (px)
};
const LEVELS = 24; // Opacity Steps

const startsInk = event =>
  event.shiftKey && event.button === 0 && !event.target.closest('input, textarea');

const popupOpen = () => Boolean(document.querySelector('.st-dialog[open]'));

export default function inkWriting({ options, on, topLayer, painter }) {
  const { width, hold, fade, gap } = { ...DEFAULTS, ...options };
  const holdMs = hold * 1000;
  const fadeMs = fade * 1000;
  const color = cssVar('--ink-color');

  let stroke = null;
  let swallowClick = false;

  function makeTrail(host) {
    let strokes = [];

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

    return {
      wake: painter(paint, host),
      start() {
        const points = [];
        strokes.push(points);
        return points;
      }
    };
  }

  const page = makeTrail();
  const above = makeTrail(topLayer());
  let trail = page;

  function add(x, y) {
    const last = stroke[stroke.length - 1];
    if (last && Math.hypot(x - last.x, y - last.y) < gap) return;
    stroke.push({ x, y, t: performance.now() });
  }

  on(document, 'mousedown', event => {
    if (startsInk(event)) event.preventDefault();
  });

  on(document, 'pointerdown', event => {
    swallowClick = false;
    if (!startsInk(event)) return;
    trail = popupOpen() ? above : page;
    stroke = trail.start();
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
    trail.wake();
  });

  on(document, 'pointerup', () => {
    if (stroke && stroke.length > 1) swallowClick = true;
    stroke = null;
  });

  on(document, 'click', event => {
    if (!swallowClick) return;
    swallowClick = false;
    event.preventDefault();
    event.stopPropagation();
  }, true);
}

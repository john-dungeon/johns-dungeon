import { root, CALM } from './shared.js';

const SCROLLERS = ['.st-dialog-inner', '.st-table-wrap', '.site-nav'];
const MIN_THUMB = 24;
const PAGE_STEP = 0.9;
const LINE = 16;
const EASE = 0.22;
const wheelUnit = (event, pageSize) => [1, LINE, pageSize][event.deltaMode];

const AXES = [
  { name: 'y', size: 'clientHeight', total: 'scrollHeight', pos: 'scrollTop', mouse: 'clientY', length: 'height', start: 'top' },
  { name: 'x', size: 'clientWidth', total: 'scrollWidth', pos: 'scrollLeft', mouse: 'clientX', length: 'width', start: 'left' }
];

const bars = [];
const active = () => root.classList.contains('fake-cursor');

const glides = new WeakMap();

function glideFor(scroller) {
  if (glides.has(scroller)) return glides.get(scroller);

  let goal = null;
  let frame = 0;
  const room = axis => Math.max(0, scroller[axis.total] - scroller[axis.size]);

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    goal = null;
  }

  function step() {
    let busy = false;
    AXES.forEach(axis => {
      const gap = goal[axis.name] - scroller[axis.pos];
      if (Math.abs(gap) < 1) {
        scroller[axis.pos] = goal[axis.name];
        return;
      }
      const move = Math.sign(gap) * Math.min(Math.abs(gap), Math.max(1, Math.abs(gap) * EASE));
      scroller[axis.pos] += move;
      busy = true;
    });
    frame = busy ? requestAnimationFrame(step) : 0;
    if (!busy) goal = null;
  }

  function push(dx, dy) {
    const from = goal || { x: scroller.scrollLeft, y: scroller.scrollTop };
    const next = {
      x: Math.min(room(AXES[1]), Math.max(0, from.x + dx)),
      y: Math.min(room(AXES[0]), Math.max(0, from.y + dy))
    };
    if (next.x === from.x && next.y === from.y) return false;

    if (CALM.matches) {
      scroller.scrollLeft = next.x;
      scroller.scrollTop = next.y;
    } else {
      goal = next;
      frame ||= requestAnimationFrame(step);
    }
    return true;
  }

  const glide = { push, stop };
  glides.set(scroller, glide);
  return glide;
}

function place({ scroller, axis, track }) {
  const host = track.parentElement;
  const box = scroller.getBoundingClientRect();
  const hostBox = host.getBoundingClientRect();
  const left = box.left - hostBox.left - host.clientLeft + host.scrollLeft;
  const top = box.top - hostBox.top - host.clientTop + host.scrollTop;

  if (axis.name === 'y') {
    Object.assign(track.style, {
      left: left + box.width - track.offsetWidth + 'px',
      top: top + 'px',
      height: box.height + 'px'
    });
  } else {
    Object.assign(track.style, {
      left: left + 'px',
      top: top + box.height - track.offsetHeight + 'px',
      width: box.width + 'px'
    });
  }
}

function slide(bar) {
  const { scroller, axis, track, thumb, travel } = bar;
  if (track.hidden) return;
  const room = scroller[axis.total] - scroller[axis.size];
  const progress = Math.min(1, Math.max(0, scroller[axis.pos] / room));
  thumb.style.transform = `translate${axis.name.toUpperCase()}(${progress * travel}px)`;
}

function layout(bar) {
  const { scroller, axis, track, thumb, isPage } = bar;
  const room = scroller[axis.total] - scroller[axis.size];
  track.hidden = !active() || room < 1;
  if (track.hidden) return;

  if (!isPage) place(bar);
  const length = track[axis.size];
  const thumbLength = Math.max(MIN_THUMB, length * scroller[axis.size] / scroller[axis.total]);
  bar.travel = length - thumbLength;
  thumb.style[axis.length] = thumbLength + 'px';
  slide(bar);
}

function makeBar(scroller, axis) {
  const isPage = scroller === root;
  const host = isPage ? document.body : scroller.parentElement;
  if (!isPage && getComputedStyle(host).position === 'static') host.classList.add('sb-host');

  const track = document.createElement('div');
  track.className = `sb-track sb-track--${axis.name}${isPage ? ' sb-track--page' : ''}`;
  track.hidden = true;
  const thumb = document.createElement('div');
  thumb.className = 'sb-thumb';
  track.append(thumb);
  host.append(track);

  const bar = { scroller, axis, track, thumb, isPage, travel: 0 };
  const glide = isPage ? null : glideFor(scroller);

  (isPage ? window : scroller).addEventListener('scroll', () => slide(bar), { passive: true });

  thumb.addEventListener('pointerdown', event => {
    event.preventDefault();
    if (glide) glide.stop();
    thumb.setPointerCapture(event.pointerId);
    thumb.classList.add('is-dragging');
    const from = { mouse: event[axis.mouse], pos: scroller[axis.pos] };

    const drag = moved => {
      const travel = track[axis.size] - thumb.getBoundingClientRect()[axis.length];
      const room = scroller[axis.total] - scroller[axis.size];
      if (travel <= 0) return;
      scroller.scrollTo({
        [axis.start]: from.pos + (moved[axis.mouse] - from.mouse) * room / travel,
        behavior: 'instant'
      });
    };
    thumb.addEventListener('pointermove', drag);
    thumb.addEventListener('lostpointercapture', () => {
      thumb.removeEventListener('pointermove', drag);
      thumb.classList.remove('is-dragging');
    }, { once: true });
  });

  track.addEventListener('pointerdown', event => {
    if (event.target !== track) return;
    if (glide) glide.stop();
    const before = event[axis.mouse] < thumb.getBoundingClientRect()[axis.start];
    scroller[axis.pos] += (before ? -1 : 1) * scroller[axis.size] * PAGE_STEP;
  });

  if (!isPage) {
    track.addEventListener('wheel', event => {
      if (event.ctrlKey) return;
      const moved = glide.push(
        event.deltaX * wheelUnit(event, scroller.clientWidth),
        event.deltaY * wheelUnit(event, scroller.clientHeight)
      );
      if (moved) event.preventDefault();
    }, { passive: false });

    scroller.addEventListener('wheel', glide.stop, { passive: true });
  }

  return bar;
}

const layoutAll = () => bars.forEach(layout);
const resizer = new ResizeObserver(layoutAll);

[root, ...SCROLLERS.flatMap(selector => [...document.querySelectorAll(selector)])].forEach(scroller => {
  AXES.forEach(axis => bars.push(makeBar(scroller, axis)));
  if (scroller === root) {
    resizer.observe(document.body);
  } else {
    resizer.observe(scroller);
    [...scroller.children].forEach(child => resizer.observe(child));
  }
});

addEventListener('resize', layoutAll);
document.addEventListener('popupopen', layoutAll);
new MutationObserver(layoutAll).observe(root, { attributes: true, attributeFilter: ['class'] });

import { root } from './shared.js';

const SCROLLERS = ['.st-dialog-inner', '.st-table-wrap', '.site-nav'];
const MIN_THUMB = 24;
const PAGE_STEP = 0.9;
const LINE = 16;
const wheelUnit = (event, pageSize) => [1, LINE, pageSize][event.deltaMode];

const AXES = [
  { name: 'y', size: 'clientHeight', total: 'scrollHeight', pos: 'scrollTop', mouse: 'clientY', length: 'height', start: 'top' },
  { name: 'x', size: 'clientWidth', total: 'scrollWidth', pos: 'scrollLeft', mouse: 'clientX', length: 'width', start: 'left' }
];

const bars = [];
const active = () => root.classList.contains('fake-cursor');

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

function paint(bar) {
  const { scroller, axis, track, thumb, isPage } = bar;
  const room = scroller[axis.total] - scroller[axis.size];
  track.hidden = !active() || room < 1;
  if (track.hidden) return;

  if (!isPage) place(bar);
  const length = track[axis.size];
  const thumbLength = Math.max(MIN_THUMB, length * scroller[axis.size] / scroller[axis.total]);
  const progress = Math.min(1, Math.max(0, scroller[axis.pos] / room));

  thumb.style[axis.length] = thumbLength + 'px';
  thumb.style.transform = `translate${axis.name.toUpperCase()}(${progress * (length - thumbLength)}px)`;
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

  const bar = { scroller, axis, track, thumb, isPage };

  (isPage ? window : scroller).addEventListener('scroll', () => paint(bar), { passive: true });

  thumb.addEventListener('pointerdown', event => {
    event.preventDefault();
    thumb.setPointerCapture(event.pointerId);
    thumb.classList.add('is-dragging');
    const from = { mouse: event[axis.mouse], pos: scroller[axis.pos] };

    const move = moved => {
      const travel = track[axis.size] - thumb.getBoundingClientRect()[axis.length];
      const room = scroller[axis.total] - scroller[axis.size];
      if (travel <= 0) return;
      scroller.scrollTo({
        [axis.start]: from.pos + (moved[axis.mouse] - from.mouse) * room / travel,
        behavior: 'instant'
      });
    };
    thumb.addEventListener('pointermove', move);
    thumb.addEventListener('lostpointercapture', () => {
      thumb.removeEventListener('pointermove', move);
      thumb.classList.remove('is-dragging');
    }, { once: true });
  });

  track.addEventListener('pointerdown', event => {
    if (event.target !== track) return;
    const before = event[axis.mouse] < thumb.getBoundingClientRect()[axis.start];
    scroller[axis.pos] += (before ? -1 : 1) * scroller[axis.size] * PAGE_STEP;
  });

  if (!isPage) {
    track.addEventListener('wheel', event => {
      if (event.ctrlKey) return;
      const before = [scroller.scrollLeft, scroller.scrollTop];
      scroller.scrollBy({
        left: event.deltaX * wheelUnit(event, scroller.clientWidth),
        top: event.deltaY * wheelUnit(event, scroller.clientHeight),
        behavior: 'instant'
      });
      const moved = scroller.scrollLeft !== before[0] || scroller.scrollTop !== before[1];
      if (moved) event.preventDefault();
    }, { passive: false });
  }
  
  return bar;
}

const paintAll = () => bars.forEach(paint);
const resizer = new ResizeObserver(paintAll);

[root, ...SCROLLERS.flatMap(selector => [...document.querySelectorAll(selector)])].forEach(scroller => {
  AXES.forEach(axis => bars.push(makeBar(scroller, axis)));
  if (scroller === root) {
    resizer.observe(document.body);
  } else {
    resizer.observe(scroller);
    [...scroller.children].forEach(child => resizer.observe(child));
  }
});

addEventListener('resize', paintAll);
document.addEventListener('popupopen', paintAll);
new MutationObserver(paintAll).observe(root, { attributes: true, attributeFilter: ['class'] });

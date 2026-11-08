import { CALM, waiting, announce, themeConfig, onThemeChange, load, save } from './shared.js';

const random = (min, max) => min + Math.random() * (max - min);

const TIMERS = 'effect-timers';

let current = '';
let round = 0;
let cleanups = [];
let started = new Set();

function makeContext(options, layer) {
  const undo = [];

  function on(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    undo.push(() => target.removeEventListener(type, handler, options));
  }

  function timer(run, min, max, persist = false) {
    let id;
    const wait = () => random(min, max) * 1000;
    const schedule = delay => {
      if (persist) save(TIMERS, { ...load(TIMERS, {}), [options.id]: Date.now() + delay });
      id = setTimeout(() => {
        if (!document.hidden) run();
        schedule(wait());
      }, delay);
    };
    const left = persist ? (load(TIMERS, {})[options.id] || 0) - Date.now() : 0;
    schedule(left > 0 ? Math.min(left, max * 1000) : wait());
    undo.push(() => clearTimeout(id));
  }

  function topLayer() {
    layer.setAttribute('popover', 'manual');
    const raise = () => {
      try { layer.hidePopover(); } catch (e) {}
      try { layer.showPopover(); } catch (e) {}
      announce('layerraised');
    };
    raise();
    on(document, 'popupopen', raise);
  }

  function painter(draw) {
    const canvas = document.createElement('canvas');
    const pen = canvas.getContext('2d');
    layer.appendChild(canvas);
    let frame = 0;

    const fit = () => {
      const ratio = devicePixelRatio || 1;
      canvas.width = Math.round(innerWidth * ratio);
      canvas.height = Math.round(innerHeight * ratio);
      pen.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const tick = now => {
      frame = 0;
      pen.clearRect(0, 0, innerWidth, innerHeight);
      if (draw(pen, now)) wake();
    };
    const wake = () => { frame ||= requestAnimationFrame(tick); };

    fit();
    on(window, 'resize', () => { fit(); wake(); });
    undo.push(() => cancelAnimationFrame(frame));
    return wake;
  }

  return {
    options,
    layer,
    random,
    on,
    timer,
    topLayer,
    painter,
    sound: name => announce('fxsound', name),
    stop: () => undo.splice(0).forEach(fn => fn())
  };
}

async function loadEffect(options, slot, myRound) {
  if (started.has(slot)) return;
  started.add(slot);

  let module;
  try {
    module = await import(`./effects/${options.id}.js`);
  } catch (error) {
    console.warn(`effects.js: could not load the effect "${options.id}".`, error);
    return;
  }
  if (myRound !== round) return;
  if (CALM.matches && !module.calmSafe) return;
  if (waiting() && !module.gateSafe) {
    started.delete(slot);
    return;
  }

  const layer = document.createElement('div');
  layer.className = 'fx-layer';
  layer.dataset.effect = options.id;
  document.body.appendChild(layer);

  const ctx = makeContext(options, layer);
  let finish;
  try {
    finish = module.default(ctx);
  } catch (error) {
    console.warn(`effects.js: the effect "${options.id}" failed to start.`, error);
    ctx.stop();
    layer.remove();
    return;
  }
  cleanups.push(() => {
    ctx.stop();
    if (typeof finish === 'function') finish();
    layer.remove();
  });
}

function start() {
  const list = themeConfig(current).effects || [];
  list.forEach((entry, slot) => {
    loadEffect(typeof entry === 'string' ? { id: entry } : entry, slot, round);
  });
}

function restart() {
  round++;
  started = new Set();
  cleanups.splice(0).forEach(fn => fn());
  start();
}

onThemeChange(id => {
  current = id;
  restart();
});
document.addEventListener('gateopen', start);

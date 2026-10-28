import { root, CALM, themeConfig, onThemeChange } from './shared.js';

const waiting = () => root.dataset.gate === 'pending';
const random = (min, max) => min + Math.random() * (max - min);

let current = '';
let round = 0;
let cleanups = [];

function makeContext(options, layer) {
  const undo = [];
  return {
    options,
    layer,
    random,
    on(target, type, handler) {
      target.addEventListener(type, handler);
      undo.push(() => target.removeEventListener(type, handler));
    },
    timer(run, min, max) {
      let id;
      const next = () => {
        id = setTimeout(() => {
          if (!document.hidden) run();
          next();
        }, random(min, max) * 1000);
      };
      next();
      undo.push(() => clearTimeout(id));
    },
    sound: name => document.dispatchEvent(new CustomEvent('fxsound', { detail: name })),
    stop: () => undo.splice(0).forEach(fn => fn())
  };
}

async function load(options, myRound) {
  let module;
  try {
    module = await import(`./effects/${options.id}.js`);
  } catch (error) {
    console.warn(`effects.js: could not load the effect "${options.id}".`, error);
    return;
  }
  if (myRound !== round) return;
  if (CALM.matches && !module.calmSafe) return;

  const layer = document.createElement('div');
  layer.className = 'fx-layer';
  layer.dataset.effect = options.id;
  document.body.appendChild(layer);

  const ctx = makeContext(options, layer);
  const finish = module.default(ctx);
  cleanups.push(() => {
    ctx.stop();
    if (typeof finish === 'function') finish();
    layer.remove();
  });
}

function restart() {
  round++;
  cleanups.splice(0).forEach(fn => fn());
  if (waiting()) return;
  const list = themeConfig(current).effects || [];
  list.forEach(entry => load(typeof entry === 'string' ? { id: entry } : entry, round));
}

onThemeChange(id => {
  current = id;
  restart();
});
document.addEventListener('gateopen', restart);

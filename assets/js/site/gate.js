import { root, CALM, announce, save } from './shared.js';

const gate = document.getElementById('gate');

function run() {
  const calm = CALM.matches;
  const seconds = name => (calm ? 0 : Number(gate.dataset[name]) || 0) * 1000;
  const delay = seconds('delay');
  const fade = seconds('fade');
  const media = gate.querySelector('.gate-media');
  let leaving = false;

  gate.style.setProperty('--gate-fade', fade + 'ms');

  if (media && !calm) {
    if (media.play) {
      media.preload = 'auto';
      media.load();
    } else if (media.dataset.active) {
      new Image().src = media.dataset.active;
    }
  }

  function activate() {
    if (!media || calm) return;
    if (media.play) media.play().catch(() => {});
    else if (media.dataset.active) media.src = media.dataset.active;
  }

  function open() {
    leaving = true;
    save('gate-passed', true);
    root.dataset.gate = 'open';
    gate.classList.add('is-leaving');
    announce('gateopen');
    setTimeout(() => gate.close(), fade);
  }

  gate.addEventListener('cancel', event => event.preventDefault());
  gate.addEventListener('close', () => { if (!leaving) gate.showModal(); });
  gate.showModal();

  gate.addEventListener('click', () => {
    announce('gateenter');
    gate.classList.add('is-opening');
    activate();
    setTimeout(open, delay);
  }, { once: true });
}

if (gate && root.dataset.gate === 'pending') run();

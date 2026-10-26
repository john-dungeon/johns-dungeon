import { root, CALM, save } from './shared.js';

const gate = document.getElementById('gate');
const announce = type => document.dispatchEvent(new CustomEvent(type));

function run() {
  const seconds = name => (CALM.matches ? 0 : Number(gate.dataset[name]) || 0) * 1000;
  const delay = seconds('delay');
  const fade = seconds('fade');
  let leaving = false;

  gate.style.setProperty('--gate-fade', fade + 'ms');

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
    setTimeout(open, delay);
  }, { once: true });
}

if (gate && root.dataset.gate === 'pending') run();

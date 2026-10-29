import { root, CALM, announce, save } from './shared.js';

const gate = document.getElementById('gate');

function run() {
  const calm = CALM.matches;
  const seconds = name => (calm ? 0 : Number(gate.dataset[name]) || 0);
  let leaving = false;

  ['zoom', 'darken', 'fade'].forEach(name => {
    gate.style.setProperty(`--gate-${name}`, seconds(name) + 's');
  });
  gate.style.setProperty('--gate-focus', gate.dataset.focus);
  gate.style.setProperty('--gate-scale', calm ? 1 : gate.dataset.scale);

  function open() {
    leaving = true;
    save('gate-passed', true);
    root.dataset.gate = 'open';
    gate.classList.add('is-leaving');
    announce('gateopen');
    setTimeout(() => gate.close(), seconds('fade') * 1000);
  }

  gate.addEventListener('cancel', event => event.preventDefault());
  gate.addEventListener('close', () => { if (!leaving) gate.showModal(); });
  gate.showModal();

  gate.addEventListener('click', () => {
    announce('gateenter');
    gate.classList.add('is-opening');
    setTimeout(open, seconds('zoom') * 1000);
  }, { once: true });
}

if (gate && root.dataset.gate === 'pending') run();

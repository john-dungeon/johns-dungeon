import { root, waiting, load, save, wireDialog, openDialog } from './shared.js';

const KEY = 'lock-open';

const clean = path => path.replace(/(\/index)?(\.html)?\/?$/, '');
const locked = new Set(globalThis.SITE_LOCKED.map(url => clean(globalThis.SITE_ROOT + url.slice(1))));

const dialog = document.getElementById('lock');
const form = dialog.querySelector('form');
const input = dialog.querySelector('input');

wireDialog(dialog);

const isOpen = () => load(KEY, false);

async function isRightPassword(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return hex === dialog.dataset.hash.toLowerCase();
}

function ask(granted, denied = () => {}) {
  input.value = '';
  dialog.returnValue = '';
  dialog.addEventListener('close', () => {
    (dialog.returnValue === 'granted' ? granted : denied)();
  }, { once: true });
  openDialog(dialog);
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const right = await isRightPassword(input.value);
  if (right) save(KEY, true);
  dialog.close(right ? 'granted' : 'denied');
});

document.getElementById('lock-cancel').addEventListener('click', () => dialog.close());

document.addEventListener('click', event => {
  const plain = event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
  const link = event.target.closest?.('a[href]');
  if (!plain || !link || link.target === '_blank' || link.origin !== location.origin) return;
  if (isOpen() || !locked.has(clean(link.pathname))) return;

  event.preventDefault();
  ask(() => { location.href = link.href; });
});

if (root.dataset.lock === 'pending') {
  const reveal = () => { delete root.dataset.lock; };
  const start = () => (isOpen() ? reveal() : ask(reveal, () => location.replace(globalThis.SITE_ROOT)));
  if (waiting()) document.addEventListener('gateopen', start, { once: true });
  else start();
}

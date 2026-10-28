import { root, FINE_POINTER, INTERACTIVE, themeConfig, onThemeChange } from './shared.js';

const VIDEO = /\.(webm|mp4)$/i;
const url = file => globalThis.SITE_ROOT + file;

const holder = document.createElement('div');
holder.id = 'site-cursor';
holder.setAttribute('popover', 'manual');
holder.setAttribute('aria-hidden', 'true');
document.body.appendChild(holder);

let spec = null;
let hotspot = [0, 0];
let normal = null;
let link = null;
let overLink = false;
let x = 0;
let y = 0;
let frame = 0;

function media(file, size) {
  const node = document.createElement(VIDEO.test(file) ? 'video' : 'img');
  node.src = url(file);
  node.style.width = size + 'px';
  if (node.tagName === 'VIDEO') {
    Object.assign(node, { autoplay: true, loop: true, muted: true, playsInline: true });
  } else {
    node.alt = '';
  }
  return node;
}

function raise() {
  if (!spec) return;
  try { holder.hidePopover(); } catch (e) {}
  try { holder.showPopover(); } catch (e) {}
}

function paintLayers() {
  normal.style.display = overLink && link !== normal ? 'none' : '';
  if (link !== normal) link.style.display = overLink ? '' : 'none';
}

function enable(config) {
  spec = config;
  const size = config.size || 32;
  hotspot = (config.hotspot || '0 0').split(' ').map(Number);
  normal = media(config.image, size);
  link = config.pointer ? media(config.pointer, size) : normal;

  holder.textContent = '';
  holder.append(normal);
  if (link !== normal) holder.append(link);
  overLink = false;
  paintLayers();

  root.classList.add('fake-cursor');
  raise();
}

function disable() {
  spec = null;
  root.classList.remove('fake-cursor');
  holder.textContent = '';
  try { holder.hidePopover(); } catch (e) {}
}

function paint() {
  frame = 0;
  holder.style.transform = `translate3d(${x - hotspot[0]}px, ${y - hotspot[1]}px, 0)`;
}

document.addEventListener('pointermove', event => {
  if (!spec || event.pointerType === 'touch') return;
  x = event.clientX;
  y = event.clientY;
  holder.style.opacity = 1;
  frame ||= requestAnimationFrame(paint);
});

document.addEventListener('pointerover', event => {
  if (!spec) return;
  const now = Boolean(event.target.closest(INTERACTIVE));
  if (now === overLink) return;
  overLink = now;
  paintLayers();
});

root.addEventListener('pointerleave', () => { holder.style.opacity = 0; });
document.addEventListener('popupopen', raise);

onThemeChange(id => {
  const config = themeConfig(id).cursor;
  if (config && config.animated && config.image && FINE_POINTER.matches) enable(config);
  else disable();
});

import { root, load, save, themeConfig, onThemeChange, INTERACTIVE } from './shared.js';

const { defaults, volume, sets } = globalThis.SITE_AUDIO;
const url = file => globalThis.SITE_ROOT + file;

const prefs = {
  effects: load('sound-effects', defaults.effects),
  music: load('sound-music', defaults.music)
};

// Sound Effects
const clips = new Map();
let effects = {};

function clip(file) {
  if (!clips.has(file)) {
    const audio = new Audio(url(file));
    audio.preload = 'auto';
    clips.set(file, audio);
  }
  return clips.get(file);
}

function play(name) {
  const file = effects[name];
  if (!prefs.effects || !file) return;
  const sound = clip(file).cloneNode();
  sound.volume = volume.effects;
  sound.play().catch(() => {});
}

document.addEventListener('click', event => {
  if (event.target.closest(INTERACTIVE)) play('click');
});

let hovered = null;
document.addEventListener('pointerover', event => {
  if (event.pointerType !== 'mouse') return;
  const item = event.target.closest(INTERACTIVE);
  if (item && item !== hovered) play('hover');
  hovered = item;
});

document.addEventListener('popupopen', () => play('open'));
document.addEventListener('popupclose', () => play('close'));

// Background Music
const music = new Audio();
music.loop = true;
music.volume = volume.music;
let track = '';

function syncMusic() {
  const file = themeConfig(root.dataset.theme).music;
  if (!prefs.music || !file || document.hidden) {
    music.pause();
    return;
  }
  if (track !== file) {
    track = file;
    music.src = url(file);
  }
  music.play().catch(() => {});
}

['pointerdown', 'keydown'].forEach(type => document.addEventListener(type, syncMusic, { once: true }));
document.addEventListener('visibilitychange', syncMusic);

// Theme Changes, Sound Menu
onThemeChange(id => {
  effects = sets[themeConfig(id).sounds] || {};
  Object.values(effects).forEach(clip);
  syncMusic();
});

document.querySelectorAll('[data-sound]').forEach(box => {
  const kind = box.dataset.sound;
  box.checked = prefs[kind];
  box.addEventListener('change', () => {
    prefs[kind] = box.checked;
    save('sound-' + kind, box.checked);
    syncMusic();
  });
});

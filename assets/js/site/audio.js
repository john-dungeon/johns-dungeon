import { root, load, save, themeConfig, onThemeChange, INTERACTIVE } from './shared.js';

const { defaults, volume, sets, playlists = {} } = globalThis.SITE_AUDIO;
const url = file => globalThis.SITE_ROOT + file;

const prefs = {
  effects: load('sound-effects', defaults.effects),
  music: load('sound-music', defaults.music)
};

const waiting = () => root.dataset.gate === 'pending';

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
  if (waiting() && name !== 'enter') return;
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
document.addEventListener('gateenter', () => play('enter'));
document.addEventListener('fxsound', event => play(event.detail));

// ---- Background music ----
const music = new Audio();
music.volume = volume.music;

let playlist = [];
let listName = '';
let track = '';
let saved = load('music-state', null);

function start(file, from = 0) {
  track = file;
  music.src = url(file);
  music.loop = playlist.length === 1;
  if (from) music.addEventListener('loadedmetadata', () => { music.currentTime = from; }, { once: true });
}

function pick() {
  const others = playlist.filter(file => file !== track);
  const choices = others.length ? others : playlist;
  return choices[Math.floor(Math.random() * choices.length)];
}

function syncMusic() {
  if (!prefs.music || !playlist.length || document.hidden || waiting()) {
    music.pause();
    return;
  }
  if (!track) start(pick());
  if (music.paused) music.play().catch(() => {});
}

music.addEventListener('ended', () => {
  start(pick());
  syncMusic();
});

function saveMusic() {
  if (track) save('music-state', { list: listName, file: track, time: music.currentTime });
}
addEventListener('pagehide', saveMusic);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) saveMusic();
  syncMusic();
});

document.addEventListener('gateopen', syncMusic);
['pointerdown', 'keydown'].forEach(type => document.addEventListener(type, syncMusic));

// Theme Changes, Sound Menu
onThemeChange(id => {
  const config = themeConfig(id);
  effects = sets[config.sounds] || {};
  Object.values(effects).forEach(clip);

  const name = config.music || '';
  if (name !== listName) {
    listName = name;
    playlist = playlists[name] || [];
    track = '';
    music.pause();
    if (saved && saved.list === name && playlist.includes(saved.file)) start(saved.file, saved.time);
    saved = null;
  }
  syncMusic();
});

document.querySelectorAll('[data-sound]').forEach(box => {
  const kind = box.dataset.sound;   // "effects" or "music"
  box.checked = prefs[kind];
  box.addEventListener('change', () => {
    prefs[kind] = box.checked;
    save('sound-' + kind, box.checked);
    syncMusic();
  });
});

(function () {
  const THEMES = window.SITE_THEMES || [];
  const IDS = THEMES.map(theme => theme.id);
  const PATTERN = /just-the-docs-([a-z]+)\.css/;
  const root = document.documentElement;

  const themeLinks = () => [...document.querySelectorAll('link[rel="stylesheet"]')]
    .filter(l => PATTERN.test(l.getAttribute('href')));

  let link = themeLinks()[0];
  if (!link) return;

  const currentTheme = () => {
    const id = link.getAttribute('href').match(PATTERN)?.[1];
    return id === 'default' ? window.SITE_DEFAULT_THEME : id;
  };
  const hrefFor = theme =>
    link.getAttribute('href').replace(PATTERN, `just-the-docs-${theme}.css`);

  const preloaded = new Set();
  function preloadFonts(id) {
    if (preloaded.has(id)) return;
    preloaded.add(id);
    const theme = THEMES.find(item => item.id === id);
    ((theme && theme.fonts) || []).forEach(font => {
      if (font.preload === false) return;
      const hint = document.createElement('link');
      hint.rel = 'preload';
      hint.as = 'font';
      hint.crossOrigin = 'anonymous';
      hint.href = window.SITE_ROOT + font.file;
      document.head.appendChild(hint);
    });
  }

  function setStylesheet(theme) {
    return new Promise(resolve => {
      const old = link;
      const next = old.cloneNode();
      next.setAttribute('href', hrefFor(theme));
      next.addEventListener('load', () => { old.remove(); resolve(); });
      old.after(next);
      link = next;
    });
  }

  function switchTheme(theme) {
    preloadFonts(theme);
    if (!document.startViewTransition) return setStylesheet(theme);
    return document.startViewTransition(() => setStylesheet(theme)).updateCallbackDone;
  }

  function announce(theme) {
    root.dataset.theme = theme;
    document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
  }

  let active = currentTheme();
  try {
    const saved = localStorage.getItem('theme');
    if (IDS.includes(saved) && saved !== currentTheme()) {
      document.write(`<link rel="stylesheet" href="${hrefFor(saved)}">`);
      link.remove();
      active = saved;
    }
  } catch (e) {}
  root.dataset.theme = active;
  preloadFonts(active);

  const startCursor = (THEMES.find(theme => theme.id === active) || {}).cursor;
  if (startCursor && startCursor.animated && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    root.classList.add('fake-cursor');
  }

  document.addEventListener('DOMContentLoaded', () => {
    link = themeLinks()[0];

    const menu = document.getElementById('theme-menu');
    if (!menu) return;
    const options = menu.querySelectorAll('.dock-option');

    const markActive = () => {
      options.forEach(option => option.classList.toggle('active', option.dataset.theme === root.dataset.theme));
    };

    menu.addEventListener('click', event => {
      const option = event.target.closest('.dock-option');
      if (!option) return;
      const theme = option.dataset.theme;
      if (theme === root.dataset.theme) return;
      try { localStorage.setItem('theme', theme); } catch (e) {}
      switchTheme(theme).then(() => { announce(theme); markActive(); });
    });

    markActive();
  });
})();

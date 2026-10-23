(function () {
  const THEMES = window.SITE_THEMES || [];
  const IDS = THEMES.map(theme => theme.id);
  const PATTERN = /just-the-docs-([a-z]+)\.css/;

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

  let active = currentTheme();
  try {
    const saved = localStorage.getItem('theme');
    if (IDS.includes(saved) && saved !== currentTheme()) {
      document.write(`<link rel="stylesheet" href="${hrefFor(saved)}">`);
      active = saved;
    }
  } catch (e) {}
  preloadFonts(active);

  document.addEventListener('DOMContentLoaded', () => {
    const links = themeLinks();
    link = links[links.length - 1];
    links.slice(0, -1).forEach(old => old.remove());

    const toggle = document.getElementById('theme-toggle');
    const menu = document.getElementById('theme-menu');
    if (!toggle || !menu) return;
    const options = menu.querySelectorAll('.theme-option');

    const markActive = () => {
      const now = currentTheme();
      options.forEach(option => option.classList.toggle('active', option.dataset.theme === now));
    };

    const setMenu = open => {
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    toggle.addEventListener('click', event => {
      event.stopPropagation();
      setMenu(menu.hidden);
    });

    menu.addEventListener('click', event => {
      const option = event.target.closest('.theme-option');
      if (!option) return;
      setMenu(false);
      const theme = option.dataset.theme;
      if (theme === currentTheme()) return;
      try { localStorage.setItem('theme', theme); } catch (e) {}
      switchTheme(theme).then(markActive);
    });

    document.addEventListener('click', event => {
      if (!menu.hidden && !menu.contains(event.target)) setMenu(false);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') setMenu(false);
    });

    markActive();
  });
})();

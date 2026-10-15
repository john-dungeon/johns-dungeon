(function () {
  const THEMES = window.SITE_THEMES || [];
  const PATTERN = /just-the-docs-([a-z]+)\.css/;

  let link = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .find(l => PATTERN.test(l.getAttribute('href')));
  if (!link) return;

  const currentTheme = () => link.getAttribute('href').match(PATTERN)?.[1];
  const hrefFor = theme =>
    link.getAttribute('href').replace(PATTERN, `just-the-docs-${theme}.css`);

  function setStylesheet(theme) {
    const old = link;
    const next = old.cloneNode();
    next.setAttribute('href', hrefFor(theme));
    next.addEventListener('load', () => old.remove());
    old.after(next);
    link = next;
  }

  try {
    const saved = localStorage.getItem('theme');
    if (THEMES.includes(saved) && saved !== currentTheme()) {
      link.setAttribute('href', hrefFor(saved));
    }
  } catch (e) {}

  document.addEventListener('DOMContentLoaded', () => {
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
      setStylesheet(option.dataset.theme);
      try { localStorage.setItem('theme', option.dataset.theme); } catch (e) {}
      markActive();
      setMenu(false);
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

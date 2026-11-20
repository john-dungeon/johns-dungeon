(function () {
  const KEY = 'effects-snapshot';
  const root = document.documentElement;
  const store = SiteStore.session;
  const isEffect = name => /^(--)?fx-/.test(name);
  const screenSize = () => innerWidth + 'x' + innerHeight;

  const saved = store.get(KEY, null);
  const stillValid = saved
    && saved.build === window.SITE_BUILD
    && saved.theme === root.dataset.theme
    && saved.size === screenSize();
  if (stillValid) {
    saved.classes.forEach(name => root.classList.add(name));
    Object.entries(saved.vars).forEach(([name, value]) => root.style.setProperty(name, value));
  }

  addEventListener('pagehide', () => {
    const vars = {};
    Array.from(root.style).filter(isEffect).forEach(name => {
      vars[name] = root.style.getPropertyValue(name);
    });
    store.set(KEY, {
      build: window.SITE_BUILD,
      theme: root.dataset.theme,
      size: screenSize(),
      classes: [...root.classList].filter(isEffect),
      vars
    });
  });
})();

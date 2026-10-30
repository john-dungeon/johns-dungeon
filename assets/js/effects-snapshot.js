(function () {
  const KEY = 'effects-snapshot';
  const root = document.documentElement;
  const isEffect = name => /^(--)?fx-/.test(name);
  const screenSize = () => innerWidth + 'x' + innerHeight;

  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY));
    const stillValid = saved
      && saved.build === window.SITE_BUILD
      && saved.theme === root.dataset.theme
      && saved.size === screenSize();
    if (stillValid) {
      saved.classes.forEach(name => root.classList.add(name));
      Object.entries(saved.vars).forEach(([name, value]) => root.style.setProperty(name, value));
    }
  } catch (e) {}

  addEventListener('pagehide', () => {
    try {
      const vars = {};
      Array.from(root.style).filter(isEffect).forEach(name => {
        vars[name] = root.style.getPropertyValue(name);
      });
      sessionStorage.setItem(KEY, JSON.stringify({
        build: window.SITE_BUILD,
        theme: root.dataset.theme,
        size: screenSize(),
        classes: [...root.classList].filter(isEffect),
        vars
      }));
    } catch (e) {}
  });
})();

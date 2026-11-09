(function () {
  const SUFFIX = '-collapsed';
  const root = document.documentElement;

  try {
    Object.keys(localStorage)
      .filter(key => key.endsWith(SUFFIX) && localStorage.getItem(key) === 'true')
      .forEach(key => root.classList.add(key));
  } catch (e) {}

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-panel-toggle]').forEach(button => {
      const state = button.dataset.panelToggle + SUFFIX;
      const paint = () =>
        button.setAttribute('aria-expanded', String(!root.classList.contains(state)));

      button.addEventListener('click', () => {
        const collapsed = root.classList.toggle(state);
        try { localStorage.setItem(state, collapsed); } catch (e) {}
        paint();
      });

      paint();
    });
  });
})();

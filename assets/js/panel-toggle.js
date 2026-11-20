(function () {
  const SUFFIX = '-collapsed';
  const root = document.documentElement;
  const store = SiteStore.local;

  store.keys()
    .filter(key => key.endsWith(SUFFIX) && store.get(key, false) === true)
    .forEach(key => root.classList.add(key));

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-panel-toggle]').forEach(button => {
      const state = button.dataset.panelToggle + SUFFIX;
      const paint = () =>
        button.setAttribute('aria-expanded', String(!root.classList.contains(state)));

      button.addEventListener('click', () => {
        store.set(state, root.classList.toggle(state));
        paint();
      });

      paint();
    });
  });
})();

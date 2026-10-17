(function () {
  const KEY = 'navbar-collapsed';
  const CLASS = 'navbar-collapsed';
  const root = document.documentElement;

  try {
    if (localStorage.getItem(KEY) === 'true') root.classList.add(CLASS);
  } catch (e) {}

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('navbar-toggle');
    if (!toggle) return;

    const paint = () =>
      toggle.setAttribute('aria-expanded', String(!root.classList.contains(CLASS)));

    toggle.addEventListener('click', () => {
      const collapsed = root.classList.toggle(CLASS);
      try { localStorage.setItem(KEY, collapsed); } catch (e) {}
      paint();
    });

    paint();
  });
})();

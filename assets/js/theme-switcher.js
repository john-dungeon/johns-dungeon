(function () {
  var THEMES = window.SITE_THEMES || [];
  var PATTERN = /just-the-docs-([a-z]+)\.css/;

  var link = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .find(function (l) { return PATTERN.test(l.getAttribute('href')); });
  if (!link) return;

  function currentTheme() {
    var match = link.getAttribute('href').match(PATTERN);
    return match && match[1];
  }

  function setStylesheet(theme) {
    link.setAttribute('href',
      link.getAttribute('href').replace(PATTERN, 'just-the-docs-' + theme + '.css'));
  }

  try {
    var saved = localStorage.getItem('theme');
    if (THEMES.indexOf(saved) !== -1 && saved !== currentTheme()) setStylesheet(saved);
  } catch (e) {}

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('theme-toggle');
    var menu = document.getElementById('theme-menu');
    if (!toggle || !menu) return;
    var options = menu.querySelectorAll('.theme-option');

    function markActive() {
      var now = currentTheme();
      options.forEach(function (option) {
        option.classList.toggle('active', option.dataset.theme === now);
      });
    }

    function setMenu(open) {
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggle.addEventListener('click', function (event) {
      event.stopPropagation();
      setMenu(menu.hidden);
    });

    menu.addEventListener('click', function (event) {
      var option = event.target.closest('.theme-option');
      if (!option) return;
      setStylesheet(option.dataset.theme);
      try { localStorage.setItem('theme', option.dataset.theme); } catch (e) {}
      markActive();
      setMenu(false);
    });

    document.addEventListener('click', function (event) {
      if (!menu.hidden && !menu.contains(event.target)) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenu(false);
    });

    markActive();
  });
})();

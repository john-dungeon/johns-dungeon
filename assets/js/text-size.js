(function () {
  const KEY = 'text-size';
  const NORMAL = 100;
  const root = document.documentElement;

  const paint = percent => {
    if (percent === NORMAL) root.style.removeProperty('font-size');
    else root.style.setProperty('font-size', percent + '%', 'important');
  };
  const remember = value => { try { localStorage.setItem(KEY, value); } catch (e) {} };

  let size = NORMAL;
  try { size = parseInt(localStorage.getItem(KEY), 10) || NORMAL; } catch (e) {}
  paint(size);

  document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('size-menu');
    if (!menu) return;
    const min = +menu.dataset.min;
    const max = +menu.dataset.max;
    const step = +menu.dataset.step;
    const output = document.getElementById('size-value');
    const down = document.getElementById('size-down');
    const up = document.getElementById('size-up');

    const show = () => {
      size = Math.min(max, Math.max(min, size));
      output.textContent = size + '%';
      down.disabled = size <= min;
      up.disabled = size >= max;
      paint(size);
    };

    const actions = {
      'size-down': () => size - step,
      'size-up': () => size + step,
      'size-reset': () => NORMAL
    };

    menu.addEventListener('click', event => {
      const action = actions[event.target.closest('button')?.id];
      if (!action) return;
      size = action();
      show();
      remember(size);
    });

    show();
  });
})();

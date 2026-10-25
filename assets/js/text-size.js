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
    const slider = document.getElementById('size-slider');
    const output = document.getElementById('size-value');
    const reset = document.getElementById('size-reset');
    if (!slider) return;

    const show = value => {
      size = Math.min(+slider.max, Math.max(+slider.min, value));
      slider.value = size;
      output.textContent = size + '%';
      paint(size);
    };

    slider.addEventListener('input', () => {
      show(+slider.value);
      remember(size);
    });
    reset.addEventListener('click', () => {
      show(NORMAL);
      remember(NORMAL);
    });

    show(size);
  });
})();

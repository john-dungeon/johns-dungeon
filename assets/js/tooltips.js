(function () {
  const GAP = 8;
  const MARGIN = 8;
  let tip = null;
  let current = null;

// Pop-Up Z Priority
  const supportsPopover = typeof HTMLElement !== 'undefined' &&
    typeof HTMLElement.prototype.showPopover === 'function';

  function ensureTip() {
    if (tip) return;
    tip = document.createElement('div');
    tip.className = 'tooltip-bubble';
    tip.id = 'site-tooltip';
    tip.setAttribute('role', 'tooltip');
    if (supportsPopover) tip.setAttribute('popover', 'manual');
    document.body.appendChild(tip);
  }

// Tooltip Text
  const ALLOWED = new Set(['EM', 'STRONG', 'I', 'B', 'CODE', 'BR']);

  function copyAllowed(parent, source) {
    source.childNodes.forEach(node => {
      if (node.nodeType === 3) {
        parent.append(node.textContent);
      } else if (node.nodeType === 1 && ALLOWED.has(node.tagName)) {
        const copy = document.createElement(node.tagName);
        copyAllowed(copy, node);
        parent.append(copy);
      } else if (node.nodeType === 1) {
        copyAllowed(parent, node);
      }
    });
  }

  function setContent(html) {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    tip.textContent = '';
    copyAllowed(tip, parsed.body);
  }
  
// Tooltip Position
  function place(target) {
    const rect = target.getBoundingClientRect();
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;

    const maxLeft = window.innerWidth - width - MARGIN;
    const left = Math.max(MARGIN, Math.min(rect.left, maxLeft));

    let top = rect.top - height - GAP;
    if (top < MARGIN) top = rect.bottom + GAP;

    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }

  function hide() {
    if (!tip || !current) return;
    current.removeAttribute('aria-describedby');
    current = null;
    tip.classList.remove('is-open');
    if (supportsPopover) {
      try { tip.hidePopover(); } catch (e) {}
    }
  }

  function show(target) {
    const text = target.getAttribute('data-tooltip');
    if (!text) return;
    ensureTip();
    hide();
    current = target;
    setContent(text);
    tip.classList.add('is-open');
    if (supportsPopover) {
      try { tip.showPopover(); } catch (e) {}
    }
    place(target);
    target.setAttribute('aria-describedby', 'site-tooltip');
  }

  const tipTarget = event => event.target.closest?.('[data-tooltip]') ?? null;

// Mouse Hover
  document.addEventListener('pointerover', event => {
    if (event.pointerType === 'touch') return;
    const target = tipTarget(event);
    if (target && target !== current) show(target);
  });

  document.addEventListener('pointerout', event => {
    if (!current || tipTarget(event) !== current) return;
    if (event.relatedTarget && current.contains(event.relatedTarget)) return;
    hide();
  });

// Keyboard Focus
  document.addEventListener('focusin', event => {
    const target = tipTarget(event);
    if (target && target.matches(':focus-visible')) show(target);
  });

  document.addEventListener('focusout', event => {
    if (tipTarget(event) === current) hide();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') hide();
  });

  document.addEventListener('pointerdown', hide);
  window.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);
})();

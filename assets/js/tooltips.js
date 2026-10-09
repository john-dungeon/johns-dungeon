(function () {
  var tip = null;
  var current = null;
  var GAP = 8;
  var MARGIN = 8;

  // Pop-Up Z Priority
  var supportsPopover = typeof HTMLElement !== 'undefined' &&
    typeof HTMLElement.prototype.showPopover === 'function';

  function ensureTip() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.className = 'tooltip-bubble';
    tip.id = 'site-tooltip';
    tip.setAttribute('role', 'tooltip');
    if (supportsPopover) tip.setAttribute('popover', 'manual');
    document.body.appendChild(tip);
    return tip;
  }

  // Tooltip Positioning
  function place(target) {
    var rect = target.getBoundingClientRect();
    var width = tip.offsetWidth;
    var height = tip.offsetHeight;

    var left = rect.left;
    var maxLeft = window.innerWidth - width - MARGIN;
    if (left > maxLeft) left = maxLeft;
    if (left < MARGIN) left = MARGIN;

    var top = rect.top - height - GAP;
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

  // Markdown Formatting
  function addFormatted(line) {
    var pattern = /\*\*(.+?)\*\*|\*(.+?)\*/g;
    var last = 0;
    var match;
    while ((match = pattern.exec(line)) !== null) {
      if (match.index > last) {
        tip.appendChild(document.createTextNode(line.slice(last, match.index)));
      }
      var isBold = match[1] !== undefined;
      var node = document.createElement(isBold ? 'strong' : 'em');
      node.textContent = isBold ? match[1] : match[2];
      tip.appendChild(node);
      last = pattern.lastIndex;
    }
    if (last < line.length) {
      tip.appendChild(document.createTextNode(line.slice(last)));
    }
  }

  function fill(text) {
    tip.textContent = '';
    text.split(/\s*\\\s*/).forEach(function (line, index) {
      if (index > 0) tip.appendChild(document.createElement('br'));
      addFormatted(line);
    });
  }

  function show(target) {
    var text = target.getAttribute('data-tooltip');
    if (!text) return;
    ensureTip();
    hide();
    current = target;
    fill(text);
    tip.classList.add('is-open');
    if (supportsPopover) {
      try { tip.showPopover(); } catch (e) {}
    }
    place(target);
    target.setAttribute('aria-describedby', 'site-tooltip');
  }

  function tipTarget(event) {
    var node = event.target;
    return node && node.closest ? node.closest('[data-tooltip]') : null;
  }

  // Cursor Hover
  document.addEventListener('pointerover', function (event) {
    if (event.pointerType === 'touch') return;
    var target = tipTarget(event);
    if (target && target !== current) show(target);
  });

  document.addEventListener('pointerout', function (event) {
    if (!current) return;
    if (tipTarget(event) !== current) return;
    if (event.relatedTarget && current.contains(event.relatedTarget)) return;
    hide();
  });

  // Keyboard Focus
  document.addEventListener('focusin', function (event) {
    var target = tipTarget(event);
    if (target && target.matches(':focus-visible')) show(target);
  });

  document.addEventListener('focusout', function (event) {
    if (tipTarget(event) === current) hide();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') hide();
  });

  document.addEventListener('pointerdown', hide);
  window.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);
})();

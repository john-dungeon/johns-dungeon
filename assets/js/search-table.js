(function () {
  function init(root) {
    if (root.getAttribute('data-ready')) return;
    root.setAttribute('data-ready', 'true');

    var config = JSON.parse(root.getAttribute('data-config'));
    var columns = config.columns;
    var nameKey = columns[0].key;
    var columnByKey = {};
    var fieldNames = ['tag'];

    function intOr(value, fallback) {
      var n = parseInt(value, 10);
      return isNaN(n) ? fallback : n;
    }

    // Results Shown
    var limitMin = intOr(config.limit_min, 25);
    var limitMax = intOr(config.limit_max, 500);
    var limitStep = intOr(config.limit_step, 25);
    var limit = Math.min(limitMax, Math.max(limitMin, intOr(config.limit_default, 100)));

    columns.forEach(function (col, index) {
      col.type = col.type || 'text';
      col.index = index;
      if (col.type === 'rank') {
        col.rankList = (col.order || []).map(function (item) { return String(item).toLowerCase(); });
      }
      columnByKey[col.key] = col;
      fieldNames.push(col.key);
    });

    var table = root.querySelector('.st-table');
    var body = table.tBodies[0];
    var search = root.querySelector('.st-search');
    var count = root.querySelector('.st-count');
    var empty = root.querySelector('.st-empty');
    var filterToggle = root.querySelector('.st-filter-toggle');
    var filterPanel = root.querySelector('.st-filter-panel');
    var dialog = root.querySelector('.st-dialog');
    var dialogTitle = dialog.querySelector('.st-dialog-title');
    var dialogTags = dialog.querySelector('.st-dialog-tags');
    var dialogFacts = dialog.querySelector('.st-dialog-facts');
    var dialogBody = dialog.querySelector('.st-dialog-body');

    var sortKey = columnByKey[config.default_sort] ? config.default_sort : nameKey;
    var sortDir = config.default_dir === 'desc' ? -1 : 1;

    var fieldPattern = fieldNames.join('|');
    var halfTyped = new RegExp('^(' + fieldPattern + '):$');

    // Filter Panel Selection
    var filters = { tags: {}, any: false, cats: {}, ranges: {} };

    function toNumber(text) {
      if (text === null || text === undefined || text === '') return null;
      var n = parseFloat(text);
      return isNaN(n) ? null : n;
    }

    function compareText(a, b) {
      return a.localeCompare(b, undefined, { numeric: true });
    }

    function el(tag, className, text) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    }

    // Read Rows
    var records = Array.prototype.map.call(body.rows, function (row) {
      var rec = { row: row, text: {}, num: {}, rank: {}, values: {}, tags: [] };
      var tagText = row.getAttribute('data-tags');
      rec.tags = tagText ? tagText.split(',') : [];
      columns.forEach(function (col) {
        var raw = row.getAttribute('data-v-' + col.key) || '';
        rec.text[col.key] = raw;
        rec.values[col.key] = raw === '' ? [] : (col.type === 'list' ? raw.split(', ') : [raw]);
        if (col.type === 'number') rec.num[col.key] = toNumber(raw);
        if (col.type === 'rank') {
          var index = col.rankList.indexOf(raw);
          rec.rank[col.key] = index === -1 ? null : index + 1;
        }
      });
      return rec;
    });

    // Read Tags
    var tagLabels = {};
    var optionLabels = {};
    records.forEach(function (rec) {
      var tagNames = rec.row.getAttribute('data-tag-names');
      rec.tagNames = tagNames ? tagNames.split(',') : [];
      rec.tags.forEach(function (tag, i) {
        if (!tagLabels[tag]) tagLabels[tag] = rec.tagNames[i] || tag;
      });
      columns.forEach(function (col) {
        if (col.index === 0 || col.type === 'number') return;
        var cellText = rec.row.cells[col.index].textContent.trim();
        var labels = col.type === 'list' ? cellText.split(', ') : [cellText];
        rec.values[col.key].forEach(function (value, i) {
          optionLabels[col.key] = optionLabels[col.key] || {};
          if (!optionLabels[col.key][value]) optionLabels[col.key][value] = labels[i] || value;
        });
      });
    });

    // Translate Search into Tags
    function parseQuery(text) {
      var terms = [];
      var pattern = new RegExp('(-?)(?:(' + fieldPattern + '):)?(?:"([^"]*)"|(\\S+))', 'gi');
      var match;
      while ((match = pattern.exec(text)) !== null) {
        var field = match[2] ? match[2].toLowerCase() : nameKey;
        var value = (match[3] !== undefined ? match[3] : match[4]).toLowerCase();
        if (!match[2] && value.charAt(0) === '#') {
          field = 'tag';
          value = value.slice(1);
        }
        if (!match[2] && (value === '-' || halfTyped.test(value))) continue;
        if (value) terms.push({ negate: match[1] === '-', field: field, value: value });
      }
      return terms;
    }

    // Number Displayed
    function matchNumber(actual, query) {
      var single = /^(>=|<=|>|<|=)?\s*(-?\d+(?:\.\d+)?)$/.exec(query);
      if (single) {
        if (actual === null) return false;
        var n = parseFloat(single[2]);
        switch (single[1]) {
          case '>': return actual > n;
          case '>=': return actual >= n;
          case '<': return actual < n;
          case '<=': return actual <= n;
          default: return actual === n;
        }
      }
      var range = /^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/.exec(query);
      if (range) {
        if (actual === null) return false;
        return actual >= parseFloat(range[1]) && actual <= parseFloat(range[2]);
      }
      return null;
    }

    function matchesTerm(rec, term) {
      if (term.field === 'tag') {
        return rec.tags.some(function (tag) { return tag.indexOf(term.value) !== -1; });
      }
      var col = columnByKey[term.field];
      var text = rec.text[col.key];
      if (col.type === 'number') {
        var numeric = matchNumber(rec.num[col.key], term.value);
        if (numeric !== null) return numeric;
        if (/[a-z]/.test(term.value)) return text.indexOf(term.value) !== -1;
        return null;
      }
      var exact = col.match ? col.match === 'exact' : col.type === 'rank';
      if (col.type === 'list') {
        if (exact) return text.split(', ').indexOf(term.value) !== -1;
        return text.indexOf(term.value) !== -1;
      }
      if (exact) return text === term.value;
      return text.indexOf(term.value) !== -1;
    }

    function matches(rec, terms) {
      for (var i = 0; i < terms.length; i++) {
        var hit = matchesTerm(rec, terms[i]);
        if (hit === null) continue;
        if (hit === terms[i].negate) return false;
      }
      return true;
    }

    // Filter Panel
    function wantsFilter(col) {
      if (col.filter === false) return false;
      if (col.filter === true) return true;
      if (col.in_table === false) return false;
      if (col.type === 'number') return true;
      var distinct = Object.keys(optionLabels[col.key] || {}).length;
      return distinct > 1 && distinct <= 30;
    }

    function matchesFilters(rec) {
      var picked = Object.keys(filters.tags);
      if (picked.length) {
        var hasTag = function (tag) { return rec.tags.indexOf(tag) !== -1; };
        var tagOk = filters.any ? picked.some(hasTag) : picked.every(hasTag);
        if (!tagOk) return false;
      }

      var catKeys = Object.keys(filters.cats);
      for (var i = 0; i < catKeys.length; i++) {
        var chosen = Object.keys(filters.cats[catKeys[i]]);
        if (!chosen.length) continue;
        var have = rec.values[catKeys[i]];
        var anyHit = chosen.some(function (value) { return have.indexOf(value) !== -1; });
        if (!anyHit) return false;
      }

      var rangeKeys = Object.keys(filters.ranges);
      for (var j = 0; j < rangeKeys.length; j++) {
        var range = filters.ranges[rangeKeys[j]];
        if (range.min === null && range.max === null) continue;
        var actual = rec.num[rangeKeys[j]];
        if (actual === null || actual === undefined) return false;
        if (range.min !== null && actual < range.min) return false;
        if (range.max !== null && actual > range.max) return false;
      }
      return true;
    }

    function activeFilterCount() {
      var total = Object.keys(filters.tags).length;
      Object.keys(filters.cats).forEach(function (key) {
        total += Object.keys(filters.cats[key]).length;
      });
      Object.keys(filters.ranges).forEach(function (key) {
        var range = filters.ranges[key];
        if (range.min !== null || range.max !== null) total++;
      });
      return total;
    }

    function optionGroup(title, entries, isOn, onToggle) {
      var group = el('div', 'st-filter-group');
      group.appendChild(el('div', 'st-filter-title', title));
      var wrap = el('div', 'st-filter-options');
      entries.forEach(function (entry) {
        var button = el('button', 'st-opt', entry.label);
        button.type = 'button';
        button.setAttribute('aria-pressed', isOn(entry.value) ? 'true' : 'false');
        button.addEventListener('click', function () {
          var now = button.getAttribute('aria-pressed') !== 'true';
          button.setAttribute('aria-pressed', now ? 'true' : 'false');
          onToggle(entry.value, now);
          render();
        });
        wrap.appendChild(button);
      });
      group.appendChild(wrap);
      return group;
    }

    function rangeInput(label, placeholder, value) {
      var input = el('input', 'st-range-input');
      input.type = 'number';
      input.step = 'any';
      input.placeholder = placeholder;
      input.setAttribute('aria-label', label);
      if (value !== null && value !== undefined) input.value = value;
      return input;
    }

    function rangeGroup(col) {
      var group = el('div', 'st-filter-group');
      var unit = col.suffix ? ' (' + col.suffix.trim() + ')' : '';
      group.appendChild(el('div', 'st-filter-title', col.label + unit));
      var row = el('div', 'st-range');
      var current = filters.ranges[col.key] || { min: null, max: null };
      var minInput = rangeInput(col.label + ' minimum', 'Min', current.min);
      var maxInput = rangeInput(col.label + ' maximum', 'Max', current.max);
      function update() {
        filters.ranges[col.key] = { min: toNumber(minInput.value), max: toNumber(maxInput.value) };
        render();
      }
      minInput.addEventListener('input', update);
      maxInput.addEventListener('input', update);
      row.appendChild(minInput);
      row.appendChild(el('span', 'st-range-to', 'to'));
      row.appendChild(maxInput);
      group.appendChild(row);
      return group;
    }

    function buildPanel() {
      filterPanel.textContent = '';

      columns.forEach(function (col) {
        if (col.index === 0 || !wantsFilter(col)) return;

        if (col.type === 'number') {
          filterPanel.appendChild(rangeGroup(col));
          return;
        }

        var labels = optionLabels[col.key] || {};
        var values = Object.keys(labels);
        values.sort(function (a, b) {
          if (col.type === 'rank') {
            var ra = col.rankList.indexOf(a);
            var rb = col.rankList.indexOf(b);
            ra = ra === -1 ? 999 : ra;
            rb = rb === -1 ? 999 : rb;
            if (ra !== rb) return ra - rb;
          }
          return compareText(labels[a], labels[b]);
        });
        var entries = values.map(function (value) { return { value: value, label: labels[value] }; });

        filterPanel.appendChild(optionGroup(col.label, entries,
          function (value) { return !!(filters.cats[col.key] && filters.cats[col.key][value]); },
          function (value, on) {
            filters.cats[col.key] = filters.cats[col.key] || {};
            if (on) filters.cats[col.key][value] = true;
            else delete filters.cats[col.key][value];
          }
        ));
      });

      var tagValues = config.tags === false ? [] : Object.keys(tagLabels);
      if (tagValues.length) {
        tagValues.sort(function (a, b) { return compareText(tagLabels[a], tagLabels[b]); });
        var tagEntries = tagValues.map(function (value) { return { value: value, label: tagLabels[value] }; });
        filterPanel.appendChild(optionGroup('Tags', tagEntries,
          function (value) { return !!filters.tags[value]; },
          function (value, on) {
            if (on) filters.tags[value] = true;
            else delete filters.tags[value];
          }
        ));
      }

      // Results Shown
      var limitGroup = el('div', 'st-filter-group');
      limitGroup.appendChild(el('div', 'st-filter-title', 'Results shown'));
      var limitRow = el('div', 'st-limit');
      var slider = el('input', 'st-limit-slider');
      slider.type = 'range';
      slider.min = limitMin;
      slider.max = limitMax;
      slider.step = limitStep;
      slider.value = limit;
      slider.setAttribute('aria-label', 'Number of results shown');
      var output = el('output', 'st-limit-value', String(limit));
      slider.addEventListener('input', function () {
        limit = parseInt(slider.value, 10);
        output.textContent = String(limit);
        render();
      });
      limitRow.appendChild(slider);
      limitRow.appendChild(output);
      limitGroup.appendChild(limitRow);
      filterPanel.appendChild(limitGroup);

      // Match-Any and Clear
      var footer = el('div', 'st-filter-footer');
      if (tagValues.length) {
        var label = el('label', 'st-filter-match');
        var box = el('input');
        box.type = 'checkbox';
        box.checked = filters.any;
        box.addEventListener('change', function () {
          filters.any = box.checked;
          render();
        });
        label.appendChild(box);
        label.appendChild(document.createTextNode(' Match any selected tag (instead of all)'));
        footer.appendChild(label);
      }
      var clear = el('button', 'st-filter-clear', 'Clear filters');
      clear.type = 'button';
      clear.addEventListener('click', function () {
        filters = { tags: {}, any: false, cats: {}, ranges: {} };
        buildPanel();
        render();
      });
      footer.appendChild(clear);
      filterPanel.appendChild(footer);
    }

    function sortValue(rec) {
      var col = columnByKey[sortKey];
      if (col.type === 'number') return rec.num[sortKey];
      if (col.type === 'rank') return rec.rank[sortKey];
      return rec.text[sortKey] || null;
    }

    // Missing Value Entry Sort
    function compareRecords(a, b) {
      var va = sortValue(a);
      var vb = sortValue(b);
      var tie = compareText(a.text[nameKey], b.text[nameKey]);
      if (va === null && vb === null) return tie;
      if (va === null) return 1;
      if (vb === null) return -1;
      var result = typeof va === 'number' ? va - vb : compareText(va, vb);
      if (result === 0) return tie;
      return result * sortDir;
    }

    function updateHeaders() {
      var headers = table.tHead.querySelectorAll('th[data-key]');
      Array.prototype.forEach.call(headers, function (th) {
        var state = 'none';
        if (th.getAttribute('data-key') === sortKey) {
          state = sortDir === 1 ? 'ascending' : 'descending';
        }
        th.setAttribute('aria-sort', state);
      });
    }

    // Restructure Table
    function render() {
      var terms = parseQuery(search.value);
      var matched = records.filter(function (rec) {
        return matches(rec, terms) && matchesFilters(rec);
      });
      matched.sort(compareRecords);
      var shown = matched.slice(0, limit);

      var fragment = document.createDocumentFragment();
      shown.forEach(function (rec, index) {
        rec.row.classList.toggle('is-even', index % 2 === 1);
        fragment.appendChild(rec.row);
      });
      body.textContent = '';
      body.appendChild(fragment);

      var noun = config.noun || 'entries';
      var text = 'Showing ' + shown.length + ' of ' + matched.length + ' ' + noun;
      if (matched.length !== records.length) text += ' (filtered from ' + records.length + ')';
      if (shown.length < matched.length && limit < limitMax) {
        text += ' \u00b7 raise the limit under Filter to see more';
      }
      count.textContent = text;
      empty.hidden = matched.length !== 0;

      var active = activeFilterCount();
      filterToggle.textContent = 'Filter' + (active ? ' (' + active + ')' : '');
      updateHeaders();
    }

    // Add Tag to Search
    function addTerm(field, value) {
      var token = field + ':' + (/\s/.test(value) ? '"' + value + '"' : value);
      if (search.value.toLowerCase().indexOf(token) !== -1) return;
      search.value = (search.value.trim() + ' ' + token).trim();
      render();
    }

    function openItem(row) {
      var id = row.getAttribute('data-id');
      var source = root.querySelector('.st-details [data-for="' + id + '"]');

      dialogTitle.textContent = row.querySelector('.st-name').textContent;
      dialog.setAttribute('aria-label', dialogTitle.textContent);

      // Show or Hide Value Table
      dialogFacts.textContent = '';
      if (config.popup_facts !== false) {
        for (var c = 1; c < row.cells.length; c++) {
          var cell = row.cells[c];
          var text = cell.textContent.trim();
          if (!text || text === '\u2014') continue;
          var term = document.createElement('dt');
          term.textContent = cell.getAttribute('data-label');
          var definition = document.createElement('dd');
          definition.textContent = text;
          dialogFacts.appendChild(term);
          dialogFacts.appendChild(definition);
        }
      }

      dialogTags.textContent = '';
      var tagNames = row.getAttribute('data-tag-names');
      if (tagNames && config.tags !== false) {
        tagNames.split(',').forEach(function (name) {
          var button = document.createElement('button');
          button.type = 'button';
          button.className = 'tag-chip';
          button.textContent = name;
          button.addEventListener('click', function () {
            dialog.close();
            addTerm('tag', name.toLowerCase());
          });
          dialogTags.appendChild(button);
        });
      }

      dialogBody.innerHTML = source ? source.innerHTML : '';
      dialog.showModal();
    }

    // Open Entry
    body.addEventListener('click', function (event) {
      var row = event.target.closest('tr');
      if (row) openItem(row);
    });

    body.addEventListener('keydown', function (event) {
      if ((event.key === 'Enter' || event.key === ' ') && event.target.tagName === 'TR') {
        event.preventDefault();
        openItem(event.target);
      }
    });

    // Toggle Sort Order
    table.tHead.addEventListener('click', function (event) {
      var th = event.target.closest('th');
      if (!th) return;
      var key = th.getAttribute('data-key');
      if (!key) return;
      if (key === sortKey) {
        sortDir = -sortDir;
      } else {
        sortKey = key;
        sortDir = 1;
      }
      render();
    });

    filterToggle.addEventListener('click', function () {
      var opening = filterPanel.hidden;
      filterPanel.hidden = !opening;
      filterToggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
    });

    dialog.querySelector('.st-dialog-close').addEventListener('click', function () {
      dialog.close();
    });

    // Expand Click Area
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });

    search.addEventListener('input', render);

    buildPanel();
    render();
  }

  Array.prototype.forEach.call(document.querySelectorAll('.search-table'), init);
})();

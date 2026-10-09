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

    function readState(map, value) {
      return map[value] || 'off';
    }

    function writeState(map, value, state) {
      if (state === 'off') delete map[value];
      else map[value] = state;
    }

    function valuesWithState(map, state) {
      return Object.keys(map).filter(function (value) { return map[value] === state; });
    }

    var records = Array.prototype.map.call(body.rows, function (row) {
      var rec = {
        row: row, text: {}, num: {}, rank: {},
        own: {}, extra: {}, values: {},
        tags: [], tagNames: []
      };
      var tagText = row.getAttribute('data-tags');
      rec.tags = tagText ? tagText.split(',') : [];
      var tagNameText = row.getAttribute('data-tag-names');
      rec.tagNames = tagNameText ? tagNameText.split(',') : [];

      columns.forEach(function (col) {
        var raw = row.getAttribute('data-v-' + col.key) || '';
        rec.text[col.key] = raw;

        var own = raw === '' ? [] : (col.type === 'list' ? raw.split(', ') : [raw]);
        var extraRaw = col.type === 'number' ? null : row.getAttribute('data-o-' + col.key);
        var extraLabels = extraRaw ? extraRaw.split(', ') : [];
        var values = own.slice();
        extraLabels.forEach(function (label) {
          var lower = label.toLowerCase();
          if (values.indexOf(lower) === -1) values.push(lower);
        });
        rec.own[col.key] = own;
        rec.extra[col.key] = extraLabels;
        rec.values[col.key] = values;

        if (col.type === 'number') rec.num[col.key] = toNumber(raw);
        if (col.type === 'rank') {
          var index = col.rankList.indexOf(raw);
          rec.rank[col.key] = index === -1 ? null : index + 1;
        }
      });
      return rec;
    });

    var tagLabels = {};
    var optionLabels = {};

    function setLabel(key, value, label) {
      optionLabels[key] = optionLabels[key] || {};
      if (!optionLabels[key][value]) optionLabels[key][value] = label;
    }

    records.forEach(function (rec) {
      rec.tags.forEach(function (tag, i) {
        if (!tagLabels[tag]) tagLabels[tag] = rec.tagNames[i] || tag;
      });
      columns.forEach(function (col) {
        if (col.index === 0 || col.type === 'number') return;
        var cell = rec.row.cells[col.index];
        var cellText = (cell.getAttribute('data-text') || cell.textContent).trim();
        var ownLabels = col.type === 'list' ? cellText.split(', ') : [cellText];
        rec.own[col.key].forEach(function (value, i) {
          setLabel(col.key, value, ownLabels[i] || value);
        });
        rec.extra[col.key].forEach(function (label) {
          setLabel(col.key, label.toLowerCase(), label);
        });
      });
    });

// Search Box
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
        // Ignore half-typed terms such as "tag:" or a lone "-".
        if (!match[2] && (value === '-' || halfTyped.test(value))) continue;
        if (value) terms.push({ negate: match[1] === '-', field: field, value: value });
      }
      return terms;
    }

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

    // A test for one value of a category column, based on a search term.
    function termTest(col, term) {
      var exact = col.match ? col.match === 'exact' : col.type === 'rank';
      return function (value) {
        return exact ? value === term.value : value.indexOf(term.value) !== -1;
      };
    }

    function isExcluded(rec, key, test) {
      if (rec.own[key].some(test)) return true;
      var extra = rec.extra[key].map(function (label) { return label.toLowerCase(); });
      return extra.length > 0 && extra.every(test);
    }

    function matchesTerm(rec, term) {
      if (term.field === 'tag') {
        return rec.tags.some(function (tag) { return tag.indexOf(term.value) !== -1; });
      }
      var col = columnByKey[term.field];
      if (col.type === 'number') {
        var numeric = matchNumber(rec.num[col.key], term.value);
        if (numeric !== null) return numeric;
        if (/[a-z]/.test(term.value)) return rec.text[col.key].indexOf(term.value) !== -1;
        return null;
      }
      return rec.values[col.key].some(termTest(col, term));
    }

    function matches(rec, terms) {
      for (var i = 0; i < terms.length; i++) {
        var term = terms[i];
        var col = columnByKey[term.field];
        if (term.negate && col && col.type !== 'number') {
          if (isExcluded(rec, col.key, termTest(col, term))) return false;
          continue;
        }
        var hit = matchesTerm(rec, term);
        if (hit === null) continue;
        if (hit === term.negate) return false;
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

      var hasTag = function (tag) { return rec.tags.indexOf(tag) !== -1; };
      var tagsIn = valuesWithState(filters.tags, 'include');
      var tagsOut = valuesWithState(filters.tags, 'exclude');
      if (tagsIn.length) {
        var tagOk = filters.any ? tagsIn.some(hasTag) : tagsIn.every(hasTag);
        if (!tagOk) return false;
      }
      if (tagsOut.some(hasTag)) return false;

      var catKeys = Object.keys(filters.cats);
      for (var i = 0; i < catKeys.length; i++) {
        var key = catKeys[i];
        var have = rec.values[key];
        var hasValue = function (value) { return have.indexOf(value) !== -1; };
        var included = valuesWithState(filters.cats[key], 'include');
        var excluded = valuesWithState(filters.cats[key], 'exclude');
        var isOut = function (value) { return excluded.indexOf(value) !== -1; };
        if (included.length && !included.some(hasValue)) return false;
        if (excluded.length && isExcluded(rec, key, isOut)) return false;
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

    function optionGroup(title, entries, getState, onChange) {
      var group = el('div', 'st-filter-group');
      group.appendChild(el('div', 'st-filter-title', title));
      var wrap = el('div', 'st-filter-options');
      entries.forEach(function (entry) {
        var button = el('button', 'st-opt', entry.label);
        button.type = 'button';

        function paint() {
          var state = getState(entry.value);
          var words = state === 'include' ? 'included' : (state === 'exclude' ? 'excluded' : 'not filtered');
          button.setAttribute('data-state', state);
          button.setAttribute('aria-pressed', state === 'off' ? 'false' : 'true');
          button.setAttribute('aria-label', entry.label + ', ' + words);
        }

        paint();
        button.addEventListener('click', function () {
          var state = getState(entry.value);
          var next = state === 'off' ? 'include' : (state === 'include' ? 'exclude' : 'off');
          onChange(entry.value, next);
          paint();
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

      filterPanel.appendChild(el('p', 'st-filter-hint',
        'Click a tag or category once to include it, twice to exclude it, and a third time to clear it.'));

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
          function (value) { return readState(filters.cats[col.key] || {}, value); },
          function (value, state) {
            filters.cats[col.key] = filters.cats[col.key] || {};
            writeState(filters.cats[col.key], value, state);
          }
        ));
      });

      var tagValues = config.tags === false ? [] : Object.keys(tagLabels);
      if (tagValues.length) {
        tagValues.sort(function (a, b) { return compareText(tagLabels[a], tagLabels[b]); });
        var tagEntries = tagValues.map(function (value) { return { value: value, label: tagLabels[value] }; });
        filterPanel.appendChild(optionGroup('Tags', tagEntries,
          function (value) { return readState(filters.tags, value); },
          function (value, state) { writeState(filters.tags, value, state); }
        ));
      }

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
        label.appendChild(document.createTextNode(' Match any included tag (instead of all)'));
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

// Pop-Up Window
    function openItem(row) {
      var id = row.getAttribute('data-id');
      var source = root.querySelector('.st-details [data-for="' + id + '"]');

      dialogTitle.textContent = row.querySelector('.st-name').textContent;
      dialog.setAttribute('aria-label', dialogTitle.textContent);

      dialogFacts.textContent = '';
      if (config.popup_facts !== false) {
        for (var c = 1; c < row.cells.length; c++) {
          var cell = row.cells[c];
          var text = (cell.getAttribute('data-text') || cell.textContent).trim();
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
        var tagList = tagNames.split(',');
        dialogTags.textContent = (tagList.length === 1 ? 'Tag: ' : 'Tags: ') + tagList.join(', ');
      }

      dialogBody.innerHTML = source ? source.innerHTML : '';
      dialog.showModal();
    }

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

(function () {
  function init(root) {
    if (root.getAttribute('data-ready')) return;
    root.setAttribute('data-ready', 'true');

    var config = JSON.parse(root.getAttribute('data-config'));
    var columns = config.columns;
    var nameKey = columns[0].key;
    var columnByKey = {};
    var fieldNames = ['tag'];

    columns.forEach(function (col) {
      col.type = col.type || 'text';
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
    var dialog = root.querySelector('.st-dialog');
    var dialogTitle = dialog.querySelector('.st-dialog-title');
    var dialogTags = dialog.querySelector('.st-dialog-tags');
    var dialogFacts = dialog.querySelector('.st-dialog-facts');
    var dialogBody = dialog.querySelector('.st-dialog-body');

    var sortKey = columnByKey[config.default_sort] ? config.default_sort : nameKey;
    var sortDir = config.default_dir === 'desc' ? -1 : 1;

    var fieldPattern = fieldNames.join('|');
    var halfTyped = new RegExp('^(' + fieldPattern + '):$');

    function toNumber(text) {
      if (text === null || text === '') return null;
      var n = parseFloat(text);
      return isNaN(n) ? null : n;
    }

    // Read Entries
    var records = Array.prototype.map.call(body.rows, function (row) {
      var rec = { row: row, text: {}, num: {}, rank: {}, tags: [] };
      var tagText = row.getAttribute('data-tags');
      rec.tags = tagText ? tagText.split(',') : [];
      columns.forEach(function (col) {
        var raw = row.getAttribute('data-v-' + col.key) || '';
        rec.text[col.key] = raw;
        if (col.type === 'number') rec.num[col.key] = toNumber(raw);
        if (col.type === 'rank') {
          var index = col.rankList.indexOf(raw);
          rec.rank[col.key] = index === -1 ? null : index + 1;
        }
      });
      return rec;
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

    // Number Search
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

    function compareText(a, b) {
      return a.localeCompare(b, undefined, { numeric: true });
    }

    function sortValue(rec) {
      var col = columnByKey[sortKey];
      if (col.type === 'number') return rec.num[sortKey];
      if (col.type === 'rank') return rec.rank[sortKey];
      return rec.text[sortKey] || null;
    }

    // Missing Tag Entry Sort
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
      var visible = records.filter(function (rec) { return matches(rec, terms); });
      visible.sort(compareRecords);

      var fragment = document.createDocumentFragment();
      visible.forEach(function (rec, index) {
        rec.row.classList.toggle('is-even', index % 2 === 1);
        fragment.appendChild(rec.row);
      });
      body.textContent = '';
      body.appendChild(fragment);

      count.textContent = 'Showing ' + visible.length + ' of ' + records.length + ' ' + (config.noun || 'entries');
      empty.hidden = visible.length !== 0;
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

      dialogFacts.textContent = '';
      for (var c = 1; c < row.cells.length; c++) {
        var cell = row.cells[c];
        var text = cell.textContent.trim();
        if (!text || text === '—') continue;
        var term = document.createElement('dt');
        term.textContent = cell.getAttribute('data-label');
        var definition = document.createElement('dd');
        definition.textContent = text;
        dialogFacts.appendChild(term);
        dialogFacts.appendChild(definition);
      }

      dialogTags.textContent = '';
      var chips = row.querySelectorAll('.tag-chip');
      Array.prototype.forEach.call(chips, function (chip) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'tag-chip';
        button.textContent = chip.textContent;
        button.addEventListener('click', function () {
          dialog.close();
          addTerm('tag', chip.getAttribute('data-tag'));
        });
        dialogTags.appendChild(button);
      });

      dialogBody.innerHTML = source ? source.innerHTML : '';
      dialog.showModal();
    }

    // Tag Filter
    body.addEventListener('click', function (event) {
      var chip = event.target.closest('.tag-chip');
      if (chip) {
        addTerm('tag', chip.getAttribute('data-tag'));
        return;
      }
      var row = event.target.closest('tr');
      if (row) openItem(row);
    });

    // Open Description
    body.addEventListener('keydown', function (event) {
      if ((event.key === 'Enter' || event.key === ' ') && event.target.tagName === 'TR') {
        event.preventDefault();
        openItem(event.target);
      }
    });

    // Toggle Sort
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

    dialog.querySelector('.st-dialog-close').addEventListener('click', function () {
      dialog.close();
    });

    //  Expand Click Area
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });

    search.addEventListener('input', render);

    render();
  }

  Array.prototype.forEach.call(document.querySelectorAll('.search-table'), init);
})();

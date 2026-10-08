(function () {
  var table = document.getElementById('item-table');
  if (!table) return;

  var body = table.tBodies[0];
  var search = document.getElementById('item-search');
  var count = document.getElementById('item-count');
  var empty = document.getElementById('item-empty');
  var dialog = document.getElementById('item-dialog');
  var dialogTitle = dialog.querySelector('.item-dialog-title');
  var dialogMeta = dialog.querySelector('.item-dialog-meta');
  var dialogTags = dialog.querySelector('.item-dialog-tags');
  var dialogBody = dialog.querySelector('.item-dialog-body');

  // Rarity Sort
  var RARITY_ORDER = {
    'common': 1,
    'uncommon': 2,
    'rare': 3,
    'very rare': 4,
    'legendary': 5,
    'artifact': 6
  };

  var sortKey = 'name';
  var sortDir = 1;

  function toNumber(text) {
    if (text === null || text === '') return null;
    var n = parseFloat(text);
    return isNaN(n) ? null : n;
  }

  // Read Values for Filter
  var records = Array.prototype.map.call(body.rows, function (row) {
    var rarity = row.getAttribute('data-rarity') || '';
    var tags = row.getAttribute('data-tags');
    return {
      row: row,
      name: row.getAttribute('data-name') || '',
      type: row.getAttribute('data-type') || '',
      rarity: rarity,
      rank: RARITY_ORDER[rarity] || null,
      cost: toNumber(row.getAttribute('data-cost')),
      weight: toNumber(row.getAttribute('data-weight')),
      tags: tags ? tags.split(',') : []
    };
  });

  // Translate Search into Results
  function parseQuery(text) {
    var terms = [];
    var pattern = /(-?)(?:(tag|type|rarity|name):)?(?:"([^"]*)"|(\S+))/gi;
    var match;
    while ((match = pattern.exec(text)) !== null) {
      var field = match[2] ? match[2].toLowerCase() : 'name';
      var value = (match[3] !== undefined ? match[3] : match[4]).toLowerCase();
      if (!match[2] && value.charAt(0) === '#') {
        field = 'tag';
        value = value.slice(1);
      }
      // Ignore Unfinished Searches
      if (!match[2] && (value === '-' || /^(tag|type|rarity|name):$/.test(value))) continue;
      if (value) terms.push({ negate: match[1] === '-', field: field, value: value });
    }
    return terms;
  }

  function matches(rec, terms) {
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      var hit;
      if (t.field === 'tag') {
        hit = rec.tags.some(function (tag) { return tag.indexOf(t.value) !== -1; });
      } else if (t.field === 'type') {
        hit = rec.type.indexOf(t.value) !== -1;
      } else if (t.field === 'rarity') {
        hit = rec.rarity === t.value;
      } else {
        hit = rec.name.indexOf(t.value) !== -1;
      }
      if (hit === t.negate) return false;
    }
    return true;
  }

  function compareText(a, b) {
    return a.localeCompare(b, undefined, { numeric: true });
  }

  function sortValue(rec) {
    if (sortKey === 'rarity') return rec.rank;
    if (sortKey === 'cost') return rec.cost;
    if (sortKey === 'weight') return rec.weight;
    if (sortKey === 'type') return rec.type || null;
    return rec.name;
  }

  // Sort Items with Missing Value
  function compareRecords(a, b) {
    var va = sortValue(a);
    var vb = sortValue(b);
    if (va === null && vb === null) return compareText(a.name, b.name);
    if (va === null) return 1;
    if (vb === null) return -1;
    var result = typeof va === 'number' ? va - vb : compareText(va, vb);
    if (result === 0) return compareText(a.name, b.name);
    return result * sortDir;
  }

  function updateHeaders() {
    var headers = table.tHead.querySelectorAll('th');
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

    count.textContent = 'Showing ' + visible.length + ' of ' + records.length;
    empty.hidden = visible.length !== 0;
    updateHeaders();
  }

  // Add Condition to Search
  function addTerm(field, value) {
    var token = field + ':' + (/\s/.test(value) ? '"' + value + '"' : value);
    if (search.value.toLowerCase().indexOf(token) !== -1) return;
    search.value = (search.value.trim() + ' ' + token).trim();
    render();
  }

  function openItem(row) {
    var id = row.getAttribute('data-id');
    var source = document.querySelector('.item-descriptions [data-for="' + id + '"]');

    dialogTitle.textContent = row.querySelector('.item-name').textContent;

    var parts = [];
    for (var c = 1; c <= 4; c++) {
      var text = row.cells[c].textContent.trim();
      if (text && text !== '—') parts.push(text);
    }
    dialogMeta.textContent = parts.join(' · ');

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

  // Clicking Entry
  body.addEventListener('click', function (event) {
    var chip = event.target.closest('.tag-chip');
    if (chip) {
      addTerm('tag', chip.getAttribute('data-tag'));
      return;
    }
    var row = event.target.closest('tr');
    if (row) openItem(row);
  });

  body.addEventListener('keydown', function (event) {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.tagName === 'TR') {
      event.preventDefault();
      openItem(event.target);
    }
  });

  // Toggle Sorting
  table.tHead.addEventListener('click', function (event) {
    var th = event.target.closest('th');
    if (!th) return;
    var key = th.getAttribute('data-key');
    if (key === sortKey) {
      sortDir = -sortDir;
    } else {
      sortKey = key;
      sortDir = 1;
    }
    render();
  });

  dialog.querySelector('.item-dialog-close').addEventListener('click', function () {
    dialog.close();
  });

  // Expand Clicking Range
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close();
  });

  search.addEventListener('input', render);

  render();
})();

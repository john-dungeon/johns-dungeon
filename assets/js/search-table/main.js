import { intOr, compareText } from './utils.js';
import { prepareColumns, prepareTags, readRecords, flagUnlisted } from './records.js';
import { createQueryParser, matchesQuery } from './query.js';
import { newFilters, matchesFilters, activeFilterCount, buildPanel } from './filters.js';
import { createDialog } from './dialog.js';
import { watchHash } from './deeplink.js';

function init(root) {
  if (root.dataset.ready) return;
  root.dataset.ready = 'true';

  const config = JSON.parse(root.dataset.config);
  const { columns, byKey, nameKey } = prepareColumns(config);
  const tags = prepareTags(config);

  const limits = {
    min: intOr(config.limit_min, 25),
    max: intOr(config.limit_max, 500),
    step: intOr(config.limit_step, 25)
  };

  const state = {
    filters: newFilters(),
    limit: Math.min(limits.max, Math.max(limits.min, intOr(config.limit_default, 100))),
    sortKey: byKey[config.default_sort] ? config.default_sort : nameKey,
    sortDir: config.default_dir === 'desc' ? -1 : 1
  };

  const table = root.querySelector('.st-table');
  const body = table.tBodies[0];
  const search = root.querySelector('.st-search');
  const count = root.querySelector('.st-count');
  const empty = root.querySelector('.st-empty');
  const filterToggle = root.querySelector('.st-filter-toggle');
  const filterPanel = root.querySelector('.st-filter-panel');
  const openItem = createDialog(root, tags);

  const records = readRecords(body, columns);
  flagUnlisted(records, columns);
  const parseQuery = createQueryParser(columns, nameKey);

  function compareRecords(a, b) {
    const ka = a.sort[state.sortKey];
    const kb = b.sort[state.sortKey];
    const tie = compareText(a.text[nameKey], b.text[nameKey]);
    if (ka === null && kb === null) return tie;
    if (ka === null) return 1;
    if (kb === null) return -1;
    const result = ka.group - kb.group
      || (ka.amount || 0) - (kb.amount || 0)
      || compareText(ka.text, kb.text);
    return result === 0 ? tie : result * state.sortDir;
  }

  function updateHeaders() {
    table.tHead.querySelectorAll('th[data-key]').forEach(th => {
      let ariaSort = 'none';
      if (th.dataset.key === state.sortKey) {
        ariaSort = state.sortDir === 1 ? 'ascending' : 'descending';
      }
      th.setAttribute('aria-sort', ariaSort);
    });
  }

  function render() {
    const terms = parseQuery(search.value);
    const matched = records
      .filter(rec => matchesQuery(rec, terms, byKey) && matchesFilters(rec, state.filters))
      .sort(compareRecords);
    const shown = matched.slice(0, state.limit);

    const fragment = document.createDocumentFragment();
    shown.forEach(rec => fragment.appendChild(rec.row));
    body.textContent = '';
    body.appendChild(fragment);

    let text = `Showing ${shown.length} of ${matched.length} ${config.noun || 'entries'}`;
    if (matched.length !== records.length) text += ` (Filtered from ${records.length})`;
    if (shown.length < matched.length && state.limit < limits.max) {
      text += ' \u00b7 raise the limit under Filter to see more';
    }
    count.textContent = text;
    empty.hidden = matched.length !== 0;

    const active = activeFilterCount(state.filters);
    filterToggle.textContent = 'Filter' + (active ? ` (${active})` : '');
    updateHeaders();
  }

  body.addEventListener('click', event => {
    const row = event.target.closest('tr');
    if (row) openItem(row);
  });

  body.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.tagName === 'TR') {
      event.preventDefault();
      openItem(event.target);
    }
  });

  table.tHead.addEventListener('click', event => {
    const th = event.target.closest('th');
    const key = th && th.dataset.key;
    if (!key) return;
    if (key === state.sortKey) {
      state.sortDir = -state.sortDir;
    } else {
      state.sortKey = key;
      state.sortDir = 1;
    }
    render();
  });

  filterToggle.addEventListener('click', () => {
    const opening = filterPanel.hidden;
    filterPanel.hidden = !opening;
    filterToggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
  });

  search.addEventListener('input', render);

  buildPanel(filterPanel, { columns, tags, state, limits, onChange: render });
  render();
  watchHash(root, records, openItem);
}

document.querySelectorAll('.search-table').forEach(init);

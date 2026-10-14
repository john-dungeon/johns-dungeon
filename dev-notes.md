---
title: Developer Notes
nav_exclude: true
search_exclude: true
---
{% raw %}
# Developer Notes

### Locations
- `_config.yml` – site settings (theme is pinned: change the version on purpose, not by accident).
- `_data/themes.yml` – themes in the switcher menu. `_data/tables/` – one settings file per search table.
- `_sass/color_schemes/` – one file per theme. `_sass/custom/` – all custom CSS, split by topic and loaded in order by `custom.scss`.
- `assets/css/just-the-docs-NAME.scss` – one tiny file per theme (Jekyll needs each one).
- `_includes/` – reusable HTML: `catalog.html` (link tables), `search-table.html` (search tables, with helpers in `table/`), `404.html` (the "not constructed yet" message), plus head/footer pieces.
- `assets/js/` – `theme-switcher.js`, `tooltips.js`, and the `search-table/` folder (one file per job; `main.js` is the entry point).

### Adding Pages
Create a `.md` file in the right folder with front matter: `title` and `parent` (exact title of the section page). For subclasses, use `parent` for the class and `grand_parent` for the section page, and optionally `tagline` and `summary` (used for the hover tooltip in the grid).

- Unfinished page: body is `{% include 404.html %}`, and add `search_exclude: true`. Delete both when the page is ready.
- Backlinks automatically appear in the footer. They point to `grand_parent`, else `parent`, else Home. Don't write one by hand.
- New class categories (for subclasses): create `subclasses/CLASS.md` with `title`, `parent: Subclasses`, `has_children: true`, `redirect_url: /subclasses/`, `search_exclude: true`, and no body.

### Adding Themes
1. Add `_sass/color_schemes/NAME.scss` (copy an existing one).
2. Copy `assets/css/just-the-docs-dark.scss` to `just-the-docs-NAME.scss` and change `color_scheme="NAME"`.
3. Add an entry to `_data/themes.yml`.

Optional overrides in a scheme: `$theme-body-font`, `$theme-heading-font`, `$stripe-odd-color`, `$stripe-even-color`, `$marker-colors`, `$unlisted-color`.

### Link Tables (`catalog.html`)
`{% include catalog.html parent="Items" %}` lists every page whose `parent` is that title, sorted by title. The column count is picked automatically: the count (at least 3) that leaves the fewest empty cells, with ties going to the smaller count. With one group of links, this means the smallest divisor of the link count that is at least 3 (4 links → 4 columns, 12 → 3), so there are no empty cells. With `group_by`, each group starts on a new row under its own heading, all groups share one table, and the count is chosen to minimize empty cells across all groups together. The count never goes above `max_columns` (default 5), so a page with, say, 7 links gets 4 columns with one empty cell instead of one very wide row. Options: `group_by="front_matter_key"`, `columns=3` (the minimum column count), `grand_parent="Title"` (use instead of `parent`). Wrap the include in `{::nomarkdown}` ... `{:/nomarkdown}`.

### Tooltips
Any element with `data-tooltip="text"` gets a hover/focus bubble. In the text, `*italic*`, `**bold**`, and `\` (a line break) work. Link tables build theirs from `tagline` + `summary`.

### Search Tables (`search-table.html`)
Put `{% include search-table.html data="items" %}` (inside `{::nomarkdown}`) on a page. A table named `items` uses three files:
- `_data/tables/items.yml` – settings and columns (below).
- `_includes/entries/items.md` – the entries. This is the file you edit.
- `_includes/table/templates/<template>.md` – how an entry's fields become popup text.

**Entry format:** entries are separated by a line that is exactly `---` (never use `---` inside a description; use `***`). One `key: value` per line. A line that starts with a field name (lowercase letters, digits, underscores) and `: ` starts a field; every other line continues the field above it. Lists are comma-separated. Write cost and weight as plain numbers. Species traits are indented list items (see `entries/species.md`). Species entry order: name, article (optional), description, age, type, size, speed, settings, tags, traits.

**Extra entry fields:** `tags` (comma-separated, shown in the popup). `condition` (spells) is added to the end of the casting time exactly as written, so begin it with its own punctuation, like `condition: , which you take when you are hit by an attack roll`. `KEY_options` (e.g. `rarity_options`) lists other values an entry counts as for search and filters. Excluding hides the entry only if all of its values are excluded. `note_KEY` fields are used by the item template.

**Table settings (`_data/tables/NAME.yml`):**
- `template` – popup layout file in `_includes/table/templates/` (required).
- `noun` – word used in "Showing 5 of 20 items".
- `default_sort` (column key; default is the first column) and `default_dir` (`asc` or `desc`; default `asc`).
- `placeholder` – search box hint text.
- `tags` – the tags the Filter panel offers, in the order shown (for example `tags: [Magic Item, Consumable]`), even if no entry uses them yet. A tag an entry uses that isn't listed appears in red in its popup. `tags: false` hides tags in the Filter panel and popup.
- `limit_default` (100), `limit_min` (25), `limit_max` (500), `limit_step` (25).
- `marker` – colored symbol after names: `symbol`, `tag` (only entries with this tag; leave out for all), `color_by` (entry field whose value picks the color from `$marker-colors`), `label` (hover text prefix).
- `columns` – the list below. The first column is always the name.

**Column options:** `key` (matches the field in entries), `label`, `blank_as` (blank entries count as this value in search, filters, and sorting; the cell shows its `symbols` entry if it has one, otherwise "—"), `type` (`text` default, `number`, `list`, `rank`, or `measure`), `order` (the categories for this column's Filter buttons, in the order shown, even if no entry uses them yet; rank, number, and measure columns also sort by it; a cell value that isn't listed turns red, unless a number or measure column can read it as an amount; leave it out and the column gets no buttons and nothing is flagged; in a rank, number, or measure column a quoted `"..."` marks where amounts go: names before it sort first in listed order, names after it sort last alphabetically, and without it amounts come after all names), `units` (measure columns: unit word → size in a base unit, like `{foot: 1, feet: 1, mile: 5280}`; a plural ending in "s" is matched automatically), `note` (adds an entry field to the table cell: `field` is the entry key, `format` is the added text with `%s` standing for the value (default ` (%s)`), `show_if` shows the note only when the entry's value equals it, for true/false fields like `ritual`, and `sort: true` also sorts by the note's value when the entry has one), `format: money` (number columns: cells display as GP/SP/CP and the Filter heading says GP; write the value as a decimal up to hundredths), `prefix` / `suffix` (other numbers), `plain: true` (list cells hide "(notes)"), `symbols` (value → icon), `labels` (value → friendly text), `in_table: false` (searchable but hidden), `filter: false` (skip its Filter group; numbers get a range, columns with `order` get buttons), `sortable: false`, `match: exact` (search must match the whole value; default for `rank`).

**Search box:** plain words search names. `field:value` searches a column, `"quoted phrase"` keeps words together, `-word` excludes, `#tag` or `tag:word` searches tags. Numbers accept `cost:>=100` or `weight:1-5`.

**Adding a new column or field:** add the key to the entry, add a column in the `.yml` file, and (if it should appear in the popup) use it in the template.

### Other Notes
- `has_toc: false` is set for every page in `_config.yml`, so don't repeat it in front matter.
- Colors and fonts come from the color-scheme variables, never hard-coded in `_sass/custom/`.
- GitHub Pages may compile Sass with an older compiler. Avoid `min()`/`max()` with mixed units, `@use`, and `math.div`.
- Variables made inside an `_includes` file are shared with the page that called it. Give every include its own prefix (`mk_`, `cl_`, `pe_`...).
- A normal `.md` page runs any Liquid it contains, even inside backticks. Wrap documentation examples in raw tags.
- Before deleting a CSS class, search the whole repo for its name (GitHub's search box works).
{% endraw %}

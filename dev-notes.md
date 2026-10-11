# Developer Notes

### Locations
- `_config.yml` – site settings (theme is pinned: change the version on purpose, not by accident).
- `_data/themes.yml` – list of themes in the theme-switcher menu.
- `_sass/color_schemes/` – one file per theme. `_sass/custom/` – all custom CSS, split by topic and loaded in order by `custom.scss`.
- `_includes/` – reusable HTML: `catalog.html` (link grids), `search-table.html` (searchable tables), plus head/footer pieces.
- `assets/js/` – `theme-switcher.js`, `tooltips.js`, `search-table.js`.

### Adding Pages
Create a `.md` file in the right folder with front matter: `title`, `parent` (exact title of the section page). For subclasses also add `class_name`, and optionally `tagline` and `summary` (used for the hover tooltip in the grid).

### Adding Themes
1. Add `_sass/color_schemes/NAME.scss` (copy an existing one).
2. Copy `assets/css/just-the-docs-dark.scss` to `just-the-docs-NAME.scss` and change `color_scheme="NAME"`.
3. Add an entry to `_data/themes.yml`.

Optional overrides in a scheme: `$theme-body-font`, `$theme-heading-font`, `$stripe-color`, `$marker-colors`.

### Link Tables (`catalog.html`)
`{% include catalog.html parent="Items" %}` — options: `group_by="front_matter_key"`, `columns=3`. Wrap the include in `{::nomarkdown}` ... `{:/nomarkdown}`.

### Search Tables (`search-table.html`)
Put `{% include search-table.html data="items/item-list.md" %}` (inside `{::nomarkdown}`) on a page. The data file has front matter `table:` (settings) and `entries:` (the rows).

`table:` settings
- `noun` – word used in "Showing 5 of 20 items".
- `placeholder` – search box hint.
- `default_sort` / `default_dir` – column key and `asc`/`desc`.
- `popup_facts: false` – hide the column list at the top of the popup.
- `tags: false` – turn off tags (filter and popup).
- `limit_min`, `limit_max`, `limit_step`, `limit_default` – the "Results shown" slider (defaults 25 / 500 / 25 / 100).
- `marker` – the ✦ symbol: `symbol`, `tag` (only entries with this tag get it), `color_by` (column that picks the color), `label`.

Each item in `columns:` (the first column is always the name)
- `key`, `label` – required.
- `type` – `text` (default), `list`, `number`, or `rank` (with `order: [...]` lowest to highest).
- `prefix`, `suffix` – shown around numbers.
- `symbols` – map of value → symbol, e.g. `"required": "☒"`.
- `in_table: false` – keep out of the table, but still searchable and in the popup.
- `sortable: false` – header isn't clickable.
- `filter: true/false` – force or hide the filter-panel group (otherwise automatic).
- `match: exact` – exact matching in search (default for `rank`).

Each entry has a value for every column `key`, plus `tags: [...]` and `description:` (markdown, shown in the popup). `<key>_options: [...]` lists extra values an entry can take, e.g. `rarity_options` for potions with several potencies.

Search box syntax: plain words search names. `column:value` searches a column (`rarity:rare`). `tag:word` or `#word` searches tags. `-term` excludes. Quotes keep phrases together. Numbers accept `>=5`, `<10`, or ranges like `10-50` (`cost:10-50`).

### Other Notes
- Colors and fonts come from the color-scheme variables, never hard-coded in `_sass/custom/`.
- Before deleting a CSS class, search the whole repo for its name.

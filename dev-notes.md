---
title: Developer Notes
nav_exclude: true
search_exclude: true
---

# Developer Notes

### Locations
- `_config.yml` – site settings (theme is pinned: change the version on purpose, not by accident).
- `_data/themes.yml` – list of themes in the theme-switcher menu.
- `_sass/color_schemes/` – one file per theme. `_sass/custom/` – all custom CSS, split by topic and loaded in order by `custom.scss`.
- `_includes/` – reusable HTML: `catalog.html` (link tables), `search-table.html` (search tables), `404.html` (the "not constructed yet" message), plus head/footer pieces.
- `assets/js/` – `theme-switcher.js`, `tooltips.js`, and the `search-table/` folder (one file per job; `main.js` is the entry point).

### Adding Pages
Create a `.md` file in the right folder with front matter: `title`, `parent` (exact title of the section page). For subclasses, use `parent` for the class and `grand_parent` for the section page, and optionally `tagline` and `summary` (used for the hover tooltip in the grid). For an unfinished page, put `{% include 404.html %}` as the body and add `search_exclude: true`; delete both when the page is ready.

### Adding Themes
1. Add `_sass/color_schemes/NAME.scss` (copy an existing one).
2. Copy `assets/css/just-the-docs-dark.scss` to `just-the-docs-NAME.scss` and change `color_scheme="NAME"`.
3. Add an entry to `_data/themes.yml`.

Optional overrides in a scheme: `$theme-body-font`, `$theme-heading-font`, `$stripe-color`, `$marker-colors`.

### Link Tables (`catalog.html`)
`{% include catalog.html parent="Items" %}` lists every page whose `parent` is that title, sorted by title. Options: `group_by="front_matter_key"`, `columns=3`. Wrap the include in `{::nomarkdown}` ... `{:/nomarkdown}`.

### Search Tables (`search-table.html`)
Put `{% include search-table.html data="items" %}` (inside `{::nomarkdown}`) on a page. A table named `items` uses three files:
- `_data/tables/items.yml` – settings and columns (below). `template:` names the popup layout.
- `_includes/entries/items.md` – the entries. This is the file you edit. Separate entries with a line that is exactly `---` (never use `---` inside a description; use `***`).
- `_includes/table/templates/<template>.md` – how an entry's fields become popup text.
Helpers are in `_includes/table/`.

**Entry format:** one `key: value` per line. A line that starts with a lowercase word and `: ` starts a field; every other line continues the field above it. Lists are comma-separated. Write cost and weight as plain numbers. Species traits are indented list items (see `entries/species.md`).

**Adding a new column or field:** add the key to the entry, add a column in the `.yml` file, and (if it should appear in the popup) use it in the template.

(Keep the existing `table:` settings and column-option lists here, minus the old `entries:` paragraph, and add: `template`, and the column options `labels` (value → friendly label) and `plain` (hide "(notes)" in list cells).)

### Other Notes
- `has_toc: false` is set for every page in `_config.yml`, so don't repeat it in front matter.
- Colors and fonts come from the color-scheme variables, never hard-coded in `_sass/custom/`.
- Before deleting a CSS class, search the whole repo for its name.

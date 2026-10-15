---
title: Developer Notes
nav_exclude: true
search_exclude: true
---
{% raw %}
# Developer Notes

## 1. Locations

**Site Settings**
- `_config.yml` – site settings. The theme version is pinned: change it on purpose, never by accident.
- `_data/themes.yml` – themes in the switcher menu.
- `_data/tables/` – one settings file per search table.

**Styling**
- `_sass/color_schemes/` – one file per theme (colors, and optionally fonts).
- `assets/css/just-the-docs-NAME.scss` – one tiny file per theme (Jekyll needs each one).
- `_sass/custom/` – all custom CSS, loaded in order by `custom.scss`:
  - `_helpers` – shared variables and mixins (loaded first).
  - `_theme` – fonts and the theme switcher button.
  - `_base` – links, scrollbar, and the `.indent` class.
  - `_tables` – flat, striped tables.
  - `_search-table` – everything for search tables.
  - `_tooltip` – the hover bubble.

**Reusable HTML (`_includes/`)**
- `catalog.html` – link tables.
- `search-table.html` – search tables. Its helpers are in `table/` and the popup layouts are in `table/templates/`.
- `backlink.html` – the automatic "Back to..." link in the footer.
- `404.html` – the "not constructed yet" message.
- `head_custom.html`, `footer_custom.html`, `nav_footer_custom.html` – theme hook points.

**Scripts (`assets/js/`)**
- `theme-switcher.js` and `tooltips.js`.
- `search-table/` – one file per job. `main.js` is the entry point.

**Content Folders**
- `items/`, `species/`, `spells/`, `rules/`, `settings/`, `subclasses/`. Each has an `index.md`.
- Items, species, and spells also have an `_entries.md` holding their table entries.

## 2. Additions

### Add a Page
Create a `.md` file in the right folder with front matter: `title` and `parent` (the exact title of the section page). For subclasses, use `parent` for the class and `grand_parent: Subclasses`. Optional: `tagline` and `summary` (used for the hover tooltip in link tables).

- Unfinished page: the body is `{% include 404.html %}`.
- Back links are automatic. They point to `grand_parent`, else `parent`, else Home. Never write one by hand.
- `has_toc: false` is already the default for every page, so don't repeat it.

### Add a Class (for Subclasses)
Create `subclasses/CLASS.md` with `title`, `parent: Subclasses`, `has_children: true`, `redirect_url: /subclasses/`, `search_exclude: true`, and no body. It shows in the sidebar as a stub that redirects to the Subclasses page.

### Add a Theme
1. Add `_sass/color_schemes/NAME.scss` (copy an existing one).
2. Copy `assets/css/just-the-docs-dark.scss` to `just-the-docs-NAME.scss` and change `color_scheme="NAME"`.
3. Add an entry to `_data/themes.yml`.

Optional overrides in a color scheme: `$theme-body-font`, `$theme-heading-font`, `$stripe-odd-color`, `$stripe-even-color`, `$marker-colors`, `$unlisted-color`.

### Add a Search Table Entry
Edit the table's `_entries.md` (see section 4 for the format).

### Add a Column or Field
Add the key to the entry, add a column in the table's `.yml` file, and (if it should appear in the popup) use it in the template.

## 3. Link Tables and Tooltips

### Link Tables (`catalog.html`)
`{% include catalog.html parent="Items" %}` lists every page whose `parent` is that title, sorted by title. Wrap the include in `{::nomarkdown}` ... `{:/nomarkdown}`.

**Options**
- `grand_parent="Title"` – use instead of `parent`.
- `group_by="front_matter_key"` – each group starts on a new row under its own heading, and all groups share one table.
- `columns=3` – the minimum column count.
- `max_columns=5` – the maximum column count.

The column count is picked automatically: the count (at least 3) that leaves the fewest empty cells, with ties going to the smaller count.
- One group: this is the smallest divisor of the link count that is at least 3 (4 links gives 4 columns, 12 gives 3), so there are no empty cells.
- With `group_by`: the count minimizes empty cells across all groups together.
- The count never goes above `max_columns`, so 7 links gives 4 columns with one empty cell instead of one very wide row.

### Tooltips
Any element with `data-tooltip="text"` gets a hover/focus bubble. In the text, `*italic*`, `**bold**`, and `\` (a line break) work. Link tables build theirs from `tagline` + `summary`.

## 4. Search Tables

Put `{% include search-table.html data="items" %}` (inside `{::nomarkdown}`) on a page. A table named `items` uses three files:
- `_data/tables/items.yml` – settings and columns (below).
- `items/_entries.md` – the entries. This is the file you edit.
- `_includes/table/templates/<template>.md` – how an entry's fields become popup text.

### Entry Format
- Entries are separated by a line that is exactly `---`. Never use `---` inside a description; use `***`.
- One `key: value` per line. A line starting with a field name (lowercase letters, digits, underscores) and `: ` starts a field. Every other line continues the field above it.
- Lists are comma-separated. Write cost and weight as plain numbers.
- Species traits are indented list items (see `species/_entries.md`). Species entry order: name, article (optional), description, age, type, size, speed, settings, tags, traits.

### Extra Entry Fields
- `tags` – comma-separated, shown in the popup.
- `condition` (spells) – added to the end of the casting time exactly as written, so begin it with its own punctuation, like `condition: , which you take when you are hit by an attack roll`.
- `options_KEY` (e.g. `options_rarity`) – lists other values the entry counts as for search and filters. Excluding hides the entry only if all of its values are excluded.
- On number columns, `options_cost` and `options_weight` list amounts or ranges instead, like `options_cost: 50, 200, 3-36`. Use plain numbers, no thousands commas. A slider or Min/Max filter keeps the entry if any listed amount or range overlaps it.
- `note_KEY` fields are used by the item template.
- `prefix_type` (items) – placed before the type in the popup's first line, like `prefix_type: Simple Melee` with `type: Weapon` showing "Simple Melee Weapon". It isn't shown in the table's Type column, so filtering still uses the plain type.

### Table Settings (`_data/tables/NAME.yml`)
- `template` – popup layout file in `_includes/table/templates/` (required).
- `noun` – word used in "Showing 5 of 20 items".
- `default_sort` – column key (default: the first column).
- `default_dir` – `asc` or `desc` (default: `asc`).
- `placeholder` – search box hint text.
- `tags` – the tags the Filter panel offers, in the order shown, even if no entry uses them yet. A tag an entry uses that isn't listed appears in red in its popup. `tags: false` hides tags in the Filter panel and popup.
- `limit_default` (100), `limit_min` (25), `limit_max` (500), `limit_step` (25).
- `marker` – a colored symbol after names. Fields: `symbol`; `tag` (only entries with this tag; leave out for all); `color_by` (the entry field whose value picks the color from `$marker-colors`); `label` (hover text prefix).
- `auto_tags` – rules that add a tag automatically, like `- { tag: Concentration, field: duration, equals: Concentration }` (case doesn't matter). Add the tag to `tags` too so it gets a filter button.
- `columns` – the list below. The first column is always the name.

### Column Options

**Core**
- `key` – matches the field in entries.
- `label` – the heading.
- `type` – `text` (default), `number`, `list`, `rank`, or `measure`.
- `order` – the categories for this column's Filter buttons, in the order shown, even if no entry uses them yet.
  - Rank, number, and measure columns also sort by it.
  - A cell value that isn't listed turns red, unless a number or measure column can read it as an amount.
  - Leave `order` out and the column gets no buttons and nothing is flagged.
  - In rank, number, and measure columns, a quoted `"..."` marks where amounts go. Names before it sort first in listed order, names after it sort last alphabetically. Without it, amounts come after all names.
- `blank_as` – blank entries count as this value in search, filters, and sorting. The cell shows its `symbols` entry if it has one, otherwise "—".

**Display**
- `format: money` – number columns: cells display as GP/SP/CP and the Filter heading says GP. Write the value as a decimal up to hundredths.
- `prefix` / `suffix` – for other numbers.
- `zero_label` – number columns: an entry whose value is exactly `0` is shown and treated as this word (for example `Weightless`). The popup template needs the same rule written into it.
- `plain: true` – list cells hide "(notes)".
- `symbols` (value to icon) and `labels` (value to friendly text).
- `in_table: false` – searchable but hidden.
- `note` – adds an entry field to the table cell:
  - `field` is the entry key.
  - `format` is the added text, with `%s` standing for the value (default ` (%s)`).
  - `show_if` shows the note only when the entry's value equals it, for true/false fields like `ritual`.
  - `sort: true` also sorts by the note's value when the entry has one.

**Behavior**
- `sortable: false` – not clickable.
- `filter: false` – skip its Filter group. By default, numbers get a range and columns with `order` get buttons.
- `match: exact` – search must match the whole value (the default for `rank`).
- `units` – measure columns: unit word to size in a base unit, like `{foot: 1, feet: 1, mile: 5280}`. A plural ending in "s" is matched automatically.
- `slider` – number columns: `{ max, min_label, max_label }` turns the Min/Max boxes into a double-ended slider. Positions are `0` (min label, no lower limit), `1` to `max` (amounts), and `max+1` (max label, no upper limit). Entries whose text equals a label word (e.g. `Weightless`) count as 0 or infinity.
- `buckets` – replaces the `order`-based Filter buttons.
  - A plain word matches that exact value.
  - `{ label, up_to }` catches amounts up to that size (written like `10 minutes`, using the column's `units`).
  - `{ label }` with no `up_to` catches every larger amount.
  - List amount buckets from smallest to largest.
  - Bucketing uses the note's sort value when there is one (so Concentration spells are bucketed by their "up to" time).

### Search Box
- Plain words search names.
- `field:value` searches a column.
- `"quoted phrase"` keeps words together.
- `-word` excludes.
- `#tag` or `tag:word` searches tags.
- Numbers accept `cost:>=100` or `weight:1-5`.

## 5. Reminders
- **Liquid runs in every normal `.md` page**, even inside backticks. Wrap documentation examples in raw tags (like this page does).
- **Includes share variables with the page that calls them.** Give every include its own prefix (`mk_`, `cl_`, `pe_`, `jw_`, `sp_`...).
- **For Sass compatibility**, halve with `* 0.5`, not `/ 2` (slash division is deprecated in newer Sass). Avoid `@use` and `math.div`: the theme loads this folder with `@import`.
- **Colors and fonts come from the color-scheme variables**, never hard-coded in `_sass/custom/`.
- **Entry files are named `_entries.md`** so Jekyll doesn't publish them as raw pages. They're loaded with `include_relative`, so they must sit in the same folder as the page that shows the table.
- **Before deleting a CSS class**, search the whole repo for its name (GitHub's search box works).
{% endraw %}

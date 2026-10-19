---
title: Developer Notes
nav_exclude: true
search_exclude: true
---
{% raw %}
# Developer Notes

## 1. Project Map

### Settings and Data
- `_config.yml` – site settings. The theme version is pinned: change it on purpose, never by accident.
- `_data/themes.yml` – themes in the switcher menu.
- `_data/tables/` – one settings file per search table.
- `_data/challenge.yml` – Challenge Rating → XP and Proficiency Bonus (used by the monster template). Fractions are written as decimals (`0.5`).

### Styling
- `_sass/color_schemes/` – one file per theme (colors, and optionally fonts).
- `assets/css/just-the-docs-NAME.scss` – one tiny file per theme (Jekyll needs each one).
- `_sass/custom/` – all custom CSS, loaded in this order by `custom.scss` (import each file once):
  - `_helpers` – shared variables and mixins (loaded first), including the shared animation curve `$motion`.
  - `_theme` – fonts, the theme switcher button, and the theme cross-fade.
  - `_base` – links, scrollbar, the `.indent` class, and the animation speed `--motion-duration`.
  - `_tables` – flat, striped tables.
  - `_search-table` – everything for search tables.
  - `_statblock` – monster stat blocks. It also hides the popup's own title when the popup holds a stat block, because the stat block shows the name itself.
  - `_navbar-toggle` – the nav bar hide/show button and slide animation.
  - `_tooltip` – the hover bubble.
  - `_dropdown` – collapsible `<details>` sections.

### Reusable HTML (`_includes/`)
- `catalog.html` – link tables.
- `search-table.html` – search tables.
- `backlink.html` – the automatic "Back to..." link in the footer.
- `404.html` – the "not constructed yet" message.
- `head_custom.html`, `footer_custom.html`, `nav_footer_custom.html` – theme hook points.
- `table/` – helpers for `search-table.html`:
  - `parse-entry.html` – turns an entry's text into packed fields.
  - `field.html` – reads one field from the packed fields.
  - `value.html` – a cell's raw value (applies `zero_label` and list handling).
  - `cell.html` – builds a table cell (symbols, formats, notes, red "missing" cells).
  - `list.html` – cleans a comma-separated list. With `plain`, it removes "(notes)".
  - `join-words.html` – "A, B, or C" style joining, in the order written.
  - `named-list.html` – turns `- key: Name` / `description:` lists into bold-italic-titled paragraphs (species traits, monster traits and actions). Optional `row="class"` wraps each item in a `<div>` with that class.
  - `marker.html` – the symbols next to item names.
  - `money.html`, `weight.html`, `cr.html`, `signed.html` – display formats (`5 SP`, `1.2 oz.`, `1/2`, `+3` / `−1`).
  - `templates/` – popup layouts: `item.md`, `species.md`, `spell.md`, `monster.md`.

### Scripts (`assets/js/`)
- `theme-switcher.js`, `tooltips.js`, and `navbar-toggle.js` (remembers whether the navigation sidebar is hidden).
- `search-table/` – one file per job. `main.js` is the entry point.

### Content Folders
- `feats/`, `items/`, `monsters/`, `rules/`, `settings/`, `species/`, `spells/`, `subclasses/`. Each has an `index.md`.
- Feats, items, monsters, species, and spells also have an `_entries.md` holding their table entries.

## 2. Additions

### Add a Section (top-level aisle)
Create `NAME/index.md` with `title`, `parent: Home`, and `has_children: true`. Do not set `nav_order`: the sidebar sorts sections alphabetically (only Home has `nav_order: 1`, to stay first), and the Home page's link table picks the new section up automatically.

### Add a Page
Create a `.md` file in the right folder with front matter: `title` and `parent` (the exact title of the section page). For subclasses, use `parent` for the class and `grand_parent: Subclasses`. Optional: `tagline` and `summary` (used for the hover tooltip in link tables).

- Unfinished page: the body is `{% include 404.html %}`.
- Back links are automatic. They point to `grand_parent`, else `parent`, else Home. Never write one by hand.
- `has_toc: false` is already the default for every page, so don't repeat it.

### Add a Class (for Subclasses)
Create `subclasses/CLASS.md` with `title`, `parent: Subclasses`, `has_children: true`, `redirect_url: /subclasses/`, `search_exclude: true`, and no body. It shows in the navigation sidebar as a stub that redirects to the Subclasses page.

### Add a Theme
1. Add `_sass/color_schemes/NAME.scss` (copy an existing one).
2. Copy `assets/css/just-the-docs-dark.scss` to `just-the-docs-NAME.scss` and change `color_scheme="NAME"`.
3. Add an entry to `_data/themes.yml`.

Optional overrides in a color scheme: `$theme-body-font`, `$theme-heading-font`, `$stripe-odd-color`, `$stripe-even-color`, `$marker-colors`, `$unlisted-color`.

### Add a Search Table Entry
Edit the table's `_entries.md` (see section 4 for the format).

### Add a Column or Field
Add the key to the entry, add a column in the table's `.yml` file, and (if it should appear in the popup) use it in the template.

### Add a Setting (world)
Search the repo for an existing setting name (like `Solachia`) and add the new one to every `order` list that contains it.

### Add a Style File
Create `_sass/custom/_NAME.scss` and add one `@import "NAME";` line to `custom.scss`.

## 3. Link Tables, Tooltips, and Dropdowns

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

### Dropdown Text
Use raw HTML with Kramdown's `markdown` attributes so Markdown works inside:

```
<details markdown="1">
<summary markdown="span">**Title**</summary>

Body text
</details>
```

Keep a blank line after `</summary>` and before each `<details>`. Works on pages and in `_entries.md` descriptions.

## 4. Search Tables

Put `{% include search-table.html data="items" %}` (inside `{::nomarkdown}`) on a page. A table named `items` uses three files:
- `_data/tables/items.yml` – settings and columns (see "Table Settings" and "Column Options").
- `items/_entries.md` – the entries. This is the file you edit.
- `_includes/table/templates/<template>.md` – how an entry's fields become popup text.

### Entry Format
- Entries are separated by a line that is exactly `---`. Never use `---` inside a description; use `***`.
- One `key: value` per line. A line starting with a field name and `: ` starts a field. Field names are **all lowercase** (letters, digits, underscores): a capitalized name like `Resistances:` is not recognized and gets glued onto the field above it. Every other line continues the field above it.
- Lists are comma-separated. Write cost and weight as plain numbers.
- `tags` – comma-separated, shown in the popup.
- `options_KEY` (e.g. `options_rarity`) – lists other values the entry counts as for search and filters. Excluding hides the entry only if all of its values are excluded.
- On number columns, `options_cost` and `options_weight` list amounts or ranges instead, like `options_cost: 50, 200, 3-36`. Use plain numbers, no thousands commas. A slider or Min/Max filter keeps the entry if any listed amount or range overlaps it.

### Named Lists (traits, actions, and so on)
Fields such as species `traits` and monster `traits` / `actions` use indented list items. The first key's name is ignored (`trait_1`, `action_2`, anything); its value is the item's title.

```
actions:
- action_1: Multiattack
  description: The creature makes two Claw attacks.
- action_2: Claw
  description: *Melee Attack Roll:* +4, reach 5 ft. *Hit:* 6 (1d6 + 3) Slashing damage.

  A second paragraph can follow after a blank line.
```

Indent anything that starts with `- ` inside a description (like a bullet list) by two spaces, or it is read as a new item.

### Fields by Table

**Items** (`item.md`): `name`, `prefix_type`, `type`, `note_type`, `rarity`, `options_rarity`, `note_rarity`, `attunement`, `cost`, `options_cost`, `note_cost`, `weight`, `options_weight`, `note_weight`, `setting`, `note_setting`, `tags`, `description`.
- `prefix_type` is placed before the type in the popup's first line (`prefix_type: Simple Melee` with `type: Weapon` shows "Simple Melee Weapon"). It isn't shown in the table's Type column, so filtering still uses the plain type.
- `setting` is comma-separated. It auto-adds the Setting-Specific tag and appends the "can only be found in…" note to the popup. Never hand-write that note or tag.
- `note_setting` is an extra sentence added to the end of that note. Don't use `*` inside it, since the whole note is italic.

**Species** (`species.md`): `name`, `article` (optional), `description`, `age`, `type`, `size`, `speed`, `settings`, `tags`, `traits`. Several `type` values are joined with "and", several `size` values with "or", in the order written.

**Spells** (`spell.md`): `name`, `level` (`Cantrip` or 1–9), `school`, `classes`, `casting_time`, `condition`, `ritual` (`true`), `range`, `area`, `components` (`V, S, M`), `material`, `duration`, `concentration_max`, `tags`, `description`.
- `condition` is added to the end of the casting time exactly as written, so begin it with its own punctuation, like `condition: , which you take when you are hit by an attack roll`.

**Monsters** (`monster.md`): `name`, `size`, `type`, `alignment`, `ac`, `initiative`, `hp`, `speed`, `str`–`cha`, `saves`, `skills`, `resistances`, `vulnerabilities`, `immunities`, `gear`, `senses`, `languages`, `cr`, `settings`, `tags`, `flavor`, and the sections `traits`, `actions`, `bonus_actions`, `reactions`, `legendary_actions`.
- `size` and `type` can list several values. Sizes are joined with "or" and types with "and", in the order written.
- The scores `str`–`cha` give modifiers and saves automatically. `saves: Dex, Wis` adds the Proficiency Bonus to those saves.
- `cr` is a plain number, with fractions as decimals (`0.125`, `0.25`, `0.5`). The Proficiency Bonus and XP come from `_data/challenge.yml`. The search box doesn't understand `1/2`; search `cr:0.5`.
- `initiative` is optional and replaces the computed value, shown as written (like `+7 (17)`).
- `skills` through `languages` are free text. A line shows only if the entry has that field, in the order Skills, Resistances, Vulnerabilities, Immunities, Gear, Senses, Languages, then the CR line.
- Sections use the named-list format above. Each section can have an optional `KEY_intro` field (`traits_intro`, `actions_intro`, `bonus_actions_intro`, `reactions_intro`, `legendary_actions_intro`), shown as a plain paragraph between the section heading and its first row. Use it for text that applies to the whole section.
- `flavor` is optional: one paragraph of plain text, shown in italics as a blockquote at the bottom. Don't put `*` in it.

### Table Settings (`_data/tables/NAME.yml`)
- `template` – popup layout file in `_includes/table/templates/` (required).
- `noun` – word used in "Showing 5 of 20 items".
- `default_sort` – column key (default: the first column).
- `default_dir` – `asc` or `desc` (default: `asc`).
- `placeholder` – search box hint text.
- `tags` – the tags the Filter panel offers, in the order shown, even if no entry uses them yet. A tag an entry uses that isn't listed appears in red in its popup. `tags: false` hides tags in the Filter panel and popup.
- `limit_default` (100), `limit_min` (25), `limit_max` (500), `limit_step` (25).
- `markers` – a list of markers, each with `symbol`, `tag`, `color_by` (the entry field whose value picks the color from `$marker-colors`), and `label` (hover text prefix).
- `auto_tags` – rules that add a tag automatically, like `- { tag: Concentration, field: duration, equals: Concentration }` (case doesn't matter). Add the tag to `tags` too so it gets a filter button. Leave out `equals` to fire whenever the field has any value.
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
  - In rank, number, and measure columns, a quoted `"..."` marks where amounts go. Names before it sort first in listed order, names after it sort last in listed order. Without it, amounts come after all names.
- `blank_as` – blank entries count as this value in search, filters, and sorting. The cell shows its `symbols` entry if it has one, otherwise "—". A blank cell in a column without `blank_as` (and not `in_table: false`) is highlighted red as a missing value.

**Display**
- `format: cr` – number columns: `0.5` displays as `1/2` (display only).
- `format: money` – number columns: cells display as GP/SP/CP and the Filter heading says GP. Write the value as a decimal. Digits past the hundredths show as a decimal amount of CP (`0.002` shows `0.2 CP`).
- `format: weight` – number columns: weights of 0.1 or less display in ounces, rounded up to the hundredth (`0.075` shows `1.2 oz.`); others in lb., rounded up to the tenth (`0.75` shows `0.8 lb.`). Display only, so sorting and filters use the exact number.
- `prefix` / `suffix` – for other numbers.
- `zero_label` – number columns: an entry whose value is exactly `0` is shown and treated as this word (for example `Weightless`). The popup template needs the same rule written into it.
- `plain: true` – list cells hide "(notes)".
- `symbols` (value to icon) and `labels` (value to friendly text).
- `in_table: false` – searchable and filterable but hidden from the table.
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
- **Includes share variables with the page that calls them.** Give every include its own prefix (`mk_`, `cl_`, `pe_`, `jw_`, `ni_`, `sg_`, `sp_`, `sps_`, `ms_`...).
- **Include parameters must be plain values or dotted names** (`key=col.key`). Brackets like `list[0]` break the include tag, so assign the value to a variable first.
- **Line breaks in stat blocks use `<br>`.** A single trailing `\` printed literally there. If a popup elsewhere shows a stray `\`, use two backslashes (`\\`) or `<br>`.
- **For Sass compatibility**, halve with `* 0.5`, not `/ 2` (slash division is deprecated in newer Sass). Avoid `@use` and `math.div`: the theme loads this folder with `@import`.
- **Colors and fonts come from the color-scheme variables**, never hard-coded in `_sass/custom/`.
- **Entry files are named `_entries.md`** so Jekyll doesn't publish them as raw pages. They're loaded with `include_relative`, so they must sit in the same folder as the page that shows the table.
- **Before deleting a CSS class**, search the whole repo for its name (GitHub's search box works).
- **Just the Docs** sets heading (`h1`–`h6`) and table (`th`, `td`) font sizes with `!important`. A custom `font-size` on those elements only works if it is `!important` too.
{% endraw %}

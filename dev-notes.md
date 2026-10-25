# Developer Notes

## 0. Design Rules

These are the rules the overhaul followed. New work should follow them too.

- **One place per setting.** Wording lives in `strings.yml`, themes and fonts in `themes.yml`, shared lists in `lists.yml`, sound in `audio.yml`, look and feel in `_settings.scss`, table behavior in `_data/tables/`.
- **Universal rules over local fixes.** All text goes through `text.html`. All tooltips go through `tooltip.html`. All quotes go through `quote.html`. All numbers are shown by `format.html`. Don't reimplement these in one spot.
- **Logic is separate from the page.** The search table's `columns`, `records`, `query`, and `filters` scripts never touch the page. Only `panel`, `dialog`, and `main` do.
- **Announce, don't call.** Scripts that don't depend on each other talk through events on `document` (see section 4b), not by calling each other.
- **Delete before adding.** A new feature should first look for an existing rule to extend.

## 1. Project Map

### Settings and Data
- `_config.yml` – site settings.
  - The theme version is pinned (`remote_theme: just-the-docs/just-the-docs@v0.12.0`). Change it on purpose, never by accident.
  - `color_scheme` is the theme first-time visitors see. It must match an `id` in `themes.yml`.
  - `exclude` keeps `dev-notes.md`, `README.md`, and `assets/PERSONAL-NOTES.md` off the website. The files stay in the repository, which is public.
- `_data/strings.yml` – every piece of site wording that isn't page content.
- `_data/themes.yml` – the themes in the switcher menu, and each theme's fonts, background image, cursor, sound set, and music.
- `_data/lists.yml` – lists shared by several search table columns (worlds, creature types, sizes).
- `_data/audio.yml` – sound defaults, volumes, and the sound effect sets.
- `_data/text_size.yml` – the lowest size, highest size, and step of the text size buttons.
- `_data/challenge.yml` – Challenge Rating to XP and Proficiency Bonus (used by the monster template). Fractions are decimals (`0.5`).
- `_data/tables/` – one settings file per search table.

### Styling
- `_sass/color_schemes/` – one file per theme (colors only). Just the Docs' own `dark` and `light` need no file here.
- `assets/css/just-the-docs-ID.scss` – one 3-line stub per theme. Jekyll needs each one as a separate file. `just-the-docs-default.scss` is the stylesheet every page loads first. It builds the default theme (`color_scheme` in `_config.yml`), so never delete it.
- `_sass/custom/` – all custom CSS, loaded in this order by `custom.scss` (import each file once):
  - `_settings` – every adjustable visual value, each with `!default`.
  - `_helpers` – derived variables and mixins (loaded second).
  - `_theme` – fonts, heading weight, the theme cross-fade.
  - `_base` – links, scrollbar, the `.indent` and `.italic` classes, the animation speed variable.
  - `_tables` – flat, striped tables.
  - `_search-table` – everything for search tables, including the popup.
  - `_statblock` – the monster popup's inner parts and width.
  - `_navbar-toggle` – the sidebar hide and show button.
  - `_tooltip` – the hover bubble.
  - `_dropdown` – collapsible `<details>` sections.
  - `_dock` – the Sound, Size, and Theme buttons and their menus.
  - `_background` – the page background image, its parallax movement, and the see-through panels.
  - `_cursor` – the custom mouse cursor.
- `assets/fonts/` – the font files named in `themes.yml`.
- `assets/images/` – background images (`dungeon-bg.webp`, `parchment-bg.webp`). `assets/images/cursors/` – cursor images.
- `assets/audio/` – sound effects (one folder per set) and music.

### Layout and Reusable HTML
- `_layouts/wiki.html` – the page layout. See section 2.
- `_includes/text.html` – the universal text formatter. See section 3.
- `_includes/quote.html` – an italic blockquote. `tooltip.html` – a `data-tooltip` attribute.
- `_includes/catalog.html` – link tables. `search-table.html` – search tables.
- `_includes/backlink.html` – the automatic "Back to..." link in the footer.
- `_includes/head_custom.html`, `footer_custom.html`, `nav_footer_custom.html` – Just the Docs hook points. `head_custom` loads every script and hands data to them. `footer_custom` holds the "unfinished" quote, the back link, and the dock.
- `_includes/theme.scss.liquid` – builds one theme's stylesheet (fonts, background, cursor, font rules, color scheme).
- `_includes/table/` – helpers for `search-table.html`:
  - `parse-entry.html` – turns an entry's text into packed fields.
  - `field.html` – reads one field from the packed fields.
  - `value.html` – a cell's raw value (applies `zero_label` and list cleanup).
  - `format.html` – shows a number: `money` (`5 SP`), `weight` (`1.2 oz.`), `cr` (`1/2`), `signed` (`+3`, `−1`), or a prefix and suffix.
  - `cell.html` – builds a table cell (symbols, formats, notes, red “missing” cells). List cells wrap each item in a `<span class="st-item">`.
  - `list.html` – cleans a comma-separated list. With `plain`, it removes "(notes)".
  - `join-words.html` – "A, B, or C" style joining, in the order written.
  - `named-list.html` – turns `- key: Name` and `description:` lists into bold-italic titled paragraphs. Optional `row="class"` wraps each item in a `<div>` with that class.
  - `tags.html` – an entry's tags, including the ones `auto_tags` adds.
  - `marker.html` – the symbols next to item names.
  - `templates/` – popup layouts: `item.md`, `species.md`, `spell.md`, `monster.md`, `feat.md`.

### Scripts (`assets/js/`)
- `theme-switcher.js` – remembers the chosen theme, swaps its stylesheet, preloads that theme's fonts, sets `<html data-theme>`, and announces `themechange`.
- `text-size.js` – the saved text size, applied early so the page doesn't flash, and the Size buttons.
- `navbar-toggle.js` – remembers whether the sidebar is hidden. `tooltips.js` – shows the bubble for any `data-tooltip`.
- `site/` – the visual effects. Modules started by `site/main.js`:
  - `shared.js` – small helpers used by the others.
  - `dock.js` – opens and closes the dock's menus.
  - `parallax.js` – moves the background with the mouse.
  - `audio.js` – sound effects, music, and the Sound menu.
- `search-table/` – see section 7.

### Content Folders
- `feats/`, `items/`, `monsters/`, `rules/`, `settings/`, `species/`, `spells/`, `subclasses/`. Each has an `index.md`.
- Feats, items, monsters, species, and spells also have an `_entries.md` holding their table entries.

## 1b. Customizing

| To change | Edit |
|---|---|
| Any site wording (footer text, button labels, messages, table wording) | `_data/strings.yml` |
| Which themes exist, their fonts, background, cursor, sounds, music | `_data/themes.yml` |
| Worlds, creature types, sizes | `_data/lists.yml` |
| Sound defaults, volumes, which file plays for which event | `_data/audio.yml` |
| Text size limits and step | `_data/text_size.yml` |
| Animation speed, popup widths, tooltip width, rarity colors, heading weight, popup title size | `_sass/custom/_settings.scss` |
| Panel see-through level, parallax strength and delay | `_sass/custom/_settings.scss` |
| A theme's colors | `_sass/color_schemes/ID.scss` |
| A table's columns, filters, limits | `_data/tables/NAME.yml` |

**Strings.** Use `{name}` as a fill-in spot, such as `{title}`. Only `nav_footer` and `unfinished` accept Markdown and `[[links]]`. Wrap a value in quotes if it contains a colon followed by a space.

**Settings.** Every value in `_settings.scss` ends in `!default`, so any color scheme can override one for just that theme by writing the same variable name without `!default`. Don't set `$theme-body-font`, `$theme-heading-font`, `$theme-background`, `$theme-cursor`, or `$theme-cursor-pointer` in a color scheme. They come from `themes.yml` through `theme.scss.liquid`.

**Other color scheme overrides:** `$stripe-odd-color`, `$stripe-even-color`, `$unlisted-color`, `$marker-colors`.

## 2. Pages

### Front matter
- `title` – required. For sections and pages, `parent` is the exact title of the section page. For subclasses, `parent` is the class and `grand_parent` is `Subclasses`.
- `has_children: true` – on section pages and class stubs.
- `layout: wiki` – builds the page from the keys below. Without it, the page is a normal Just the Docs page. Home uses the normal layout.
- `tagline` – an italic line under the title. It is also the first line of the page's tooltip in link tables.
- `summary` – the rest of that tooltip.
- `intro` – the paragraph under the title (wiki layout).
- `catalog` – a link table. `catalog: true` lists every page whose `parent` is this page's title. Or give a map of `grand_parent`, `group_by` (a front matter key), `columns` (minimum, default 3), and `max_columns` (default 5).
- `table` – a search table, by name (a file in `_data/tables/`).
- `quote` – the closing quote. Write the text only, without outer quotation marks.
- `unfinished: true` – shows the "not constructed yet" message and the Back link. Leave the body empty.
- `nav_exclude`, `search_exclude`, `redirect_url` – Just the Docs and class stub settings.
- `has_toc: false` is already the default for every page. Don't repeat it.

A value can't contain a colon followed by a space or a space followed by `#`. Wrap it in single quotes if it does.

The wiki layout order is: title, tagline, intro, page body, link table, search table, divider, quote. Back links are automatic. They point to `grand_parent`, else `parent`, else Home. Never write one by hand.

### Add a Section
Create `NAME/index.md` with `title`, `parent: Home`, `has_children: true`, `layout: wiki`, `intro`, `quote`, and either `catalog: true` or `table: NAME`. Do not set `nav_order`: sections sort alphabetically (only Home has `nav_order: 1`), and the Home link table picks the new one up.

### Add a Page
Create a `.md` file in the right folder with `title` and `parent`. An unfinished page is only front matter with `unfinished: true`.

### Add a Class (for Subclasses)
Create `subclasses/CLASS.md` with `title`, `parent: Subclasses`, `has_children: true`, `redirect_url: /subclasses/`, `search_exclude: true`, and no body.

## 3. Text Rules

Everything on the site passes through `text.html`, so these rules work everywhere:

- Markdown works: `*italic*`, `**bold**`, lists.
- `<br>` makes a line break. Use it in tooltips and stat blocks (a lone `\` there prints literally). In other popups, a trailing `\` also works. If one prints a stray `\`, use `\\` or `<br>`.
- Links: `[[Name]]`, `[[Name|label]]`, `[[table:Name]]`, `[[table:Name|label]]`. They open that entry's popup. `table` defaults to the page's own table.
- It applies to page `intro` and `tagline`, quotes, tooltips, the footer text, text cells, and every popup.
- It does not apply to attributes (search box hint, aria labels), number cells, or the wording used by scripts. Those are plain text.

Other rules:

- **Headings are bold automatically.** Never write `**` in a heading. The weight is `$heading-weight` in `_settings.scss`.
- **Quotes:** `{% include quote.html text="..." %}`. Don't type the outer quotation marks.
- **Tooltips:** `{% include tooltip.html text="..." %}` prints a full `data-tooltip="..."` attribute. The bubble inserts the text as HTML, so only use text you wrote.
- **Italic blocks:** put `{: .italic }` on the line after the text. Other classes: `.indent`, `.catalog` (a plain table), `.headless` (hide the header row).
- **Dropdown text:** use raw HTML with Kramdown's `markdown` attributes:
  ```
  <details markdown="1">
  <summary markdown="span">**Title**</summary>

  Body text
  </details>
  ```
  Keep a blank line after `</summary>` and before each `<details>`.

## 4. Themes and Fonts

### Add a Theme
1. Add `_sass/color_schemes/NAME.scss` (copy an existing one).
2. Add `assets/css/just-the-docs-NAME.scss`:
   ```
   ---
   ---
   {% include theme.scss.liquid id="NAME" %}
   ```
3. Add an entry to `_data/themes.yml` (`id` must match both file names). Only `id` and `label` are required. See "Theme Keys" below for the rest.
4. To make it the default for new visitors, set `color_scheme: NAME` in `_config.yml`.

### Theme Keys (`themes.yml`)
- `id`, `label` – the name in code and the name shown in the menu.
- `body_font`, `heading_font`, `font_fallback`, `fonts` – see "Add Fonts to a Theme".
- `background` – a picture for the page background (see section 4b).
- `cursor` – a custom mouse cursor: `image`, `hotspot`, and optional `pointer` (see section 4b).
- `sounds` – the name of a sound effect set in `audio.yml`. A theme with no `sounds` is silent.
- `music` – a background music file. Optional.

### Add Fonts to a Theme
1. Put the font files in `assets/fonts/`. File names are case-sensitive and should have no spaces. `.woff2` is the smallest format. `.ttf` also works.
2. In the theme's entry in `themes.yml`, add one line per file under `fonts:`, then name the families in `body_font` and `heading_font`:
   ```
   fonts:
     - { family: Crimson Pro, file: assets/fonts/CrimsonPro-Regular.ttf }
     - { family: Crimson Pro, file: assets/fonts/CrimsonPro-Italic.ttf, style: italic }
   ```
   `weight` is 400 by default. Use a quoted range such as `"200 900"` for a variable font. `preload: false` skips the early download for a file that isn't needed on the first view.

How it works: `theme.scss.liquid` writes one `@font-face` rule per file into that theme's stylesheet, plus the Sass variables for the theme's fonts, background, and cursor. `theme-switcher.js` adds a preload hint for the active theme's files, so the download starts before the stylesheet is read.

## 4b. Effects (Dock, Background, Cursor, Sound, Text Size)

### Events and the Active Theme
Scripts that don't know about each other communicate through events on `document`:

| Event | Sent by | Meaning |
|---|---|---|
| `themechange` | `theme-switcher.js` | The theme was switched. `event.detail` is the theme's `id`. Sent after the new stylesheet is in place. |
| `popupopen` | `search-table/dialog.js` | A search table popup just opened. |
| `popupclose` | `search-table/dialog.js` | A search table popup just closed. |

The active theme's `id` is always on `<html data-theme="...">`, so CSS can use `html[data-theme="dungeon"]` and scripts can read `document.documentElement.dataset.theme`. `site/shared.js` has `onThemeChange(fn)`, which runs `fn` now for the current theme and again after every switch.

To react to something new, listen for an event. Don't call another script's functions.

### Stored Settings
Visitors' choices live in the browser's `localStorage`:

| Key | Set by | Value |
|---|---|---|
| `theme` | `theme-switcher.js` | a theme `id` |
| `navbar-collapsed` | `navbar-toggle.js` | `true` or `false` |
| `text-size` | `text-size.js` | a percent, like `110` |
| `sound-effects` | `audio.js` | `true` or `false` |
| `sound-music` | `audio.js` | `true` or `false` |

Every read and write is wrapped in `try`/`catch`, because storage can be blocked.

### The Dock
The row of buttons at the bottom right (Sound, Size, Theme).

- Markup: `footer_custom.html`. Behavior: `site/dock.js`. Styles: `_dock.scss`.
- Each button sits in a `.dock-item` next to its `.dock-menu`, which starts `hidden`. `dock.js` opens one menu at a time. Pressing outside the dock or pressing Escape closes them all. A button with `role="menuitem"` also closes its menu when clicked. Checkboxes and plain buttons don't.
- **To add a dock button:** copy a `.dock-item` in `footer_custom.html`, give the menu and its button matching `id` and `aria-controls`, and add the wording to `strings.yml`.
- **Dock sizes are in `px` on purpose.** Everything else on the site scales with the text size buttons. If the dock scaled too, its buttons would move out from under the pointer while clicking them.

### Background and Parallax
- Set `background: assets/images/NAME.webp` in a theme's `themes.yml` entry. A theme without it keeps its plain color, and none of the background CSS is built for it.
- `theme.scss.liquid` writes the image into `$theme-background`. `_background.scss` draws it on `body::before`, a fixed layer behind the page that is slightly bigger than the screen so it has room to move.
- `site/parallax.js` writes `--parallax-x` and `--parallax-y` (-1 to 1) from the mouse position, once per screen refresh. The CSS turns them into a slide in the opposite direction. It does nothing for touchscreens, or for visitors who ask for reduced motion.
- `.main` and `.side-bar` are made slightly see-through (`$panel-opacity`) so the picture shows around the text. If the picture is hidden, inspect the page for another element with a solid background and add it in `_background.scss`.
- **Image size:** 2560 × 1440 px, WebP, ideally under about 500 KB. The picture is scaled to cover the screen and cropped, so keep important detail near the middle. Keep `$parallax-range` smaller than `$parallax-margin`, or the layer's edge becomes visible.

### Custom Cursor
Each theme can have its own cursor, set in `themes.yml`:

```
cursor:
  image: assets/images/cursors/quill.webp
  hotspot: 2 30
  pointer: assets/images/cursors/quill-link.webp
```

- `image` – the cursor. 32 × 32 px with a transparent background. WebP and PNG both work. Browsers allow up to 128 × 128, but Chrome hides cursors bigger than 32 × 32 near the window's edge.
- `hotspot` – `x y`, in image pixels: the exact point that does the clicking (for a quill, the tip of the nib). Default `0 0`.
- `pointer` – optional. The image shown over links and buttons. Defaults to `image`.
- It is pure CSS: `theme.scss.liquid` writes `$theme-cursor` and `$theme-cursor-pointer`, and `_cursor.scss` applies them. Each theme's stylesheet has its own cursor, so switching themes swaps it. No script is involved.
- The rules use `!important`, because Just the Docs and the site set `cursor: pointer` in many places.
- A missing image falls back to the normal arrow.
- A cursor image can't animate. Animated files show only their first frame.

### Sound
- Settings: `_data/audio.yml`. Behavior: `site/audio.js`. The Sound menu has two checkboxes, `data-sound="effects"` and `data-sound="music"`.
- `defaults` is what first-time visitors get (music is off, because browsers block autoplay anyway). `volume` runs from 0 to 1.
- `sets` are groups of effect files. A theme picks one with `sounds: NAME`. Dark and Light share the `basic` set, which only has `click`. The events are:
  - `click` – any link, button, input, or table row is clicked.
  - `hover` – the mouse moves onto a new link, button, or table row.
  - `open` and `close` – a search table popup opens or closes.
  - An event missing from a set is silent.
- Music loops, follows the theme's `music` file, pauses when the tab is hidden, and starts only after the visitor's first click or key press.
- Use `.mp3` files, which play in every browser. Keep effects short (under about a second) and small. A missing file fails silently.
- The set of clickable things is `INTERACTIVE` in `site/shared.js`. Add a selector there to include more.

### Text Size
- Settings: `_data/text_size.yml` (`min`, `max`, `step`, in percent). The Size menu has a minus button, the current percent, a plus button, and Reset. A button is greyed out at its limit.
- `text-size.js` runs in the page head, so the saved size is applied before the page paints.
- The size is set as an inline `font-size` on `<html>` marked `!important`, which beats any stylesheet. At 100% the inline style is removed completely. Everything on the site is sized in `rem`, so everything scales together (except the dock, which uses `px`).
- If some text doesn't scale, it is sized in `px` somewhere. Change it to `rem`.

### Entry Point
`site/main.js` imports `dock.js`, `parallax.js`, and `audio.js`. Each starts itself when imported. Remove an import to switch that feature off.

## 5. Search Tables

Put `layout: wiki` and `table: items` in a section page's front matter. A table named `items` uses three files:
- `_data/tables/items.yml` – settings and columns (see "Table Settings" and "Column Options").
- `items/_entries.md` – the entries. This is the file you edit.
- `_includes/table/templates/<template>.md` – how an entry's fields become popup text.

### Add a Table
Create all three files, then point a page at it with `table: NAME`. The `template` setting names the popup layout file.

### Add an Entry
Add it to the table's `_entries.md`, separated from the next one by a line that is exactly `---`.

### Add a Column or Field
Add the key to the entry, add a column in the table's `.yml` file, and (if it should appear in the popup) use it in the template.

### Entry Format
- Entries are separated by a line that is exactly `---`. Never use `---` inside a description. Use `***`.
- One `key: value` per line. A line starting with a field name and `: ` starts a field. Field names are **all lowercase** (letters, digits, underscores). A capitalized name like `Resistances:` is not recognized and gets glued onto the field above it. Every other line continues the field above it.
- Lists are comma-separated. Write cost and weight as plain numbers.
- `tags` – comma-separated, shown in the popup.
- `options_KEY` (for example `options_rarity`) – lists other values the entry counts as, for search and filters. Excluding hides the entry only if all of its values are excluded.
- On number columns, `options_cost` and `options_weight` list amounts or ranges instead, like `options_cost: 50, 200, 3-36`. Use plain numbers, no thousands commas. A slider or Min/Max filter keeps the entry if any listed amount or range overlaps it.
- Entry names must be unique within a table: each row's `id` is its slugified name, and links rely on it.

### Named Lists (traits, actions, and so on)
Fields such as species `traits` and monster `traits` and `actions` use indented list items. The first key's name is ignored (`trait_1`, `action_2`, anything). Its value is the item's title.

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

**Items** (`item.md`): `name`, `prefix_category`, `category`, `note_category`, `rarity`, `options_rarity`, `note_rarity`, `attunement`, `cost`, `options_cost`, `note_cost`, `weight`, `options_weight`, `note_weight`, `setting`, `note_setting`, `tags`, `description`.
- `prefix_category` goes before the category in the popup's first line (`prefix_category: Simple Melee` with `category: Weapon` shows "Simple Melee Weapon"). It isn't shown in the table's Category column.
- `setting` is comma-separated. It auto-adds the Setting-Specific tag and appends the "can only be found in…" note to the popup. Never hand-write that note or tag.
- `note_setting` is an extra sentence added to the end of that note.

**Species** (`species.md`): `name`, `article` (optional), `description`, `age`, `type`, `size`, `speed`, `settings`, `tags`, `traits`. Several `type` values are joined with "and", and several `size` values with "or", in the order written.

**Spells** (`spell.md`): `name`, `level` (`Cantrip` or 1–9), `school`, `classes`, `casting_time`, `condition`, `ritual` (`true`), `range`, `area`, `components` (`V, S, M`), `material`, `duration`, `concentration_max`, `tags`, `description`.
- `condition` is added to the end of the casting time exactly as written, so begin it with its own punctuation, like `condition: , which you take when you are hit by an attack roll`.

**Monsters** (`monster.md`): `name`, `size`, `type`, `alignment`, `ac`, `initiative`, `hp`, `speed`, `str`–`cha`, `saves`, `skills`, `resistances`, `vulnerabilities`, `immunities`, `gear`, `senses`, `languages`, `cr`, `settings`, `tags`, `flavor`, and the sections `traits`, `actions`, `bonus_actions`, `reactions`, `legendary_actions`.
- `name` is also the stat block's title.
- The scores `str`–`cha` give modifiers and saves automatically. `saves: Dex, Wis` adds the Proficiency Bonus to those saves.
- `cr` is a plain number, with fractions as decimals (`0.125`, `0.25`, `0.5`). The Proficiency Bonus and XP come from `_data/challenge.yml`. The search box doesn't understand `1/2`. Search `cr:0.5`.
- `initiative` is optional and replaces the computed value, shown as written.
- `skills`, `resistances`, `vulnerabilities`, `immunities`, `gear`, `senses`, and `languages` are free text. A line shows only if the entry has that field.
- Passive Perception is added to the end of the Senses line automatically. Don't type it into `senses`. Write negative bonuses with a plain hyphen (`Perception -1`).
- Each section can have an optional `KEY_intro` field, shown as a plain paragraph above its first row.
- `flavor` is optional: one paragraph, shown in italics as a blockquote at the bottom.

**Feats** (`feat.md`): `name`, `category`, `prerequisite`, `repeatable` (`true` or `false`, blank means false), `tags`, `description`.

### Table Settings (`_data/tables/NAME.yml`)
- `template` – popup layout file in `_includes/table/templates/` (required).
- `noun` – word used in "Showing 5 of 20 items".
- `default_sort` – column key (default: the first column). `default_dir` – `asc` or `desc` (default `asc`).
- `placeholder` – search box hint text (default is in `strings.yml`).
- `dialog` – optional popup style. Adds the class `st-dialog--NAME` to the popup. Only `statblock` exists (monsters).
- `tags` – the tags the Filter panel offers, in the order shown, even if no entry uses them yet. A tag an entry uses that isn’t listed appears in red in its popup, and its table row turns red. `tags: false` hides tags in the Filter panel and popup, but the search box still understands them.
- `auto_tags` – rules that add a tag automatically, like `- { tag: Concentration, field: duration, equals: Concentration }` (case doesn't matter). Add the tag to `tags` too so it gets a filter button. Leave out `equals` to fire whenever the field has any value.
- `markers` – symbols next to names. Each has `symbol`, `tag`, `color_by` (the entry field whose value picks the color from `$marker-colors`), and `label` (hover text prefix).
- `limit_default` (100), `limit_min` (25), `limit_max` (500), `limit_step` (25) – the results-shown slider.
- `columns` – see below. The first column is always the name.

### Column Options

**Core**
- `key` – matches the field in entries. `label` – the heading.
- `type` – how the column behaves:
  - `text` (default) – substring search.
  - `list` – the cell holds `a, b, c`. Each item is searched and filtered separately.
  - `rank` – ordered categories (like Rarity). Sorts by `order`. Search must match the whole value.
  - `number` – plain numbers. Sorts by amount, with a Min/Max filter or a slider.
  - `measure` – amounts with units (`10 minutes`, `120 feet`). Sorts by size using `units`. Filters with `buckets`.
- `abbreviate` – the cell shows the first N letters of each comma-separated part of the cell followed by a period, with the full name in the hover bubble. Works on text and list columns (not on columns with `format`, `symbols`, or a number type). The popup, filters, and search still use the full names. Use plain text only (no `[[links]]`).
- `order` – the categories for this column's Filter buttons, in the order shown, even if no entry uses them yet. Give a list, or the name of a list in `_data/lists.yml` (`order: settings`).
  - Rank, number, and measure columns also sort by it.
  - A cell value that isn't listed turns red, unless a number or measure column can read it as an amount.
  - Leave `order` out and the column gets no buttons and nothing is flagged.
  - A quoted `"..."` marks where amounts go. Names before it sort first, and names after it sort last. Without it, amounts come after all names.
- `blank_as` – blank entries count as this value in search, filters, and sorting. The cell shows its `symbols` entry if it has one, otherwise "—". A blank cell in a column without `blank_as` (and not `in_table: false`) is highlighted red as a missing value.

**Display**
- `format: cr` – `0.5` displays as `1/2`. `format: money` – cells display as GP/SP/CP. `format: weight` – weights of 0.1 or less display in ounces, others in pounds. All display only. Sorting and filters use the exact number.
- `prefix` and `suffix` – for other numbers. `unit` – shown in the Filter heading, like "Cost (GP)".
- `zero_label` – number columns: an entry whose value is exactly `0` is shown as this word (for example `Weightless`) in both the table and the popup.
- `plain: true` – list cells hide "(notes)".
- `symbols` (value to icon) and `labels` (value to friendly text). Quote `"true"` and `"false"` keys.
- `in_table: false` – searchable and filterable but hidden from the table.
- `note` – adds an entry field to the table cell: `field` is the entry key, `format` is the added text with `%s` for the value (default ` (%s)`), `show_if` shows the note only when the entry's value equals it, and `sort: true` also sorts by the note's value.

**Behavior**
- `sortable: false` – not clickable. `filter: false` – skip its Filter group.
- `match: exact` – search must match the whole value (the default for `rank`).
- `units` – measure columns: unit word to size in a base unit, like `{foot: 1, feet: 1, mile: 5280}`. A plural ending in "s" is matched automatically.
- `slider` – number columns: `{ max, min_label, max_label }` turns the Min/Max boxes into a double-ended slider. Positions are `0` (min label, no lower limit), `1` to `max` (amounts), and `max+1` (max label, no upper limit). Entries whose text equals a label word count as 0 or infinity.
- `buckets` – replaces the `order`-based Filter buttons. A plain word matches that exact value. `{ label, up_to }` catches amounts up to that size (like `10 minutes`, using the column's `units`). `{ label }` with no `up_to` catches every larger amount. List amount buckets from smallest to largest. Concentration spells are bucketed by their "up to" time.

### Shared Lists
`_data/lists.yml` holds lists used by several tables. Adding a world means adding its name to `settings` there (and creating its page in `settings/`). Every table picks it up.

### Search Box
- Plain words search names. `field:value` searches a column. `"quoted phrase"` keeps words together. `-word` excludes.
- `#tag` or `tag:word` searches tags.
- Numbers accept `cost:>=100`, `cost:<50`, `weight:1-5`, or `cr:0.5`.

## 6. How a Table Is Built

Liquid builds each row and popup at build time. A script then makes it interactive. The two sides share a few attributes:

- `data-config` on `.search-table` – the table's settings file as JSON.
- On each row: `id` (the slugified name), `data-tag-names`, and `data-v-KEY` (the lowercase displayed value), `data-o-KEY` (the `options_` values), and `data-s-KEY` (a sort override from a column `note`).
- The popup HTML sits in `.st-details`, one `<div data-for="ROW-ID">` per entry.
- `deeplink.js` opens a popup when the URL ends in `#entry-name`.

## 7. Search Table Scripts (`assets/js/search-table/`)

The first four files never touch the page, so they can be tested on their own.

- `utils.js` – the `t()` wording helper (reads `strings.yml`), the one number syntax (`NUMBER`, `parseSpan`), and small DOM helpers.
- `columns.js` – the column types. **To add a column type, add one line to `TYPES`.** It also prepares each column (lists, order, buckets) and adds the tag column. Tags behave as one more list column, so search, filters, and sorting need no special cases for them.
- `records.js` – reads the rows into records, sorts, and flags unlisted values (a row with an unlisted tag gets `st-row-unlisted`).
- `query.js` – turns the search box text into terms and matches them.
- `filters.js` – what the Filter panel has selected, and how it matches.
- `panel.js` – the Filter panel's buttons, boxes, and sliders.
- `dialog.js` – the popup. It also announces `popupopen` and `popupclose` (see section 4b). `deeplink.js` – opens a popup from the URL. `main.js` – the entry point that wires it all together.

## 8. Reminders

- **Liquid runs in every normal `.md` page**, even inside backticks. Wrap documentation examples in raw tags. This file is excluded from the build, so it doesn't need them.
- **Never put `}` inside a `{{ }}` tag.** Liquid ends the tag at the first `}`. Assign the value first with `{% assign %}`, then print it. (`{% %}` tags are fine.)
- **Includes share variables with the page that calls them.** Give every include its own prefix (`mk_`, `cl_`, `pe_`, `jw_`, `ni_`, `fm_`, `ms_`, `sps_`, `sp_`, `it_`, `ft_`, `tx_`, `qt_`, `tt_`, `tg_`, `th_`...). Pass what an include needs as a parameter instead of relying on a shared variable.
- **Include parameters must be plain values or dotted names** (`key=col.key`). Brackets like `list[0]` break the include tag, so assign the value to a variable first.
- **`theme.scss.liquid` must assign every `th_` variable it prints, and must not hide a missing one with `| default:`.** An unassigned variable prints nothing and breaks the build with an "expected expression" error, which is the right outcome. A `default` guard instead makes the build pass while silently dropping a font, background, or cursor.
- **Sass can't read data files.** A stylesheet only knows what is written into it. `_settings.scss` holds the defaults, and `theme.scss.liquid` writes each theme's fonts, background, and cursor. Just the Docs also builds stylesheets of its own that load `custom.scss`, which is why every setting has a `!default`.
- **Never delete `assets/css/just-the-docs-default.scss`.** Every page loads it first. If it doesn't use the theme include, the first view shows the wrong fonts.
- **For Sass compatibility**, halve with `* 0.5`, not `/ 2`. Avoid `@use` and `math.div`: the theme loads this folder with `@import`.
- **Colors and fonts come from the color scheme variables**, never hard-coded in `_sass/custom/`.
- **Just the Docs** sets heading (`h1`–`h6`) and table (`th`, `td`) font sizes with `!important`. A custom `font-size` on those elements only works if it is `!important` too.
- **Entry files are named `_entries.md`** so Jekyll doesn't publish them as raw pages. They're loaded with `include_relative`, so they must sit in the same folder as the page that shows the table.
- **YAML:** quote a value that contains a colon followed by a space, or starts with `,` or `#`. Quote the keys `"true"` and `"false"`. Use spaces, never tabs. A value like `hotspot: 8 2` is fine unquoted.
- **File names on GitHub Pages are case-sensitive.** A wrong capital in a font, image, or audio file name gives the fallback with no error message.
- **Before deleting a CSS class**, search the whole repo for its name (GitHub's search box works).
- **After changing a script,** hard refresh (Ctrl+Shift+R). GitHub Pages and browsers cache scripts for several minutes. A mix of old and new script files stops every table from working.
- **When something stops working, open the browser console first** (F12, then the Console tab). A script error stops the rest of that script, so one mistake can break a whole feature. The message names the file and line.
- **When adding code to a script, check which function it goes inside.** A line pasted a level too high or too low can run before the variables it needs exist, and that stops the whole file.
- **Bulk edits:** press `.` on the repository page to open github.dev, a browser editor with Search and Replace across files (regex supported).

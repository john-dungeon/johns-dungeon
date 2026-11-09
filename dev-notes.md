# Developer Notes

## 0. Quick Start

**What this site is.** A Jekyll site on GitHub Pages using the Just the Docs theme (`just-the-docs/just-the-docs@v0.12.0`, pinned in `_config.yml`). Live at `https://john-dungeon.github.io/johns-dungeon/`. Almost everything is either:

- **content** (Markdown files and `_entries.md` lists), or
- **settings** (files in `_data/` and `_sass/custom/_settings.scss`), or
- **machinery** (`_includes/`, `_layouts/`, `assets/js/`, `_sass/custom/`) that you rarely touch.

**How to work on it.**
1. Edit files on GitHub. Press `.` on the repository page to open github.dev, a browser editor with multi-file Search and Replace (regex supported).
2. Commit. GitHub Pages rebuilds the site (give it a minute or two).
3. Reload with a hard refresh (Ctrl+Shift+R). A mix of old and new script files breaks every table.
4. If something looks wrong, open the browser console (F12) first. A script error names the file and line. A Liquid or YAML mistake instead shows up as a failed build in the repository's Actions tab, or as a missing page or section.

**The three questions to ask before any change.**
- Is there already a setting for this? (Section 3 is a lookup table.)
- Is there already a rule I can extend instead of adding a new one? (Section 1.)
- Will it still work when someone else adds the next entry, page, or theme without reading this file? If not, make it a rule, not a patch.

## 1. Design Rules

- **One place per setting.** Wording: `strings.yml`. Themes, fonts, cursors, effects: `themes.yml`. Shared lists: `lists.yml`. Sound: `audio.yml`. Entrance screen: `gate.yml`. Clickable elements: `interactive.yml`. Look and feel numbers: `_settings.scss`. Table behavior: `_data/tables/`.
- **A list needed by both Sass and JavaScript lives in `_data/` and is written into both by Liquid.** Sass can't read JS and neither can read `_data/` directly, so Liquid is the bridge: `theme.scss.liquid` writes a Sass variable, `head_custom.html` writes a JS global. The clickable-element list (`interactive.yml`) is the model. Never copy such a list into a script or stylesheet by hand.
- **Universal rules over local fixes.** All text goes through `text.html`, tooltips through `tooltip.html`, quotes through `quote.html`, numbers through `format.html`, links through `links.html`, side panels through `panel.html`. Don't reimplement these in one spot.
- **Work it out, don't hand-write it.** If the site can derive a value (tags, passive Perception, lair XP, saves, the search index), derive it. Hand-written copies drift out of date.
- **Logic is separate from the page.** The search table's `columns`, `records`, `query`, and `filters` scripts never touch the page. Only `panel`, `dialog`, `deeplink`, and `main` do.
- **Announce, don't call.** Scripts that don't depend on each other talk through events on `document` (section 9.1).
- **Colors and fonts come from the color scheme and `themes.yml`**, never hard-coded in `_sass/custom/`.
- **Delete before adding.** A new feature should first look for an existing rule to extend.

## 2. Project Map

### Root
- `_config.yml` – site settings.
  - Theme version is pinned. Change it on purpose.
  - `color_scheme: dungeon` is the theme first-time visitors see. It must match a `themes.yml` `id`.
  - `exclude` keeps `README.md`, `dev-notes.md`, and `assets/PERSONAL-NOTES.md` off the website. They stay in the (public) repository, so nothing private belongs in them.
  - `defaults` sets `has_toc: false` for every page. Don't repeat it.
- `index.md` – Home. A normal Just the Docs page (no `layout: wiki`) with a link table of the sections and a closing quote.
- `404.md` – the error page (`title: ???`, `unfinished: true`, hidden from nav and search).
- `README.md` – the repository's front page, with the link to the live site.
- `zzzz-search-data.json` – the site search index: the theme's own page index plus one record per search-table entry (section 9.10). It lives at the repo root on purpose.
- `assets/js/zzzz-search-data.json` – a three-line stub that replaces the theme's copy of the index so the two don't collide (section 9.10). Never delete it.
- `assets/PERSONAL-NOTES.md` – the author's private-ish worldbuilding notes (excluded from the site).

### Data (`_data/`)
- `strings.yml` – all site wording that isn't page content.
- `themes.yml` – the switcher's themes: fonts, background, cursor, sounds, music, effects.
- `lists.yml` – lists shared by several table columns (`settings`, `creature_types`, `sizes`).
- `audio.yml` – sound defaults, volumes, effect sets, music playlists.
- `gate.yml` – the entrance screen: on/off, picture, zoom point, zoom size, and three timings.
- `session.yml` – how long the site must be closed before a visit ends, and what is forgotten then.
- `text_size.yml` – lowest size, highest size, and step of the Size buttons.
- `interactive.yml` – the CSS selectors that count as "clickable" (hover cursor, hover sound, torch glow). Read by both the stylesheets and the scripts (section 9.6).
- `challenge.yml` – Challenge Rating to XP and Proficiency Bonus (monster template). Fractions are decimals (`0.5`). **Row order matters:** a monster with a lair gets the XP of the row after its own (section 7, Monsters).
- `plurals.yml` – irregular plurals for Swarm stat blocks (`fey`, `monstrosity`, `undead`; anything unlisted gets an "s").
- `tables/` – one settings file per search table: `feats`, `items`, `monsters`, `species`, `spells`.

### Styling
- `_sass/color_schemes/` – one colors-only file per theme (`dungeon.scss`, `parchment.scss`). Just the Docs' own `dark` and `light` need none.
- `assets/css/just-the-docs-ID.scss` – one 3-line stub per theme (Jekyll needs each as a separate file): `light`, `dark`, `dungeon`, `parchment`. `just-the-docs-default.scss` is loaded by every page first and builds the `color_scheme` theme. Never delete it.
- `_sass/custom/` – all custom CSS, loaded in this order by `custom.scss` (import each file once):
  - `_settings` – every adjustable visual value, each with `!default`.
  - `_helpers` – derived variables (stripes, shadows, z-index, sidebar sizes), the `$panels` map (section 9.4), the mixins (`outlined`, `outlined-button`, `muted`, `fit-table`, `accent-on-hover`, `parallax-layer`, `vignette-picture`, `toc-fits`, `panel-fits`, `panel-in-place`, `panel-under-main`) and the `css-max` function.
  - `_theme` – fonts, heading weight and size, body size variable, theme cross-fade.
  - `_base` – links, scrollbar color, `.indent`, `.italic`, animation speed variable.
  - `_tables` – flat, striped tables (`.catalog`, `.headless`).
  - `_search-table` – search tables, filter panel, and popup.
  - `_statblock` – the monster popup.
  - `_panels` – the left and right side panels and their hide/show buttons (section 9.4).
  - `_search-bar` – widens Just the Docs' search box and its results to the full width of the panel.
  - `_tooltip`, `_dropdown`, `_checkbox`, `_dock` – hover bubble, `<details>`, checkboxes, dock.
  - `_background` – page background image, parallax, see-through panels.
  - `_cursor` – native (static) cursor rules and the animated cursor element.
  - `_scrollbar` – the custom scrollbars (used only with the animated cursor).
  - `_effects` – the ambient effect layer, torch glow, vignette, stone crumble, ink.
  - `_gate` – the entrance screen.
- `assets/fonts/`, `assets/images/` (backgrounds, `cursors/`, `entrance.webp`), `assets/audio/` (effects, plus `music/`), `assets/favicon.webp`. Paths are set in `themes.yml`, `audio.yml`, and `gate.yml`.

### Layout and Reusable HTML (`_layouts/`, `_includes/`)
- `_layouts/wiki.html` – the page layout (section 4).
- `text.html` – the universal text formatter (section 5). `links.html` – `[[links]]`. `quote.html` – italic blockquote. `tooltip.html` – a `data-tooltip` attribute.
- `catalog.html` – link tables. `search-table.html` – search tables. `backlink.html` – the automatic "Back to..." link.
- `components/sidebar.html` – replaces Just the Docs' sidebar. Builds the left panel (site navigation), the right panel (page outline, only for pages with an `outline`), and the hide/show buttons.
- `panel.html` – one side panel (section 9.4). `panel-toggles.html` – the hide/show buttons. `outline.html` – the right panel's list of headings.
- `gate.html` – the entrance screen.
- `head_custom.html`, `footer_custom.html`, `nav_footer_custom.html` – Just the Docs hook points. `head_custom` loads every script, hands data to them (`SITE_STRINGS`, `SITE_LISTS`, `SITE_AUDIO`, `SITE_INTERACTIVE`, and the theme and session settings), adds `has-right` to `<html>` when the page has an outline, and adds the redirect for class stubs. `footer_custom` holds the "unfinished" quote, back link, dock, and entrance screen. `nav_footer_custom` is the left panel's footer line (`nav_footer` in `strings.yml`).
- `theme.scss.liquid` – builds one theme's stylesheet: `@font-face` rules, Sass variables for fonts, background, static cursor, sizes, and the clickable selector (`$interactive-selector`), then the color scheme.
- `table/` – helpers for `search-table.html` (and the search index):
  - `parse-entry` (entry text to packed fields), `field` (reads one field), `value` (a cell's raw value), `cell` (one `<td>`), `format` (numbers: `money`, `weight`, `cr`, `signed`, or prefix/suffix).
  - `list` (comma list cleaner), `join-words` ("A, B, or C"; optional plural), `plural`, `named-list` (`- key: Name` lists to titled paragraphs; optional `row="class"` wraps each in a `<div>`), `item-name` (reads a list item's title), `tags` (including `auto_tags`), `marker`.
  - `templates/` – `item`, `species`, `spell`, `monster`, `feat`: how each table's fields become popup text.

### Scripts (`assets/js/`)
- `session.js` – runs first in the head. Decides if this is a new visit, forgets old choices, decides if the entrance screen shows.
- `theme-switcher.js` – remembers the theme, swaps its stylesheet, preloads its fonts, sets `<html data-theme>`, announces `themechange`.
- `effects-snapshot.js` – keeps effect classes and variables across page loads so effects don't flash (section 9.7).
- `text-size.js` – saved text size (applied early, no flash) and the Size buttons.
- `panel-toggle.js` – remembers which side panels are hidden and runs the hide/show buttons (section 9.4). `tooltips.js` – the bubble for any `data-tooltip`.
- `site/` – visual effects, started by `site/main.js`: `shared.js` (helpers), `dock.js`, `parallax.js`, `hover.js`, `gate.js`, `audio.js`, `cursor.js`, `scrollbar.js`, `effects.js`, and `effects/` (one file per effect: `torch-glow`, `vignette`, `stone-crumble`, `ink-writing`, `ink-drip`).
- `search-table/` – section 8. These scripts don't import from `site/`.

### Content Folders
`feats/`, `items/`, `monsters/`, `rules/`, `settings/`, `species/`, `spells/`, `subclasses/`. Each has an `index.md`. Feats, items, monsters, species, and spells also have an `_entries.md` holding their table entries.

## 3. Where Do I Edit?

| To change | Edit |
|---|---|
| Any site wording (buttons, messages, table text) | `_data/strings.yml` |
| Themes: fonts, background, cursor, sounds, music, effects | `_data/themes.yml` |
| Worlds, creature types, sizes | `_data/lists.yml` |
| Sound defaults, volumes, event-to-file mapping, playlists | `_data/audio.yml` |
| Entrance screen picture, zoom point, timings | `_data/gate.yml` |
| Visit length, what is forgotten | `_data/session.yml` |
| Text size limits and step | `_data/text_size.yml` |
| What counts as clickable (cursor swap, hover sound, torch glow) | `_data/interactive.yml` |
| Irregular plurals for Swarms | `_data/plurals.yml` |
| CR to XP and Proficiency Bonus | `_data/challenge.yml` |
| Animation speed, popup widths, tooltip width, right panel width, hide/show button size, rarity colors, panel see-through level, parallax, entrance and scrollbar heights, effect colors and sizes | `_sass/custom/_settings.scss` |
| One theme's heading weight, body size, heading size | `_data/themes.yml` (`heading_weight`, `body_size`, `heading_size`) |
| A theme's colors | `_sass/color_schemes/ID.scss` |
| A table's columns, filters, tags, limits | `_data/tables/NAME.yml` |
| Which entry fields the search bar looks at | `search_fields` in `_data/tables/NAME.yml` (section 9.10) |
| A table's entries | `NAME/_entries.md` |
| How a table's popup reads | `_includes/table/templates/TEMPLATE.md` |
| How often an effect fires, how big, how long | its entry in `themes.yml` (options), defaults at the top of `effects/NAME.js` |
| A page's text | that page's `.md` file |
| A page's right-hand outline | `outline` in that page's front matter (section 4) |

**Strings.** `{name}` is a fill-in spot, such as `{title}` or `{shown}`. Only `nav_footer` and `unfinished` accept Markdown and `[[links]]`. Quote a value that contains a colon followed by a space.

**Settings.** Every value in `_settings.scss` ends in `!default`, so a color scheme can override one for just that theme by writing the same variable without `!default`. Never set `$theme-body-font`, `$theme-heading-font`, `$theme-background`, `$theme-cursor`, `$theme-cursor-pointer`, or `$interactive-selector` in a color scheme. They come from `themes.yml` and `interactive.yml` through `theme.scss.liquid`, which also writes `$heading-weight`, `$body-size`, and `$heading-size` for themes that set them.

**Other color scheme overrides:** `$stripe-odd-color`, `$stripe-even-color`, `$unlisted-color`, `$missing-background`, `$marker-colors` (`_helpers.scss` adds `varies` and `variant` to it).

## 4. Pages

### Front matter
- `title` – required. For sections and pages, `parent` is the exact title of the section page. For subclasses, `parent` is the class and `grand_parent` is `Subclasses`.
- `has_children: true` – on section pages and class stubs.
- `layout: wiki` – builds the page from the keys below. Without it, the page is a normal Just the Docs page (Home uses this).
- `tagline` – italic line under the title; also the first line of the page's tooltip in link tables. `summary` – the rest of that tooltip. A page with only a `summary` shows just that.
- `intro` – the paragraph under the title.
- `catalog` – a link table. `catalog: true` lists every page whose `parent` is this page's title. Or give a map of `grand_parent`, `group_by` (a front matter key), `columns` (minimum, default 3), `max_columns` (default 5). The table picks whichever column count between the two leaves the fewest empty cells.
- `table` – a search table, by name (a file in `_data/tables/`).
- `quote` – the closing quote, without outer quotation marks.
- `outline` – a list of heading titles. The page gets a right-hand panel linking to each matching heading (section 9.4). Each title must match the heading's text exactly, including curly apostrophes: type `’` itself in both places, since a straight `'` is converted to an entity in the heading and won't match. A title with no matching heading shows in red with a tooltip.
- `unfinished: true` – shows the "not constructed yet" message and Back link. Leave the body empty.
- `nav_exclude`, `search_exclude`, `redirect_url` – Just the Docs and class stub settings. `nav_exclude: true` also hides a page from link tables. `search_exclude: true` keeps a page (or a table page's entries) out of the search bar.
- `nav_order` – only Home uses it. Sections sort alphabetically (`nav_sort: case_insensitive`).

A value can't contain a colon followed by a space, or a space followed by `#`. Wrap it in single quotes if it does.

**Wiki layout order:** title, tagline, intro, page body, link table, search table, divider, quote. Back links are automatic (to `grand_parent`, else `parent`, else Home). Never write one by hand. `[[links]]` in the page body are converted too.

### Placeholder pages
An unfinished page is only front matter plus `unfinished: true`, with a `summary` (and, for subclasses, `tagline: Placeholder`) so its link-table tooltip still reads well:
```
---
title: Chayu
parent: Settings
summary: asian medieval fantasy with ambiguous technology level
unfinished: true
---
```
When you write it for real, delete `unfinished`, add `layout: wiki`, a proper `tagline`/`summary`, and a `quote`.

### Subclass pages
A finished subclass (see `monk-storm.md`, `monk-blade.md`, `monk-backwater-inn.md`) has `title`, `parent` (the class), `grand_parent: Subclasses`, `layout: wiki`, `tagline`, `summary`, `quote`, and an `outline` listing its feature headings. The body is an intro paragraph, then one `## Level N: Feature Name` heading per feature level, with run-in features written as `***Feature Name.*** text`. Headings are bold automatically.

### Class stubs
`subclasses/CLASS.md` exists for each class (Artificer, Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard) with `title`, `parent: Subclasses`, `has_children: true`, `redirect_url: /subclasses/`, `search_exclude: true`, and no body. They only exist to give the sidebar its class folders; visiting one redirects to the Subclasses page. The Subclasses page groups its link table by each page's `parent`, so a subclass shows up under its class automatically.

## 5. Text Rules

Everything passes through `text.html`, so these work everywhere:

- Markdown: `*italic*`, `**bold**`, lists. `<br>` makes a line break (use it in tooltips and stat blocks; in other popups a trailing `\` also works, and a stray `\` means use `\\` or `<br>`).
- Links: `[[Name]]`, `[[Name|label]]`, `[[table:Name]]`, `[[table:Name|label]]`. They open that entry's popup. `table` defaults to the page's own table (inside a popup, the table that popup belongs to). Names are matched by slug, so `Surgeon's Tools` and `Surgeon’s Tools` (curly apostrophe) point at the same entry. Links work across tables: `[[items:Mech Frame]]` in a monster entry opens the item.
- Applies to `intro`, `tagline`, quotes, tooltips, footer text, text cells, popups, and the text the search bar indexes for table entries. It does **not** apply to attributes (search hint, aria labels), number cells, or script wording.

Also:
- **Headings are bold automatically.** Never write `**` in a heading.
- **Quotes:** `{% include quote.html text="..." %}`, without outer quotation marks.
- **Tooltips:** `{% include tooltip.html text="..." %}` prints a full `data-tooltip="..."` attribute. `tooltips.js` only keeps a short list of safe tags (`em`, `i`, `strong`, `b`, `code`, `sup`, `sub`, `del`, `s`, `u`, `a`, `br`); anything else is dropped but its text stays.
- **Italic blocks:** `{: .italic }` on the line after the text. Other classes: `.indent`, `.catalog` (plain table), `.headless` (hide the header row).
- **Dropdowns:** raw HTML with Kramdown attributes, with a blank line after `</summary>` and before each `<details>`:
  ```
  <details markdown="1">
  <summary markdown="span">**Title**</summary>

  Body text
  </details>
  ```

### Content conventions
- The rules text follows the 2024 (5.5e) style: Capitalized terms (Magic action, Bonus Action, Bloodied, Prone, Emanation), "Hit Points", "Proficiency Bonus". Monsters follow the 2025 Monster Manual (MM25).
- Run-in headings: `***Feature.***` (bold italic). Sub-headings inside a feature: `**Name.**`.
- Quiet side rules: a blockquote of italics, opening with `*The following rule isn't often relevant, but may be important when it is.*`, then `> ***Name.*** *text*`.
- Tables inside descriptions end with `{: .catalog }`.

## 6. Themes and Fonts

### Add a Theme
1. Add `_sass/color_schemes/NAME.scss` (copy an existing one).
2. Add `assets/css/just-the-docs-NAME.scss`:
   ```
   ---
   ---
   {% include theme.scss.liquid id="NAME" %}
   ```
3. Add an entry to `themes.yml` (`id` must match both file names; only `id` and `label` are required).
4. To make it the default, set `color_scheme: NAME` in `_config.yml`.

### Theme Keys (`themes.yml`; the file's header comment lists them too)
`id`, `label`, `body_font`, `heading_font`, `font_fallback`, `fonts`, `heading_weight` (default 400), `body_size`, `heading_size`, `background`, `cursor`, `sounds`, `music`, `effects`. Background is section 9.5, cursor 9.6, effects 9.7, sound 9.8.

Current themes: `dungeon` (pixel fonts, torch cursor, torch glow, vignette and stone crumble, dungeon sounds and music), `parchment` (IM Fell fonts, quill cursor, ink writing and ink drip, page sounds), `dark` and `light` (Just the Docs' own colors, basic sounds).

### Add Fonts to a Theme
Put files in `assets/fonts/` (names are case-sensitive, no spaces; `.woff2` is smallest, `.ttf` works). Add one line per file under `fonts:`, then name the families in `body_font` and `heading_font`:
```
fonts:
  - { family: Crimson Pro, file: assets/fonts/CrimsonPro-Regular.ttf }
  - { family: Crimson Pro, file: assets/fonts/CrimsonPro-Italic.ttf, style: italic }
```
`weight` is 400 by default (`"200 900"` for a variable font). `preload: false` skips the early download.

- **Heading weight:** if the heading font has no file at `heading_weight`, the browser fakes bold, which looks smeared. A font with only a Regular file wants `heading_weight: normal`.
- **Text size:** use `body_size` and `heading_size` (percent of normal) to calibrate fonts. They are independent: `_theme.scss` computes `--heading-ratio` so changing one doesn't move the other.
- **How it works:** `theme.scss.liquid` writes one `@font-face` per file plus the Sass variables. `theme-switcher.js` preloads the active theme's font files.

## 7. Search Tables

Put `layout: wiki` and `table: items` in a section page's front matter. A table named `items` uses three files:
- `_data/tables/items.yml` – settings and columns.
- `items/_entries.md` – the entries (the file you edit most).
- `_includes/table/templates/<template>.md` – how fields become popup text.

Current tables: `feats`, `items`, `monsters`, `species`, `spells`. Each table's entries are also searchable from the site search bar (section 9.10).

### Entry Format
`_entries.md` is **not YAML**. A tiny Liquid parser (`parse-entry.html`) reads it, so YAML quoting rules do not apply there.

```text
name: Bloodletting
level: 1
school: Evocation
classes: Cleric, Druid, Warlock
casting_time: Action
range: 60 feet
components: S, M
material: a metal knife and a bowl
duration: Concentration
concentration_max: 1 minute
tags: Damage, Esoteric, Upcast
description: You cause a bleeding cut to suddenly appear on a creature within range.

A second paragraph is fine; it just continues the field above.

---

name: Next Entry
...
```

- Entries are separated by a line that is exactly `---`. Never use `---` inside a description; use `***`.
- One `key: value` per line. Field names are **all lowercase** (letters, digits, underscores). Every other line continues the field above. So a description line that starts with a lowercase word and a colon (`note: ...`) silently becomes a new field. Capitalized `Resistances:` is fine because it isn't recognized as a field name.
- Values are whitespace-trimmed, so a leading space in a value is lost. A field that gets glued onto other text (`condition`, `note_rarity`) must supply its own leading punctuation instead (see below).
- Don't write `{{` or `{%` in entries. Includes are processed as Liquid.
- Lists are comma-separated. Don't put a comma inside parentheses in a list field (`Medium (4–5 ft, stocky)` breaks into two items).
- Write cost and weight as plain numbers (no thousands commas).
- `tags` – comma-separated, shown in the popup.
- `options_KEY` (like `options_rarity`) – other values the entry counts as, for search and filters. Excluding hides the entry only if all its values are excluded.
- `options_cost` and `options_weight` list amounts or ranges, like `50, 200, 3-36`. A slider or Min/Max filter keeps the entry if any amount or range overlaps.
- Entry names must be unique within a table: each row's `id` is its slugified name, and links, deep links, and search results rely on it. Two names that slugify the same (`Bob's` and `Bob’s`) collide.

### Appended Fields (author supplies the punctuation)
Some fields are added to the end of other text exactly as written, with no automatic space, comma, or semicolon. This is on purpose: the template can't know what punctuation the sentence needs, so the entry author writes it.

| Field | Appended to | Example |
|---|---|---|
| `condition` (spells) | the casting time | `condition: , which you take when you are hit by an attack roll` |
| `note_rarity` (items) | the parenthetical after the rarity | `note_rarity: ; See table` |

If an item has `attunement: true` and a `note_rarity`, begin the note with its own punctuation (`; See table`), giving `(Requires Attunement; See table)`. With no attunement the note stands alone, so it is written plainly (`See table`, giving `(See table)`). Without the punctuation, the two run together as `Requires AttunementSee table`.

Not every `note_` field works this way. `note_category` (items) and `note_type` (monsters) get their parentheses from the template, so write only the words (`note_type: Dinosaur`, not `note_type: (Dinosaur)`).

### Named Lists (traits, actions, ...)
Species `traits` and monster `traits`, `actions`, and so on use indented list items. The first key's name is ignored (`trait_1`, anything); its value is the item's title.
```text
actions:
- action_1: Multiattack
  description: The creature makes two Claw attacks.
- action_2: Claw
  description: *Melee Attack Roll:* +4, reach 5 ft. *Hit:* 6 (1d6 + 3) Slashing damage.

  A second paragraph can follow after a blank line.
```
Indent anything starting with `- ` inside a description by two spaces, or it is read as a new item.

### Fields by Table

**Items** (`item.md`): `name`, `prefix_category`, `category`, `note_category`, `rarity`, `options_rarity`, `note_rarity`, `attunement`, `cost`, `options_cost`, `note_cost`, `weight`, `options_weight`, `note_weight`, `setting`, `note_setting`, `variant`, `note_variant`, `tags`, `description`.
- `prefix_category` goes before the category in the popup (`Martial Melee` + `Weapon`); not shown in the table column.
- Rarity: leave blank or `none` for mundane items. `Varies` shows "Rarity Varies". `attunement: true` adds "Requires Attunement". `note_rarity` is appended inside the same parentheses exactly as written (see "Appended Fields" above).
- Cost is in gold: the tenths digit is silver and the hundredths digit is copper (`0.5` = 5 SP, `0.05` = 5 CP, `400.3` = 400 GP 3 SP). `cost: 0` shows as "None", `Varies` and `Priceless` are shown as written. Weight is in pounds (0.1 lb. or less shows in ounces); `0` shows "Weightless".
- `setting` is comma-separated. It auto-adds the Setting-Specific tag, the ☁ marker, and the "can only be found in…" note. Never hand-write any of those. `note_setting` adds a sentence to that note.
- `variant: true` auto-adds the Variant tag and the ⧨ marker. With `note_variant`, it also adds the "Variant." note in the popup.
- Magic items get the ✦ marker, colored by rarity, from the Magic Item tag.

**Species** (`species.md`): `name`, `article` (optional; otherwise a/an is picked from the first letter), `description`, `age`, `type`, `size`, `speed`, `settings`, `tags`, `traits`. Several `type` values join with "and", several `size` values with "or", in the order written. A size's parenthetical (`Medium (about 4–5 feet tall)`) shows in the popup but is hidden in the table column (`plain: true`).

**Spells** (`spell.md`): `name`, `level` (`Cantrip` or 1–9), `school`, `classes`, `casting_time`, `condition`, `ritual` (`true`), `range`, `area`, `components` (`V, S, M`), `material`, `duration`, `concentration_max`, `tags`, `description`.
- `condition` is appended to the casting time exactly as written, so start it with punctuation: `condition: , which you take when you are hit by an attack roll`.
- `area` shows in the Range column as `(30-foot Emanation)`. `concentration_max` shows after Concentration (`, up to 1 minute`) and also sorts the column. `ritual: true` adds "or Ritual" to the casting time.
- `Esoteric` is a tag; the Spells page explains it in a dropdown.

**Monsters** (`monster.md`): `name` (also the stat block title), `size`, `type`, `note_type`, `alignment`, `ac`, `initiative`, `hp`, `speed`, `str`–`cha`, `saves`, `skills`, `resistances`, `vulnerabilities`, `immunities`, `gear`, `senses`, `languages`, `cr`, `settings`, `tags`, `flavor`, and the sections below.
- Sections, in the order shown: `traits`, `actions`, `bonus_actions`, `reactions`, `charged_actions`, `legendary_actions`, `regional_effects`. Each is a named list.
- **Section intro and outro.** Each section can have an optional intro paragraph named `intro_KEY` (like `intro_charged_actions`, `intro_legendary_actions`), shown between the heading and the list. It can also have an optional outro paragraph named `outro_KEY` (like `outro_regional_effects`), shown right after the list. Both accept Markdown and `[[links]]`. **Neither is styled automatically.** If you want an intro in italics, wrap it in asterisks yourself, and give each paragraph of a multi-paragraph intro its own pair. A section with neither field is unchanged. An intro or outro with no matching list shows nothing, because an empty section is skipped. Intros and outros are not searched by the search bar.
- **Subtype.** `note_type` is the creature's subtype, shown in parentheses right after the type in the summary line: `size: Large`, `type: Beast`, `note_type: Dinosaur` reads "Large Beast (Dinosaur)". Write only the words (the parentheses come from the template) and leave the field out when there is no subtype. It appears on the stat block only. The table's Creature Type column, search, and filters don't see it, so use a tag (like `Skith` or `Welterbeast`) for anything you want to filter by.
- **`cr` is required.** Write a plain number (fractions as decimals: `0.125`, `0.25`, `0.5`; search `cr:0.5`, not `1/2`), or `None` (any capitalization). Proficiency Bonus and XP come from `challenge.yml`.
  - **Normal CR:** the stat block shows `CR 8 (XP 3,900; PB +3)`. Saves with proficiency get the Proficiency Bonus added automatically.
  - **Lair XP is automatic.** A monster with a `regional_effects` section is worth the XP of the next CR up (MM25 rule), shown as `CR 8 (XP 3,900, or 5,000 in lair; PB +3)`. The "next CR" is simply the next row of `challenge.yml`, so keep that file in order. CR 30 has no next row and shows no lair XP. Don't type lair XP by hand.
  - **`cr: None` is for summons** (subclass features, spells). The stat block shows `CR None (XP 0; PB equals your Proficiency Bonus)`. Because the PB isn't known, each proficient save is shown as the modifier plus the text `+ PB` (`+5 + PB`). Passive Perception is unaffected, since it never uses PB (see below). Type any attack bonuses or DCs that use PB however you like (`PB + 4` and so on). No lair XP is ever shown for `None`.
  - In the table, `None` sorts first (the `cr` column's `order` is `[None, "..."]`), searches as `cr:none`, and is skipped by a Min/Max CR filter.
- Scores give modifiers and saves automatically; `saves: Dex, Wis` adds the Proficiency Bonus to those.
- `initiative` is optional and replaces the computed value. `skills`, `resistances`, `vulnerabilities`, `immunities`, `gear`, `senses`, `languages` are free text and show only if present.
- Passive Perception is added to the Senses line automatically for every monster, including `cr: None` ones. It is 10 plus the Perception bonus if a Perception skill is listed, otherwise 10 plus the Wisdom modifier. Proficiency Bonus is never added on its own, so a summon with no Perception skill gets a plain Wisdom-based number. Don't type it. Write negative bonuses with a plain hyphen (`Perception -1`), and write a listed Perception bonus as a plain number.
- A blank `settings` shows as "Any" in the table.
- `size` joins with "or", `type` with "and". Tag `Swarm` and the heading becomes "Swarm of" + size + plural type (e.g. "Swarm of Tiny Beasts"). A `note_type` goes after the plural type and is not pluralized ("Swarm of Tiny Beasts (Rat)"). Irregular plurals live in `plurals.yml`.
- Summary line order: size, type, subtype in parentheses, then a comma and the alignment ("Large Monstrosity (Welterbeast), Chaotic Evil").
- Auto tags: Legendary (has `legendary_actions`), Boss (has `charged_actions`), Lair (has `regional_effects`), Spellcaster (has an action named "Spellcasting"). Don't hand-write them.
- `flavor` is one optional italic paragraph at the bottom.
- The Monsters page explains Charged Actions in a dropdown.

**Feats** (`feat.md`): `name`, `category`, `prerequisite`, `repeatable` (`true`/`false`, blank is false), `tags`, `description`. The popup shows the category, the prerequisite, and the description; `repeatable` is only for searching and filtering.

### Table Settings (`_data/tables/NAME.yml`)
- `template` (required), `noun` ("Showing 5 of 20 items"), `default_sort` (column key; default the first), `default_dir` (`asc`/`desc`), `placeholder` (search hint; default in `strings.yml`).
- `search_fields` – which entry fields the **site search bar** reads for this table's entries (section 9.10). Default `[description]`. Set it for tables whose text isn't in `description`: monsters use `[flavor, traits, actions, bonus_actions, reactions, charged_actions, legendary_actions, regional_effects]`, species use `[description, traits]`. Named-list fields are rendered the same way the popup does. This does not affect the table's own search box.
- `dialog` – optional popup style class `st-dialog--NAME`. Only `statblock` exists.
- `tags` – the tags the Filter panel offers, in order, even if unused. A tag an entry uses that isn't listed shows in red in its popup and turns its row red. `tags: false` hides tags in the panel and popup (search still understands them).
- `auto_tags` – rules adding a tag automatically. Also add the tag to `tags`. Rule keys:
  - `tag` – the tag to add.
  - `field` – the entry field to look at (comma-separate several; any one firing is enough).
  - `equals` – fire only when the field equals this (case-insensitive). Omit to fire whenever the field has a value.
  - `item` – for named-list fields: fire when an item with this title exists (`{ tag: Spellcaster, field: actions, item: Spellcasting }`).
- `markers` – symbols next to names: `symbol`, `tag` (show only for entries with this tag), `color_by` (entry field whose value picks the color from `$marker-colors`; no match means the default link color), `label` (hover text prefix).
- `limit_default` (500), `limit_min` (50), `limit_max` (1000), `limit_step` (50) – the results-shown slider. Defaults are in `search-table/main.js`.
- `columns` – below. The first column is always the name.

### Column Options
**Core**
- `key` (matches the entry field), `label` (heading).
- `type`:
  - `text` (default; substring search)
  - `list` (`a, b, c`; each item searched and filtered separately)
  - `rank` (ordered categories; sorts by `order`; search matches the whole value)
  - `number` (sorts by amount; Min/Max filter or slider)
  - `measure` (amounts with units like `10 minutes`; sorts by `units`; filters with `buckets`)
- `abbreviate` – shows the first N letters of each comma-separated part plus a period, with the full name in the hover bubble. Text and list columns only (not with `format`, `symbols`, or numbers). Popup, filters, and search use full names. Plain text only.
- `order` – the Filter buttons' categories, in order, even if unused. A list, or the name of a list in `lists.yml` (an unknown name logs a warning in the console). Rank, number, and measure columns also sort by it. An unlisted cell value turns red (unless a number or measure column can read it as an amount). Without `order`, the column gets no buttons and nothing is flagged. A quoted `"..."` marks where amounts go: names before it sort first, names after it sort last; without it, amounts come after all names. (The monsters `cr` column uses `[None, "..."]`; the items `cost` column uses `[None, "...", Varies, Priceless]`.)
- `blank_as` – blank entries count as this value in search, filters, and sorting. The cell shows its `symbols` entry if any, otherwise the value (or "—" when there is none). A blank cell in a column without `blank_as` (and not `in_table: false`) is highlighted red as missing.

**Display**
- `format: cr` (`0.5` shows `1/2`), `money` (GP/SP/CP), `weight` (0.1 or less in ounces, others in pounds), `signed` (`+3`, `−1`). Display only; sorting and filters use the exact number. Anything that isn't a plain number (like "Varies" or "None") is shown as written.
- `prefix` and `suffix` for other numbers. `unit` shows in the Filter heading ("Cost (GP)").
- `zero_label` – a value of exactly `0` shows as this word (like `Weightless`) in the table and popup.
- `plain: true` – list cells hide "(notes)".
- `symbols` (value to icon) and `labels` (value to friendly text, also used on Filter buttons). Quote `"true"` and `"false"` keys.
- `in_table: false` – searchable and filterable but hidden from the table.
- `note` – adds an entry field to the cell: `field`, `format` (`%s` for the value; default ` (%s)`), `show_if` (only when the entry's value equals it), `sort: true` (also sort by the note's value). Works on text columns only, not list columns.

**Behavior**
- `sortable: false`, `filter: false` (skip its Filter group), `match: exact` (default for `rank`).
- `units` – measure columns: unit word to size, like `{foot: 1, feet: 1, mile: 5280}`. Plurals ending in "s" match automatically.
- `slider` – number columns: `{ max, min_label, max_label }` makes a double-ended slider. Positions: `0` (min label, no lower limit), `1` to `max` (amounts), `max+1` (max label, no upper limit). Entries whose text equals a label count as 0 or infinity.
- `buckets` – replaces the `order`-based buttons. A plain word matches that exact value. `{ label, up_to }` catches amounts up to that size (using the column's `units`). `{ label }` with no `up_to` catches every larger amount. List amount buckets smallest to largest.

### Shared Lists
`lists.yml` holds lists used by several tables (`order: settings`). To add a world, add its name to `settings` there and create its page in `settings/`. The list must stay in step with the pages, because a `settings` value missing from the list shows in red.

### Search Box
- Plain words search names. `field:value` searches a column (`classes:wizard`). `"quoted phrase"` keeps words together. `-word` excludes.
- `#tag` or `tag:word` searches tags.
- Numbers accept `cost:>=100`, `cost:<50`, `weight:1-5`, `cr:0.5`. Words in a number column match its text (`cr:none`).
- The Filter panel: click a button once to include, twice to exclude, three times to clear. Tags match all included tags unless "Match any" is ticked.
- This is the table's own box. The sidebar's search bar is separate (section 9.10).

## 8. How a Table Is Built

Liquid builds each row and popup at build time; a script then makes it interactive. They share these attributes:
- `data-config` on `.search-table` – the table's settings file as JSON.
- On each row: `id` (slugified name), `data-tag-names`, `data-v-KEY` (lowercase displayed value), `data-o-KEY` (the `options_` values), `data-s-KEY` (sort override from a column `note`).
- Popup HTML sits in `.st-details`, one `<div data-for="ROW-ID">` per entry. `deeplink.js` opens a popup when the URL ends in `#entry-name` (after the entrance screen is passed), and removes the hash again when the popup closes.

The build steps in `search-table.html`: read `_entries.md` from the page's own folder (`include_relative`), split on `---`, parse each entry into packed fields, compute tags (including `auto_tags`), build each row's cells and the popup from the template, then wrap everything in the toolbar, table, and dialog markup. Every variable it creates starts with `st_`.

**Scripts (`assets/js/search-table/`).** The first four never touch the page, so they can be tested alone.
- `utils.js` – `t()` wording helper (reads `strings.yml`), number syntax (`NUMBER`, `parseSpan`), small DOM helpers.
- `columns.js` – column types. **To add a type, add one line to `TYPES`.** Also prepares each column and adds the tag column (tags behave as one more list column, so search, filters, and sorting need no special cases).
- `records.js` – reads rows into records, sorts, flags unlisted values.
- `query.js` – parses the search box and matches terms. `filters.js` – Filter panel state and matching.
- `panel.js` – the Filter panel's buttons, boxes, and sliders (not the side panels of section 9.4). `dialog.js` – the popup (announces `popupopen` and `popupclose`). `deeplink.js` – popup from the URL. `main.js` – wires it together.

## 9. Site Features

### 9.1 Events and Stored Settings
Scripts that don't know each other communicate through events on `document`. To react to something new, listen for an event; don't call another script's functions.

| Event | Sent by | Meaning |
|---|---|---|
| `themechange` | `theme-switcher.js` | Theme switched. `detail` is the theme `id`. Sent after the new stylesheet is in place. |
| `popupopen`, `popupclose` | `search-table/dialog.js` | A table popup opened or closed. |
| `hoverstart`, `hoverend` | `site/hover.js` | The pointer entered or left something clickable (section 9.6). Neighboring clickables with no gap count as one hover. |
| `gateenter` | `site/gate.js` | Entrance screen clicked. |
| `gateopen` | `site/gate.js` | Zoom is over; the screen is fading away. |
| `fxsound` | `site/effects.js` | An effect asked for a sound. `detail` is the sound name. `audio.js` plays it. |
| `layerraised` | `site/effects.js` | An effect's top-layer element was re-raised above a popup. `cursor.js` re-raises the fake cursor so it stays on top. |

The active theme's `id` is always on `<html data-theme="...">` (CSS: `html[data-theme="dungeon"]`). `site/shared.js` is the shared toolbox: `root`, `FINE_POINTER` and `CALM` (media queries: mouse available, reduced motion), `hoverableFrom`, `waiting()` (is the entrance screen still pending?), `announce(type, detail)`, `themeConfig(id)`, `cssVar(name)`, `onThemeChange(fn)` (runs `fn` now and after every switch), `load(key, fallback)` / `save(key, value)`, `posterize`, and `fadeOut`.

**Data handed to scripts.** `head_custom.html` writes these globals from `_data/` before any module runs: `SITE_STRINGS`, `SITE_LISTS`, `SITE_AUDIO`, `SITE_INTERACTIVE` (the clickable selector as one string), `SITE_THEMES`, `SITE_DEFAULT_THEME`, `SITE_ROOT`, `SITE_SESSION`, and `SITE_BUILD`. To give a script a new data file, add a global there.

**Stored settings.**

`localStorage` (every read and write is wrapped in `try`/`catch`):

| Key | Set by | Value |
|---|---|---|
| `theme` | `theme-switcher.js` | a theme `id` |
| `left-collapsed`, `right-collapsed` | `panel-toggle.js` | `true` / `false` (one key per side panel; section 9.4) |
| `text-size` | `text-size.js` | a percent, like `110` |
| `sound-effects`, `sound-music` | `audio.js` | `true` / `false` |
| `last-seen` | `session.js` | last time any page was open, in ms |
| `gate-passed` | `gate.js` | `true` once the entrance screen was clicked this visit |
| `music-state` | `audio.js` | playlist, song, and position where the last page left off |
| `effect-timers` | `effects.js` | when each persistent effect fires next |

`sessionStorage` (per tab): `effects-snapshot` (effect classes and variables, section 9.7) and `cursor-position` (so the animated cursor doesn't jump on page change).

The scripts outside `site/` (`session`, `theme-switcher`, `text-size`, `panel-toggle`) write plain strings. Scripts in `site/` use `load`/`save`, which JSON-encode. Booleans and numbers look the same either way; a plain string like the theme `id` does not, so read each key with the same style that wrote it.

### 9.2 Visits and the Entrance Screen
A "visit" lasts until the site has been closed, in every tab, for `timeout` minutes (`session.yml`).

- While any page is open, `session.js` writes `last-seen` every 15 seconds and on page leave. When a page loads and `last-seen` is missing or too old, the visit is over: the keys in `reset`, plus `gate-passed`, `music-state`, and `effect-timers`, are removed.
- The entrance screen shows when `gate-passed` is missing. `session.js` sets `<html data-gate="pending">` before paint (CSS hides the page, not the gate). `gate.js` opens the gate as a modal `<dialog>`, so the page is unclickable underneath. Escape can't close it.
- **Settings (`gate.yml`):** `enabled`; `image` (the picture); `focus` (the point the image zooms into, `x y` from the top-left); `scale` (how far it zooms); `zoom`, `darken`, `fade` (three durations in seconds).
- **The click sequence:**
  1. Click (or Enter): `.is-opening` is added and `gateenter` is announced (door sound, music permission unlocked).
  2. For `zoom` seconds the picture zooms into `focus`. The Enter button fades away. Over the last `darken` seconds of the zoom, a black layer fades in, so the screen is fully black exactly when the zoom ends.
  3. Zoom over: `gate-passed` is saved, `data-gate` becomes `open`, `.is-leaving` fades the dialog out over `fade` seconds (a fade from black to the site), and `gateopen` is announced (music and gate-blocked effects start).
  4. After the fade, the dialog closes.
- **Reduced motion:** all three durations become 0 and the zoom scale becomes 1, so entering is instant.
- **The fade is the dialog's `opacity`.** `::backdrop` ignores it, so `_gate.scss` makes the backdrop transparent and lets the dialog paint the screen.
- The picture slides with the mouse via the `parallax-layer` mixin and is drawn pixelated. If `image` is empty, the screen is a plain colored panel with the button.
- If storage is blocked, visits can't be tracked, so both the reset and the entrance screen are skipped. If `timeout` is missing or not positive, `session.js` warns in the console and visits never expire (a missing value must never count as 0). If `gate.js` fails, the page appears after 5 seconds (`data-gate-late`). If there is no `#gate` element, `session.js` warns and skips the screen.
- **Check by hand:** `SITE_SESSION` in the console shows the settings (`timeout` should be a number). `localStorage` `last-seen` should keep changing; `gate-passed` should be `true` after entering. `document.getElementById('gate')` should print the dialog. To see the entrance screen again, delete `gate-passed` and reload.
- `data-gate` is missing (no gate), `pending`, or `open`. `audio.js` stays silent and `effects.js` and `deeplink.js` wait while it is `pending`.

### 9.3 The Dock
The Sound, Size, and Theme buttons at the bottom right. Markup: `footer_custom.html`; behavior: `site/dock.js`; styles: `_dock.scss`.
- Each `.dock-item` holds a button and its `.dock-menu` (starts `hidden`). One menu is open at a time; clicking outside or pressing Escape closes all. A `role="menuitem"` button also closes its menu; checkboxes and plain buttons don't.
- The theme menu is built from `themes.yml`. The Sound menu's two checkboxes are `data-sound="effects"` and `"music"`. The Size menu reads its limits from `text_size.yml`.
- **Add a button:** copy a `.dock-item`, give the menu and button matching `id` and `aria-controls`, add wording to `strings.yml`.
- **Dock sizes are in `px` on purpose.** If it scaled with the Size buttons, they would move out from under the pointer while clicking.

### 9.4 Side Panels (Left Navigation, Right Outline)
Just the Docs' sidebar is replaced by two panels of our own.

- **Markup:** `components/sidebar.html` builds them. `panel.html` is the one reusable panel (params: `side`, `title`, `href`, `body`, optional `footer`, optional `menu`). `panel-toggles.html` adds the hide/show buttons. `outline.html` fills the right panel's body.
- **Left panel:** the site title (links home), the Just the Docs navigation (`components/site_nav.html`), and the `nav_footer` line. From the md breakpoint up it is a fixed box beside the content. Below md it is the top bar, and the `menu` button (`#menu-button`, wording `menu_toggle`) opens the navigation.
- **Right panel:** only on pages with an `outline` (section 4). `head_custom.html` adds `has-right` to `<html>` before paint when the page has one. It shows only when the window is wide enough for sidebar + content + panel (`toc-fits` in `_helpers.scss`); on narrower windows it is hidden and so is its button. `outline.html` looks for each title as the text of a heading in the page's rendered content and links to that heading's `id`. A title with no matching heading shows in red with a tooltip (`outline_missing`). The heading itself isn't changed.
- **Hide and show:** each panel has a round button (`data-panel-toggle="left"` / `"right"`). `panel-toggle.js` toggles `left-collapsed` / `right-collapsed` on `<html>` and saves each as its own `localStorage` key of the same name. On load it re-applies every saved `*-collapsed` key before paint, so there is no flash. A collapsed panel slides under the content (`panel-under-main`) and is hidden after the slide.
- **Layout:** `_panels.scss` keeps one number, `--main-left`, which says where the content column starts. It centers the content between the panels (`--left-w` and `--right-w` are 0 when a panel is hidden) and never lets it go under the left panel or its button (`--left-min`). Each panel follows `--main-left`. `--main-left` is registered with `@property` in `head_custom.html` so the browser can animate it.
- **Per-side settings:** the `$panels` map in `_helpers.scss` (`width`, `start`, `edge`, `clear`). `_panels.scss` loops over it, so a new panel side needs a map entry and a `panel.html` call, not new CSS. Sizes: `$toc-width`, `$toggle-size`, `$toggle-inset` in `_settings.scss`; the left panel's width is Just the Docs' `$nav-width`.
- **Look:** the panel color is `$sidebar-box-color`: the sidebar color, slightly see-through when the theme has a background image (`$panel-opacity`). Titles use the theme's heading font and `$panel-title-size`.
- The vignette effect also paints over each panel (`html.fx-vignette .panel--SIDE::after`), and the stone crumble shake moves the panels and buttons with the page.
- Panel scrolling uses the custom scrollbar when the animated cursor is on (`.panel-body` is in `scrollbar.js`'s `SCROLLERS`).

### 9.5 Background and Parallax
- `background: assets/images/.../NAME.webp` in a theme. Without it, the theme keeps its plain color and no background CSS is built.
- `theme.scss.liquid` writes `$theme-background`; `_background.scss` draws it on `body::before`, a fixed layer slightly bigger than the screen. `parallax.js` writes `--parallax-x` and `--parallax-y` (-1 to 1) from the mouse (not for touchscreens or reduced motion). The slide itself is the `parallax-layer` mixin (also used by the entrance screen).
- `.main` and the side panels are slightly see-through (`$panel-opacity`). If the picture is hidden, another element has a solid background; add it in `_background.scss`.
- **Image:** 2560 × 1440 px WebP, ideally under about 500 KB, scaled to cover and cropped, so keep detail near the middle. Keep `$parallax-range` smaller than `$parallax-margin`.

### 9.6 Custom Cursor and Hover
Set per theme in `themes.yml`:
```
cursor:
  image: assets/images/cursors/torch-orange.webp
  pointer: assets/images/cursors/torch-blue.webp
  animated: true
  size: 32
  hotspot: 16 16
```
- `image` – the cursor. `hotspot` – `x y` in displayed pixels, the exact clicking point (default `0 0`). `pointer` – optional image over links and buttons (default `image`).
- **Static (default):** pure CSS. `theme.scss.liquid` writes `$theme-cursor` and `$theme-cursor-pointer`, and `_cursor.scss` applies them with `!important` (Just the Docs sets `cursor: pointer` in many places). Use a 32 × 32 px transparent WebP or PNG (browsers allow up to 128 × 128, but Chrome hides cursors over 32 × 32 near the window edge). Browsers show only the first frame of animated files. A missing image falls back to the arrow. To check: open the theme's stylesheet and search for `cursor:`.
- **Animated (`animated: true`):** browsers can't animate a native cursor, so `site/cursor.js` hides the real one (`html.fake-cursor`, which `theme-switcher.js` also sets early) and moves `#site-cursor` to the pointer once per frame. It is a `popover="manual"` element, which puts it in the browser's top layer above the dialogs; the script re-raises it on `popupopen` and `layerraised`. `image` can be an animated `.webp`, `.gif`, `.apng`, or a `.webm`/`.mp4` video (chosen by extension; videos autoplay, muted, looped). `size` is the displayed width (default 32); the hotspot is in those pixels. `theme.scss.liquid` skips the native cursor for animated themes. Both current fancy themes are animated.
- Animated WebP is the best format: smooth transparency everywhere. GIF has only on/off transparency, and WebM transparency doesn't work in Safari.
- The fake cursor is off for touchscreens (`FINE_POINTER`) and themes without `animated`. It trails the real pointer by about one frame and appears after the first mouse move.

**What counts as "hovering" (one list, two readers).** The list lives in `_data/interactive.yml`, one CSS selector per item (links, buttons, summaries, selects, labels, checkboxes, menu items, table rows). Liquid writes it to both sides:
- **JavaScript:** `head_custom.html` writes `window.SITE_INTERACTIVE` (the items joined with `, `). `site/shared.js` reads it as `INTERACTIVE`, and `hoverableFrom` uses it (excluding anything inside the entrance screen). `hover.js` announces `hoverstart`/`hoverend`, which swap the cursor to its `pointer` image, play the `hover` sound, and switch the torch glow to its blue palette.
- **Sass:** `theme.scss.liquid` writes `$interactive-selector`, and `_cursor.scss` uses it (`#{$interactive-selector} { ... }`) for the static pointer cursor.

To add or remove a clickable kind of element, edit only `interactive.yml`. Rules for the file:
- Use **single quotes** inside selectors (`"input[type='checkbox']"`), so the string prints safely into Sass.
- Quote any item that starts with `[` (YAML would read it as a list).
- `theme.scss.liquid` prints the list with no `default:` on purpose: if the file goes missing, the Sass build fails loudly instead of every hover effect silently vanishing.

### 9.7 Ambient Effects
Theme-specific effects: one small file each, listed per theme in `themes.yml`:
```
effects:
  - { id: torch-glow, x: 16, y: 16 }
  - { id: vignette }
  - { id: stone-crumble }
```
An entry is `{ id: NAME, ...options }` or just `NAME`. The options are handed to the effect and override its `DEFAULTS` (each effect's defaults are listed, with units, at the top of its file).

- `site/effects.js` runs on every theme change and on `gateopen`. It stops the old theme's effects, then starts the new theme's list, so effects never pile up. Each file loads on demand (`import()`), so themes without effects download nothing.
- **Gate and calm rules:** while the entrance screen is pending, only effects with `export const gateSafe = true` start; the rest wait for `gateopen`. With reduced motion, only effects with `export const calmSafe = true` start.
- **An effect file** exports a default function that receives `ctx` and may return a cleanup function:
  ```js
  export default function myEffect(ctx) {
    ctx.timer(() => { /* add an element to ctx.layer */ }, 8, 20);
  }
  ```
- **The `ctx` toolkit:**
  - `options` – the entry's other keys (including `id`).
  - `layer` – this effect's own full-screen `.fx-layer` (never blocks clicks; removed on stop).
  - `random(min, max)`.
  - `on(target, type, handler)` – a listener removed on stop.
  - `timer(run, min, max, persist)` – runs `run` every min to max seconds, skipping hidden tabs; cleared on stop. With `persist` true, the next firing time is saved (`effect-timers`, keyed by the effect's `id`), so changing pages doesn't restart the wait. The countdown continues across the whole visit and resets when a visit ends. If you shorten `max`, an older saved wait is capped to it.
  - `topLayer()` – makes a second full-screen layer in the browser's top layer, so it draws above open popups. It is re-raised on `popupopen`, and announces `layerraised`.
  - `painter(draw, host)` – makes a canvas in `host` (default `layer`) sized to the window. `draw(pen, now)` paints one frame and returns `true` while it has more to animate. Returns `wake()`, which starts the animation loop again. No loop runs while nothing is drawn.
  - `sound(name)` – plays `name` from the theme's sound set in `audio.yml` (the Sound menu and entrance silence apply automatically).
  - Everything registered through `ctx` is undone automatically.
- **Effects survive page changes without flashing.** `effects-snapshot.js` (loaded right after `theme-switcher.js`) saves every `fx-` class and `--fx-` CSS variable on `<html>` when a page is left and puts them back on the next page, but only if the site build, theme, and window size are unchanged. So **any class or variable an effect leaves on `<html>` must start with `fx-` / `--fx-`** and be removed in the effect's cleanup.
- **To add an effect:** create `effects/NAME.js`, add it to a theme's `effects`, put its CSS in `_effects.scss` and settings in `_settings.scss`, and add any sound names to that theme's set in `audio.yml`.
- **Torch glow (`torch-glow.js`):** adds `html.fx-torch-glow` and sets `--fx-torch-glow-x` and `--fx-torch-glow-y` from the options `x` and `y` (where the flame sits in the cursor image, in displayed pixels from its top-left). CSS draws a soft light as the `::before` of `#site-cursor`, redrawn as a small pixel sprite a few times a second so it flickers; it turns blue over clickable things. It needs an `animated: true` cursor. Settings: `$torch-glow-color`, `$torch-glow-core-color`, `$torch-glow-link-color`, `$torch-glow-link-core-color`, `$torch-glow-size`. Reduced-motion visitors get a steady glow. To aim it live: `document.documentElement.style.setProperty('--fx-torch-glow-x', '12px')`.
- **Vignette (`vignette.js`):** a pixelated dark border drawn over the page, the side panels, and the entrance screen. Settings: `$vignette-color` and the file's options (`cell`, `levels`, `start`, `strength`).
- **Stone crumble (`stone-crumble.js`):** every `min` to `max` seconds (default 120 to 300, persistent), the screen shakes, dust drifts in from the edges, stones fall, and the `crumble` sound plays. Options: `min`, `max`, `duration`, `stones`, `stoneSize`, `dust`, `dustSize`, `dustFadeIn`, `dustFadeOut`, `shake`. Colors: `$stone-*`, `$dust-color`, `$dust-opacity`; sprite size: `$effect-pixel`. To test it quickly, set `min: 5, max: 10` on its `themes.yml` entry (and delete `effect-timers` from `localStorage`).
- **Ink writing (`ink-writing.js`):** hold Shift and drag with the left mouse button to draw a line of ink that holds for `hold` seconds, then fades over `fade`. Not used on inputs. The click that ends a stroke is swallowed so it doesn't open anything. When a popup is open, the stroke is drawn on a top-layer canvas so it shows above the popup. Options: `width`, `hold`, `fade`, `gap`. Also runs under reduced motion (`calmSafe`).
- **Ink drip (`ink-drip.js`):** when the pointer rests for `idle` seconds, drops of ink fall from the cursor every `min` to `max` seconds and land in pools that grow with each drop and then fade (`hold`, `fade`). Ignores touch. Options: `idle`, `min`, `max`, `slop`, `dropSize`, `fallMin`, `fallMax`, `fallTime`, `poolStart`, `poolGrow`, `poolMax`, `hold`, `fade`. Doesn't run under reduced motion.
- Ink color is `$ink-color` (default: the theme's text color), written to `--ink-color`. `$ink-layer-z` sets the height of the writing layer, just under the scrollbars.

### 9.8 Sound
Settings: `audio.yml`. Behavior: `site/audio.js`. The Sound menu has two checkboxes (`data-sound="effects"` and `"music"`).
- `defaults` is what first-time visitors get (music on, since clicking the entrance screen grants playback permission). `volume` runs 0 to 1.
- **Sets** are groups of effect files; a theme picks one with `sounds: NAME` (none means silent). Events: `hover` (pointer enters a clickable), `open` and `close` (table popup), `enter` (entrance screen), `transition` (a page change within the site, or coming back with the Back button), plus any name an effect requests with `ctx.sound()` (like `crumble`). A missing event is silent. Dark and Light share the `basic` set.
- **Playlists** are named lists of music files; a theme picks one with `music: NAME`. When a song ends, another is picked at random (never the same twice in a row, unless it's the only one, which loops).
- **Saved position:** on page leave, `audio.js` saves the playlist, song, and position (`music-state`). The next page resumes there if its theme has the same playlist. Forgotten when a visit ends.
- Music pauses when the tab is hidden and stays silent until the entrance screen is passed. If the browser blocks it on a later page, it starts on the first click or key press.
- Use `.mp3` or `.ogg` (the current files are `.ogg`). Keep effects short (under about a second). A missing file fails silently.

### 9.9 Text Size, Checkboxes, Scrollbars
- **Text size:** settings in `text_size.yml`. `text-size.js` runs in the head and sets an inline `font-size` on `<html>`, `!important`, as `calc(PERCENT% * var(--body-scale, 1))`, where `--body-scale` is the theme's `body_size` (so the buttons adjust from each theme's base and follow theme switches). Everything is sized in `rem`, so it all scales together except the dock. Text that doesn't scale is in `px` somewhere.
- **Checkboxes:** `_checkbox.scss` restyles every `<input type="checkbox">` in the color scheme's colors. A new checkbox needs no class. Don't add `accent-color`. Size is `$checkbox-size`, in `em`.
- **Scrollbars:** only active together with the animated cursor (a hidden real cursor needs a drawn scrollbar). `scrollbar.js` hides the native scrollbars (`html.fake-cursor`) and draws a track and thumb for the page and for each selector in its `SCROLLERS` list (popup, table wrapper, side panel body). Dragging the thumb or clicking the track works; wheeling over the track glides smoothly. To give a new scrolling box a custom scrollbar, add its selector to `SCROLLERS` (the box must exist when the page loads). Tuning numbers (`MIN_THUMB`, `PAGE_STEP`, `LINE`, `EASE`) are at the top of the file; colors and size are in `_scrollbar.scss`.

### 9.10 Site Search (the Search Bar)
The search bar at the top of the left panel is Just the Docs' own (Lunr). It loads `/assets/js/search-data.json` and searches that. The theme only knows about pages, so on its own it can't see search-table entries, which aren't pages. Our copy of the index template adds them.

**What gets indexed**
- **Pages:** the theme's own logic, untouched: one record per page and per `h2` section, skipping `search_exclude: true` pages.
- **Table entries:** one record per entry of every table whose page has `table:` in its front matter (and isn't `search_exclude`). The record's `doc` is the table page's title ("Items"), `title` is the entry name, `content` is the entry's text as plain words, and `url` is the table page plus `#entry-slug`. Clicking a result opens that entry's popup through `deeplink.js`.
- **Entry text:** the fields listed in the table's `search_fields` (default `description`; section 7). Each field goes through the same rendering as the popup (`named-list.html` for lists, then `text.html`), so `[[links]]`, `***run-in headings***`, and tables become plain words. Typographic entities are turned back into plain characters.

**How it is built**
- `zzzz-search-data.json` at the **repo root** is a copy of the theme's `assets/js/zzzz-search-data.json` (v0.12.0), plus a block at the end commented as table entries (all its variables start with `sx_`). It keeps the theme's permalink, `/assets/js/search-data.json`.
- It is at the root because entries are read with `include_relative`, which resolves relative to the **page being rendered**, not the file the tag is in, and can't use `../`. At the root, `items/_entries.md` is reachable.
- `assets/js/zzzz-search-data.json` is a stub with a different permalink (`/assets/js/unused-theme-search-data.json`) and no body. A local file at the theme's path replaces the theme's copy; without the stub both files would write `search-data.json`. Never delete it.
- The `zzzz-` name keeps the file last among root pages. Pages in folders are rendered before root pages, so every page's `content` is already HTML when the index reads it, which the theme's heading splitting needs.
- The block splits `_entries.md` on `---` lines the same way `search-table.html` does. That logic exists in two places; if the entry format ever changes, change both.
- The table's page path comes from the page that has `table: NAME` (`page.dir`), so a table's folder must hold that page and its `_entries.md`, as it already must for the table itself.

**Using it**
- **New table or entries:** nothing to do for tables whose text is in `description`. Otherwise add `search_fields` to the table's settings file.
- **Check it:** open `/assets/js/search-data.json` on the live site (add the `/johns-dungeon` base path). Entries appear after the page records, with the table's title as `doc`. If the file is empty or missing, the build failed; look at the Actions tab.
- **Exclude a table:** `search_exclude: true` on its page.
- **Not indexed:** monster intros and outros, tags, and column values (table cells such as cost or CR). Use the table's own search box for those (section 7).
- **Apostrophes:** the index keeps whichever apostrophe the entry uses, so `Alarcon's` and `Alarcon’s` are different words to the search. Entity forms (`&rsquo;`) are converted to a straight `'`.
- **Index size:** the file grows with the number of entries and the length of their text, and is downloaded by the search bar on every page. If it ever becomes slow, trim `search_fields` (for example, drop long action lists first).

## 10. Recipes

### Add an item, spell, species, monster, or feat
1. Open the table's `_entries.md`.
2. Add a line `---` after the last entry, then the new entry's fields (section 7, "Fields by Table"). Copy a similar entry as a starting point.
3. Use only listed values for the `order`ed columns (category, rarity, school, settings...). Unlisted values show in red; add the value to the column's `order` (or to `lists.yml`) if it is genuinely new.
4. Use only tags from the table's `tags` list. Don't type auto-tags.
5. If a field is appended to other text (`condition`, `note_rarity`), start it with its own punctuation (section 7, "Appended Fields").
6. Commit, wait for the build, hard refresh, open the entry's popup and check it. It should also be findable in the sidebar search bar (section 9.10).

### Add a summon
A summon (from a spell or subclass feature) is a normal monster entry with `cr: None`. Leave out `settings` unless it belongs to a world. Write `saves` as usual (each proficient save will show `+ PB`), and type attack bonuses and DCs in terms of PB or the summoner's modifiers. Passive Perception still appears and comes from Wisdom or a listed Perception bonus. Section 7 (Monsters) lists exactly what `None` changes.

### Add a tag
Add it to `tags` in the table's `.yml`. If it should be added automatically, add an `auto_tags` rule too (section 7).

### Add a setting (world)
1. Create `settings/NAME.md` (copy a placeholder page from the Placeholder pages example in section 4).
2. Add the name to `settings` in `_data/lists.yml`.
3. Use it in `setting:` (items) or `settings:` (monsters, species) in entries.

### Add a subclass
1. Make sure `subclasses/CLASS.md` exists (class stub, section 4).
2. Create `subclasses/CLASS-NAME.md` with `title`, `parent: CLASS`, `grand_parent: Subclasses`, plus either the placeholder keys or the full keys, including `outline` (section 4).

### Add a page outline (right panel)
Add `outline:` to the page's front matter, one quoted title per heading, in the order they appear:
```
outline:
  - "Level 3: Blade"
  - "Level 6: Hone"
```
Each title must match its heading's text exactly (use the literal `’` if the heading has an apostrophe). A title with no match shows in red in the panel; fix the spelling or the heading.

### Add a rules page
Create `rules/NAME.md` with `title` and `parent: Rules` (plus `unfinished: true` while empty). The Rules page lists it automatically.

### Add a creature type, size, or other shared category value
Add it to the right list in `lists.yml` (`creature_types`, `sizes`) or to the column's `order` in the table's `.yml`. If it needs a plural form that isn't "+s", add it to `plurals.yml`.

### Add a column to a table
1. Add the key to the entries that need it.
2. Add a column in the table's `.yml` (section 7, "Column Options").
3. To show it in the popup, read it in the template with `{% include table/field.html packed=include.packed key="your_key" %}`.
4. To make its text searchable from the sidebar search bar, add the key to `search_fields` (only for fields with real prose).

### Add a new section to monster stat blocks (like Charged Actions)
1. Add `key|Heading` to `ms_section_defs` in `_includes/table/templates/monster.md`, in the position it should appear.
2. In entries, use a named list under that key. Its optional intro is `intro_KEY` and its optional outro is `outro_KEY`; the template already reads both for every section, so they need no extra code. Neither is italicized for you.
3. Add the key to `search_fields` in `monsters.yml` so the sidebar search finds its text.
4. For an automatic tag, add an `auto_tags` rule in `monsters.yml` and put the tag in `tags`.
5. If the new section should also grant lair XP (like `regional_effects`), add its key to the lair check in the CR block of `monster.md`.
6. If it is homebrew, explain it in a dropdown in `monsters/index.md`.

### Add a new table
1. Create `_data/tables/NAME.yml`, `NAME/_entries.md` (at least one entry), and a template `_includes/table/templates/TEMPLATE.md` (copy `feat.md` as the simplest example; prefix its variables).
2. Create `NAME/index.md` with `title`, `parent: Home`, `has_children: true`, `layout: wiki`, `table: NAME`, `intro`, `quote`. No `nav_order`; the Home link table picks it up.
3. If the entries keep their prose somewhere other than `description`, add `search_fields` to the `.yml`. The sidebar search picks the table up automatically; nothing else to wire.

### Add a section with plain pages
Create `NAME/index.md` with `title`, `parent: Home`, `has_children: true`, `layout: wiki`, `intro`, `quote`, and `catalog: true`.

### Change wording on the site
Find the string in `_data/strings.yml` and edit it. Don't edit wording inside includes or scripts. (The stat block's own labels, like `**CR**` and `**HP**`, live in `monster.md` because they are part of the stat block's layout.)

### Make a clickable element behave like a link (cursor, sound, glow)
Add its selector to `_data/interactive.yml` (section 9.6). Nothing else needs to change.

### Share a data list between Sass and JavaScript
1. Put the list in `_data/NAME.yml`.
2. For Sass: assign it in `theme.scss.liquid` with an `th_` variable (no `default:`), print it as a `$variable` beside the other `$theme-...` lines, and use `jsonify` so it becomes a quoted string.
3. For JavaScript: add a `window.SITE_NAME` global in `head_custom.html` and read it in the script.

### Add a theme, font, effect, sound, dock button
See sections 6, 9.7, 9.8, and 9.3.

## 11. Reminders

- **Liquid runs in every normal `.md` page and included file**, even inside backticks. Wrap documentation examples in raw tags. (This file is excluded from the build.)
- **Never put `}` inside a `{{ }}` tag.** Assign the value first with `{% assign %}`, then print it.
- **Includes share variables with their caller.** Any variable an include creates is visible to the page and to every include that runs afterward, so two files using the same name silently overwrite each other. Give every include its own prefix (`mk_`, `cl_`, `cat_`, `lk_`, `pe_`, `jw_`, `ni_`, `fm_`, `ms_`, `sps_`, `sp_`, `it_`, `ft_`, `tx_`, `qt_`, `tt_`, `tg_`, `th_`, `gt_`, `bl_`, `pl_`, `in_`, `st_`, `sx_`, `sb_`, `pnl_`, `pt_`, `ol_`, `fld_`, `lst_`, `val_`...) and pass what it needs as a parameter. When you rename variables for a prefix, do **not** rename the parameter names on the left of `key=value` in an include call (`packed=`, `cols=`, `col=`, `cell=`, `note=`); other includes read those as `include.packed` and so on. Only the values on the right change.
- **Reset flags and running totals before using them.** A template like `monster.md` runs once per entry in the same page, so a leftover value from the last entry carries into the next one. Start every flag (`ms_no_cr`, `ms_found`) and every accumulator (`ms_lair_xp`, `ms_props`) with an `assign` to `false` or `""`.
- **Include parameters must be plain values or dotted names** (`key=col.key`). Brackets like `list[0]` break the tag; assign to a variable first.
- **`where_exp` takes one condition only.** This site's Jekyll does not understand `and` / `or` inside it (`where_exp: "p", "p.a and p.b"` fails with "Expected end_of_string but found id"). Filter with one condition, then test the second one with an `if` inside the loop.
- **`include_relative` is relative to the page being rendered**, not to the file holding the tag, and can't contain `..`. That is why table entries can only be read from a page in the table's own folder, and why the search index sits at the repo root (section 9.10).
- **A Liquid syntax error names the including file, not the broken one.** An error like `'if' tag was never closed` reported in `search-table.html` can actually come from a template it includes (for example `templates/monster.md`). The reported line number is the clue: look for a file whose last line (or the line where it stops) matches that number. The usual cause is a file cut off by an incomplete paste or commit, so after editing a template, check that its last line is the one you expect, and replace a whole file by selecting all before pasting.
- **`theme.scss.liquid` must assign every `th_` variable it prints and must not hide a missing one with `| default:`.** A missing one should break the build, not silently drop a font, background, cursor, or the clickable selector.
- **Saved settings are read in the head**, so `session.js` must load before `theme-switcher.js` and `text-size.js`, and `effects-snapshot.js` after `theme-switcher.js`. Keep that order in `head_custom.html`. The `SITE_*` data globals must also be written before the module scripts that read them.
- **A dialog's `::backdrop` ignores the dialog's `opacity`.** To fade a modal dialog, make its backdrop transparent.
- **Heading size uses `zoom`**, because Just the Docs sets heading sizes with `!important` in `rem`. Zoom also scales margins. It's only written when `heading_size` and `body_size` differ. Just the Docs also sets `th`, `td`, and heading font sizes with `!important`, so a custom `font-size` there needs `!important` too.
- **Sass can't read data files.** `_settings.scss` holds defaults, and `theme.scss.liquid` writes each theme's fonts, background, cursor, and the clickable selector. Just the Docs builds extra stylesheets that load `custom.scss`, which is why every setting has `!default`.
- **Sass compatibility:** halve with `* 0.5`, not `/ 2`. Avoid `@use` and `math.div`: the theme loads this folder with `@import`.
- **Entry files are named `_entries.md`** so Jekyll doesn't publish them. They load with `include_relative`, so they must sit in the same folder as the page showing the table.
- **YAML (`.yml` files and front matter):** quote values containing a colon followed by a space, or starting with `,`, `#`, or `[`. Quote the keys `"true"` and `"false"`. Spaces only, never tabs.
- **GitHub Pages file names are case-sensitive.** A wrong capital in a font, image, or audio name gives the fallback with no error.
- **Before deleting a CSS class**, search the whole repo for its name.
- **After changing a script,** hard refresh (Ctrl+Shift+R). A mix of old and new script files stops every table working.
- **When something breaks, open the console first** (F12). A script error stops the rest of that script, and the message names the file and line.
- **When pasting code into a script,** check which function it goes inside. A line a level too high can run before its variables exist.
- **Bulk edits:** use github.dev (press `.` on the repository page) for multi-file Search and Replace.

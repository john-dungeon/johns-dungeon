# Developer Notes

## 0. Design Rules

- **One place per setting.** Wording: `strings.yml`. Themes, fonts, cursors, effects: `themes.yml`. Shared lists: `lists.yml`. Sound: `audio.yml`. Look and feel: `_settings.scss`. Table behavior: `_data/tables/`.
- **Universal rules over local fixes.** All text goes through `text.html`, tooltips through `tooltip.html`, quotes through `quote.html`, numbers through `format.html`. Don't reimplement these in one spot.
- **Logic is separate from the page.** The search table's `columns`, `records`, `query`, and `filters` scripts never touch the page. Only `panel`, `dialog`, and `main` do.
- **Announce, don't call.** Scripts that don't depend on each other talk through events on `document` (section 6.1).
- **Delete before adding.** A new feature should first look for an existing rule to extend.

## 1. Project Map

### Root
- `_config.yml` – site settings.
  - The theme version is pinned (`just-the-docs@v0.12.0`). Change it on purpose.
  - `color_scheme` is the theme first-time visitors see. It must match a `themes.yml` `id`.
  - `exclude` keeps `dev-notes.md`, `README.md`, and `assets/PERSONAL-NOTES.md` off the website. They stay in the (public) repository.

### Data (`_data/`)
- `strings.yml` – all site wording that isn't page content.
- `themes.yml` – the switcher's themes: fonts, background, cursor, sounds, music, effects.
- `lists.yml` – lists shared by several table columns (settings, creature types, sizes).
- `audio.yml` – sound defaults, volumes, effect sets, music playlists.
- `gate.yml` – the entrance screen: on/off, delay, fade, idle and active pictures.
- `session.yml` – how long the site must be closed before a visit ends, and what is forgotten then.
- `text_size.yml` – lowest size, highest size, and step of the Size buttons.
- `challenge.yml` – Challenge Rating to XP and Proficiency Bonus (monster template). Fractions are decimals (`0.5`).
- `tables/` – one settings file per search table.

### Styling
- `_sass/color_schemes/` – one colors-only file per theme. Just the Docs' own `dark` and `light` need none.
- `assets/css/just-the-docs-ID.scss` – one 3-line stub per theme (Jekyll needs each as a separate file). `just-the-docs-default.scss` is loaded by every page first and builds the `color_scheme` theme. Never delete it.
- `_sass/custom/` – all custom CSS, loaded in this order by `custom.scss` (import each file once):
  - `_settings` – every adjustable visual value, each with `!default`.
  - `_helpers` – derived variables and mixins, including `parallax-layer`.
  - `_theme` – fonts, heading weight and size, body size variable, theme cross-fade.
  - `_base` – links, scrollbar, `.indent`, `.italic`, animation speed variable.
  - `_tables` – flat, striped tables.
  - `_search-table` – search tables and their popup.
  - `_statblock` – the monster popup.
  - `_navbar-toggle` – the sidebar hide/show button.
  - `_sidebar` – the sidebar as a box with a left margin.
  - `_tooltip`, `_dropdown`, `_checkbox`, `_dock` – hover bubble, `<details>`, checkboxes, dock.
  - `_background` – page background image, parallax, see-through panels.
  - `_cursor` – native (static) cursor rules and the animated cursor element.
  - `_effects` – the ambient effect layer and the torch glow.
  - `_gate` – the entrance screen.
- `assets/fonts/`, `assets/images/` (backgrounds and `cursors/`; paths are set in `themes.yml`), `assets/audio/` (effects, one folder per set; music, one folder per playlist).

### Layout and Reusable HTML
- `_layouts/wiki.html` – the page layout (section 3).
- `_includes/text.html` – the universal text formatter (section 4). `quote.html` – italic blockquote. `tooltip.html` – a `data-tooltip` attribute.
- `catalog.html` – link tables. `search-table.html` – search tables. `backlink.html` – the automatic "Back to..." link.
- `gate.html` – the entrance screen.
- `head_custom.html`, `footer_custom.html`, `nav_footer_custom.html` – Just the Docs hook points. `head_custom` loads every script and hands data to them. `footer_custom` holds the "unfinished" quote, back link, dock, and entrance screen.
- `theme.scss.liquid` – builds one theme's stylesheet: `@font-face` rules, Sass variables for fonts, background, static cursor, and sizes, then the color scheme.
- `table/` – helpers for `search-table.html`: `parse-entry` (entry text to packed fields), `field` (reads one field), `value` (a cell's raw value), `format` (numbers: `money`, `weight`, `cr`, `signed`, or prefix/suffix), `cell`, `list`, `join-words` ("A, B, or C"), `named-list` (`- key: Name` lists to titled paragraphs; optional `row="class"` wraps each in a `<div>`), `tags` (including `auto_tags`), `marker`, and `templates/` (`item`, `species`, `spell`, `monster`, `feat`).

### Scripts (`assets/js/`)
- `session.js` – runs first in the head. Decides if this is a new visit, forgets old choices, decides if the entrance screen shows.
- `theme-switcher.js` – remembers the theme, swaps its stylesheet, preloads its fonts, sets `<html data-theme>`, announces `themechange`.
- `text-size.js` – saved text size (applied early, no flash) and the Size buttons.
- `navbar-toggle.js` – remembers whether the sidebar is hidden. `tooltips.js` – the bubble for any `data-tooltip`.
- `site/` – visual effects, started by `site/main.js`: `shared.js` (helpers), `dock.js`, `parallax.js`, `gate.js`, `audio.js`, `cursor.js`, `effects.js`, and `effects/` (one file per effect).
- `search-table/` – section 8. These scripts don't import from `site/`.

### Content Folders
`feats/`, `items/`, `monsters/`, `rules/`, `settings/`, `species/`, `spells/`, `subclasses/`. Each has an `index.md`. Feats, items, monsters, species, and spells also have an `_entries.md` holding their table entries.

## 2. Customizing

| To change | Edit |
|---|---|
| Any site wording | `_data/strings.yml` |
| Themes: fonts, background, cursor, sounds, music, effects | `_data/themes.yml` |
| Worlds, creature types, sizes | `_data/lists.yml` |
| Sound defaults, volumes, event-to-file mapping, playlists | `_data/audio.yml` |
| Entrance screen | `_data/gate.yml` |
| Visit length, what is forgotten | `_data/session.yml` |
| Text size limits and step | `_data/text_size.yml` |
| Animation speed, popup widths, tooltip width, rarity colors, default heading weight and sizes, panel see-through level, parallax, effect colors and sizes | `_sass/custom/_settings.scss` |
| One theme's heading weight, body size, heading size | `_data/themes.yml` (`heading_weight`, `body_size`, `heading_size`) |
| A theme's colors | `_sass/color_schemes/ID.scss` |
| A table's columns, filters, limits | `_data/tables/NAME.yml` |

**Strings.** `{name}` is a fill-in spot, such as `{title}`. Only `nav_footer` and `unfinished` accept Markdown and `[[links]]`. Quote a value that contains a colon followed by a space.

**Settings.** Every value in `_settings.scss` ends in `!default`, so a color scheme can override one for just that theme by writing the same variable without `!default`. Never set `$theme-body-font`, `$theme-heading-font`, `$theme-background`, `$theme-cursor`, or `$theme-cursor-pointer` in a color scheme. They come from `themes.yml` through `theme.scss.liquid`, which also writes `$heading-weight`, `$body-size`, and `$heading-size` for themes that set them.

**Other color scheme overrides:** `$stripe-odd-color`, `$stripe-even-color`, `$unlisted-color`, `$marker-colors`.

## 3. Pages

### Front matter
- `title` – required. For sections and pages, `parent` is the exact title of the section page. For subclasses, `parent` is the class and `grand_parent` is `Subclasses`.
- `has_children: true` – on section pages and class stubs.
- `layout: wiki` – builds the page from the keys below. Without it, the page is a normal Just the Docs page (Home uses this).
- `tagline` – italic line under the title; also the first line of the page's tooltip in link tables. `summary` – the rest of that tooltip.
- `intro` – the paragraph under the title.
- `catalog` – a link table. `catalog: true` lists every page whose `parent` is this page's title. Or give a map of `grand_parent`, `group_by` (a front matter key), `columns` (minimum, default 3), `max_columns` (default 5).
- `table` – a search table, by name (a file in `_data/tables/`).
- `quote` – the closing quote, without outer quotation marks.
- `unfinished: true` – shows the "not constructed yet" message and Back link. Leave the body empty.
- `nav_exclude`, `search_exclude`, `redirect_url` – Just the Docs and class stub settings.
- `has_toc: false` is already the default. Don't repeat it.

A value can't contain a colon followed by a space, or a space followed by `#`. Wrap it in single quotes if it does.

Wiki layout order: title, tagline, intro, page body, link table, search table, divider, quote. Back links are automatic (to `grand_parent`, else `parent`, else Home). Never write one by hand.

### Adding pages
- **Section:** `NAME/index.md` with `title`, `parent: Home`, `has_children: true`, `layout: wiki`, `intro`, `quote`, and either `catalog: true` or `table: NAME`. No `nav_order`: sections sort alphabetically, and the Home link table picks them up.
- **Page:** a `.md` file in the right folder with `title` and `parent`. An unfinished page is only front matter plus `unfinished: true`.
- **Class (for Subclasses):** `subclasses/CLASS.md` with `title`, `parent: Subclasses`, `has_children: true`, `redirect_url: /subclasses/`, `search_exclude: true`, and no body.

## 4. Text Rules

Everything passes through `text.html`, so these work everywhere:

- Markdown: `*italic*`, `**bold**`, lists. `<br>` makes a line break (use it in tooltips and stat blocks; in other popups a trailing `\` also works, and a stray `\` means use `\\` or `<br>`).
- Links: `[[Name]]`, `[[Name|label]]`, `[[table:Name]]`, `[[table:Name|label]]`. They open that entry's popup. `table` defaults to the page's own table.
- Applies to `intro`, `tagline`, quotes, tooltips, footer text, text cells, and popups. It does **not** apply to attributes (search hint, aria labels), number cells, or script wording.

Also:
- **Headings are bold automatically.** Never write `**` in a heading.
- **Quotes:** `{% include quote.html text="..." %}`, without outer quotation marks.
- **Tooltips:** `{% include tooltip.html text="..." %}` prints a full `data-tooltip="..."` attribute. The bubble inserts the text as HTML, so only use text you wrote.
- **Italic blocks:** `{: .italic }` on the line after the text. Other classes: `.indent`, `.catalog` (plain table), `.headless` (hide the header row).
- **Dropdowns:** raw HTML with Kramdown attributes, with a blank line after `</summary>` and before each `<details>`:
  ```
  <details markdown="1">
  <summary markdown="span">**Title**</summary>

  Body text
  </details>
  ```

## 5. Themes and Fonts

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
`id`, `label`, `body_font`, `heading_font`, `font_fallback`, `fonts`, `heading_weight` (default 700), `body_size`, `heading_size`, `background`, `cursor`, `sounds`, `music`, `effects`. Background is section 6.5, cursor 6.6, effects 6.7, sound 6.8.

### Add Fonts to a Theme
Put files in `assets/fonts/` (names are case-sensitive, no spaces; `.woff2` is smallest, `.ttf` works). Add one line per file under `fonts:`, then name the families in `body_font` and `heading_font`:
```
fonts:
  - { family: Crimson Pro, file: assets/fonts/CrimsonPro-Regular.ttf }
  - { family: Crimson Pro, file: assets/fonts/CrimsonPro-Italic.ttf, style: italic }
```
`weight` is 400 by default (`"200 900"` for a variable font). `preload: false` skips the early download.

- **Heading weight:** if the heading font has no file at `heading_weight`, the browser fakes bold, which looks smeared. A font with only a Regular file wants `heading_weight: 400` (or `normal`).
- **Text size:** use `body_size` and `heading_size` (percent of normal) to calibrate fonts. They are independent: `_theme.scss` computes `--heading-ratio` so changing one doesn't move the other.
- **How it works:** `theme.scss.liquid` writes one `@font-face` per file plus the Sass variables. `theme-switcher.js` preloads the active theme's font files.

## 6. Site Features

### 6.1 Events and Stored Settings
Scripts that don't know each other communicate through events on `document`. To react to something new, listen for an event; don't call another script's functions.

| Event | Sent by | Meaning |
|---|---|---|
| `themechange` | `theme-switcher.js` | Theme switched. `detail` is the theme `id`. Sent after the new stylesheet is in place. |
| `popupopen`, `popupclose` | `search-table/dialog.js` | A table popup opened or closed. |
| `gateenter` | `site/gate.js` | Entrance screen clicked. |
| `gateopen` | `site/gate.js` | Delay over; the screen is fading away. |
| `fxsound` | `site/effects.js` | An effect asked for a sound. `detail` is the sound name. `audio.js` plays it. |

The active theme's `id` is always on `<html data-theme="...">` (CSS: `html[data-theme="dungeon"]`). `site/shared.js` has `onThemeChange(fn)`, which runs `fn` now and after every switch, plus `waiting()` (is the entrance screen still pending?) and `announce(type, detail)`.

**Stored settings** (`localStorage`; every read and write is wrapped in `try`/`catch`):

| Key | Set by | Value |
|---|---|---|
| `theme` | `theme-switcher.js` | a theme `id` |
| `navbar-collapsed` | `navbar-toggle.js` | `true` / `false` |
| `text-size` | `text-size.js` | a percent, like `110` |
| `sound-effects`, `sound-music` | `audio.js` | `true` / `false` |
| `last-seen` | `session.js` | last time any page was open, in ms |
| `gate-passed` | `gate.js` | `true` once the entrance screen was clicked this visit |
| `music-state` | `audio.js` | playlist, song, and position where the last page left off |

### 6.2 Visits and the Entrance Screen
A "visit" lasts until the site has been closed, in every tab, for `timeout` minutes (`session.yml`).

- While any page is open, `session.js` writes `last-seen` every 15 seconds and on page leave. When a page loads and `last-seen` is missing or too old, the visit is over: the keys in `reset`, plus `gate-passed` and `music-state`, are removed.
- The entrance screen shows when `gate-passed` is missing. `session.js` sets `<html data-gate="pending">` before paint (CSS hides the page, not the gate). `gate.js` opens the gate as a modal `<dialog>`, so the page is unclickable underneath. Escape can't close it.
- Clicking (or Enter) does, in order: add `.is-opening`, announce `gateenter` (doors sound); after `delay` seconds save `gate-passed`, set `data-gate="open"`, add `.is-leaving` (fades for `fade` seconds), announce `gateopen` (music starts); then close the dialog.
- **Pictures:** `idle` is the still picture (and a video's poster). `active` starts on the click: a `.webm`/`.mp4` video (holds its last frame) or an animated `.webp`/`.gif` (export it to play once). Set `delay` to its length. Both optional; an animated image also needs `idle`. Videos use `preload="none"` and are fetched only when the screen will show. Both pictures slide with the mouse via the `parallax-layer` mixin. With reduced motion, only `idle` shows and delay and fade are skipped.
- **The fade is the dialog's `opacity`.** `::backdrop` ignores it, so `_gate.scss` makes the backdrop transparent and lets the dialog paint the screen.
- If storage is blocked, visits can't be tracked, so both the reset and the entrance screen are skipped. If `timeout` is missing or not positive, `session.js` warns in the console and visits never expire (a missing value must never count as 0). If `gate.js` fails, the page appears after 5 seconds (`data-gate-late`). If there is no `#gate` element, `session.js` warns and skips the screen.
- **Check by hand:** `SITE_SESSION` in the console shows the settings (`timeout` should be a number). `localStorage` `last-seen` should keep changing; `gate-passed` should be `true` after entering. `document.getElementById('gate')` should print the dialog.
- `data-gate` is missing (no gate), `pending`, or `open`. `audio.js` stays silent and `effects.js` and `deeplink.js` wait while it is `pending`.

### 6.3 The Dock
The Sound, Size, and Theme buttons at the bottom right. Markup: `footer_custom.html`; behavior: `site/dock.js`; styles: `_dock.scss`.
- Each `.dock-item` holds a button and its `.dock-menu` (starts `hidden`). One menu is open at a time; clicking outside or pressing Escape closes all. A `role="menuitem"` button also closes its menu; checkboxes and plain buttons don't.
- **Add a button:** copy a `.dock-item`, give the menu and button matching `id` and `aria-controls`, add wording to `strings.yml`.
- **Dock sizes are in `px` on purpose.** If it scaled with the Size buttons, they would move out from under the pointer while clicking.

### 6.4 The Sidebar Box
Just the Docs stretches the sidebar to the content column. `_sidebar.scss` turns it into a box from the md breakpoint up.
- `.side-bar` has no background or border; the box is its `::before`, at `$nav-width`. The space to its left is the margin. The element keeps its original size, so the hide/show slide, toggle button, and content column work as before.
- `.site-nav > .nav-list` has a 1px side margin (`$sidebar-border-width`) so highlighted links stop inside the box's border instead of painting over it.
- The box color is `$sidebar-box-color`: the sidebar color, slightly see-through when the theme has a background image. Below md, the sidebar is the top bar with a normal background.

### 6.5 Background and Parallax
- `background: assets/images/.../NAME.webp` in a theme. Without it, the theme keeps its plain color and no background CSS is built.
- `theme.scss.liquid` writes `$theme-background`; `_background.scss` draws it on `body::before`, a fixed layer slightly bigger than the screen. `parallax.js` writes `--parallax-x` and `--parallax-y` (-1 to 1) from the mouse (not for touchscreens or reduced motion). The slide itself is the `parallax-layer` mixin (also used by the entrance screen).
- `.main` and the sidebar box are slightly see-through (`$panel-opacity`). If the picture is hidden, another element has a solid background; add it in `_background.scss`.
- **Image:** 2560 × 1440 px WebP, ideally under about 500 KB, scaled to cover and cropped, so keep detail near the middle. Keep `$parallax-range` smaller than `$parallax-margin`.

### 6.6 Custom Cursor
Set per theme in `themes.yml`:
```
cursor:
  image: assets/images/cursors/torch.webp
  animated: true
  size: 32
  hotspot: 16 16
  pointer: assets/images/cursors/torch-link.webp
```
- `image` – the cursor. `hotspot` – `x y` in displayed pixels, the exact clicking point (default `0 0`). `pointer` – optional image over links and buttons (default `image`).
- **Static (default):** pure CSS. `theme.scss.liquid` writes `$theme-cursor` and `$theme-cursor-pointer`, and `_cursor.scss` applies them with `!important` (Just the Docs sets `cursor: pointer` in many places). Use a 32 × 32 px transparent WebP or PNG (browsers allow up to 128 × 128, but Chrome hides cursors over 32 × 32 near the window edge). Browsers show only the first frame of animated files. A missing image falls back to the arrow. To check: open the theme's stylesheet and search for `cursor:`.
- **Animated (`animated: true`):** browsers can't animate a native cursor, so `site/cursor.js` hides the real one (`html.fake-cursor`) and moves `#site-cursor` to the pointer once per frame. It is a `popover="manual"` element, which puts it in the browser's top layer above the dialogs; the script re-raises it on `popupopen`. `image` can be an animated `.webp`, `.gif`, `.apng`, or a `.webm`/`.mp4` video (chosen by extension; videos autoplay, muted, looped). `size` is the displayed width (default 32); the hotspot is in those pixels. `theme.scss.liquid` skips the native cursor for animated themes.
- Animated WebP is the best format: smooth transparency everywhere. GIF has only on/off transparency, and WebM transparency doesn't work in Safari.
- The fake cursor is off for touchscreens (`FINE_POINTER`) and themes without `animated`. It trails the real pointer by about one frame and appears after the first mouse move.

### 6.7 Ambient Effects
Theme-specific effects: one small file each, listed per theme in `themes.yml`:
```
effects:
  - { id: torch-glow, x: 16, y: 16 }
```
An entry is `{ id: NAME, ...options }` or just `NAME`.

- `site/effects.js` runs on every theme change and on `gateopen`. It stops the old theme's effects, then starts the new theme's list, so effects never pile up. Each file loads on demand (`import()`), so themes without effects download nothing.
- Effects don't start while the entrance screen is pending. They are skipped for reduced motion unless the file has `export const calmSafe = true`.
- **An effect file** exports a default function that receives `ctx` and may return a cleanup function:
  ```js
  export default function myEffect(ctx) {
    ctx.timer(() => { /* add an element to ctx.layer */ }, 8, 20);
  }
  ```
- **The `ctx` toolkit:**
  - `options` – the entry's other keys.
  - `layer` – this effect's own full-screen `.fx-layer` (never blocks clicks; removed on stop).
  - `random(min, max)`.
  - `on(target, type, handler)` – a listener removed on stop.
  - `timer(run, min, max)` – runs `run` every min to max seconds, skipping hidden tabs; cleared on stop.
  - `sound(name)` – plays `name` from the theme's sound set in `audio.yml` (the Sound menu and entrance silence apply automatically).
  - Everything registered through `ctx` is undone automatically.
- **To add an effect:** create `effects/NAME.js`, add it to a theme's `effects`, put its CSS in `_effects.scss` and settings in `_settings.scss`, and add any sound names to that theme's set in `audio.yml`.
- **Torch glow (`torch-glow.js`):** adds `html.fx-torch-glow` and sets `--fx-torch-glow-x` and `--fx-torch-glow-y` from the options `x` and `y` (where the flame sits in the cursor image, in displayed pixels from its top-left). CSS draws two soft lights as the `::before` (outer) and `::after` (inner) of `#site-cursor`, sharing one `torch-flicker` keyframe set and one duration so they flicker together. It needs an `animated: true` cursor. Settings: `$torch-glow-color`, `$torch-glow-core-color`, `$torch-glow-size`, `$torch-flicker-duration`. Reduced-motion visitors get a steady glow. To aim it live: `document.documentElement.style.setProperty('--fx-torch-glow-x', '12px')`.

### 6.8 Sound
Settings: `audio.yml`. Behavior: `site/audio.js`. The Sound menu has two checkboxes (`data-sound="effects"` and `"music"`).
- `defaults` is what first-time visitors get (music on, since clicking the entrance screen grants playback permission). `volume` runs 0 to 1.
- **Sets** are groups of effect files; a theme picks one with `sounds: NAME` (none means silent). Dark and Light share `basic` (only `click`). Events: `click` (link, button, input, table row), `hover`, `open` and `close` (table popup), `enter` (entrance screen), plus any name an effect requests with `ctx.sound()`. A missing event is silent.
- **Playlists** are named lists of music files; a theme picks one with `music: NAME`. When a song ends, another is picked at random (never the same twice in a row, unless it's the only one, which loops).
- **Saved position:** on page leave, `audio.js` saves the playlist, song, and position (`music-state`). The next page resumes there if its theme has the same playlist. Forgotten when a visit ends.
- Music pauses when the tab is hidden and stays silent until the entrance screen is passed. If the browser blocks it on a later page, it starts on the first click or key press.
- Use `.mp3`. Keep effects short (under about a second). A missing file fails silently. The clickable set is `INTERACTIVE` in `site/shared.js`.

### 6.9 Text Size and Checkboxes
- **Text size:** settings in `text_size.yml`. `text-size.js` runs in the head and sets an inline `font-size` on `<html>`, `!important`, as `calc(PERCENT% * var(--body-scale, 1))`, where `--body-scale` is the theme's `body_size` (so the buttons adjust from each theme's base and follow theme switches). Everything is sized in `rem`, so it all scales together except the dock. Text that doesn't scale is in `px` somewhere.
- **Checkboxes:** `_checkbox.scss` restyles every `<input type="checkbox">` in the color scheme's colors. A new checkbox needs no class. Don't add `accent-color`. Size is `$checkbox-size`, in `em`.

### 6.10 Entry Point
`site/main.js` imports `dock`, `parallax`, `gate`, `audio`, `cursor`, `effects`. Each starts itself when imported. Remove an import to switch that feature off. Keep `gate` before `cursor`, so the cursor joins the top layer after the entrance dialog and lands above it.

## 7. Search Tables

Put `layout: wiki` and `table: items` in a section page's front matter. A table named `items` uses three files:
- `_data/tables/items.yml` – settings and columns.
- `items/_entries.md` – the entries (the file you edit).
- `_includes/table/templates/<template>.md` – how fields become popup text.

**Add a table:** create all three, then point a page at it with `table: NAME`. **Add an entry:** add it to `_entries.md`. **Add a column or field:** add the key to the entry, a column in the `.yml`, and (for the popup) use it in the template.

### Entry Format
- Entries are separated by a line that is exactly `---`. Never use `---` inside a description; use `***`.
- One `key: value` per line. Field names are **all lowercase** (letters, digits, underscores); a capitalized name like `Resistances:` isn't recognized and gets glued onto the field above. Every other line continues the field above.
- Lists are comma-separated. Write cost and weight as plain numbers.
- `tags` – comma-separated, shown in the popup.
- `options_KEY` (like `options_rarity`) – other values the entry counts as, for search and filters. Excluding hides the entry only if all its values are excluded.
- `options_cost` and `options_weight` list amounts or ranges, like `50, 200, 3-36`. Plain numbers, no thousands commas. A slider or Min/Max filter keeps the entry if any amount or range overlaps.
- Entry names must be unique within a table: each row's `id` is its slugified name, and links rely on it.

### Named Lists (traits, actions, ...)
Species `traits` and monster `traits`, `actions`, and so on use indented list items. The first key's name is ignored (`trait_1`, anything); its value is the item's title.
```
actions:
- action_1: Multiattack
  description: The creature makes two Claw attacks.
- action_2: Claw
  description: *Melee Attack Roll:* +4, reach 5 ft. *Hit:* 6 (1d6 + 3) Slashing damage.

  A second paragraph can follow after a blank line.
```
Indent anything starting with `- ` inside a description by two spaces, or it is read as a new item.

### Fields by Table
- **Items** (`item.md`): `name`, `prefix_category`, `category`, `note_category`, `rarity`, `options_rarity`, `note_rarity`, `attunement`, `cost`, `options_cost`, `note_cost`, `weight`, `options_weight`, `note_weight`, `setting`, `note_setting`, `tags`, `description`.
  - `prefix_category` goes before the category in the popup (`Simple Melee` + `Weapon`); not shown in the table column.
  - `setting` is comma-separated. It auto-adds the Setting-Specific tag and the "can only be found in…" note. Never hand-write either. `note_setting` adds a sentence to that note.
- **Species** (`species.md`): `name`, `article` (optional), `description`, `age`, `type`, `size`, `speed`, `settings`, `tags`, `traits`. Several `type` values join with "and", several `size` values with "or", in the order written.
- **Spells** (`spell.md`): `name`, `level` (`Cantrip` or 1–9), `school`, `classes`, `casting_time`, `condition`, `ritual` (`true`), `range`, `area`, `components` (`V, S, M`), `material`, `duration`, `concentration_max`, `tags`, `description`.
  - `condition` is appended to the casting time exactly as written, so start it with punctuation: `condition: , which you take when you are hit by an attack roll`.
- **Monsters** (`monster.md`): `name` (also the stat block title), `size`, `type`, `alignment`, `ac`, `initiative`, `hp`, `speed`, `str`–`cha`, `saves`, `skills`, `resistances`, `vulnerabilities`, `immunities`, `gear`, `senses`, `languages`, `cr`, `settings`, `tags`, `flavor`, and the sections `traits`, `actions`, `bonus_actions`, `reactions`, `legendary_actions`.
  - Scores give modifiers and saves automatically; `saves: Dex, Wis` adds the Proficiency Bonus to those.
  - `cr` is a plain number, fractions as decimals (`0.125`, `0.25`, `0.5`). PB and XP come from `challenge.yml`. Search `cr:0.5`, not `1/2`.
  - `initiative` is optional and replaces the computed value. `skills`, `resistances`, `vulnerabilities`, `immunities`, `gear`, `senses`, `languages` are free text and show only if present.
  - Passive Perception is added to the Senses line automatically; don't type it. Write negative bonuses with a plain hyphen (`Perception -1`).
  - Each section can have an optional `KEY_intro` paragraph. `flavor` is one optional italic paragraph at the bottom.
- **Feats** (`feat.md`): `name`, `category`, `prerequisite`, `repeatable` (`true`/`false`, blank is false), `tags`, `description`.

### Table Settings (`_data/tables/NAME.yml`)
- `template` (required), `noun` ("Showing 5 of 20 items"), `default_sort` (column key; default the first), `default_dir` (`asc`/`desc`), `placeholder` (search hint; default in `strings.yml`).
- `dialog` – optional popup style class `st-dialog--NAME`. Only `statblock` exists.
- `tags` – the tags the Filter panel offers, in order, even if unused. A tag an entry uses that isn't listed shows in red in its popup and turns its row red. `tags: false` hides tags in the panel and popup (search still understands them).
- `auto_tags` – rules adding a tag automatically, like `- { tag: Concentration, field: duration, equals: Concentration }` (case-insensitive; omit `equals` to fire whenever the field has a value). Also add the tag to `tags`.
- `markers` – symbols next to names: `symbol`, `tag`, `color_by` (entry field whose value picks the color from `$marker-colors`), `label` (hover text prefix).
- `limit_default` (100), `limit_min` (25), `limit_max` (500), `limit_step` (25) – the results-shown slider.
- `columns` – below. The first column is always the name.

### Column Options
**Core**
- `key` (matches the entry field), `label` (heading).
- `type`: `text` (default; substring search), `list` (`a, b, c`; each item searched and filtered separately), `rank` (ordered categories; sorts by `order`; search matches the whole value), `number` (sorts by amount; Min/Max filter or slider), `measure` (amounts with units like `10 minutes`; sorts by `units`; filters with `buckets`).
- `abbreviate` – shows the first N letters of each comma-separated part plus a period, with the full name in the hover bubble. Text and list columns only (not with `format`, `symbols`, or numbers). Popup, filters, and search use full names. Plain text only.
- `order` – the Filter buttons' categories, in order, even if unused. A list, or the name of a list in `lists.yml`. Rank, number, and measure columns also sort by it. An unlisted cell value turns red (unless a number or measure column can read it as an amount). Without `order`, the column gets no buttons and nothing is flagged. A quoted `"..."` marks where amounts go: names before it sort first, names after it sort last; without it, amounts come after all names.
- `blank_as` – blank entries count as this value in search, filters, and sorting. The cell shows its `symbols` entry if any, otherwise "—". A blank cell in a column without `blank_as` (and not `in_table: false`) is highlighted red as missing.

**Display**
- `format: cr` (`0.5` shows `1/2`), `money` (GP/SP/CP), `weight` (0.1 or less in ounces, others in pounds). Display only; sorting and filters use the exact number.
- `prefix` and `suffix` for other numbers. `unit` shows in the Filter heading ("Cost (GP)").
- `zero_label` – a value of exactly `0` shows as this word (like `Weightless`) in the table and popup.
- `plain: true` – list cells hide "(notes)".
- `symbols` (value to icon) and `labels` (value to friendly text). Quote `"true"` and `"false"` keys.
- `in_table: false` – searchable and filterable but hidden from the table.
- `note` – adds an entry field to the cell: `field`, `format` (`%s` for the value; default ` (%s)`), `show_if` (only when the entry's value equals it), `sort: true` (also sort by the note's value).

**Behavior**
- `sortable: false`, `filter: false` (skip its Filter group), `match: exact` (default for `rank`).
- `units` – measure columns: unit word to size, like `{foot: 1, feet: 1, mile: 5280}`. Plurals ending in "s" match automatically.
- `slider` – number columns: `{ max, min_label, max_label }` makes a double-ended slider. Positions: `0` (min label, no lower limit), `1` to `max` (amounts), `max+1` (max label, no upper limit). Entries whose text equals a label count as 0 or infinity.
- `buckets` – replaces the `order`-based buttons. A plain word matches that exact value. `{ label, up_to }` catches amounts up to that size (using the column's `units`). `{ label }` with no `up_to` catches every larger amount. List amount buckets smallest to largest.

### Shared Lists
`lists.yml` holds lists used by several tables. To add a world, add its name to `settings` there and create its page in `settings/`.

### Search Box
- Plain words search names. `field:value` searches a column. `"quoted phrase"` keeps words together. `-word` excludes.
- `#tag` or `tag:word` searches tags.
- Numbers accept `cost:>=100`, `cost:<50`, `weight:1-5`, `cr:0.5`.

## 8. How a Table Is Built

Liquid builds each row and popup at build time; a script then makes it interactive. They share these attributes:
- `data-config` on `.search-table` – the table's settings file as JSON.
- On each row: `id` (slugified name), `data-tag-names`, `data-v-KEY` (lowercase displayed value), `data-o-KEY` (the `options_` values), `data-s-KEY` (sort override from a column `note`).
- Popup HTML sits in `.st-details`, one `<div data-for="ROW-ID">` per entry. `deeplink.js` opens a popup when the URL ends in `#entry-name` (after the entrance screen is passed).

**Scripts (`assets/js/search-table/`).** The first four never touch the page, so they can be tested alone.
- `utils.js` – `t()` wording helper (reads `strings.yml`), number syntax (`NUMBER`, `parseSpan`), small DOM helpers.
- `columns.js` – column types. **To add a type, add one line to `TYPES`.** Also prepares each column and adds the tag column (tags behave as one more list column, so search, filters, and sorting need no special cases).
- `records.js` – reads rows into records, sorts, flags unlisted values.
- `query.js` – parses the search box and matches terms. `filters.js` – Filter panel state and matching.
- `panel.js` – the panel's buttons, boxes, and sliders. `dialog.js` – the popup (announces `popupopen` and `popupclose`). `deeplink.js` – popup from the URL. `main.js` – wires it together.

## 9. Reminders

- **Liquid runs in every normal `.md` page**, even inside backticks. Wrap documentation examples in raw tags. (This file is excluded from the build.)
- **Never put `}` inside a `{{ }}` tag.** Assign the value first with `{% assign %}`, then print it.
- **Includes share variables with their caller.** Give every include its own prefix (`mk_`, `cl_`, `pe_`, `jw_`, `ni_`, `fm_`, `ms_`, `sps_`, `sp_`, `it_`, `ft_`, `tx_`, `qt_`, `tt_`, `tg_`, `th_`...) and pass what it needs as a parameter.
- **Include parameters must be plain values or dotted names** (`key=col.key`). Brackets like `list[0]` break the tag; assign to a variable first.
- **`theme.scss.liquid` must assign every `th_` variable it prints and must not hide a missing one with `| default:`.** A missing one should break the build, not silently drop a font, background, or cursor.
- **Saved settings are read in the head**, so `session.js` must load before `theme-switcher.js` and `text-size.js`. Keep that order in `head_custom.html`.
- **A dialog's `::backdrop` ignores the dialog's `opacity`.** To fade a modal dialog, make its backdrop transparent.
- **Heading size uses `zoom`**, because Just the Docs sets heading sizes with `!important` in `rem`. Zoom also scales margins. It's only written when `heading_size` and `body_size` differ. Just the Docs also sets `th`, `td`, and heading font sizes with `!important`, so a custom `font-size` there needs `!important` too.
- **Sass can't read data files.** `_settings.scss` holds defaults, and `theme.scss.liquid` writes each theme's fonts, background, and cursor. Just the Docs builds extra stylesheets that load `custom.scss`, which is why every setting has `!default`.
- **Sass compatibility:** halve with `* 0.5`, not `/ 2`. Avoid `@use` and `math.div`: the theme loads this folder with `@import`.
- **Colors and fonts come from color scheme variables**, never hard-coded in `_sass/custom/`.
- **Entry files are named `_entries.md`** so Jekyll doesn't publish them. They load with `include_relative`, so they must sit in the same folder as the page showing the table.
- **YAML:** quote values containing a colon followed by a space, or starting with `,` or `#`. Quote the keys `"true"` and `"false"`. Spaces only, never tabs.
- **GitHub Pages file names are case-sensitive.** A wrong capital in a font, image, or audio name gives the fallback with no error.
- **Before deleting a CSS class**, search the whole repo for its name.
- **After changing a script,** hard refresh (Ctrl+Shift+R). A mix of old and new script files stops every table working.
- **When something breaks, open the console first** (F12). A script error stops the rest of that script, and the message names the file and line.
- **When pasting code into a script,** check which function it goes inside. A line a level too high can run before its variables exist.
- **Bulk edits:** press `.` on the repository page to open github.dev, a browser editor with multi-file Search and Replace (regex supported).

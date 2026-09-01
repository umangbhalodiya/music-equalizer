# YouTube-Style Design System — Full Reference

Read this before building anything beyond a single trivial component. It expands every entry in SKILL.md's quick reference into exact values and states. Treat these as a stable, well-established design language (this layout has held for years) rather than a pixel-perfect current snapshot — YouTube runs frequent A/B tests on thumbnail sizing and sidebar details, so if the user ever wants a literal, current, pixel-accurate clone rather than "in the style of," say so and verify specifics rather than assuming this doc is that precise.

## Color tokens

### Dark theme (default)
- Background / header / sidebar surface: `#0F0F0F`
- Raised surface / hover state: `#272727`
- Pressed / stronger hover: `#3F3F3F`
- Primary text: `#F1F1F1`
- Secondary text (metadata, timestamps): `#AAAAAA`
- Border / divider: `#2D2D2D`
- Brand accent / red: `#FF0000`, hover `#CC0000`
- Link: `#3EA6FF`
- Chip background (inactive): `#272727`; chip background (active): `#F1F1F1` with `#0F0F0F` text (colors invert)
- Icon default: `#F1F1F1`; icon muted: `#AAAAAA`

### Light theme
- Background / header / sidebar surface: `#FFFFFF`
- Raised surface / hover state: `#F2F2F2`
- Pressed / stronger hover: `#E5E5E5`
- Primary text: `#0F0F0F`
- Secondary text: `#606060`
- Border / divider: `#E5E5E5`
- Brand accent / red: `#FF0000`, hover `#CC0000`
- Link: `#065FD4`
- Chip background (inactive): `#F2F2F2`; chip background (active): `#0F0F0F` with `#FFFFFF` text
- Icon default: `#0F0F0F`; icon muted: `#606060`

Red is reserved for: the brand mark, the single primary pill button per screen (e.g. "Subscribe," "Save," "Publish"), live/notification dot badges, and active-state underline accents. It is never used as a background for large surfaces or body text.

## Typography

- Family: `Roboto, "Helvetica Neue", Arial, sans-serif`
- Search input / body text: 14px / 400
- Card title: 14px / 500 (semibold), 2-line clamp with ellipsis
- Channel name / secondary label: 12px / 400, secondary color
- Metadata line ("1.2M views · 3 days ago"): 12px / 400, secondary color, segments joined with " · "
- Sidebar nav label: 14px / 400 (500 when active)
- Section header in sidebar (e.g. "Explore"): 12px / 500, uppercase tracking-wide, secondary color
- Detail/watch-page title: 18–20px / 600
- Button label: 14px / 500

## Layout shell

- **Header:** height 56px, fixed to top, full width, `z-index` above content, background = surface color, bottom border 1px in border color (only visible once content scrolls under it, otherwise flat).
- **Sidebar:** fixed left, top offset 56px (below header), full remaining height, width **240px expanded / 72px collapsed**. Expanded shows icon (24px) + label (14px) per row, 40px row height, 24px left padding. Collapsed centers a 24px icon per row with no label, no section headers, no dividers between icon groups (just spacing).
- **Main content:** margin-left = sidebar width, padding-top = header height + 16px, horizontal padding 24px (16px on mobile, where the sidebar becomes an overlay/drawer instead of pushing content).
- **Responsive breakpoints:** sidebar auto-collapses to icon-only under ~1312px viewport width, and becomes a slide-over drawer under ~768px (mobile).

## Header component

Left block (matches sidebar width, 240px):
- Hamburger icon button, 40×40px circular hit target, transparent background, hover → hover-surface color circle.
- Logo/wordmark immediately after, ~90–110px wide, brand-red accent element + app name in primary text color, bold.

Center block (flexible, max-width ~640px, centered in remaining space):
- Search input: 40px tall, rounded-full left corners / square-ish right corners where it meets the search button, border 1px border-color, background = surface color, placeholder text in secondary color, magnifying-glass icon only inside the adjoining button.
- Search button: 64px wide, right side of the input, rounded-full right corners, background = hover-surface color, magnifying-glass icon centered.
- Optional mic icon button: circular, 40px, positioned just right of the search button, background = raised-surface color.

Right block:
- Create/upload icon button (camera or plus-in-circle), 40px circular hit target.
- Notifications bell icon button, 40px, with a small red circular badge (top-right of the bell, ~16px, white count text) when there are unseen items.
- Avatar: 32px circle, user's initial or photo, opens an account dropdown menu on click (menu uses the dropdown/menu styling below).

## Sidebar component

Ordered sections, separated by 1px dividers with 8–12px vertical padding around each divider:

1. **Primary nav** (always visible, even collapsed): Home, Shorts, Subscriptions.
2. **"You" group**: a row that expands/collapses (chevron icon), containing History, Playlists/Library, Your content, Watch later, Liked items.
3. **Subscriptions/follows list**: each row = 24px avatar circle + name, optionally a small dot for "new/unread."
4. **Explore/browse group**: category-style rows (Trending, Shopping, Music, Films, Live, Gaming, News, Sports, Learning) — swap these labels for whatever categories fit the subject.
5. **Secondary/meta group**: Settings, Report an issue, Help, Send feedback — smaller text (13px), muted color.
6. Optional footer: small legal/copyright line in muted 11–12px text.

Row states:
- Default: transparent background, icon + label in primary text color.
- Hover: background → hover-surface color, `border-radius: 8px` (rows use a soft rounded rect, not a full pill, when expanded).
- Active/selected: background → hover-surface color persists, icon and label switch to bold/500 weight; do **not** add a red bar — YouTube's own active state is just the filled background + bold text, red is reserved for brand/primary actions.

## Filter chip row

- Sits directly under the header (or under header + a thin divider), sticky on scroll, horizontal overflow with no visible scrollbar, small left/right fade or arrow affordance optional.
- Each chip: height 32px, padding 0 16px, `border-radius: full`, background = chip-background token, text 14px/500, gap 8px between chips.
- Active chip: colors invert (see chip active token above) — this is the only chip using the inverted primary color instead of red.

## Card (grid item)

- Container: no visible card background/border in the default grid — the thumbnail *is* the card; text sits directly on the page background below it.
- Thumbnail: 16:9, `border-radius: 12px`, `object-fit: cover`, subtle background placeholder (surface color) while loading.
- Duration/status badge: bottom-right of thumbnail, inset 4px, background `rgba(0,0,0,0.8)`, white text, 12px/500, padding 2px 4px, `border-radius: 4px`.
- Below thumbnail (8px gap): flex row — 36px avatar circle (omit for a dense/compact grid variant) + column of: title (14px/500, 2-line clamp), channel/owner name (12px, secondary color, hover → primary color/underline), metadata line (12px, secondary color).
- Overflow ("⋮") icon button: top-right of the thumbnail, opacity 0 by default, opacity 1 on card hover, 32px circular hit target, background `rgba(0,0,0,0.6)` when over the thumbnail.
- Card hover (optional, use sparingly): thumbnail scale `1.0 → 1.02` over 150ms, or a lightweight preview swap — skip entirely for dense dashboards where motion would be distracting.
- Grid: `display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px 12px;`.

## Detail / "watch" layout

Two-column at wide viewports (single column, media-first, on mobile):

**Left/main column** (flexible, cap around 1128px):
- Media/content panel at 16:9, full width of the column, background near-black regardless of theme.
- Title: 18–20px/600, margin-top 12px.
- Owner row: 40px avatar + name (14px/500) + secondary count/subtext (12px, secondary color) on the left; a red filled pill primary action (e.g. "Subscribe"/"Follow"/"Save") immediately after.
- Action-button group, right-aligned on the same row or wrapping below on narrow widths: a segmented pill (two icon+label halves, e.g. thumbs-up count | thumbs-down) followed by separate pill buttons (Share, Download/Export, Save, and a "More" `⋯` pill) — each pill: height 36px, padding 0 16px, background = chip-background token, `border-radius: full`, icon (20px) + label (14px).
- Description/info box: background = raised-surface color, `border-radius: 12px`, padding 12px 16px, collapsed to ~3 lines with a "Show more" toggle in link color.
- Comments/activity section: sort control (dropdown, e.g. "Top"/"Newest"), a new-item input row (avatar + expanding text field + primary-styled "Comment/Post" pill, secondary "Cancel" text button), then a threaded list — each item: 40px avatar, author name (13px/500), timestamp (12px, secondary, inline after name), body text (14px), and a like/dislike/reply action row (12px, secondary color, icons 16px).

**Right column** (fixed ~360–400px, hidden/stacked below main content on mobile):
- "Autoplay next" toggle switch + label at the top (optional, only if the subject has a queue concept).
- List of related items, each row: 168×94px thumbnail (16:9, `border-radius: 8px`) on the left, text block on the right — title (14px/500, 2-line clamp), owner (12px secondary), metadata (12px secondary).

## Buttons

| Variant | Shape | Fill | Use for |
|---|---|---|---|
| Primary | `border-radius: full`, height 36px, padding 0 16px | Solid red `#FF0000`, white text, hover `#CC0000` | The one primary action per screen |
| Secondary | `border-radius: full`, height 36px, padding 0 16px | Chip-background token, primary text color | Everyday actions (Share, Save, Cancel) |
| Link-style | text only | Link color, no background | "Sign in," "Show more," inline actions |
| Icon-only | circle, 40px (36px in dense contexts) | Transparent, hover → hover-surface circle | Utility icons (bell, search, overflow) |
| Chip/filter | `border-radius: full`, height 32px, padding 0 16px | Chip-background token; active state inverts | Category/filter selection |

## Iconography

Simple outlined icons, ~1.5–2px stroke, 24px default size (20px inside buttons, 16px inline with text): home, compass/explore, a stacked-squares icon for a "subscriptions/feed" concept, folder/list icons for library-type items, a camera-plus icon for create/upload, a bell for notifications, a magnifying glass for search, a 3-line hamburger for the menu toggle, a vertical 3-dot kebab for overflow menus, thumbs-up/thumbs-down, a share arrow, a download tray arrow, and a bookmark/plus-to-list icon for save. Keep the whole icon set from one consistent family/weight — don't mix filled and outlined styles.

## Elevation & motion

- Base UI is flat: no shadows on the header, sidebar, or cards by default.
- Dropdown menus, modals, and tooltips: `box-shadow: 0 2px 6px rgba(0,0,0,0.15)` (dark theme can use a slightly stronger `rgba(0,0,0,0.4)` since the base is already dark), background = surface color, `border-radius: 12px`, 8px internal padding around menu items.
- Transitions: 100–150ms `ease` on `background-color`, `color`, and `opacity`. Avoid transform/scale animation outside the optional card-hover zoom. No page-load choreography, no scroll-triggered reveals — the whole point of this system is quiet, utilitarian consistency, not spectacle.

## Empty / loading states

- Loading: gray skeleton blocks matching each element's shape (thumbnail rect, two short text bars) using the raised-surface color with a subtle shimmer/pulse opacity animation (0.6 → 1 → 0.6, ~1.5s loop) — keep it that subtle, nothing flashy.
- Empty state: an icon or illustration in secondary color, a short primary-color heading, one line of secondary-color supporting text, and — if there's an action — a single secondary-style pill button. No red here; red stays reserved for primary actions elsewhere.

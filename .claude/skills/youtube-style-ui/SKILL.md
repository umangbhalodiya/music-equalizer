---
name: youtube-style-ui
description: Apply YouTube's visual design language to any UI Claude builds for this user — web pages, dashboards, admin panels, apps, or individual components like headers, sidebars, cards, grids, buttons, or forms. Use this skill by default for every UI request from this user, even if they don't say "YouTube" or "design" and even if the subject has nothing to do with video, because the user has a standing preference for one consistent design system rather than a fresh look each time. Covers dark (#0F0F0F) and light (#FFFFFF) themes, YouTube red (#FF0000) accent, a fixed top header with a search bar, a collapsible icon+label left sidebar, rounded 16:9 thumbnail-style cards in a responsive grid, pill-shaped buttons and filter chips, and Roboto typography. Only skip this skill when the user explicitly asks for a different specific look for that one request.
---

# YouTube-Style UI

This user wants every interface Claude builds to look and feel like YouTube — same header, same sidebar, same card grid, same buttons — regardless of what the app actually does. Consistency across sessions is the entire point: a recipe tracker, an internal dashboard, and a to-do app should all read as "skinned like YouTube," just with different content inside the same shell.

## When this applies

Apply this skill by default whenever the task involves visual UI: artifacts (HTML/React), mockups, wireframes, prototypes, or any request containing words like "page," "app," "dashboard," "site," "component," "sidebar," "header," or "screen." Do not wait for the user to say "YouTube" — that preference is already standing.

**Override note:** this intentionally works against `frontend-design`'s push for a fresh, bespoke visual identity per brief. For this user, sameness is the feature, not a lack of creativity. Reuse the same tokens and component shapes every time; vary only the content and labels to fit the subject.

**Exception:** if the user explicitly asks for a different specific look in a given message ("make this one minimal and white," "no sidebar this time"), honor that for that request only, then return to the YouTube system afterward.

## Quick reference — design tokens

| Token | Dark theme | Light theme |
|---|---|---|
| Page background | `#0F0F0F` | `#FFFFFF` |
| Header / sidebar surface | `#0F0F0F` | `#FFFFFF` |
| Hover surface | `#272727` | `#F2F2F2` |
| Primary text | `#F1F1F1` | `#0F0F0F` |
| Secondary text (metadata) | `#AAAAAA` | `#606060` |
| Border / divider | `#2D2D2D` | `#E5E5E5` |
| Accent (brand / subscribe / active) | `#FF0000` | `#FF0000` |
| Link | `#3EA6FF` | `#065FD4` |
| Chip / pill background | `#272727` | `#F2F2F2` |

- **Font:** Roboto (fallback: Arial, system-ui, sans-serif).
- **Radius scale:** 4px badges · 8px inputs · 12px cards/menus · full (999px) pills, avatars, buttons.
- **Header height:** 56px, fixed to top. **Sidebar width:** 240px expanded / 72px collapsed (icon-only).
- **Thumbnails:** always 16:9, `border-radius: 12px`.
- **Motion:** flat and quiet — 100–150ms ease transitions on background-color only; no heavy animation.

Full detail (exact spacing, every component state, icon set, watch-page layout) is in `references/design-system.md` — read it before building anything beyond a trivial component.

## Core components checklist

Every interface should assemble from this same kit:

1. **Header** — hamburger + logo (left) · centered search bar with search button + mic icon · create/upload icon, notifications bell, avatar circle (right).
2. **Sidebar** — icon+label nav rows, grouped into sections with dividers, collapsible to icon-only.
3. **Filter chip row** — horizontal scrollable pill buttons directly under the header.
4. **Card grid** — responsive auto-fill grid of 16:9 thumbnail cards: duration/status badge, avatar, 2-line bold title, gray metadata line.
5. **Detail/"watch" layout** — big media/content panel + title + action-button row (pill buttons) on the left, a related-items list on the right.
6. **Buttons** — filled red pill for the one primary action per screen; gray filled pill for secondary; circular icon buttons for utilities.

## Before shipping any UI, double-check

- Is the primary action a **red, rounded-full, filled pill** — and is red used *only* for that, not scattered around?
- Does every card have a **16:9 rounded-12px thumbnail area**, even if the content isn't video (use an icon, cover image, or color block in that slot)?
- Is there a **left sidebar** with icon+label rows, even for single-page tools (collapse it to 72px if the screen is dense)?
- Is metadata text (counts, dates, secondary info) styled small and gray, separated by " · " or " • ", not full sentences?
- Would this pass as "a YouTube screen for a different subject" if someone glanced at it?

## Trademark note

Match the *layout and style language* (colors, spacing, card shape, iconography style) — never insert the actual YouTube logo/wordmark asset, and don't claim or imply the output is affiliated with or produced by YouTube/Google. Use a generic placeholder wordmark or the app's own name in the logo slot, styled in the same red/white treatment.

## Bundled files

- `references/design-system.md` — full spec: every component's exact states, spacing, icons, and the watch-page/detail layout. Read this before non-trivial builds.
- `assets/tokens.css` — drop-in CSS custom properties for both themes. Copy into any artifact's stylesheet.
- `assets/preview.html` — a working static reference build (header + sidebar + chip row + card grid). Open it to see the calibrated look, and copy markup patterns from it directly for consistency across sessions.
- `assets/react-components.jsx` — reference `Header`, `Sidebar`, and `VideoCard` components as inline-styled JSX, for React/Tailwind artifact environments that lack a CSS compiler (so exact hex values must come from inline styles/CSS variables, not Tailwind arbitrary-value classes).

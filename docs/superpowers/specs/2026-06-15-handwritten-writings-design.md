# Handwritten Writings — Design Spec

## Overview

Replace the current typed blog-style writings section with handwritten content exported from a Supernote (transparent PNGs). Each writing exists as a folder of handwritten page images plus a Markdown file with metadata and a typed version for text mode.

## Data Model

### Asset layout

```
public/writings/<slug>/p1.png
public/writings/<slug>/p2.png
public/writings/<slug>/p3.png
src/content/writings/<slug>.md
```

The folder name in `public/writings/` matches the content entry slug for easy pairing.

### Markdown frontmatter

```yaml
---
title: "A Walk Through Shimokitazawa"
date: 2026-06-11
tags: [tokyo, life]
handwriting:
  - "/writings/shimokitazawa/p1.png"
  - "/writings/shimokitazawa/p2.png"
  - "/writings/shimokitazawa/p3.png"
---
```

`handwriting` is a required array of image paths. The Markdown body below the frontmatter is the typed version displayed in Text mode.

### Zod schema update

Add to the existing writings collection config:

```ts
handwriting: z.array(z.string()).optional(),
```

## Pages

### Writings listing (`/writings/`)

- Latest post featured above the fold (scroll-reveal, same as current), using its first handwriting PNG as the hero card image
- Below: responsive grid of square thumbnail cards (2/3/4 columns)
- Each card shows the first handwriting PNG (`p1.png`) as the thumbnail
- Card overlay: title (serif, 22px), reading time (16px, from body word count), tags from frontmatter
- TagFilter with OR/AND toggle — same component, uses frontmatter tags
- Sorting: newest first by `date` in frontmatter (same as current)

### Individual writing (`/writings/<slug>`)

Top-level toggle between two views, client-side only — no page reload:

**Original view:**
- Handwriting PNGs displayed one page at a time (paginated)
- ← Prev / Next → buttons centered below the image
- Current page indicator: "2 / 5"
- PNG is rendered at full width within the article container, respecting aspect ratio
- Transparent background sits on `#f7f6f5`

**Text view:**
- Full typed version of the article rendered from Markdown body
- Same typographic treatment as current: `640px` max-width, serif at 27px/1.6
- No pagination — single scrollable page
- Shows date, reading time, tags

### Accessibility

- A visually-hidden line above the toggle: *"This page has handwritten content. Switch to Text view for a readable version."*
- Screen readers and search engines index the full text from Text mode
- No per-image alt text needed

### Toggle UI

- Pill-button toggle: `[ Original ] [ Text ]` — active state uses `--accent` background
- Sits below the nav, above the article content
- Toggle state managed by a small inline `<script>` in the Astro component

## Components

- **ViewToggle.astro** — the Original/Text toggle pill buttons + inline JS
- **HWPagination.astro** — prev/next nav for the handwriting view
- Existing components updated: **WritingCard.astro** (use `handwriting[0]` instead of `hero`), **TagFilter.astro** (unchanged), **WritingPage template** (add toggle + conditional rendering)

## CSS

- Handwriting PNGs: `max-width: 100%; height: auto; display: block;` — no extra styling needed since background is transparent
- Pagination buttons: system-ui, `--border` stroke, rounded, `--accent` hover
- Toggle: system-ui, matching the existing button style in TagFilter

## Edge Cases

- **Single-page writing:** Pagination shows no Prev/Next (both disabled), "1 / 1"
- **No handwriting field (missing or empty):** Fall back to full text view with no toggle. Useful for any typed-only posts
- **Toggle back to Original:** Always resets to page 1 (no state persistence between view switches — keeps the JS simple)
- **Missing PNG files:** Astro build won't catch this at compile time — handwritten image will show broken image. User should verify paths.
- **Reduced motion:** No animation in the toggle — instant switch. Respects existing reduced-motion setup.

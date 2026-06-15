# Personal Site — Design Spec

## Overview

A personal website showcasing writings, photography, and an about page. Built with Astro, styled in a neutral palette with serif body text and sans-serif UI elements.

## Stack

- **Framework:** Astro (static site generation)
- **Content:** Markdown files with frontmatter (tags, title, date, reading time, hero image)
- **Deployment:** Cloudflare Pages (free tier). CI/CD via git push.
- **Photos:** Stored in repo as static assets (curated exports from Immich).

## Design System

### Palette
- Background: #f7f6f5 (Light Paper)
- Text: #1a1a1a (body), #2a2a2a (titles/dark grey), #666 (secondary), #888 (muted), #aaa (labels)
- Borders: #eee, #f0f0f0
- Accent: #1a1a1a (buttons, active states)

### Typography
- Body: Georgia, serif
- UI (nav, labels, buttons, pills): system-ui, sans-serif

## Pages

### Homepage (/)
- Nav bar at top: logo (tim forrer) | writings · photos · about
- Hero photo: centered with generous whitespace (gallery-object feel, not full-viewport)
- Scroll reveal: on scroll, hero photo fades out, "Hi, I'm Tim" intro text fades in
- No other content on homepage

### Writings (/writings)
- Scroll reveal: most recent writing visible above the fold -> scroll -> remaining writings + tag filtering fade in
- Responsive grid of square thumbnail cards: 2 columns on mobile, 3 on tablet, 4 on desktop
- Each card: header image (from frontmatter), title in dark grey, reading time
- No dates displayed
- Tag filtering bar below the hero writing (scroll-revealed):
  - Clickable tag pills (sourced from post frontmatter)
  - OR/AND toggle switch — OR mode: posts matching any selected tag; AND mode: posts matching all selected tags
  - Tags are multi-select, toggle on/off
- Individual writing page (/writings/slug): rendered Markdown with the same nav and typography

### Photos (/photos)
- Featured section (top, above fold): masonry grid of ~7 curated photos
- Scroll reveal: collections section fades in on scroll
- Collections: two-column grid of image tiles with collection name overlay
- Clicking a collection navigates to /photos/collection-name showing a full gallery
- Photo detail page (/photos/collection-name/photo-slug): full image with title

### About (/about)
- Scroll reveal: bio + timeline visible above the fold
- Bio paragraph in a narrow centered column (text left-aligned within it)
- "A Brief History of Tim" — centered vertical timeline with entries connected by a midline (title + date range, no description text)
- No email address exposed

## Key Behaviors

### Scroll Reveal
Used consistently across all pages. Lightweight CSS-based scroll-driven animations. No heavy JS libraries.
- Homepage: hero photo fades out, intro fades in
- Writings: most recent writing visible initially, remaining grid + tags fade in on scroll
- Photos: featured masonry visible initially, collections fade in on scroll
- About: bio + timeline visible initially

### Tag Filtering
Filter state managed entirely client-side. Tags defined per-post in Markdown frontmatter. OR/AND toggle changes filter logic. No page reload needed.

### Reading Time
Auto-calculated at build time from word count. Displayed as "X min read".

## Data Model (Markdown Frontmatter)

### Writing post
```yaml
---
title: "Building with Dioxus in 2026"
date: 2026-05-28
tags: [rust, dioxus, webdev]
hero: ./images/dioxus-hero.jpg
---
```

### Photo collection
```yaml
---
title: "Oregon Coast"
date: 2026-05-01
cover: ./images/coast-cover.jpg
photos:
  - src: ./images/coast-01.jpg
    title: "Haystack Rock"
  - src: ./images/coast-02.jpg
    title: "Mist at Cannon Beach"
---
```

## Future Considerations (out of scope for v1)
- RSS feed
- Dark mode toggle
- Full-text search

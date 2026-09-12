# timforrer.com

Personal website — essays and photography. Built with [Astro](https://astro.build)
and deployed as a fully static site to Cloudflare Pages.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the dev server at http://localhost:4321 |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve the built site locally |

There is no codegen or pre-build step — `npm run build` is just `astro build`, and
the contents of `dist/` can be deployed as-is (Cloudflare Pages: build command
`npm run build`, output directory `dist`).

## Stack

- **Astro 6** with `output: 'static'` — no adapter, no server runtime.
- **Content collections** for writings, schema in `src/content.config.ts`.
- **Markdown → HTML** via `remark-math` + `rehype-katex` (LaTeX maths, e.g. `$\rightarrow$`).
- **Plain CSS** (`src/styles/global.css` + scoped component styles), no UI framework.
- **Vanilla JS** only for the photo lightbox and the handwriting page-turning.

## Routes

| Path | File | Description |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Homepage — a single hero photo |
| `/about` | `src/pages/about.astro` | Bio + current gear |
| `/photos` | `src/pages/photos/index.astro` | Cover grid of photo themes |
| `/photos/<theme>` | `src/pages/photos/[...collection].astro` | Masonry gallery + lightbox |
| `/writings` | `src/pages/writings/index.astro` | Latest essay + grid of the rest |
| `/writings/<slug>` | `src/pages/writings/[...slug].astro` | Essay (Handwritten ⇄ Typed toggle) |
| `404` | `src/pages/404.astro` | Not-found page |

## Project structure

```
src/
  pages/                    File-based routes (table above)
  layouts/
    BaseLayout.astro        HTML shell, nav, scroll-reveal
  components/
    Nav.astro               Top navigation
    WritingCard.astro       Essay card (thumbnail + title + reading time)
    CollectionPicker.astro  Theme <select> on a gallery page
    Lightbox.astro          Full-screen photo viewer
    HWPagination.astro      Prev/Next pager for handwritten pages
  data/
    photos.ts               Reads public/photos/ at build time
  lib/
    reading-time.ts         Shared reading-time helper
  content/
    writings/*.md            Essays (Markdown + frontmatter)
  content.config.ts         Writings collection schema
  styles/
    global.css              Base styles, CSS variables, scroll-reveal

public/
  photos/<theme>/           Photo files — the source of truth for galleries
  writings/<slug>/          Handwritten page images (PNG)
  favicon.svg, favicon.ico, apple-touch-icon.png, header.png, _headers, photos/placeholder.svg

photos/                     Configuration for the photo galleries
  config.json               Collection order, homepage hero, "Featured" reel
  README.md                 Photo workflow

docs/
  TODO.md                   Current state and next steps
  superpowers/              Historical design specs and plans (partly superseded)
```

## Content

### Writings

One Markdown file per essay at `src/content/writings/<slug>.md`. The file name
(`<slug>.md`) becomes the URL: `/writings/<slug>`.

```yaml
---
title: "Learning to Write"
date: 2026-06-25
description: "Trying to write better."    # optional
handwriting:                               # optional; omit for text-only posts
  - "/writings/learning-to-write/Essays_Page_1.png"
  - "/writings/learning-to-write/Essays_Page_2.png"
---
```

- Posts with a `handwriting` array show a **Handwritten / Typed** toggle. The
  toggle itself is pure CSS; only the page-turning of the scanned images uses
  JavaScript.
- Handwritten pages are transcribed into the Markdown body by the `ocr-writings`
  skill (`.pi/skills/ocr-writings/`).
- There are **no tags or categories**.

### Photos

Photo galleries are driven entirely by folders — see [`photos/README.md`](photos/README.md).
In short: drop an image into `public/photos/<theme>/` and it appears. Ordering
within a theme is alphabetical and the first image is the theme's cover. Gallery
settings (collection order, homepage hero, "Featured" reel) live in
`photos/config.json`.

## Documentation

- [`AGENTS.md`](AGENTS.md) — notes for AI agents working in this repo
- [`photos/README.md`](photos/README.md) — photo workflow
- [`docs/TODO.md`](docs/TODO.md) — current state and next steps
- `docs/superpowers/` — original design specs and plans (historical; some superseded)

## AI statement

AI tools (OpenCode, etc.) were used to help build and iterate on this website. Every word and photograph on the site is mine.

# TODO

## Next

- [ ] Update bio on the about page
- [ ] Add more writings to `src/content/writings/`
- [ ] Connect repo to Cloudflare Pages (build: `npm run build`, output dir: `dist`)

## Current state

- **Static site, no runtime.** ASTRO `output: 'static'`; build emits plain HTML to
  `dist/`. No adapter or server binding.
- **Photos are folder-driven.** Drop images into `public/photos/<theme>/`; no
  build step. `src/data/photos.ts` reads the folder tree at build time.
  Configuration lives in a single `photos/config.json`. See `photos/README.md`.
- **Writings** are Markdown in `src/content/writings/`. Handwritten posts show a
  Handwritten/Typed toggle (pure CSS) and page images; only the page-turning uses
  JS. No tags/categories. See `src/pages/writings/[...slug].astro` and `README.md`.
- **Build:** `npm run build` → 10 static pages in `dist/` (9 routes + `404.html`).

## Known follow-ups

- `description` in the writings schema/frontmatter is not rendered anywhere yet.

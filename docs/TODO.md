# TODO

## Next

- [ ] Update bio on the about page
- [ ] Add more writings to `src/content/writings/`
- [ ] Push to GitHub: `git push -u origin main` (remote already configured)
- [ ] Connect repo to Cloudflare Pages (build: `npm run build`, output dir: `dist`)

## Current state

- **Static site, no runtime.** ASTRO `output: 'static'`; build emits plain HTML to
  `dist/`. No adapter or server binding.
- **Photos are folder-driven.** Drop images into `public/photos/<theme>/`; no
  build step. `src/data/photos.ts` reads the folder tree at build time.
  Configuration lives in a single `photos/config.json`. See `photos/README.md`.
- **Writings** are Markdown in `src/content/writings/`. Handwritten posts show a
  Handwritten/Typed toggle and page images; see
  `src/pages/writings/[...slug].astro`.
- **Build:** `npm run build` → 9 static pages in `dist/` (plus `404.html`).

## Known follow-ups

- `description` in the writings schema/frontmatter is not rendered anywhere yet.
- Tag filtering (OR/AND) exists on `/writings` but the current two posts have no
  overlapping tags, so it has nothing to filter.

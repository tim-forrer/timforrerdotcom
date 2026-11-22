# TODO

## Next

- [ ] Update bio on the about page
- [ ] Add more writings to `src/content/writings/`
- [ ] Connect repo to Cloudflare Pages (build: `npm run build`, output dir: `dist`)

## Current state

- **Static site, no runtime.** ASTRO `output: 'static'`; build emits plain HTML to
  `dist/`. No adapter or server binding.
- **Photos are folder-driven.** Source images live in `public/photos/<theme>/`;
  metadata lives in `photos/metadata.json`; prepared display variants live under
  `public/photo-variants/` and `public/writing-variants/`. Run
  `npm run photos:prepare` after changing source media. Configuration lives in
  `photos/config.json`. See `photos/README.md`.
- **Writings** are Markdown in `src/content/writings/`. Handwritten posts show a
  Handwritten/Typed toggle (pure CSS) and page images; only the page-turning uses
  JS. No tags/categories. See `src/pages/writings/[...slug].astro` and `README.md`.
- **Build:** `npm run build` emits static routes from the current writing and
  photo collections. The exact route count changes as content is added.

- **Quality checks:** `npm run check` runs Astro's type and template checks;
  GitHub Actions runs it before building.

## Known follow-ups

- Recheck Core Web Vitals and network payloads in a browser after deployment;
  browser performance tracing was unavailable during the source audit.

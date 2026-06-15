# TODO

## Next

- [ ] Add real photos to `public/photos/placeholders/` and update `src/data/photos.ts` with correct filenames
- [ ] Update bio on about page to reflect Tokyo-based life
- [ ] Add real writings to `src/content/writings/`
- [ ] Create GitHub repo and push: `git remote add origin <url> && git push -u origin main`
- [ ] Connect repo to Cloudflare Pages (build: `npm run build`, output dir: `dist/client`)

## Session Context (Jun 11)

- Homepage: hero image is `position: fixed; inset: 0; z-index: -1` — centered in viewport, nav floats on top
- Nav: logo matches links in `var(--text-muted)`, both hover to `var(--text)`
- Body: `#f7f6f5` background, `display: flex; flex-direction: column; min-height: 100vh`
- About timeline: year above each entry, blank vertical lines between. Currently: Swindon '98 → Reading '00 → Durham '17 → Tokyo '21
- Build: `npm run build` (8 static pages), deploy output is `dist/client`
- All current work committed to main (`f884326`)

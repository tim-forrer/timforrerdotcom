<!-- tools -->
OCR of handwritten writings is handled by the `ocr-writings` skill (`.pi/skills/ocr-writings/`), which transcribes pages to markdown using `google/gemma-4-31b-it` subagents in parallel. No API key needed — pi manages credentials. Requires ImageMagick (`brew install imagemagick`). Invoke by asking the agent to process a writings slug, or `/skill:ocr-writings <slug>`.
<!-- tools -->

<!-- photos -->
Photos on the site are **folder-driven**, not hand-coded. The image folders in `public/photos/` are the source of truth and each subfolder is one theme (collection): `animals`, `architecture`, `clouds`, `nature`, `street`, `night`. Create themes by adding a folder; retheme a photo by moving its file. Folders/files are live-published, so a newly dropped or moved image needs `npm run photos` to rebuild the generated listing.

Be careful — there are **two distinct `photos` directories**:
- `public/photos/` holds the actual image files (one subfolder per theme).
- `photos/` (repo root) holds configuration that drives the site:
  - `order.json` — display order of collections on the `/photos` grid.
  - `homepage.json` — `{ "photo": "/photos/..." }` sets the single homepage hero image.
  - `featured.json` — `{ "photos": [...] }` builds the flat cross-theme "Featured" collection.

`.gitkeep` files keep empty theme folders (architecture, night, street) tracked in git — preserve them.

There are **no captions and no manual photo ordering** in code. Sort within a theme by prefixing filenames (alphabetical). `src/data/photos.json` is a **generated artifact** — never edit it by hand; run `npm run photos` (`node scripts/generate-photos.js`) after any photo/config change. It runs automatically ahead of `astro build`.

Pages: `/photos` is the masonry cover grid landing (theme cards at natural aspect ratio); `/photos/<theme>` is the masonry gallery with a lightbox; the homepage hero is set by `homepage.json`. See `photos/README.md` for the full how-to.
<!-- photos -->

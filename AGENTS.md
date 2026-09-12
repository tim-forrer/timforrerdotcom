<!-- tools -->
OCR of handwritten writings is handled by the `ocr-writings` skill (`.pi/skills/ocr-writings/`), which transcribes pages to markdown using `google/gemma-4-31b-it` subagents in parallel. No API key needed — pi manages credentials. Requires ImageMagick (`brew install imagemagick`). Invoke by asking the agent to process a writings slug, or `/skill:ocr-writings <slug>`.
<!-- tools -->

<!-- photos -->
Photos on the site are **folder-driven**, not hand-coded. The image folders in `public/photos/` are the source of truth and each subfolder is one theme (collection): `animals`, `architecture`, `clouds`, `nature`, `street`, `night`. Create themes by adding a folder; retheme a photo by moving its file. There is **no build step and no generated listing** — `src/data/photos.ts` reads the folder tree at build time. `astro build` always picks up changes fresh; restart `npm run dev` to see newly added/moved files locally.

Be careful — there are **two distinct `photos` directories**:
- `public/photos/` holds the actual image files (one subfolder per theme).
- `photos/` (repo root) holds configuration that drives the site, in a single `config.json`:
  - `order` — display order of collections on the `/photos` grid.
  - `homepage` — `/photos/...` path of the single homepage hero image (or `null`).
  - `featured` — image paths for the flat cross-theme "Featured" collection (empty = hidden).

`.gitkeep` files keep empty theme folders (architecture, night, street) tracked in git — preserve them.

There are **no captions and no manual photo ordering** in code. Sort within a theme by prefixing filenames (alphabetical); the first photo in a folder is the collection cover.

Pages: `/photos` is the masonry cover grid landing (theme cards at natural aspect ratio); `/photos/<theme>` is the masonry gallery with a lightbox; the homepage hero is set by `config.homepage`. See `photos/README.md` for the full how-to.
<!-- photos -->

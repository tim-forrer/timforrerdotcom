<!-- site -->
Static Astro site for timforrer.com — essays (writings) and photography. No runtime: `output: 'static'`, builds plain HTML to `dist/`; deployed to Cloudflare Pages (build `npm run build`, output `dist`).

Commands: `npm run dev` (localhost:4321) · `npm run build` → `dist/` · `npm run preview`.

Key files:
- `src/pages/` — file-based routes: `/`, `/about`, `/photos`, `/photos/<theme>`, `/writings`, `/writings/<slug>`, `404`.
- `src/layouts/BaseLayout.astro` — HTML shell, nav, scroll-reveal.
- `src/components/` — `Nav`, `WritingCard`, `CollectionPicker`, `Lightbox`, `HWPagination`.
- `src/content/writings/*.md` — essays; schema in `src/content.config.ts`.
- `src/data/photos.ts` — reads `public/photos/` at build time (see photos below).
- `src/lib/reading-time.ts`, `src/styles/global.css`.

Full map and content model: `README.md`.
<!-- site -->

<!-- tools -->
OCR of handwritten writings is handled by the `ocr-writings` skill (`.pi/skills/ocr-writings/`), which transcribes pages to markdown using `google/gemma-4-31b-it` subagents in parallel. No API key needed — pi manages credentials. Requires ImageMagick (`brew install imagemagick`). Invoke by asking the agent to process a writings slug, or `/skill:ocr-writings <slug>`. Display images are prepared by `.pi/skills/ocr-writings/prepare-images.sh <slug>`, which resizes raw scans to `p1.png`…`pN.png`; run it alone after re-exporting handwriting to swap pages without re-running OCR.
<!-- tools -->

<!-- writings -->
Essays live in `src/content/writings/<slug>.md`; the filename is the URL (`/writings/<slug>`). Frontmatter schema (`src/content.config.ts`): `title` and `date` required; `description` and `handwriting[]` optional. No tags/categories.

Posts with a `handwriting` array render a Handwritten/Typed toggle on the detail page. The switch is **pure CSS** (hidden radio inputs + labels) — no JS. Only the page-turning (`HWPagination` + a small inline script in `[...slug].astro`) uses JS. Scanned pages are transcribed into the Markdown body by the `ocr-writings` skill (see tools above).
<!-- writings -->

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

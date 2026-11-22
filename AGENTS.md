<!-- site -->
Static Astro site for timforrer.com — essays (writings) and photography. No runtime: `output: 'static'`, builds plain HTML to `dist/`; deployed to Cloudflare Pages (build `npm run build`, output `dist`).

Commands: `npm run dev` (localhost:4321) · `npm run build` → `dist/` · `npm run preview` · `npm run check` · `npm run photos:prepare`.

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
OCR of handwritten writings is handled by the `ocr-writings` skill (`.pi/skills/ocr-writings/`), which transcribes pages to markdown using `google/gemma-4-31b-it` subagents in parallel. No API key needed — pi manages credentials. It requires ImageMagick (`brew install imagemagick`). Invoke by asking the agent to process a writings slug, or `/skill:ocr-writings <slug>`. Display scans are prepared by `.pi/skills/ocr-writings/prepare-images.sh <slug>`, which resizes raw scans to `p1.png`…`pN.png`; run it alone after re-exporting handwriting to swap source pages without re-running OCR. Then run `npm run photos:prepare` to regenerate their WebP display copies.
<!-- tools -->

<!-- writings -->
Essays live in `src/content/writings/<slug>.md`; the filename is the URL (`/writings/<slug>`). Frontmatter schema (`src/content.config.ts`): `title` and `date` required; `description` and `handwriting[]` optional. No tags/categories.

Posts with a `handwriting` array render a Handwritten/Typed toggle on the detail page. The switch is **pure CSS** (hidden radio inputs + labels) — no JS. Only the page-turning (`HWPagination` + a small inline script in `[...slug].astro`) uses JS. Scanned pages are transcribed into the Markdown body by the `ocr-writings` skill (see tools above).
<!-- writings -->

<!-- photos -->
Photos on the site are **folder-driven**, not hand-coded. The source folders in `public/photos/` are authoritative; each subfolder is a theme (collection), currently including `animals`, `architecture`, `clouds`, `everyday-spaces`, `landscape`, `nature`, `street`, and `night`. Create themes by adding a folder; retheme a photo by moving its source file. Add or update its `photos/metadata.json` entry with descriptive alt text and orientation-correct dimensions, then run `npm run photos:prepare` to remove private image metadata and generate WebP derivatives. Commit files under `public/photo-variants/` and `public/writing-variants/`; Cloudflare Pages does not run image tools during its build. `src/data/photos.ts` validates metadata, config references, and generated variants at build time. Restart `npm run dev` after changing files under `public/` locally.

Be careful — there are **two distinct `photos` directories**:
- `public/photos/` holds the source image files (one subfolder per theme).
- `public/photo-variants/` holds generated 480px and 1600px WebP derivatives.
- `public/writing-variants/` holds generated lossless WebP handwriting pages.
- `photos/` (repo root) holds configuration and metadata:
  - `config.json` drives collection order, homepage image, and featured photos.
  - `metadata.json` supplies alt text and dimensions for source photos.
  - `order` — display order of collections on the `/photos` grid.
  - `homepage` — `/photos/...` path of the single homepage hero image (or `null`).
  - `featured` — image paths for the flat cross-theme "Featured" collection (empty = hidden).

Preserve `.gitkeep` files in intentionally empty theme folders (`night` and
`street` currently).

There are no visible captions. Photo order is a case-sensitive filename sort;
prefix filenames to set order and the collection cover. Configured collection
order comes first, then unlisted populated themes alphabetically. Invalid
config references, metadata mismatches, and missing WebP variants fail the
build.

Pages: `/photos` is the masonry cover grid landing (theme cards at natural aspect ratio); `/photos/<theme>` is the masonry gallery with a lightbox; `/photos/featured` appears when the featured list is non-empty; the homepage hero is set by `config.homepage`. See `photos/README.md` for the full how-to.
<!-- photos -->

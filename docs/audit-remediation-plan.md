# Website Audit Remediation Plan

This plan addresses the findings from the read-only site audit. It is ordered to
reduce privacy risk first, then make photo behavior deterministic, improve page
loading and accessibility, and tighten data and documentation quality.

## Goals and scope

- Keep the site static and preserve its folder-driven photo workflow.
- Make published photo assets deterministic, appropriately sized, and free of
  unwanted metadata.
- Ensure galleries and controls work with keyboard and assistive technology.
- Make invalid photo configuration and content/schema drift visible during the
  build instead of silently producing incomplete pages.
- Keep the implementation small; avoid adding a runtime or a large UI library.

This document is a plan only. No application code, content, or image assets were
changed while writing it.

## Phase 1 — Remove metadata from published photos

**Finding:** `public/photos/animals/panda.jpg` contains GPS metadata. Other
published photos retain camera and capture-time metadata.

**Plan:**

1. Decide whether the repository should retain original photo files privately
   or whether the checked-in files themselves should be sanitized. For the
   current public-folder workflow, prefer sanitizing the copies in
   `public/photos/` so Git history and deployment artifacts do not contain
   location metadata.
2. Strip EXIF/IPTC/XMP metadata from every image currently under
   `public/photos/`, preserving the visible pixels, orientation, and color
   appearance. Confirm that orientation is applied to the pixels before
   orientation metadata is removed.
3. Add a documented publishing step or a small repeatable script that strips
   metadata from newly exported photos before they are added to the public
   folders. Avoid relying on a one-time manual cleanup.
4. Review whether handwritten scan images contain metadata worth removing as
   well; apply the same policy if they do.
5. Update `photos/README.md` with the metadata policy and the exact workflow for
   adding an image.

**Completion criteria:** A metadata inspection of every published photo finds
no GPS coordinates or identifying capture metadata; the photos still render in
the correct orientation; the addition workflow applies the policy to new
images.

**Priority:** Immediate, before the next deployment.

## Phase 2 — Make photo ordering and covers deterministic

**Finding:** `src/data/photos.ts` relies on filesystem directory order in
`listPhotos()`, while the documentation says files are ordered alphabetically.
The first returned photo is also used as the collection cover.

**Plan:**

1. Sort the filtered image filenames explicitly in `listPhotos()` before
   building `Photo` objects. Use a documented comparison rule. A plain
   locale-independent lexical comparison is predictable; a natural sort is
   also reasonable if numbered prefixes should sort numerically.
2. Preserve the existing filename-prefix convention as the user-facing way to
   select a cover and gallery order.
3. Ensure configured collection order remains first, with unlisted themes
   appended alphabetically.
4. Verify each current collection's first photo after sorting and record any
   intended exceptions by renaming/prefixing the file rather than adding
   collection-specific code.
5. Update the photo guide to state the exact sorting behavior and filename
   prefix convention.

**Completion criteria:** Repeated builds produce the same photo order and
covers on every supported development/build environment; documented sorting
matches the implementation.

**Priority:** High. This also improves confidence in generated listings and
featured selections.

## Phase 3 — Establish a responsive image delivery strategy

**Finding:** The photo and handwriting assets total roughly 15 MB in the
repository. Photo galleries and cover grids use original images, and the
gallery images have no explicit loading strategy or intrinsic dimensions.

**Plan:**

1. Measure the rendered width and expected quality needed for each image use:
   collection cover, masonry thumbnail, homepage hero, and lightbox.
2. Generate at least two derivatives for each photo: a display-size version
   appropriate for the page layout and a larger version for the lightbox. Keep
   the current source originals outside the public output if the repository
   workflow can support that cleanly; otherwise retain them and publish
   derivatives alongside them.
3. Prefer modern formats such as WebP or AVIF where browser support and
   fallback requirements are acceptable. Keep JPEG fallback if it simplifies
   reliable static delivery.
4. Update photo data to identify the thumbnail/display source and the
   lightbox source separately. Use `srcset`/`sizes` where they provide a
   meaningful responsive choice.
5. Add `loading="lazy"` and `decoding="async"` to below-the-fold cover and
   gallery images. Keep the likely LCP image eager; do not lazy-load the
   homepage hero or the first visible image if measurement shows it is
   critical.
6. Add image width and height attributes, or an `aspect-ratio` reservation
   backed by known dimensions, to reduce layout shifts while images load.
7. Inspect handwritten PNGs separately. Preserve legibility and transparency
   while evaluating whether lossless WebP or optimized PNG materially reduces
   download size. Load only pages that are needed for the current handwriting
   spread where practical.
8. Compare before/after asset sizes and run a browser performance check once
   browser tracing is available. Record LCP, CLS, transfer size, and image
   request count for the home page, photos landing page, largest gallery, and a
   handwritten essay.

**Completion criteria:** Gallery tiles download appropriately sized images,
the lightbox retains sufficient quality, images reserve layout space, and the
measured transfer size is lower without a visual quality regression.

**Priority:** High for galleries; medium for handwriting assets. The exact
format and derivative dimensions should be based on measurements rather than
chosen arbitrarily.

## Phase 4 — Validate photo configuration and references at build time

**Finding:** `photos/config.json` is parsed with a TypeScript cast, not runtime
validation. Unknown order entries are ignored, missing featured photos are
silently filtered, and a bad homepage path can create a broken hero image.

**Plan:**

1. Define a runtime schema for `photos/config.json` (Zod is already available
   through Astro) with the expected types for `order`, `homepage`, and
   `featured`.
2. Validate the parsed configuration once when photo data is loaded. Include
   the config filename and offending value in any error message.
3. Resolve `homepage` and every `featured` path against the discovered photo
   inventory. Fail the build for missing references instead of silently
   dropping them.
4. Detect and report duplicate collection names, duplicate featured paths,
   unknown order entries, malformed paths, and paths outside the photo tree.
5. Choose a consistent policy for empty theme folders: keep them ignored by
   gallery generation, but either permit them in `order` without warning or
   emit an actionable warning. Document the choice.
6. Add a build-time validation path that can be run locally and in CI without
   starting a server.

**Completion criteria:** Invalid JSON, unknown collection references, and
missing image references produce a clear non-zero build failure; valid current
configuration generates the same intended collections and homepage image.

**Priority:** High. This prevents silent broken pages as the folder-driven
content grows.

## Phase 5 — Align the writing card with its content schema

**Finding:** `src/components/WritingCard.astro` reads `post.data.hero`, but
`src/content.config.ts` does not define a `hero` field.

**Plan:**

1. Decide whether a separate hero image is a real content feature. If not,
   remove the unsupported `hero` fallback and keep the existing handwriting
   thumbnail behavior (or an explicit no-thumbnail treatment).
2. If hero images are intended, add an optional `hero` field to the schema,
   document its path convention, and validate that the referenced asset exists.
3. Use the selected thumbnail source consistently in listing cards and
   provide appropriate alternative text (see Phase 7).
4. Run Astro type checking after the decision so schema/template mismatches are
   caught.

**Completion criteria:** The card only uses fields represented in the schema,
and the behavior for text-only writings is intentional and documented.

**Priority:** Medium. Resolve before adding more thumbnail types.

## Phase 6 — Use writing descriptions as page metadata

**Finding:** Essay descriptions are present in frontmatter and the schema, but
are not rendered into document metadata. The base layout currently only sets a
title.

**Plan:**

1. Add optional `description` and canonical URL properties to
   `BaseLayout.astro`.
2. Render an escaped `<meta name="description">` when a description is
   supplied. Pass each writing's description from
   `src/pages/writings/[...slug].astro`.
3. Add a sensible fallback for pages without an explicit description; avoid
   generating duplicate boilerplate descriptions across all routes.
4. Add Open Graph and Twitter card tags for title, description, canonical URL,
   and an appropriate image where one exists. Use absolute URLs based on the
   configured site origin.
5. Decide whether the homepage, About page, photos landing page, and each photo
   collection need hand-written descriptions; add them where useful.
6. Check generated HTML for duplicate titles/descriptions and verify canonical
   URLs use the expected trailing-slash convention.

**Completion criteria:** Each writing page with a description emits that
description in its head, titles remain unique, and canonical/social URLs point
to the correct public route.

**Priority:** Medium. This improves search and link previews but does not block
core functionality.

## Phase 7 — Add meaningful image alternative text

**Finding:** Photo alt text is currently derived from filenames, often numeric
camera filenames. The writing-card thumbnail is intentionally empty-alt, and
handwritten pages also use empty alt text.

**Plan:**

1. Add an explicit `alt` field to the photo data model. Keep filenames as
   stable asset identifiers; do not overload filenames as descriptions.
2. Decide where photo metadata lives. For this small site, a sidecar manifest
   or a small JSON/TypeScript manifest keyed by relative photo path is likely
   clearer than embedding descriptive text in filenames. Preserve the
   folder-driven discovery of actual files.
3. Require an alt value for meaningful gallery photos. Allow an explicit empty
   value only for decorative images.
4. Use the photo alt text in collection galleries and provide concise,
   context-appropriate alt text for the homepage hero and collection covers.
5. For handwriting scans, decide whether the typed essay is a sufficient
   equivalent while the Handwritten view is active. If not, provide an
   accessible description or an accessible link to the typed version. Avoid
   reading the entire essay as image alt text.
6. Keep listing-card thumbnails empty-alt only when the card link's title
   already provides the same destination and the image adds no separate
   information.

**Completion criteria:** No meaningful photo is announced using a numeric
filename, and decorative/duplicate images remain correctly hidden from
assistive technology.

**Priority:** Medium, paired with the responsive image data-model work.

## Phase 8 — Make the lightbox keyboard and screen-reader accessible

**Finding:** Gallery images are click targets without keyboard focus. The
lightbox has labeled buttons but no dialog semantics or focus management.

**Plan:**

1. Make every gallery thumbnail a real button or an anchor with a clear
   accessible name. Preserve the visual layout and avoid nested interactive
   elements.
2. Mark the lightbox as a modal dialog (`role="dialog"`, `aria-modal="true"`)
   with an accessible name. Ensure it is hidden from accessibility APIs while
   closed.
3. When opened, save the triggering thumbnail, move focus to the close
   control, and keep keyboard focus inside the dialog while it is open.
4. On close, restore focus to the triggering thumbnail and restore the
   document's prior scroll state.
5. Keep Escape and arrow-key navigation; prevent arrow keys from scrolling the
   page while the lightbox is active. Ensure controls remain visible/focusable
   with a keyboard even after pointer-driven controls fade.
6. Give the displayed image a meaningful accessible description from the photo
   metadata. Announce the current position when navigating if testing shows the
   change is not otherwise clear to screen-reader users.
7. Check touch behavior, reduced-motion preferences, focus visibility, and
   close behavior through the backdrop.

**Completion criteria:** A keyboard-only user can open any image, navigate,
close it, and continue from the same thumbnail. A screen reader identifies the
modal and its controls, and background content cannot receive focus while the
modal is open.

**Priority:** High for accessibility; implement alongside Phase 7 if possible.

## Phase 9 — Keep content visible when JavaScript is unavailable

**Finding:** `.reveal` elements begin with `opacity: 0` and depend on the
`IntersectionObserver` setup in `BaseLayout.astro` to become visible.

**Plan:**

1. Change the default CSS state so content is visible without JavaScript.
2. Have the client script add a root class only after it confirms that
   `IntersectionObserver` is available and successfully initialized.
3. Apply the hidden reveal state only under that root class. If initialization
   fails, leave content visible.
4. Review which elements receive `.reveal`. Avoid observing a single very tall
   gallery or grid as one target with a threshold that may never be reached;
   use smaller groups or per-item reveal behavior only if it remains useful.
5. Honor `prefers-reduced-motion` and avoid animations that delay access to
   content.

**Completion criteria:** All page content remains readable with JavaScript
disabled or if observer initialization fails; reveal animations still work
where supported and respect reduced-motion settings.

**Priority:** Medium. This is a resilience and accessibility improvement.

## Phase 10 — Label the collection picker

**Finding:** The collection `<select>` in `CollectionPicker.astro` has no
visible or programmatic label and uses an inline `onchange` handler.

**Plan:**

1. Add a visible label if it fits the design; otherwise provide an explicit
   `aria-label` such as “Choose photo collection.”
2. Replace the inline event attribute with a component script that listens for
   the change event. Keep navigation functional when JavaScript is available;
   consider rendering ordinary collection links as a no-JavaScript fallback if
   the select is the only navigation method.
3. Add a visible keyboard focus style and retain a clear selected option.
4. Verify the control has a useful accessible name in a browser accessibility
   tree.

**Completion criteria:** Screen readers announce the control's purpose, the
selected collection is clear, and keyboard users can change collections.

**Priority:** Medium-low; small effort and appropriate to address with the
lightbox accessibility work.

## Phase 11 — Align docs and add repeatable quality checks

**Finding:** Documentation’s theme list is behind the current photo folders.
The project has build scripts but no explicit type-check or audit scripts.

**Plan:**

1. Update the theme examples and current folder list in `AGENTS.md`,
   `README.md`, and `photos/README.md`. Keep the explanation that folders are
   the source of truth, and distinguish the live theme folders from examples.
2. Document the EXIF policy, sort rule, image variants, alt-text metadata, and
   config validation behavior in the photo workflow.
3. Add a standard Astro type-check command (for example, `astro check`) and
   run it in CI alongside `npm run build` once the project has a CI workflow.
4. Add automated checks for photo configuration and references, metadata
   stripping, and route generation where these can be maintained cheaply.
   Prefer build-time validation over a separate test framework for these
   simple invariants.
5. Confirm the README's route count and deployment notes against generated
   output after implementation; remove stale counts rather than maintaining a
   fragile hard-coded number.
6. Once browser tracing is available, keep a small baseline record for key
   routes: home, photos landing, largest gallery, and handwritten essay. Track
   LCP, CLS, image transfer size, and total request count.

**Completion criteria:** Documentation describes the current implementation,
type checking and the static build run in CI, and the important data/asset
invariants fail clearly when broken.

**Priority:** Medium. This phase should follow the implementation decisions in
Phases 2–10 so the docs describe the final workflow.

## Suggested rollout

| Order | Work | Dependencies |
| --- | --- | --- |
| 1 | Strip metadata from existing public images and document the policy | None |
| 2 | Sort photos and make covers deterministic | None |
| 3 | Add config validation and reference checks | Phase 2 data model is helpful |
| 4 | Decide and implement image derivatives, loading, dimensions, and metadata | Phases 2 and 7 data model |
| 5 | Resolve the `hero` schema mismatch and wire descriptions into metadata | None |
| 6 | Add meaningful alt text and fix the lightbox/picker interactions | Phase 4 and image metadata design |
| 7 | Make scroll reveal progressive and resilient | None |
| 8 | Update documentation and CI checks; capture browser metrics | All implementation phases |

## Verification checklist

- [ ] No public photo contains GPS, camera, or capture-time metadata.
- [ ] Photo filenames sort consistently and determine covers as documented.
- [ ] Bad homepage, featured, and ordering references are reported clearly.
- [ ] Responsive galleries use appropriately sized sources and reserve layout
      space; offscreen images do not load eagerly.
- [ ] Lightbox can be operated entirely by keyboard and returns focus to its
      trigger.
- [ ] Meaningful photo alt text describes the image rather than its filename.
- [ ] Writing templates only access fields defined in the collection schema.
- [ ] Essay descriptions appear in generated page metadata.
- [ ] Content remains visible without JavaScript and with reduced motion.
- [ ] Collection picker has an accessible name and visible focus treatment.
- [ ] Documentation and CI checks reflect the final workflows.
- [ ] Browser performance metrics are recorded for the agreed routes.

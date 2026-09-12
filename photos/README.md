# Photos — how to organize & use

Themes drive everything. Each subfolder under `public/photos/` is one collection
(theme) shown on your site. There is **no build step**: `src/data/photos.ts`
reads the folder tree when the site is built.

## Adding / moving photos
- **Add to a theme:** drop the image file into the folder, e.g.
  `public/photos/street/my-photo.jpg`.
- **Move to another theme:** just relocate the file into the other folder
  (terminal `git mv old new` or drag-and-drop).
- **Create a new theme:** make a new folder, e.g. `public/photos/portraits/`.

That's it. `astro build` always sees the current files. When previewing locally,
**restart `npm run dev`** after adding or moving images (Vite doesn't watch
`public/`).

## Choosing collection covers
The first photo (alphabetically) in each folder becomes that collection's cover
and the one shown on the `/photos` cover grid. To choose a specific cover, prefix
the filename so it sorts first, e.g. `1_my-favorite.jpg`. (Listings are
alphabetical, so `0`, `1`, `A`, `a` sort before `p`. If you care about display
order within a theme, `1_`, `2_`, … prefixes are the easiest lever.)

## Configuration — `photos/config.json`
All configuration lives in one file:

```json
{
  "order": ["animals", "architecture", "clouds", "nature", "street", "night"],
  "homepage": "/photos/animals/panda.jpg",
  "featured": []
}
```

- **`order`** — which themes appear on the `/photos` landing grid and in what
  order. Any theme not listed is appended after, alphabetically.
- **`homepage`** — `/photos/...` path of the single homepage hero image, or
  `null` for the placeholder.
- **`featured`** — a flat cross-theme highlight reel. List image paths; it leads
  the landing grid as a "Featured" collection. Empty (`[]`) hides it entirely.

## Page structure on the site
- `/photos` — landing: a grid of collection cover cards you click into.
- `/photos/<theme>` — the masonry gallery with lightbox, e.g. `/photos/nature`.
- `/` — homepage, whose hero is the single image from `config.homepage`.

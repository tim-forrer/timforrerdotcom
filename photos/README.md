# Photos — how to organize & use

Themes drive everything. Each subfolder under `public/photos/` is one collection
(theme) shown on your site.

## Adding / moving photos
- **Add to a theme:** drop the image file into the folder, e.g.
  `public/photos/street/my-photo.jpg`.
- **Move to another theme:** just relocate the file into the other folder
  (terminal `git mv old new` or drag-and-drop).
- **Create a new theme:** make a new folder, e.g. `public/photos/portraits/`.
- Then regenerate the listings:

```bash
npm run photos        # rebuilds src/data/photos.json
```

All ordering beyond that is automatic — no code edits needed.

## Choosing collection covers
The first photo (alphabetically) in each folder becomes that collection's cover
and the one shown on the `/photos` cover grid. To choose a specific cover, prefix
the filename so it sorts first, e.g. `1_my-favorite.jpg` — or just accept the
default. (Listings are alphabetical, so `0`, `1`, `A`, `a` sort before `p`. If
you care about display order within a theme, `1_`, `2_`, … prefixes are the
easiest lever.)

## Homepage hero (set a single image)
Edit `photos/homepage.json` and point `"photo"` at any image that exists on the
site, then run `npm run photos`.

```json
{ "photo": "/photos/animals/panda.jpg" }
```

## "Featured" collection (flat highlight reel)
The nav and landing show a **Featured** option only once it has content. Put the
best shots from across your themes into `photos/featured.json`, then
`npm run photos`. Example:

```json
{
  "title": "Featured",
  "photos": [
    "/photos/nature/20260414_0019.JPG",
    "/photos/animals/panda.jpg"
  ]
}
```

## Collection order on the landing grid
Edit the list in `photos/order.json` to control which themes appear and in what
order (any theme not listed is appended after, in folder order).
`featured`, when populated, always leads.

## Page structure on the site
- `/photos` — landing: a grid of collection cover cards you click into.
- `/photos/<theme>` — the masonry gallery with lightbox, e.g. `/photos/nature`.
- `/` — homepage, whose hero is the single image from `homepage.json`.

> Tip: after any photo change, `npm run dev` to preview locally, or `npm run
> build` and the picture flow `npm run photos && astro build` runs automatically.

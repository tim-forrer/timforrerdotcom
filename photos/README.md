# Photos — how to organize & use

Themes drive everything. Each subfolder under `public/photos/` is one collection
(theme) shown on your site. `src/data/photos.ts` reads the source folder tree at
build time. Prepared WebP derivatives live in `public/photo-variants/` and
`public/writing-variants/`; commit them with the site so Cloudflare Pages does
not need image-processing tools at build time.

## Adding or moving photos

- **Add to a theme:** place the source image in a folder, e.g.
  `public/photos/street/my-photo.jpg`, and add its alt text and displayed
  dimensions to `photos/metadata.json` with a key relative to `public/photos/`.
- **Move a photo:** move the source into the other theme, update its metadata
  key, then prepare the images again.
- **Create a theme:** make a folder and add photos and metadata. Add the theme
  to `photos/config.json` if you want to set its position explicitly.

Run `npm run photos:prepare` after adding, moving, or changing source photos.
The command removes EXIF/IPTC/XMP metadata except orientation and color profile,
then generates 480px and 1600px WebP variants. It also creates lossless WebP
versions of the handwriting scans. The original files remain the folder-driven
source of truth; pages use the prepared variants. The command requires
ImageMagick and ExifTool (`brew install imagemagick exiftool`). Commit the
resulting variant files. The build reports an error if photo metadata or a
required derivative is missing.

When previewing locally, restart `npm run dev` after changing files under
`public/` because Vite does not watch those files reliably.

## Choosing collection covers and ordering

The first photo in a folder after a case-sensitive, bytewise filename sort
becomes that collection's cover and the one shown on `/photos`. Filename
prefixes set gallery order and can select a cover, for example
`0_my-favorite.jpg`. Configured collection order is followed by unlisted
collections in alphabetical order.

## Photo metadata

`photos/metadata.json` maps each source path relative to `public/photos/` to
descriptive `alt` text and orientation-correct displayed width and height. Each
discovered photo needs exactly one entry; stale or missing entries fail the
build. Describe the visible subject rather than repeating the filename. The
filename remains the stable source identifier.

## Configuration — `photos/config.json`

```json
{
  "order": ["animals", "architecture", "clouds", "nature", "street", "night"],
  "homepage": "/photos/animals/panda.jpg",
  "featured": []
}
```

- **`order`** — which themes appear on the `/photos` landing grid and in what
  order. Empty folders may be listed. Populated themes not listed are appended
  alphabetically. Unknown folders and duplicate entries fail the build.
- **`homepage`** — `/photos/...` source path of the homepage hero image, or
  `null` for the placeholder. The referenced source must exist.
- **`featured`** — source paths for a cross-theme highlight collection. Empty
  (`[]`) hides it. Every path must exist and may appear only once.

## Page structure

- `/photos` — landing page with collection cover cards.
- `/photos/<theme>` — masonry gallery with a lightbox, e.g. `/photos/nature`.
- `/` — homepage with the image set by `config.homepage`.

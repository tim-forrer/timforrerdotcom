import fs from 'node:fs';
import path from 'node:path';

export interface Photo {
  src: string;
  title: string;
}

export interface PhotoCollection {
  slug: string;
  title: string;
  cover: string;
  photos: Photo[];
}

const PHOTOS_DIR = path.resolve(process.cwd(), 'public/photos');
const CONFIG_FILE = path.resolve(process.cwd(), 'photos/config.json');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

interface PhotoConfig {
  order?: string[];
  homepage?: string | null;
  featured?: string[];
}

function titleCase(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function readConfig(): PhotoConfig {
  if (!fs.existsSync(CONFIG_FILE)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) as PhotoConfig;
}

function listPhotos(slug: string): Photo[] {
  const dir = path.join(PHOTOS_DIR, slug);
  return fs
    .readdirSync(dir)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .map((file) => ({
      src: `/photos/${slug}/${file}`,
      title: path.basename(file, path.extname(file)),
    }));
}

function buildThemes(config: PhotoConfig): PhotoCollection[] {
  const themes = new Map<string, PhotoCollection>();

  for (const entry of fs.readdirSync(PHOTOS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const photos = listPhotos(entry.name);
    if (photos.length === 0) continue;
    themes.set(entry.name, {
      slug: entry.name,
      title: titleCase(entry.name),
      cover: photos[0].src,
      photos,
    });
  }

  // Config order first (listed slugs only), then remaining themes alphabetically.
  const listed = (config.order ?? []).filter((slug) => themes.has(slug));
  const rest = [...themes.keys()].filter((slug) => !listed.includes(slug)).sort();

  return [...listed, ...rest].flatMap((slug) => {
    const theme = themes.get(slug);
    return theme ? [theme] : [];
  });
}

function buildFeatured(
  config: PhotoConfig,
  themes: PhotoCollection[],
): PhotoCollection | null {
  if (!config.featured || config.featured.length === 0) return null;
  const allPhotos = themes.flatMap((theme) => theme.photos);
  const photos = config.featured
    .map((src) => allPhotos.find((photo) => photo.src === src))
    .filter((photo): photo is Photo => Boolean(photo));
  if (photos.length === 0) return null;
  return { slug: 'featured', title: 'Featured', cover: photos[0].src, photos };
}

const config = readConfig();
const themes = buildThemes(config);
const featured = buildFeatured(config, themes);

export const photoCollections: PhotoCollection[] = featured
  ? [featured, ...themes]
  : themes;

export const homepagePhoto: string | null = config.homepage ?? null;

export function getCollectionBySlug(slug: string): PhotoCollection | undefined {
  return photoCollections.find((collection) => collection.slug === slug);
}

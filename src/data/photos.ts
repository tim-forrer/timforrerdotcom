import fs from 'node:fs';
import path from 'node:path';
import { z } from 'astro/zod';

export interface Photo {
  /** Public path to the large display derivative. */
  src: string;
  /** Public path to the small gallery derivative. */
  thumbSrc: string;
  /** Public path of the source image, used by photos/config.json references. */
  source: string;
  alt: string;
  width: number;
  height: number;
  largeWidth: number;
}

export interface PhotoCollection {
  slug: string;
  title: string;
  cover: Photo;
  photos: Photo[];
}

const PHOTOS_DIR = path.resolve(process.cwd(), 'public/photos');
const VARIANTS_DIR = path.resolve(process.cwd(), 'public/photo-variants');
const CONFIG_FILE = path.resolve(process.cwd(), 'photos/config.json');
const METADATA_FILE = path.resolve(process.cwd(), 'photos/metadata.json');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const SMALL_WIDTH = 480;
const LARGE_WIDTH = 1600;

const photoConfigSchema = z.object({
  order: z.array(z.string().min(1)).optional(),
  homepage: z.string().startsWith('/photos/').nullable().optional(),
  featured: z.array(z.string().startsWith('/photos/')).optional(),
}).strict();

const photoMetadataSchema = z.record(z.string(), z.object({
  alt: z.string().trim().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
}).strict());

type PhotoConfig = z.infer<typeof photoConfigSchema>;
type PhotoMetadata = z.infer<typeof photoMetadataSchema>[string];

function titleCase(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function readJson<T>(file: string, schema: z.ZodType<T>): T {
  let raw: string;
  try {
    raw = fs.readFileSync(file, 'utf-8');
  } catch (error) {
    throw new Error(`Unable to read ${path.relative(process.cwd(), file)}: ${String(error)}`);
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${path.relative(process.cwd(), file)}: ${String(error)}`);
  }

  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new Error(
      `Invalid ${path.relative(process.cwd(), file)}:\n${parsed.error.message}`,
    );
  }
  return parsed.data;
}

function readConfig(): PhotoConfig {
  if (!fs.existsSync(CONFIG_FILE)) return {};
  return readJson(CONFIG_FILE, photoConfigSchema);
}

function readMetadata(): Record<string, PhotoMetadata> {
  return readJson(METADATA_FILE, photoMetadataSchema);
}

const config = readConfig();
const metadata = readMetadata();

function sortedImageFiles(directory: string): string[] {
  return fs.readdirSync(directory)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function sourcePath(slug: string, file: string): string {
  return `/photos/${slug}/${file}`;
}

function buildPhoto(slug: string, file: string): Photo {
  const relativeFile = `${slug}/${file}`;
  const details = metadata[relativeFile];
  if (!details) {
    throw new Error(`Missing photo metadata for ${relativeFile} in photos/metadata.json`);
  }

  const thumbFile = `${file}.${SMALL_WIDTH}.webp`;
  const largeFile = `${file}.${LARGE_WIDTH}.webp`;
  const thumbDiskPath = path.join(VARIANTS_DIR, slug, thumbFile);
  const largeDiskPath = path.join(VARIANTS_DIR, slug, largeFile);
  if (!fs.existsSync(thumbDiskPath) || !fs.existsSync(largeDiskPath)) {
    throw new Error(
      `Missing generated photo variants for ${relativeFile}; run npm run photos:prepare`,
    );
  }

  return {
    source: sourcePath(slug, file),
    src: `/photo-variants/${slug}/${largeFile}`,
    thumbSrc: `/photo-variants/${slug}/${thumbFile}`,
    alt: details.alt,
    width: details.width,
    height: details.height,
    largeWidth: Math.min(details.width, LARGE_WIDTH),
  };
}

function buildThemes(): PhotoCollection[] {
  if (!fs.existsSync(PHOTOS_DIR)) {
    throw new Error('Photo source directory public/photos does not exist');
  }

  const directories = fs.readdirSync(PHOTOS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name);

  const configuredOrder = config.order ?? [];
  const duplicateOrderEntries = configuredOrder.filter(
    (slug, index) => configuredOrder.indexOf(slug) !== index,
  );
  if (duplicateOrderEntries.length > 0) {
    throw new Error(`Duplicate photo collection in photos/config.json order: ${[...new Set(duplicateOrderEntries)].join(', ')}`);
  }

  const unknownOrderEntries = configuredOrder.filter((slug) => !directories.includes(slug));
  if (unknownOrderEntries.length > 0) {
    throw new Error(`Unknown photo collection in photos/config.json order: ${unknownOrderEntries.join(', ')}`);
  }

  const collections = new Map<string, PhotoCollection>();
  for (const slug of directories) {
    const photos = sortedImageFiles(path.join(PHOTOS_DIR, slug))
      .map((file) => buildPhoto(slug, file));
    if (photos.length === 0) continue;
    collections.set(slug, {
      slug,
      title: titleCase(slug),
      cover: photos[0],
      photos,
    });
  }

  const discoveredSources = new Set(
    [...collections.values()].flatMap((collection) => collection.photos.map((photo) => photo.source)),
  );
  const metadataEntries = Object.keys(metadata);
  const missingSourceEntries = [...discoveredSources].filter((source) => !metadataEntries.includes(source.slice('/photos/'.length)));
  const orphanMetadataEntries = metadataEntries.filter((entry) => !discoveredSources.has(`/photos/${entry}`));
  if (missingSourceEntries.length > 0 || orphanMetadataEntries.length > 0) {
    throw new Error([
      missingSourceEntries.length ? `Missing photo metadata: ${missingSourceEntries.join(', ')}` : '',
      orphanMetadataEntries.length ? `Metadata does not match a source photo: ${orphanMetadataEntries.join(', ')}` : '',
    ].filter(Boolean).join('\n'));
  }

  const ordered = configuredOrder.filter((slug) => collections.has(slug));
  const rest = [...collections.keys()].filter((slug) => !ordered.includes(slug)).sort();
  return [...ordered, ...rest].map((slug) => collections.get(slug)!);
}

const themes = buildThemes();
const allPhotos = themes.flatMap((theme) => theme.photos);
const photosBySource = new Map(allPhotos.map((photo) => [photo.source, photo]));

if (config.homepage && !photosBySource.has(config.homepage)) {
  throw new Error(`Homepage photo ${config.homepage} does not exist in public/photos`);
}

const featuredSources = config.featured ?? [];
const duplicateFeatured = featuredSources.filter(
  (source, index) => featuredSources.indexOf(source) !== index,
);
if (duplicateFeatured.length > 0) {
  throw new Error(`Duplicate photo in photos/config.json featured: ${[...new Set(duplicateFeatured)].join(', ')}`);
}

const missingFeatured = featuredSources.filter((source) => !photosBySource.has(source));
if (missingFeatured.length > 0) {
  throw new Error(`Featured photo does not exist in public/photos: ${missingFeatured.join(', ')}`);
}

const featuredPhotos = featuredSources.map((source) => photosBySource.get(source)!);
const featured: PhotoCollection | null = featuredPhotos.length > 0
  ? { slug: 'featured', title: 'Featured', cover: featuredPhotos[0], photos: featuredPhotos }
  : null;

export const photoCollections: PhotoCollection[] = featured
  ? [featured, ...themes]
  : themes;

const homepage = config.homepage ? photosBySource.get(config.homepage) : undefined;
export const homepagePhoto: Photo | null = homepage ?? null;

export function getCollectionBySlug(slug: string): PhotoCollection | undefined {
  return photoCollections.find((collection) => collection.slug === slug);
}

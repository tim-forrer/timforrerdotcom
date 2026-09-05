#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PHOTOS_DIR = path.resolve(ROOT, 'public/photos');
const CONFIG_DIR = path.resolve(ROOT, 'photos');
const ORDER_FILE = path.resolve(CONFIG_DIR, 'order.json');
const FEATURED_FILE = path.resolve(CONFIG_DIR, 'featured.json');
const HOMEPAGE_FILE = path.resolve(CONFIG_DIR, 'homepage.json');
const OUTPUT_FILE = path.resolve(ROOT, 'src/data/photos.json');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

function titleCase(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function generateThemeCollections() {
  const entries = fs.readdirSync(PHOTOS_DIR, { withFileTypes: true });

  const collections = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'placeholders') {
      continue;
    }
    const dirPath = path.join(PHOTOS_DIR, entry.name);
    const files = fs.readdirSync(dirPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext);
    });
    if (files.length === 0) continue;

    const photos = files.map(file => ({
      src: `/photos/${entry.name}/${file}`,
      title: path.basename(file, path.extname(file)),
    }));

    collections.push({
      slug: entry.name,
      title: titleCase(entry.name),
      cover: photos[0].src,
      photos,
    });
  }

  // Apply the desired order from photos/order.json (listed slugs first, in that order).
  let order = [];
  if (fs.existsSync(ORDER_FILE)) {
    order = JSON.parse(fs.readFileSync(ORDER_FILE, 'utf-8'));
  }
  const bySlug = new Map(collections.map(c => [c.slug, c]));
  const ordered = [];
  for (const slug of order) {
    if (bySlug.has(slug)) ordered.push(bySlug.get(slug));
  }
  // Any collections not in the order file, in their original folder order.
  const unordered = collections.filter(c => !order.includes(c.slug));
  return [...ordered, ...unordered];
}

function loadSrcs(photos) {
  return photos.map(p => p.src);
}

function buildSubset(configFile, titleKey, allSrcs) {
  if (!fs.existsSync(configFile)) return null;
  const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  const src = config.photo ?? config.photos;
  const list = Array.isArray(src) ? src : [src];
  const items = list
    .filter(Boolean)
    .map(s => allSrcs.find(p => p.src === s))
    .filter(Boolean);
  if (items.length === 0) return null;
  return {
    slug: configFile === HOMEPAGE_FILE ? 'homepage' : 'featured',
    title: config.title || (configFile === HOMEPAGE_FILE ? 'Homepage' : 'Featured'),
    cover: items[0].src,
    photos: items,
  };
}

const themeCollections = generateThemeCollections();
const allSrcs = themeCollections.flatMap(c => c.photos);

const featured = buildSubset(FEATURED_FILE, 'title', allSrcs);
const homepage = buildSubset(HOMEPAGE_FILE, 'photo', allSrcs);

const collections = featured ? [featured, ...themeCollections] : themeCollections;

const payload = {
  homepage: homepage ? homepage.cover : null,
  collections,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2));
console.log(
  `Generated ${collections.length} collection(s) (${featured ? 'featured + ' : ''}${themeCollections.length} themes). ` +
  `Homepage: ${homepage ? homepage.cover : 'not set'}.`
);

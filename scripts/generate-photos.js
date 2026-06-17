#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const PHOTOS_DIR = path.resolve(process.cwd(), 'public/photos');
const FEATURED_CONFIG = path.resolve(process.cwd(), 'photos/featured.json');
const OUTPUT_FILE = path.resolve(process.cwd(), 'src/data/photos.json');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

function generateCollections() {
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
      title: entry.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      cover: photos[0].src,
      photos,
    });
  }

  return collections;
}

function generateFeatured(allCollections) {
  if (!fs.existsSync(FEATURED_CONFIG)) {
    return null;
  }

  const config = JSON.parse(fs.readFileSync(FEATURED_CONFIG, 'utf-8'));
  const allPhotos = allCollections.flatMap(c => c.photos);
  const photos = config.photos
    .map(src => allPhotos.find(p => p.src === src))
    .filter(Boolean);

  if (photos.length === 0) return null;

  return {
    slug: 'featured',
    title: config.title || 'Featured',
    cover: photos[0].src,
    photos,
  };
}

const allCollections = generateCollections();
const featured = generateFeatured(allCollections);

const collections = featured 
  ? [featured, ...allCollections]
  : allCollections;

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(collections, null, 2));
console.log(`Generated ${collections.length} collections (${featured ? 'featured + ' : ''}${allCollections.length} folders) to ${OUTPUT_FILE}`);

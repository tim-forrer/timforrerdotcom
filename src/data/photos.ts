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

import data from './photos.json';

export const homepagePhoto: string | null = data.homepage;

export const photoCollections: PhotoCollection[] = data.collections;

export function getCollectionBySlug(slug: string): PhotoCollection | undefined {
  return photoCollections.find((c) => c.slug === slug);
}

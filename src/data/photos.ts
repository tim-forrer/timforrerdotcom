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

import collections from './photos.json';

export const photoCollections: PhotoCollection[] = collections;

export function getFeaturedPhotos(): Photo[] {
  return photoCollections[0]?.photos ?? [];
}

export function getCollectionBySlug(slug: string): PhotoCollection | undefined {
  return photoCollections.find((c) => c.slug === slug);
}

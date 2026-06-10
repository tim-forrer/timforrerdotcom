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

export const photoCollections: PhotoCollection[] = [
  {
    slug: "oregon-coast",
    title: "Oregon Coast",
    cover: "/photos/placeholders/coast-cover.jpg",
    photos: [
      { src: "/photos/placeholders/coast-01.jpg", title: "Haystack Rock" },
      { src: "/photos/placeholders/coast-02.jpg", title: "Mist at Cannon Beach" },
    ],
  },
  {
    slug: "mountains",
    title: "Mountains",
    cover: "/photos/placeholders/mtn-cover.jpg",
    photos: [
      { src: "/photos/placeholders/mtn-01.jpg", title: "Alpine Meadow" },
      { src: "/photos/placeholders/mtn-02.jpg", title: "Summit View" },
    ],
  },
];

export function getFeaturedPhotos(): Photo[] {
  return photoCollections.flatMap((c) => c.photos).slice(0, 7);
}

export function getCollectionBySlug(slug: string): PhotoCollection | undefined {
  return photoCollections.find((c) => c.slug === slug);
}

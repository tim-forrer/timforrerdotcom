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
    slug: "featured",
    title: "Featured",
    cover: "/photos/placeholders/temp-img.jpg",
    photos: [
      { src: "/photos/placeholders/temp-img.jpg", title: "Golden Hour" },
      { src: "/photos/placeholders/temp-img.jpg", title: "Morning Light" },
      { src: "/photos/placeholders/temp-img.jpg", title: "Reflections" },
      { src: "/photos/placeholders/temp-img.jpg", title: "Path Through the Trees" },
      { src: "/photos/placeholders/temp-img.jpg", title: "Coastal View" },
    ],
  },
  {
    slug: "oregon-coast",
    title: "Oregon Coast",
    cover: "/photos/placeholders/temp-img.jpg",
    photos: [
      { src: "/photos/placeholders/temp-img.jpg", title: "Haystack Rock" },
      { src: "/photos/placeholders/temp-img.jpg", title: "Mist at Cannon Beach" },
    ],
  },
  {
    slug: "mountains",
    title: "Mountains",
    cover: "/photos/placeholders/temp-img.jpg",
    photos: [
      { src: "/photos/placeholders/temp-img.jpg", title: "Alpine Meadow" },
      { src: "/photos/placeholders/temp-img.jpg", title: "Summit View" },
    ],
  },
];

export function getFeaturedPhotos(): Photo[] {
  return photoCollections[0].photos;
}

export function getCollectionBySlug(slug: string): PhotoCollection | undefined {
  return photoCollections.find((c) => c.slug === slug);
}

import type { CollectionEntry } from 'astro:content';

/** Rough minutes to read, derived from the raw Markdown body length. */
export function readingTime(post: CollectionEntry<'writings'>): number {
  return Math.max(1, Math.ceil((post.body?.length ?? 0) / 1000));
}

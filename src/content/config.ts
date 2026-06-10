import { defineCollection, z } from 'astro:content';

const writingsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    hero: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = {
  writings: writingsCollection,
};

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const writings = defineCollection({
  loader: glob({ base: './src/content/writings', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
    handwriting: z.array(z.string()).optional(),
  }),
});

export const collections = { writings };

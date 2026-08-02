import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const services = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/services' }),
  schema: z.object({
    num: z.string(),
    title: z.string(),
    image: z.string(),
    imageWidth: z.number(),
    imageHeight: z.number(),
    description: z.string(),
    tags: z.array(z.string()),
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/gallery' }),
  schema: z.object({
    order: z.number(),
    image: z.string(),
    imageWidth: z.number(),
    imageHeight: z.number(),
    alt: z.string(),
    label: z.string(),
    caption: z.string(),
    size: z.enum(['normal', 'tall', 'wide']).default('normal'),
  }),
});

export const collections = { services, gallery };

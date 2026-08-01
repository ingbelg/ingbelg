import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const services = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/services' }),
  schema: z.object({
    num: z.string(),
    title: z.string(),
    image: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/gallery' }),
  schema: z.object({
    order: z.number(),
    image: z.string(),
    alt: z.string(),
    label: z.string(),
    caption: z.string(),
    size: z.enum(['normal', 'tall', 'wide']).default('normal'),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/testimonials' }),
  schema: z.object({
    rating: z.number().min(1).max(5),
    text: z.string(),
    author: z.string(),
    city: z.string(),
    demo: z.boolean().default(true),
  }),
});

export const collections = { services, gallery, testimonials };

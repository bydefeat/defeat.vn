import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';

export const newsSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string().max(110),
    description: z.string().max(180),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    cover: image().optional(),
    coverAlt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    author: z.string().optional(),
    draft: z.boolean().default(false),
  });

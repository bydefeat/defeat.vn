import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';

export const PRODUCT_CATEGORIES = ['source-code', 'saas', 'solution', 'template'] as const;

export const productSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    summary: z.string().max(200),
    category: z.enum(PRODUCT_CATEGORIES),
    cover: image().optional(),
    coverAlt: z.string().optional(),
    icon: image().optional(),
    techStack: z.array(z.string()).default([]),
    features: z.array(z.string()).default([]),
    demoUrl: z.url().optional(),
    listPriceVnd: z.number().int().positive().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(100),
    draft: z.boolean().default(false),
  });

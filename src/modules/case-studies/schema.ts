import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';

export const caseStudySchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    summary: z.string().max(220),
    client: z.string(),
    industry: z.string(),
    date: z.coerce.date(),
    cover: image().optional(),
    coverAlt: z.string().optional(),
    techStack: z.array(z.string()).default([]),
    results: z.array(z.object({ value: z.string(), label: z.string() })).max(4).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  });

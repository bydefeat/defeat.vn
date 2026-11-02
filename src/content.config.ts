/**
 * Đăng ký collections. Schema nằm trong từng module (src/modules/<module>/schema.ts).
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { newsSchema } from '@modules/news/schema';
import { productSchema } from '@modules/products/schema';
import { caseStudySchema } from '@modules/case-studies/schema';

const news = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/news' }),
  schema: newsSchema,
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/products' }),
  schema: productSchema,
});

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/case-studies' }),
  schema: caseStudySchema,
});

export const collections = { news, products, caseStudies };

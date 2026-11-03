import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '@i18n/config';
import { LOCALES } from '@i18n/config';
import { pickLocalized, splitId } from '@shared/lib/content';

export type ProductEntry = CollectionEntry<'products'>;

const isPublished = (e: ProductEntry) => import.meta.env.DEV || !e.data.draft;

export async function getProducts(locale: Locale, opts: { featured?: boolean; limit?: number } = {}) {
  const all = pickLocalized(await getCollection('products', isPublished), locale).filter((e) => !opts.featured || e.data.featured);
  const sorted = all.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
  return opts.limit ? sorted.slice(0, opts.limit) : sorted;
}

export async function getProductLocales(slug: string): Promise<Locale[]> {
  const all = await getCollection('products', isPublished);
  return all.map((e) => splitId(e.id)).filter((s) => s.slug === slug).map((s) => s.locale);
}

export const productSlug = (e: ProductEntry) => splitId(e.id).slug;
export const productPath = (e: ProductEntry) => `/products/${productSlug(e)}`;

export async function productStaticPaths(locale: Locale) {
  const items = await getProducts(locale);
  return Promise.all(
    items.map(async (product) => ({
      params: { slug: productSlug(product) },
      props: { product, availableLocales: [...LOCALES], translations: await getProductLocales(productSlug(product)) },
    })),
  );
}

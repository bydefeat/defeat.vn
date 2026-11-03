import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '@i18n/config';
import { LOCALES } from '@i18n/config';
import { pickLocalized, splitId } from '@shared/lib/content';

export type CaseStudyEntry = CollectionEntry<'caseStudies'>;

const isPublished = (e: CaseStudyEntry) => import.meta.env.DEV || !e.data.draft;

export async function getCaseStudies(locale: Locale, opts: { featured?: boolean; limit?: number } = {}) {
  const all = pickLocalized(await getCollection('caseStudies', isPublished), locale).filter((e) => !opts.featured || e.data.featured);
  const sorted = all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return opts.limit ? sorted.slice(0, opts.limit) : sorted;
}

export async function getCaseStudyLocales(slug: string): Promise<Locale[]> {
  const all = await getCollection('caseStudies', isPublished);
  return all.map((e) => splitId(e.id)).filter((s) => s.slug === slug).map((s) => s.locale);
}

export const caseStudySlug = (e: CaseStudyEntry) => splitId(e.id).slug;
export const caseStudyPath = (e: CaseStudyEntry) => `/case-studies/${caseStudySlug(e)}`;

export async function caseStudyStaticPaths(locale: Locale) {
  const items = await getCaseStudies(locale);
  return Promise.all(
    items.map(async (item) => ({
      params: { slug: caseStudySlug(item) },
      props: { item, availableLocales: [...LOCALES], translations: await getCaseStudyLocales(caseStudySlug(item)) },
    })),
  );
}

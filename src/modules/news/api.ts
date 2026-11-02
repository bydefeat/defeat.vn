import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '@i18n/config';
import { splitId } from '@shared/lib/content';

export type NewsEntry = CollectionEntry<'news'>;

const isPublished = (e: NewsEntry) => import.meta.env.DEV || !e.data.draft;

/** Bài viết theo ngôn ngữ, mới nhất trước. */
export async function getNews(locale: Locale, limit?: number): Promise<NewsEntry[]> {
  const all = await getCollection('news', (e) => isPublished(e) && splitId(e.id).locale === locale);
  const sorted = all.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  return limit ? sorted.slice(0, limit) : sorted;
}

/** Ngôn ngữ có bản dịch cho cùng slug. */
export async function getNewsLocales(slug: string): Promise<Locale[]> {
  const all = await getCollection('news', isPublished);
  return all.map((e) => splitId(e.id)).filter((s) => s.slug === slug).map((s) => s.locale);
}

export const newsSlug = (e: NewsEntry) => splitId(e.id).slug;
export const newsPath = (e: NewsEntry) => `/news/${newsSlug(e)}`;

/** getStaticPaths cho trang chi tiết (SSG). */
export async function newsStaticPaths(locale: Locale) {
  const posts = await getNews(locale);
  return Promise.all(
    posts.map(async (post) => ({
      params: { slug: newsSlug(post) },
      props: { post, availableLocales: await getNewsLocales(newsSlug(post)) },
    })),
  );
}

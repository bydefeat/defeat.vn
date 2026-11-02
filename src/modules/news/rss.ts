import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '@config/site';
import { LOCALE_META, type Locale } from '@i18n/config';
import { localizePath } from '@i18n/utils';
import { getNews, newsPath } from './api';
import { newsText } from './i18n';

export async function newsRss(context: APIContext, locale: Locale) {
  const posts = await getNews(locale);
  return rss({
    title: `${SITE.name} — ${newsText[locale].eyebrow}`,
    description: newsText[locale].desc,
    site: context.site ?? SITE.url,
    customData: `<language>${LOCALE_META[locale].hreflang}</language>`,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: localizePath(newsPath(p), locale),
      categories: p.data.tags,
    })),
  });
}

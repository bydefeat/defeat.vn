import { SITE } from '@config/site';
import type { Locale } from '@i18n/config';
import { LOCALE_META } from '@i18n/config';

/** Các builder JSON-LD (schema.org). Trả về object thuần, Seo.astro sẽ serialize. */
export type JsonLd = Record<string, unknown>;

const abs = (path: string) => new URL(path, SITE.url).toString();

export function organizationLd(): JsonLd {
  const sameAs = Object.values(SITE.social).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: abs('/icon-512.png'),
    email: SITE.email,
    foundingDate: String(SITE.foundingYear),
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.address.locality,
      addressCountry: SITE.address.country,
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteLd(locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    inLanguage: LOCALE_META[locale].hreflang,
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}

export function breadcrumbLd(items: ReadonlyArray<{ name: string; href: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.href),
    })),
  };
}

export function articleLd(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  datePublished: Date;
  dateModified?: Date;
  author?: string;
  locale: Locale;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: input.title,
    description: input.description,
    mainEntityOfPage: abs(input.path),
    image: [abs(input.image ?? SITE.ogImage)],
    datePublished: input.datePublished.toISOString(),
    dateModified: (input.dateModified ?? input.datePublished).toISOString(),
    inLanguage: LOCALE_META[input.locale].hreflang,
    author: input.author
      ? { '@type': 'Person', name: input.author }
      : { '@id': `${SITE.url}/#organization` },
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}

export function softwareLd(input: {
  name: string;
  description: string;
  path: string;
  image?: string;
  category: string;
  priceVnd?: number;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: input.name,
    description: input.description,
    url: abs(input.path),
    image: abs(input.image ?? SITE.ogImage),
    applicationCategory: input.category,
    operatingSystem: 'Web',
    publisher: { '@id': `${SITE.url}/#organization` },
    ...(input.priceVnd
      ? { offers: { '@type': 'Offer', price: input.priceVnd, priceCurrency: 'VND', availability: 'https://schema.org/InStock' } }
      : {}),
  };
}

export function serviceLd(input: { name: string; description: string; path: string }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: abs(input.path),
    provider: { '@id': `${SITE.url}/#organization` },
    areaServed: ['VN', 'Worldwide'],
  };
}

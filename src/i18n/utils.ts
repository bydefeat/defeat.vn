import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from './config';
import { ui, type UIKey } from './ui';

export function useTranslations(locale: Locale) {
  return function t(key: UIKey): string {
    return ui[locale][key] ?? ui[DEFAULT_LOCALE][key];
  };
}

export function resolveLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function localizePath(path: string, locale: Locale): string {
  const clean = '/' + path.replace(/^\/+|\/+$/g, '');
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
}

export function stripLocale(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length && isLocale(parts[0]) && parts[0] !== DEFAULT_LOCALE) parts.shift();
  return '/' + parts.join('/');
}

export function alternatePaths(pathWithoutLocale: string): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((l) => [l, localizePath(pathWithoutLocale, l)])) as Record<Locale, string>;
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

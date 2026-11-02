export const LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'vi';

export const LOCALE_META: Record<Locale, { label: string; hreflang: string; ogLocale: string }> = {
  vi: { label: 'Tiếng Việt', hreflang: 'vi-VN', ogLocale: 'vi_VN' },
  en: { label: 'English', hreflang: 'en-US', ogLocale: 'en_US' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

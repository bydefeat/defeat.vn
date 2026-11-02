import type { Locale } from '@i18n/config';
import { isLocale, DEFAULT_LOCALE } from '@i18n/config';

/**
 * Quy ước nội dung đa ngôn ngữ: src/content/<collection>/<locale>/<slug>.mdx
 * => entry.id = "<locale>/<slug>". Cùng slug ở hai ngôn ngữ = bản dịch của nhau.
 */
export function splitId(id: string): { locale: Locale; slug: string } {
  const [first, ...rest] = id.split('/');
  if (isLocale(first) && rest.length) return { locale: first, slug: rest.join('/') };
  return { locale: DEFAULT_LOCALE, slug: id };
}

/** Ước tính thời gian đọc (phút) từ nội dung thô. */
export function readingTime(body: string | undefined): number {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

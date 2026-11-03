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

/**
 * Chọn 1 bản cho mỗi slug theo ngôn ngữ trang: có bản dịch thì dùng, thiếu thì lấy bản tiếng Việt (mặc định),
 * cuối cùng là bất kỳ bản nào có. => Chỉ cần viết 1 ngôn ngữ, trang ngôn ngữ còn lại vẫn có đủ bài.
 */
export function pickLocalized<T extends { id: string }>(entries: T[], locale: Locale): T[] {
  const rank = (l: Locale) => (l === locale ? 0 : l === DEFAULT_LOCALE ? 1 : 2);
  const best = new Map<string, { entry: T; rank: number }>();
  for (const entry of entries) {
    const { locale: l, slug } = splitId(entry.id);
    const r = rank(l);
    const cur = best.get(slug);
    if (!cur || r < cur.rank) best.set(slug, { entry, rank: r });
  }
  return [...best.values()].map((v) => v.entry);
}

/** Ngôn ngữ thật của nội dung (thư mục chứa file). */
export const entryLocale = (entry: { id: string }): Locale => splitId(entry.id).locale;

/** Ước tính thời gian đọc (phút) từ nội dung thô. */
export function readingTime(body: string | undefined): number {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

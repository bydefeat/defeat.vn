import { getEntry } from 'astro:content';
import type { Locale } from '@i18n/config';

/**
 * Nguồn giá "sống" của sản phẩm.
 * Hiện đọc `listPriceVnd` từ content; giai đoạn Store thay bằng truy vấn DB/API.
 * Được gọi từ phần render on-demand (server island + API), không chạy lúc build.
 */
export interface LivePrice {
  slug: string;
  amountVnd: number | null;
  updatedAt: string;
}

export async function getLivePrice(slug: string, locale: Locale = 'vi'): Promise<LivePrice | null> {
  const entry = (await getEntry('products', `${locale}/${slug}`)) ?? (await getEntry('products', `vi/${slug}`));
  if (!entry) return null;
  return { slug, amountVnd: entry.data.listPriceVnd ?? null, updatedAt: new Date().toISOString() };
}

export function formatVnd(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

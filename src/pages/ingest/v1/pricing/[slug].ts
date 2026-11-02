/**
 * SSR + ISR: giá sản phẩm dạng JSON cho tích hợp bên ngoài / client.
 * Cache theo `routeRules` trong astro.config.mjs (maxAge 600s, swr 1 ngày, tag "pricing").
 * Khi giá đổi: gọi `context.cache.invalidate({ tags: ['pricing'] })` từ webhook quản trị.
 */
import type { APIRoute } from 'astro';
import { getLivePrice } from '@modules/products/pricing';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const price = params.slug ? await getLivePrice(params.slug) : null;
  if (!price) return Response.json({ error: 'not_found' }, { status: 404 });
  return Response.json(price);
};

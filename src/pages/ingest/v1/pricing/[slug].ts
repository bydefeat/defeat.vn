import type { APIRoute } from 'astro';
import { getLivePrice } from '@modules/products/pricing';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const price = params.slug ? await getLivePrice(params.slug) : null;
  if (!price) return Response.json({ error: 'not_found' }, { status: 404 });
  return Response.json(price);
};

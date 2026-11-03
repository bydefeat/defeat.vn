import type { APIRoute } from 'astro';
import { newsRss } from '@modules/news/rss';

export const GET: APIRoute = (context) => newsRss(context, 'vi');

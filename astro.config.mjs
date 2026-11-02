// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { cacheCloudflare } from '@astrojs/cloudflare/cache';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://defeat.vn';

/**
 * Chiến lược render (xem docs/ARCHITECTURE.md):
 * - SSG  : mặc định. Mọi trang trong src/pages được prerender lúc build.
 * - SSR  : trang/endpoint có `export const prerender = false` (API, Actions).
 * - ISR  : SSR + route caching (stale-while-revalidate) qua `routeRules` / `Astro.cache`.
 * - CSR  : React islands (`client:visible`, `client:idle`).
 * - Server Islands: `server:defer` cho phần động trong trang tĩnh.
 */
export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  adapter: cloudflare(),

  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    routing: { prefixDefaultLocale: false },
  },

  // Prism (class-based) thay vì Shiki (inline style) để tương thích CSP.
  markdown: { syntaxHighlight: 'prism' },

  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Be Vietnam Pro',
      cssVariable: '--font-be-vietnam',
      weights: [400, 500, 600, 700, 800],
      styles: ['normal'],
      subsets: ['vietnamese', 'latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      // Font mono cho nhãn, eyebrow, số liệu — chất "terminal/dither".
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains',
      weights: [400, 600],
      styles: ['normal'],
      subsets: ['vietnamese', 'latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],

  security: {
    csp: { algorithm: 'SHA-256' },
  },

  cache: {
    provider: cacheCloudflare(),
  },
  routeRules: {
    // ISR: endpoint giá sản phẩm cache 10 phút, cho phép trả bản cũ 1 ngày khi đang làm mới.
    '/ingest/v1/pricing/[slug]': { maxAge: 600, swr: 86400, tags: ['pricing'] },
  },

  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'secret', default: 'contact@defeat.vn' }),
      CONTACT_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', default: 'DEFEAT <noreply@defeat.vn>' }),
    },
  },

  integrations: [
    react(),
    mdx(),
    sitemap({
      i18n: { defaultLocale: 'vi', locales: { vi: 'vi-VN', en: 'en-US' } },
      // Loại trang noindex (pháp lý chưa có nội dung, 404) khỏi sitemap.
      filter: (page) => !/\/(ingest\/|404|privacy|terms)/.test(new URL(page).pathname),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});

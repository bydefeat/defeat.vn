// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { cacheCloudflare } from '@astrojs/cloudflare/cache';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { existsSync } from 'node:fs';

const SITE = 'https://defeat.vn';

// Bài /en/... chưa có bản tiếng Anh vẫn được dựng (dùng bản tiếng Việt, canonical trỏ về bản gốc) → không đưa vào sitemap.
/** @param {string} pathname */
const isUntranslated = (pathname) => {
  const m = pathname.match(/^\/en\/(news|products|case-studies)\/([^/]+)$/);
  if (!m) return false;
  const base = `./src/content/${m[1]}/en/${m[2]}`;
  return !existsSync(`${base}.mdx`) && !existsSync(`${base}.md`);
};

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

  // Rê chuột vào link → trình duyệt tải trước. Với clientPrerender (Speculation Rules), Chrome/Edge còn DỰNG SẴN
  // trang → bấm là hiện ngay, gần như không thấy vòng quay loading ở tab. Trình duyệt khác tự dùng prefetch thường.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  experimental: {
    clientPrerender: true,
  },

  fonts: [
    {
      // Inter — font giao diện doanh nghiệp, đọc tốt trên màn hình, hỗ trợ đầy đủ tiếng Việt.
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      // Dải weight → 1 file variable cho mỗi subset.
      weights: ['400 800'],
      // 'fallback': chặn tối đa ~100ms → font đã cache hiển thị ngay, không đổi font giữa chừng.
      display: 'fallback',
      styles: ['normal'],
      subsets: ['vietnamese', 'latin'],
      fallbacks: ['system-ui', 'sans-serif'],
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
      filter: (page) => {
        const { pathname } = new URL(page);
        return !/\/(ingest\/|404|privacy|terms)/.test(pathname) && !isUntranslated(pathname);
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});

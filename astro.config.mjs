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

/** @param {string} pathname */
const isUntranslated = (pathname) => {
  const m = pathname.match(/^\/en\/(news|products|case-studies)\/([^/]+)$/);
  if (!m) return false;
  const base = `./src/content/${m[1]}/en/${m[2]}`;
  return !existsSync(`${base}.mdx`) && !existsSync(`${base}.md`);
};

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

  markdown: { syntaxHighlight: 'prism' },

  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  experimental: {
    clientPrerender: true,
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['400 800'],
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

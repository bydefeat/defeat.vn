# DEFEAT.vn — Kiến trúc

## 1. Kiến trúc module

```
src/
├─ config/site.ts            # Thông tin công ty, menu chính
├─ i18n/                     # Cấu hình ngôn ngữ, chuỗi giao diện dùng chung, helper URL
├─ shared/                   # Dùng chung, KHÔNG phụ thuộc module nghiệp vụ
│  ├─ layouts/BaseLayout.astro
│  ├─ components/            # Header, Footer, PageHero, Breadcrumbs, Icon, CtaBand...
│  ├─ seo/                   # Seo.astro (meta/OG/hreflang), jsonld.ts (schema.org)
│  └─ lib/                   # Helper thuần
├─ modules/                  # Mỗi module = một miền nghiệp vụ, tự chứa
│  ├─ home/                  # sections/* + HomePage.astro
│  ├─ services/              # data.ts, components/, pages/
│  ├─ products/              # schema.ts, api.ts, pricing.ts, components/, pages/
│  ├─ case-studies/          # schema.ts, api.ts, components/, pages/
│  ├─ news/                  # schema.ts, api.ts, rss.ts, components/, pages/
│  ├─ contact/               # action.ts, components/ContactForm.tsx, pages/
│  ├─ about/  legal/
├─ content/<collection>/<locale>/<slug>.mdx
├─ content.config.ts         # Chỉ đăng ký collection, schema lấy từ module
├─ actions/index.ts          # Chỉ đăng ký action, logic nằm trong module
└─ pages/                    # Route mỏng: import trang từ module, không chứa logic
   └─ en/                    # Bản tiếng Anh (vi là mặc định, không có prefix)
```

**Quy tắc phụ thuộc:** `pages → modules → shared → (config, i18n)`.
- `shared` không import `modules`.
- Module có thể dùng component công khai của module khác (vd. `home` dùng `ProductCard`), không dùng nội bộ.
- Một module thường có: `schema.ts` (Zod), `api.ts` (truy cập dữ liệu), `i18n.ts` (chuỗi riêng), `components/`, `pages/`.

**Thêm module mới:** tạo `src/modules/<tên>/`, thêm schema vào `content.config.ts` (nếu có nội dung), tạo route mỏng ở `src/pages/` và `src/pages/en/`.

## 2. Chiến lược render

| Kiểu | Dùng ở đâu | Cách làm |
|---|---|---|
| **SSG** | Toàn bộ trang (home, dịch vụ, sản phẩm, dự án, tin tức, liên hệ...) | Mặc định `output: 'static'`, `getStaticPaths()` cho trang chi tiết |
| **SSR** | `/ingest/v1/pricing/[slug]`, Actions (`/_actions/*`), server island | `export const prerender = false` / Actions & server island luôn on-demand |
| **ISR** (stale-while-revalidate) | Giá sản phẩm (API + server island) | `routeRules` trong `astro.config.mjs` và `Astro.cache.set({ maxAge, swr, tags })`; provider `cacheCloudflare()` |
| **Server Island** | Khối giá trên trang sản phẩm | `<PriceTag server:defer>` + slot `fallback` (skeleton) |
| **CSR** | Form báo giá | React island `client:visible` (form vẫn gửi được khi chưa có JS) |
| **Không JS** | Menu mobile, FAQ, bộ lọc sản phẩm | `<details>`, radio + CSS `:has()` |

Làm mới giá khi dữ liệu thay đổi: gọi `context.cache.invalidate({ tags: ['pricing'] })` (hoặc `pricing:<slug>`) từ webhook quản trị.

**Quy ước endpoint:** mọi endpoint HTTP đặt dưới `/ingest/v1/` (`src/pages/ingest/v1/`), không dùng `/api/`. Phiên bản mới (breaking change) → `/ingest/v2/`.

## 3. SEO

- Mỗi trang: `title`, `description`, `canonical`, `robots`, Open Graph, Twitter Card (`src/shared/seo/Seo.astro`).
- `hreflang` vi-VN / en-US / x-default; chỉ khai báo ngôn ngữ thật sự có bản dịch (`availableLocales`).
- JSON-LD: `Organization`, `WebSite`, `FAQPage` (home), `Service`, `SoftwareApplication` (+ `Offer`), `NewsArticle`, `BreadcrumbList`.
- `sitemap-index.xml` có hreflang (loại trừ trang noindex), `robots.txt`, RSS `/rss.xml` và `/en/rss.xml`.
- Mỗi trang đúng một `<h1>`; ảnh qua `<Image />` (WebP, `srcset`, kích thước cố định → không CLS).
- Font tự host qua Fonts API, chỉ preload weight 400 & 800.
- URL không có dấu `/` cuối (`trailingSlash: 'never'`, `build.format: 'file'`).

## 4. Bảo mật

- CSP bật (`security.csp`), hash tự động cho script/style. Vì vậy:
  - Code highlight dùng **Prism** (Shiki dùng inline style, không tương thích CSP).
  - **Không dùng `<ClientRouter />`** (không hỗ trợ khi bật CSP) → chuyển trang bằng CSS `@view-transition`.
- Form: kiểm tra Zod phía server, honeypot chống bot, bắt buộc đồng ý liên hệ.
- Secret qua `astro:env` (`RESEND_API_KEY`...). Xem `.env.example`.

## 5. Nội dung

- File: `src/content/<collection>/<vi|en>/<slug>.mdx`. Cùng slug ở hai ngôn ngữ = bản dịch của nhau.
- `draft: true` → chỉ hiện khi dev.
- Nội dung có tiền tố **[Mẫu] / [Sample]** là dữ liệu mẫu, phải thay trước khi go-live. Số liệu ở `src/modules/home/i18n.ts` (`stats`) và thông tin ở `src/config/site.ts` cũng cần cập nhật.

## 6. Lệnh

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # astro check + build
npm run preview   # chạy bản build trên runtime Cloudflare (workerd)
```

Deploy: `npx wrangler deploy` (cấu hình ở `wrangler.jsonc`; adapter sinh `dist/server/wrangler.json`).

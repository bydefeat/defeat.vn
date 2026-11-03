# DEFEAT.vn — Kiến trúc

## 1. Kiến trúc module

```
src/
├─ config/site.ts            # Thông tin công ty, menu chính
├─ i18n/                     # Cấu hình ngôn ngữ, chuỗi giao diện dùng chung, helper URL
├─ app/                      # App shell: ghép các module thành khung trang
│  ├─ layouts/BaseLayout.astro
│  └─ shell/                 # Topbar, Header (dropdown), Footer, CtaBand
├─ shared/                   # Dùng chung, KHÔNG phụ thuộc module nghiệp vụ
│  ├─ components/            # PageHero, SectionHeading, Breadcrumbs, Icon...
│  ├─ motion/                # Script giao diện (xem mục Motion)
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

**Quy tắc phụ thuộc:** `pages → app → modules → shared → (config, i18n)`.
- `shared` không import `modules` hay `app`.
- `app` (layout, header, footer) được phép dùng dữ liệu/component của module (vd. mega menu lấy `SERVICES`).
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

## 3. Giao diện & Motion

**Phong cách:** corporate, sạch, sáng (tham khảo bố cục các website doanh nghiệp phần mềm như nencer.vn / nencer.com).
- Màu: nền trắng / xám-xanh nhạt (`base-200` #f4f7fb), chữ navy (#132033), chữ phụ `text-muted` (#5b6b80),
  nhấn đỏ thương hiệu (`primary` #e82024), liên kết xanh (`accent` #0a68ac), dải CTA navy (`secondary`).
- Font: **Inter** (variable 400–800, subset latin + vietnamese, preload, `font-display: fallback`).
- Thang chữ: `t-display`, `t-h1`, `t-h2`, `t-h3`, `t-lead`, `t-label`.
- Thành phần: `card-base` + `card-hover` (nhấc nhẹ + bóng khi rê chuột), `icon-chip`, `pill`, `accent-bar`
  (gạch đỏ dưới tiêu đề), `cover-placeholder` (ảnh tạm khi chưa có ảnh).
- Logo công nghệ: SVG đơn sắc từ thesvg.org (`scripts/assets/tech/`), sinh dữ liệu bằng
  `node scripts/generate-tech-logos.mjs`; hiển thị xám, rê chuột chuyển sang màu thương hiệu.
- Logo DEFEAT: PNG trong `public/brand/`.

**Motion (tối giản, mượt):**
- Fade-up nhẹ khi cuộn tới (`data-reveal`, so le bằng `data-reveal-group="ms"`), chỉ dùng `transform` + `opacity`.
- Chỉ phần tử nằm dưới màn hình lúc tải mới bị ẩn chờ cuộn → không nháy khi tải/chuyển trang.
- Hover: card nhấc nhẹ, đổi màu tiêu đề, phóng ảnh 3%; nút; dropdown fade.
- Không có hiệu ứng chuyển trang (điều hướng tự nhiên của trình duyệt), không canvas, không animation lúc tải.
- Không JS / `prefers-reduced-motion` → mọi nội dung hiển thị ngay.

**JS (`src/shared/motion/`):** `header.ts` (dropdown, menu mobile, bfcache), `reveal.ts` (fade-up), `brand.ts` (màu logo).
Tương thích CSP: không dùng `style=""` trong HTML; JS chỉ đổi style qua CSSOM.

## 4. SEO

- Mỗi trang: `title`, `description`, `canonical`, `robots`, Open Graph, Twitter Card (`src/shared/seo/Seo.astro`).
- `hreflang` vi-VN / en-US / x-default; chỉ khai báo ngôn ngữ thật sự có bản dịch (`availableLocales`).
- JSON-LD: `Organization`, `WebSite`, `FAQPage` (home), `Service`, `SoftwareApplication` (+ `Offer`), `NewsArticle`, `BreadcrumbList`.
- `sitemap-index.xml` có hreflang (loại trừ trang noindex), `robots.txt`, RSS `/rss.xml` và `/en/rss.xml`.
- Mỗi trang đúng một `<h1>`; ảnh qua `<Image />` (WebP, `srcset`, kích thước cố định → không CLS).
- Font tự host qua Fonts API, chỉ preload weight 400 & 800.
- URL không có dấu `/` cuối (`trailingSlash: 'never'`, `build.format: 'file'`).

## 5. Bảo mật

- CSP bật (`security.csp`), hash tự động cho script/style. Vì vậy:
  - Code highlight dùng **Prism** (Shiki dùng inline style, không tương thích CSP).
  - **Không dùng `<ClientRouter />`** (không hỗ trợ khi bật CSP); site điều hướng bình thường, không hiệu ứng chuyển trang.
- Form: kiểm tra Zod phía server, honeypot chống bot, bắt buộc đồng ý liên hệ.
- Secret qua `astro:env` (`RESEND_API_KEY`...). Xem `.env.example`.

## 6. Nội dung

- File: `src/content/<collection>/<vi|en>/<slug>.mdx`. Cùng slug ở hai ngôn ngữ = bản dịch của nhau.
- `draft: true` → chỉ hiện khi dev.
- Nội dung có tiền tố **[Mẫu] / [Sample]** là dữ liệu mẫu, phải thay trước khi go-live. Số liệu ở `src/modules/home/i18n.ts` (`stats`) và thông tin ở `src/config/site.ts` cũng cần cập nhật.

## 7. Lệnh

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # astro check + build
npm run preview   # chạy bản build trên runtime Cloudflare (workerd)
```

Deploy: `npx wrangler deploy` (cấu hình ở `wrangler.jsonc`; adapter sinh `dist/server/wrangler.json`).

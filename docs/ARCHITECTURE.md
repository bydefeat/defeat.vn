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

**Phong cách:** tối giản kiểu sản phẩm công nghệ (tham khảo hướng thiết kế của template Jet trên Framer — chỉ phong cách,
toàn bộ minh hoạ và nội dung là của DEFEAT): nền đen/trắng, khung **nét đứt**, panel **nền chấm**, tiêu đề lớn weight 500,
nút **viên thuốc** (trắng trên nền tối / đen trên nền sáng), mỗi tính năng một màu nhấn.

**Sáng / tối:** 2 theme daisyUI `defeat-dark` (mặc định) và `defeat-light`.
- Theme được đặt bằng script inline trong `<head>` trước khi vẽ (không nháy sai màu), nhớ lựa chọn trong `localStorage` (`defeat-theme`).
- Nút đổi theme `[data-theme-toggle]` ở header (`src/shared/motion/theme.ts`), chuyển màu mượt bằng View Transition (type `theme`).
- Biến theo theme: `--muted`, `--line`, `--line-strong`, `--dot`, `--acc-red|teal|violet|sky|yellow`, `--glow`.

**Thành phần:** `frame`, `frame-t|b|l|r` (viền nét đứt), `cells` (lưới ô ngăn nét đứt), `dot-grid`, `btn-invert`, `btn-line`,
`card-base` + `card-hover`, `pill`, `icon-chip`, `beams` (vệt sáng hero), `cta-bars` (nền vạch CTA).
Font: **Inter** (variable 400–800, latin + vietnamese). Thang chữ: `t-display`, `t-h1`, `t-h2`, `t-h3`, `t-lead`, `t-label`.

**Minh hoạ isometric nét chấm (tranh gốc):** `node scripts/generate-illustrations.mjs` → `src/assets/illustrations/*.svg`
(custom-software, security, infrastructure, growth, web, mobile, dashboard, cloud). Hiển thị bằng `Illustration.astro`
(SVG nhúng trực tiếp làm fallback khi không có JS). Khi có JS, `src/shared/motion/illo-canvas.ts` raster hoá SVG
thành canvas pixel (1 pixel canvas = 1.5px CSS, `image-rendering: pixelated`, nét xen kẽ pixel đậm/nhạt), gồm lớp nét,
lớp vệt hạt và lớp halftone toả tia. Rê chuột vào vùng `[data-illo-hover]`: đổi dần sang màu nhấn (`acc-*`), hạt lấp lánh,
halftone hiện lên, mô tả trượt ra (`.reveal-desc`). Chỉ chạy animation khi đang hover/chuyển đổi; đổi theme thì vẽ lại.

**Bộ máy minh hoạ** (`scripts/generate-illustrations.mjs`): chiếu isometric trực giao, loại bỏ mặt khuất (n·V > 0, V = (1,1,1)),
sắp thứ tự theo vật thể rồi theo mặt, chi tiết gắn vào đúng mặt; cầu (viền tròn chuẩn, vĩ/kinh tuyến nửa trước), trụ (viền tiếp tuyến), lăng trụ.

**CTA nền ASCII art** (`ascii-field.ts`, `ascii-core.ts`, `ascii.worker.ts`): trường ký tự ` .:-=+*#%@` theo sóng nhiễu trôi chậm,
logo mờ, vùng ký tự "nở" màu đỏ quanh con trỏ. Vẽ trong **Web Worker (OffscreenCanvas)** → luồng chính rảnh; fallback luồng chính 12fps.
Chỉ chạy khi khối hiện trên màn hình; reduced motion → khung tĩnh; màu theo theme (`--ascii-ink`, `--ascii-hot`).

**Thanh cuộn:** ẩn toàn site (`scrollbar-width: none` + `::-webkit-scrollbar`), vẫn cuộn bình thường.

**Logo:** công nghệ & mạng xã hội là SVG từ thesvg.org (`scripts/assets/tech`, `scripts/assets/social`); logo DEFEAT ở `public/brand/`.

**Motion (tối giản, mượt):**
- Fade-up nhẹ khi cuộn tới (`data-reveal`, so le bằng `data-reveal-group="ms"`), chỉ dùng `transform` + `opacity`.
- Chỉ phần tử nằm dưới màn hình lúc tải mới bị ẩn chờ cuộn → không nháy khi tải/chuyển trang.
- Hover: card nhấc nhẹ, đổi màu tiêu đề, phóng ảnh 3%; nút; dropdown fade.
- Chuyển trang (View Transitions, CSS) theo nguyên tắc "một mặt giấy liên tục":
  topbar, header, footer đứng yên; chỉ vùng nội dung (`.vt-content`) mờ ra / hiện vào tại chỗ.
  Phần tử dùng chung biến hình: vạch menu đang chọn (`.nav-indicator`) trượt sang mục mới, dải đầu trang
  (`.vt-hero`) co giãn, tiêu đề card → tiêu đề trang chi tiết (`.vt-title`, gán lúc `pageswap` trong
  `src/shared/motion/transitions.ts`). Back/Forward: nội dung hiện từ trên xuống (type `back`, script `pagereveal` trong `<head>`).
  Không canvas, không animation lúc tải.
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
  - **Không dùng `<ClientRouter />`** (không hỗ trợ khi bật CSP); chuyển trang dùng View Transitions gốc của trình duyệt (CSS).
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

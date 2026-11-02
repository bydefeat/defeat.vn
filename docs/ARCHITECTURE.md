# DEFEAT.vn — Kiến trúc

## 1. Kiến trúc module

```
src/
├─ config/site.ts            # Thông tin công ty, menu chính
├─ i18n/                     # Cấu hình ngôn ngữ, chuỗi giao diện dùng chung, helper URL
├─ app/                      # App shell: ghép các module thành khung trang
│  ├─ layouts/BaseLayout.astro
│  └─ shell/                 # Header (mega menu), Footer, CtaBand
├─ shared/                   # Dùng chung, KHÔNG phụ thuộc module nghiệp vụ
│  ├─ components/            # PageHero, SectionHeading, Breadcrumbs, Icon...
│  ├─ motion/                # Hệ thống motion (xem mục Motion)
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

## 3. Giao diện & Motion (dither style)

**Assets:** logo PNG gốc ở `public/brand/`. Texture dither (Bayer 8x8) sinh bằng `node scripts/generate-textures.mjs`
→ `public/textures/` và **`src/styles/textures.css`** (nhúng data URI: mask không bao giờ chờ tải ảnh → không nháy).
Logo công nghệ dither: `node scripts/generate-tech-logos.mjs` (nguồn SVG: thesvg.org, `scripts/assets/tech/`).

**Font:** Inter (nội dung) + Inter Tight (tiêu đề), variable, subset latin + vietnamese, preload đủ 4 file,
`font-display: fallback` → font đã cache hiển thị ngay, không đổi font giữa chừng khi chuyển trang/ngôn ngữ.
Thang chữ: `t-display`, `t-h1`, `t-h2`, `t-h3`, `t-lead`, `t-label`, `num` (line-height ≥ 1.1 cho dấu tiếng Việt).

**Chuyển trang (View Transitions, CSS):** trang cũ giữ nguyên và tối dần (không lộ nền trắng), trang mới quét xuống
bằng mask dither; header không cross-fade (chỉ trượt vị trí). Không dùng `<ClientRouter />` vì CSP.

**Từ vựng chuyển động — mỗi loại nội dung một kiểu (`data-reveal="…"`):**

| Kiểu | Dùng cho | Mô tả |
|---|---|---|
| `draw` | eyebrow | vạch kẻ vẽ ra, chữ trượt theo |
| `rise` | tiêu đề section | lộ từ trên xuống như in |
| `dissolve` | đoạn mô tả, nội dung bài | hiện qua 8 mức dither |
| `stair` | card dịch vụ | mở theo bậc từ góc trên-trái |
| `scan` | card sản phẩm, form, aside | quét lên từ dưới theo dòng |
| `shutter` | card dự án | mở như cửa chớp từ giữa |
| `blinds` | card tin tức | hiện qua nan rèm ngang |
| `block` | lý do chọn, giá trị | khối đỏ quét qua rồi lộ nội dung |
| `slide` | FAQ, cột footer, bước quy trình | trượt ngang + lộ từ trái |
| `wipe` | tiêu đề CTA, tiêu đề bài | quét ngang bằng mask dither |
| `pop` | nút | bật lên theo nấc pixel |
| `still` | logo công nghệ | dựng lần lượt 4 lớp dither |
| `[data-odometer]` | số liệu | cột số lăn như đồng hồ cơ |

Hero/đầu trang dùng các lớp tải-trang tương ứng: `ld-draw`, `ld-wipe`, `ld-rise`, `ld-dissolve`, `ld-pop`, `ld-slide` (+ `ld-d1…d5`).
Theo cuộn (CSS scroll-driven): thanh tiến trình đọc, đường timeline quy trình, số bước "bật đèn".

**Hover — mỗi loại card một kiểu:** dịch vụ (khung góc + ô icon đổ dither), sản phẩm (dải dither dâng lên ảnh),
dự án (bóng đổ dither trượt ra), tin tức (gạch chân dither tiêu đề), lý do chọn (thanh đỏ mép trái), logo công nghệ
(đổi màu thương hiệu theo từng lớp), nút viền (nền đổ dither), nút chính (bóng pixel).

**JS (`src/shared/motion/`):**

| Module | Việc |
|---|---|
| `reveal.ts` | Ẩn (data-pending) CHỈ phần tử nằm dưới màn hình lúc tải, hiện khi cuộn tới; so le theo `data-reveal-group`; kích hoạt odometer |
| `header.ts` | Ẩn/hiện khi cuộn, mega menu (aria-expanded, Esc, click ngoài), menu mobile, khôi phục trạng thái khi Back (bfcache) |
| `pointer.ts` | Nút nam châm `data-magnetic`, biến màu thương hiệu `data-brand` |
| `dither-canvas.ts` | Canvas dither tương tác (hero logo, wordmark footer) |

**Nguyên tắc chống nháy:**
- Phần tử nhìn thấy lúc tải không bao giờ bị ẩn bởi JS; không có "tự hiện sau X giây".
- Ảnh dự phòng của canvas chỉ hiện khi không có JS.
- Odometer đặt sẵn ở 0 bằng CSS (không đổi số bằng JS sau khi đã hiển thị).
- Không JS / `prefers-reduced-motion` → nội dung hiện đầy đủ, không animation.
- Tương thích CSP: không dùng `style=""` trong HTML; JS chỉ đổi style qua CSSOM.

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
  - **Không dùng `<ClientRouter />`** (không hỗ trợ khi bật CSP) → chuyển trang bằng CSS `@view-transition`.
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

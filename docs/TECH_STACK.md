# DEFEAT.vn — Đề xuất Tech Stack

> Website landing page cho DEFEAT: gia công phần mềm (outsourcing), giải pháp & bán mã nguồn / phần mềm.
> Mục tiêu: showcase sản phẩm, tin tức, case study, thu lead báo giá; sau này mở rộng bán hàng.
>
> Cập nhật: 11/2026 — theo **Astro 7.4** (bản mới nhất trên npm: 7.4.5).

## 1. Tổng quan

```
Astro 7.4 + TypeScript (Node ≥ 22.22.0, Vite 8)
├─ UI:        Tailwind CSS 4.3 + daisyUI 5 (theme "defeat") — dùng thẳng trong .astro
├─ Island:    React 19 (+ React Aria Components khi cần component tương tác phức tạp)
├─ Content:   MDX + Content Layer (glob loader, Zod 4) (+ Keystatic nếu người không phải dev đăng bài)
├─ Font:      Astro Fonts API (stable) — Be Vietnam Pro
├─ Bảo mật:   Astro CSP (stable) + Cloudflare Turnstile
├─ i18n:      vi / en (built-in Astro)
├─ Chuyển trang: View Transitions (CSS gốc) + Prefetch → ClientRouter khi cần
├─ Form:      Astro Actions → Email / Telegram
├─ SEO:       @astrojs/sitemap, OG image, JSON-LD
└─ Deploy:    Cloudflare (@astrojs/cloudflare 14.x)

(Giai đoạn sau)
├─ Store:     Astro on-demand + Sessions + Postgres (Drizzle) + PayOS/SePay (VN) + Lemon Squeezy/Paddle (quốc tế)
└─ Admin:     React + Ant Design
```

### Phiên bản tham chiếu (npm, 11/2026)

| Package | Version |
|---|---|
| `astro` | 7.4.x |
| `@astrojs/react` | 7.1.x |
| `@astrojs/mdx` | 8.1.x |
| `@astrojs/cloudflare` | 14.4.x (yêu cầu `astro@^7.4.0`) |
| `@astrojs/sitemap` | 3.7.x |
| `react` / `react-dom` | 19.x |
| `tailwindcss` | 4.3.x |
| `motion` | 14.x |
| `daisyui` | 5.x |
| `react-aria-components` | 1.x (tùy chọn) |
| `@astrojs/rss` | 4.x |
| `@astrojs/check` | 0.9.x |
| `@keystatic/astro` | 6.x (peer: `astro 5 \|\| 6 \|\| 7`) |
| Node.js | ≥ 22.22.0 (ghi vào `.nvmrc`) |

## 2. Chi tiết từng lớp

### Astro 7.4 + TypeScript — nền tảng
- Mặc định gửi về trình duyệt gần như 0 KB JS → SEO tốt, Lighthouse cao. Với công ty outsourcing, **website chính là portfolio**.
- **Vite 8** và **compiler viết bằng Rust** (nhanh hơn nhưng khắt khe hơn): thẻ HTML không đóng sẽ báo lỗi khi build, HTML lồng sai không còn được tự sửa → viết HTML chuẩn ngay từ đầu.
- `compressHTML` mặc định là `'jsx'`: có thể mất khoảng trắng giữa các phần tử inline → thêm `{" "}` khi cần.
- `src/fetch.ts` là **tên file đã được Astro dành riêng** (advanced routing) → không đặt file trùng tên.
- `astro build --timings` (mới ở 7.4) để xem build chậm ở đâu.
- i18n routing có sẵn: `/` (vi) và `/en/`. Lưu ý: `redirectToDefaultLocale` mặc định là `false`.

### React 19 — chỉ dùng cho island có tương tác
- Giữ React vì: hệ sinh thái lớn (form, animation), dùng chung với admin sau này, dễ tuyển dev.
- Island React vẫn dùng class daisyUI để giao diện đồng nhất với phần `.astro`.
- Dùng cho: form báo giá/liên hệ, bộ lọc/tìm kiếm sản phẩm, menu mobile, dialog, tabs, bảng giá, giỏ hàng.
- **Quy tắc team:**
  > Mặc định viết `.astro`. Chỉ dùng React khi component cần state hoặc sự kiện của người dùng.
  > Ưu tiên `client:visible` / `client:idle`, hạn chế `client:load`.

### UI — Tailwind CSS 4.3 + daisyUI 5
- daisyUI là plugin Tailwind, **chỉ gồm class CSS, không có JS** → dùng thẳng trong component `.astro`, không cần React. Rất hợp tinh thần Astro.
- Tailwind 4 cấu hình bằng CSS, không cần `tailwind.config.js`; tích hợp qua plugin `@tailwindcss/vite`.
- Tạo theme riêng `defeat` (màu đỏ `#E82024`, bo góc nhỏ để hợp logo góc cạnh); có thể thêm theme tối:
  ```css
  /* src/styles/global.css */
  @import "tailwindcss";
  @plugin "daisyui" { themes: false; }

  @plugin "daisyui/theme" {
    name: "defeat";
    default: true;
    color-scheme: light;
    --color-primary: #E82024;
    --color-primary-content: #ffffff;
    --color-neutral: #111111;
    --radius-box: 0.25rem;
    --radius-field: 0.25rem;
    --radius-selector: 0.125rem;
  }
  ```
- Tránh giao diện "daisyUI mặc định": chỉnh token theme, typography, khoảng cách theo nhận diện DEFEAT ngay từ đầu.
- Những gì cần JS (dropdown, modal, tabs) ưu tiên dùng HTML gốc mà daisyUI hỗ trợ: `<dialog>`, `<details>`, popover API, radio tabs.
- Component tương tác phức tạp (combobox, date picker, select có tìm kiếm): dùng **React Aria Components** (headless), style bằng class daisyUI/Tailwind.
- Hiệu ứng: Motion, chỉ dùng khi cần. Block "wow" cho landing có thể tham khảo Magic UI / Aceternity UI, chỉ lấy đúng block cần.
- **Không dùng Ant Design cho landing page**, vì:
  - antd sinh ra cho dashboard, giao diện dễ trông như trang admin;
  - nặng JS, đi ngược triết lý của Astro;
  - CSS-in-JS lúc chạy kết hợp SSR với island dễ bị nháy giao diện (FOUC);
  - phải ghi đè theme rất nhiều.
- antd để dành cho **admin / portal khách hàng** sau này.

### Content — MDX + Content Layer
- Cấu hình trong `src/content.config.ts`; mỗi collection **bắt buộc có loader** (vd. `glob()`).
- API mới: dùng `entry.id` (không còn `slug`), `render(entry)` (không còn `entry.render()`), `getEntry()`.
- Schema dùng **Zod 4**, import `z` từ `astro/zod` (vd. `z.email()` thay cho `z.string().email()`).
  ```ts
  // src/content.config.ts
  import { defineCollection } from 'astro:content';
  import { glob } from 'astro/loaders';
  import { z } from 'astro/zod';

  const news = defineCollection({
    loader: glob({ pattern: '**/*.mdx', base: './src/content/news' }),
    schema: ({ image }) => z.object({
      title: z.string(),
      date: z.coerce.date(),
      cover: image().optional(),
      lang: z.enum(['vi', 'en']),
    }),
  });

  export const collections = { news };
  ```
- **Live collections** (stable): dùng khi cần lấy dữ liệu lúc request (vd. giá/tồn kho sản phẩm từ API ở giai đoạn Store).
- **Markdown:** Astro 7 mặc định dùng bộ xử lý **Sätteri**. Nếu cần plugin remark/rehype (vd. mục lục, lời nhắn admonition) thì cài `@astrojs/markdown-remark` và chọn `unified()` làm processor. Ưu tiên tránh plugin nếu không thật sự cần.
- Nếu người đăng bài không phải dev (marketing, sale): thêm **Keystatic** (`@keystatic/astro` hỗ trợ Astro 7) hoặc Decap CMS. Có giao diện soạn thảo nhưng vẫn lưu MDX trong git, không cần database.

### Font — Astro Fonts API (stable)
- Khai báo font trong `astro.config.mjs`, Astro tự tải về, tự host, tạo fallback và preload → không cần nhúng link Google Fonts.
- Từ 7.4, Astro **cảnh báo** nếu cấu hình yêu cầu weight/subset mà nhà cung cấp font không có → hữu ích để chắc chắn có subset `vietnamese`.
  ```js
  // astro.config.mjs
  import { defineConfig, fontProviders } from 'astro/config';

  export default defineConfig({
    fonts: [{
      provider: fontProviders.google(),
      name: 'Be Vietnam Pro',
      cssVariable: '--font-sans',
      weights: [400, 500, 600, 700, 800],
      subsets: ['vietnamese', 'latin'],
    }],
  });
  ```

### Bảo mật — CSP (stable)
- Bật `csp` trong config: Astro tự tạo hash cho script/style và chèn Content-Security-Policy. Nên bật ngay từ đầu, bật muộn sẽ phải sửa nhiều.
- Chống spam form: Cloudflare Turnstile (nhớ thêm domain của Turnstile vào CSP).

### Chuyển trang mượt — có sẵn trong Astro, không thêm thư viện SPA
- **Bắt đầu với:** View Transitions gốc của trình duyệt + Prefetch
  ```css
  /* global.css */
  @view-transition { navigation: auto; }
  ```
  ```js
  // astro.config.mjs
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' }
  ```
- **Nâng lên `<ClientRouter />`** (từ `astro:transitions`; `<ViewTransitions />` cũ **đã bị xóa**) khi cần giữ state hoặc phần tử qua các trang (`transition:persist`), hoặc cần hiệu ứng morph (`transition:name`) trên mọi trình duyệt.
- Lưu ý khi dùng ClientRouter:
  - `<script>` chỉ chạy một lần → khởi tạo trong sự kiện `astro:page-load`;
  - island React mất state khi chuyển trang nếu không có `transition:persist`;
  - analytics phải tự gửi pageview trong `astro:page-load`;
  - dark mode phải áp lại class theme trong `astro:after-swap`;
  - dùng thẳng tên sự kiện (`astro:before-swap`...); các hằng số `TRANSITION_*` và helper cũ đã bị xóa ở Astro 7.

### Form & lead — Astro Actions
- Kiểm tra dữ liệu bằng Zod 4, gửi thông báo qua Email (Resend) và/hoặc Telegram bot.
- Trang tĩnh vẫn dùng được: chỉ endpoint của Action chạy on-demand (`export const prerender = false`).

### SEO
- `@astrojs/sitemap`, RSS cho news, OG image cho từng trang.
- JSON-LD: `Organization`, `Product` / `SoftwareApplication`, `Article`.
- Thẻ `hreflang` cho vi/en.
- Redirect URL cũ: khai báo `redirects` trong config. Có thể thử `experimental.redirectPage` (7.4) để tự thiết kế trang chuyển hướng theo thương hiệu.

### Deploy — Cloudflare
- `@astrojs/cloudflare` 14.x (yêu cầu `astro@^7.4.0`). Miễn phí, CDN tốt ở Việt Nam. Phương án thay thế: Vercel.
- Ảnh: từ 7.4 có thể tách dịch vụ ảnh — **Sharp lúc build** cho trang tĩnh, **Cloudflare Images lúc runtime** cho trang on-demand:
  ```js
  image: {
    service: {
      build: { entrypoint: 'astro/assets/services/sharp' },
      runtime: { entrypoint: /* service của Cloudflare Images */ },
    },
  }
  ```
- Lưu ý: `experimental.parallelPrerender` **không có tác dụng** trên adapter Cloudflare (adapter tự prerender).
- Node trên máy dev và CI: **≥ 22.22.0**.

## 3. Tận dụng built-in của Astro (không cài thêm thư viện)

| Nhu cầu | Built-in Astro | Thay cho |
|---|---|---|
| Ảnh tối ưu, responsive, WebP/AVIF, lazy | `<Image />`, `<Picture />`, `getImage()` (`astro:assets`) | sharp tự viết, next/image |
| Logo/icon SVG thành component | `import Logo from '../assets/logo.svg'` → `<Logo width={120} />` | svgr, thư viện icon |
| Font tự host, preload | Fonts API | link Google Fonts, Fontsource |
| Highlight code trong bài news | `<Code />` (Shiki) + highlight trong Markdown | Prism, highlight.js |
| Quản lý nội dung có schema | Content Layer, live collections | CMS headless (giai đoạn đầu) |
| Đa ngôn ngữ | i18n routing, `getRelativeLocaleUrl()`, `Astro.currentLocale`, fallback | thư viện i18n routing |
| Chuyển trang mượt | View Transitions, `<ClientRouter />` | React Router, Swup, Barba |
| Tải trước trang | `prefetch` | quicklink |
| Xử lý form / API có kiểm tra dữ liệu | Actions (Zod 4) | tự viết API + validate |
| API route, webhook thanh toán | Endpoints (`src/pages/api/*.ts`) | server Express riêng |
| Auth check, redirect theo ngôn ngữ, header | Middleware (`src/middleware.ts`) | |
| Giỏ hàng, trạng thái người dùng | Sessions | lưu cookie thủ công |
| Biến môi trường an toàn kiểu | `astro:env` (`envField`) | dotenv + tự kiểm tra |
| Phần động trong trang tĩnh (giá, "đã đăng nhập") | Server Islands (`server:defer`) | render toàn bộ trang on-demand |
| Bảo mật header | CSP | tự viết header |
| Redirect URL | `redirects` (+ `experimental.redirectPage`) | |
| Trang lỗi | `src/pages/404.astro`, `500.astro` | |
| Kiểm tra lỗi kiểu | `astro check` (cần `@astrojs/check`) | |
| Gỡ lỗi khi dev | Dev Toolbar (audit a11y, hiệu năng) | |

**Tích hợp chính thức (cài thêm nhưng do Astro duy trì):** `@astrojs/react`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, `@astrojs/cloudflare`.
**Không có sẵn, phải cài:** Tailwind (`@tailwindcss/vite`), daisyUI, gửi email, thanh toán, analytics.

## 4. Nhận diện thương hiệu
- Màu chính: đỏ `#E82024` (lấy từ logo).
- Font: **Be Vietnam Pro** (qua Fonts API, subset `vietnamese`). Font hiển thị có thể dùng loại vuông vức cho hợp logo, nhưng phải kiểm tra dấu tiếng Việt.
- Cần bổ sung: logo dạng **SVG**, bản cho nền tối / đơn sắc, favicon.

## 5. Lộ trình

| Giai đoạn | Nội dung |
|---|---|
| **1 — Landing** | Home, Dịch vụ, Sản phẩm (showcase), Case study, News, Liên hệ/Báo giá; vi/en; SEO; CSP; deploy |
| **2 — CMS** | Keystatic nếu cần cho người không phải dev đăng bài |
| **3 — Store** | Trang on-demand + **Sessions** (giỏ hàng; cấu hình qua `sessionDrivers`), Postgres + **Drizzle** (`@astrojs/db` đã bị xóa ở Astro 7), thanh toán PayOS/SePay/VNPay + Lemon Squeezy/Paddle, cấp license, link tải có giới hạn; live collections cho giá/tồn kho |
| **4 — Admin/Portal** | React + Ant Design: quản lý đơn hàng, license, khách hàng |

## 6. Cấu trúc thư mục dự kiến

```
src/
├─ components/
│  ├─ islands/       # React có tương tác (ContactForm, ProductFilter...)
│  └─ *.astro        # component tĩnh dùng class daisyUI (Hero, Footer, Card...)
├─ content/
│  ├─ products/      # *.mdx
│  ├─ news/          # *.mdx
│  └─ case-studies/  # *.mdx
├─ layouts/
├─ pages/
│  ├─ index.astro
│  ├─ products/
│  ├─ news/
│  ├─ contact.astro
│  └─ en/            # bản tiếng Anh
├─ actions/          # Astro Actions (form)
├─ styles/global.css # Tailwind 4 + @theme màu DEFEAT
└─ content.config.ts # collections + schema Zod 4
public/
└─ brand/            # logo, favicon
.nvmrc               # 22.22.0 trở lên
```

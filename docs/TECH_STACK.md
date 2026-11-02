# DEFEAT.vn — Đề xuất Tech Stack

> Website landing page cho DEFEAT: gia công phần mềm (outsourcing), giải pháp & bán mã nguồn / phần mềm.
> Mục tiêu: showcase sản phẩm, tin tức, case study, thu lead báo giá; sau này mở rộng bán hàng.

## 1. Tổng quan

```
Astro 5 + TypeScript
├─ UI:        Tailwind CSS 4 + shadcn/ui (React islands)
├─ Content:   MDX + Content Collections (+ Keystatic nếu người không phải dev đăng bài)
├─ i18n:      vi / en (built-in Astro)
├─ Chuyển trang: View Transitions (CSS gốc) + Prefetch
├─ Form:      Astro Actions → Email / Telegram
├─ SEO:       @astrojs/sitemap, OG image, JSON-LD
└─ Deploy:    Cloudflare Pages

(Giai đoạn sau)
├─ Store:     Astro server mode + Postgres/Supabase + PayOS/SePay (VN) + Lemon Squeezy/Paddle (quốc tế)
└─ Admin:     React + Ant Design
```

## 2. Chi tiết từng lớp

### Astro 5 + TypeScript — nền tảng
- Mặc định gửi về trình duyệt gần như 0 KB JS → SEO tốt, Lighthouse cao. Với công ty outsourcing, **website chính là portfolio**.
- Content Collections có schema Zod cho `products`, `news`, `case-studies`.
- i18n routing có sẵn: `/` (vi) và `/en/`.

### React — chỉ dùng cho island có tương tác
- Giữ React vì: shadcn/ui cần React, hệ sinh thái lớn, dùng chung với admin sau này, dễ tuyển dev.
- Dùng cho: form báo giá/liên hệ, bộ lọc/tìm kiếm sản phẩm, menu mobile, dialog, tabs, bảng giá, giỏ hàng.
- **Quy tắc team:**
  > Mặc định viết `.astro`. Chỉ dùng React khi component cần state hoặc sự kiện của người dùng.
  > Ưu tiên `client:visible` / `client:idle`, hạn chế `client:load`.

### UI — Tailwind CSS 4 + shadcn/ui
- shadcn/ui (dựa trên Radix): copy code vào dự án, tùy biến 100% theo nhận diện DEFEAT.
- Hiệu ứng: Motion (trước đây là Framer Motion), chỉ dùng khi cần.
- **Không dùng Ant Design cho landing page**, vì:
  - antd sinh ra cho dashboard, giao diện dễ trông như trang admin;
  - nặng JS, đi ngược triết lý của Astro;
  - CSS-in-JS lúc chạy kết hợp SSR với island dễ bị nháy giao diện (FOUC);
  - phải ghi đè theme rất nhiều.
- antd để dành cho **admin / portal khách hàng** sau này.

### Content — MDX + Content Collections
- MDX cho bài news, mô tả sản phẩm, case study (nhúng được component: demo, bảng giá, nút mua).
- Nếu người đăng bài không phải dev (marketing, sale): thêm **Keystatic** hoặc **Decap CMS**. Có giao diện soạn thảo nhưng vẫn lưu MDX trong git, không cần database.

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
- **Nâng lên `<ClientRouter />`** (từ `astro:transitions`) khi cần giữ state hoặc phần tử qua các trang (`transition:persist`), hoặc cần hiệu ứng morph (`transition:name`) trên mọi trình duyệt.
- Lưu ý khi dùng ClientRouter:
  - `<script>` chỉ chạy một lần → khởi tạo trong sự kiện `astro:page-load`;
  - island React mất state khi chuyển trang nếu không có `transition:persist`;
  - analytics phải tự gửi pageview trong `astro:page-load`;
  - dark mode phải áp lại class theme trong `astro:after-swap`.

### Form & lead
- Astro Actions (có kiểm tra dữ liệu bằng Zod), gửi thông báo qua Email (Resend) và/hoặc Telegram bot.
- Chống spam: Cloudflare Turnstile.

### SEO
- `@astrojs/sitemap`, RSS cho news, OG image cho từng trang.
- JSON-LD: `Organization`, `Product` / `SoftwareApplication`, `Article`.
- Thẻ `hreflang` cho vi/en.

### Deploy
- **Cloudflare Pages** (miễn phí, CDN tốt ở Việt Nam). Phương án thay thế: Vercel.

## 3. Nhận diện thương hiệu
- Màu chính: đỏ `#E82024` (lấy từ logo).
- Font: **Be Vietnam Pro** hoặc **Inter** (hỗ trợ đầy đủ dấu tiếng Việt). Font hiển thị có thể dùng loại vuông vức cho hợp logo, nhưng phải kiểm tra dấu tiếng Việt.
- Cần bổ sung: logo dạng **SVG**, bản cho nền tối / đơn sắc, favicon.

## 4. Lộ trình

| Giai đoạn | Nội dung |
|---|---|
| **1 — Landing** | Home, Dịch vụ, Sản phẩm (showcase), Case study, News, Liên hệ/Báo giá; vi/en; SEO; deploy |
| **2 — CMS** | Keystatic/Decap nếu cần cho người không phải dev đăng bài |
| **3 — Store** | Chuyển Astro sang server mode (adapter Node/Cloudflare), Postgres/Supabase, thanh toán PayOS/SePay/VNPay + Lemon Squeezy/Paddle, cấp license, link tải có giới hạn |
| **4 — Admin/Portal** | React + Ant Design: quản lý đơn hàng, license, khách hàng |

## 5. Cấu trúc thư mục dự kiến

```
src/
├─ components/
│  ├─ ui/            # shadcn/ui (React)
│  ├─ islands/       # React có tương tác (ContactForm, ProductFilter...)
│  └─ *.astro        # component tĩnh (Hero, Footer, Card...)
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
├─ styles/global.css
└─ content.config.ts # schema Zod
public/
└─ brand/            # logo, favicon
```

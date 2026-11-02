/**
 * Thông tin công ty dùng chung toàn site (SEO, JSON-LD, footer, liên hệ).
 * TODO: cập nhật thông tin pháp lý, địa chỉ, số điện thoại thật trước khi go-live.
 */
export const SITE = {
  name: 'DEFEAT',
  legalName: 'DEFEAT Software',
  url: 'https://defeat.vn',
  email: 'contact@defeat.vn',
  phone: '+84 000 000 000',
  address: {
    street: '',
    locality: 'Ho Chi Minh City',
    country: 'VN',
  },
  foundingYear: 2026,
  social: {
    github: 'https://github.com/bydefeat',
    facebook: '',
    linkedin: '',
  },
  ogImage: '/og-default.png',
  themeColor: '#e82024',
} as const;

export type NavKey = 'services' | 'products' | 'caseStudies' | 'news' | 'about' | 'contact';

/** Thứ tự menu chính. Đường dẫn không gồm prefix ngôn ngữ. */
export const MAIN_NAV: ReadonlyArray<{ key: NavKey; path: string }> = [
  { key: 'services', path: '/services' },
  { key: 'products', path: '/products' },
  { key: 'caseStudies', path: '/case-studies' },
  { key: 'news', path: '/news' },
  { key: 'about', path: '/about' },
];

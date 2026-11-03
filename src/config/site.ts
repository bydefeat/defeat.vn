export const SITE = {
  name: 'DEFEAT',
  legalName: 'DEFEAT Software',
  url: 'https://defeat.vn',
  email: 'contact@defeat.vn',
  phone: '+84 935 974 907',
  address: {
    street: '',
    locality: 'Ho Chi Minh City',
    country: 'VN',
  },
  foundingYear: 2026,
  social: {
    github: 'https://github.com/bydefeat',
    telegram: 'https://t.me/bydefeat',
  },
  channels: [
    { key: 'announcements', icon: 'telegram', url: 'https://t.me/bydefeat', handle: 't.me/bydefeat', label: { vi: 'Nhóm thông báo', en: 'Announcements' } },
    { key: 'community', icon: 'telegram', url: 'https://t.me/defeatcommunity', handle: 't.me/defeatcommunity', label: { vi: 'Cộng đồng chat', en: 'Community chat' } },
    { key: 'telegram', icon: 'telegram', url: 'https://t.me/vanixjnk', handle: '@vanixjnk', label: { vi: 'Nhắn tin trực tiếp', en: 'Direct message' } },
    { key: 'zalo', icon: 'zalo', url: 'https://zalo.me/84935974907', handle: '+84 935 974 907', label: { vi: 'Zalo', en: 'Zalo' } },
    { key: 'facebook', icon: 'facebook', url: 'https://www.facebook.com/vanixjnk', handle: '/vanixjnk', label: { vi: 'Facebook cá nhân', en: 'Personal Facebook' } },
  ],
  ogImage: '/og-default.png',
  themeColor: '#e82024',
  taxId: '',
  hours: { vi: '', en: '' },
} as const;

export interface BankAccount { bank: string; bin: string; number: string; holder: string; branch?: string }

export const PAYMENT: { accounts: BankAccount[]; transferNote: string } = {
  accounts: [{ bank: 'MB Bank', bin: '970422', number: '100000001', holder: 'NGUYEN DINH BAO' }],
  transferNote: 'DEFEAT <mã báo giá>',
};

export type NavKey = 'services' | 'products' | 'caseStudies' | 'news' | 'about' | 'contact' | 'contactInfo' | 'payment';

/**
 * Mục đang tạm ẩn: không hiện ở menu, footer, trang chủ. Trang tương ứng cũng tắt (trả 404) bằng cách
 * đổi tên file route có tiền tố "_" trong src/pages (Astro bỏ qua). Hiện lại: đặt false + bỏ "_" ở các route:
 * about.astro, news/, case-studies/, rss.xml.ts (cả bản trong src/pages/en/).
 */
export const HIDDEN: Readonly<Partial<Record<NavKey, boolean>>> = { caseStudies: true, news: true, about: true };
export const isShown = (key: NavKey) => !HIDDEN[key];

const ALL_NAV: ReadonlyArray<{ key: NavKey; path: string }> = [
  { key: 'services', path: '/services' },
  { key: 'products', path: '/products' },
  { key: 'caseStudies', path: '/case-studies' },
  { key: 'news', path: '/news' },
  { key: 'about', path: '/about' },
  { key: 'contactInfo', path: '/contact-info' },
  { key: 'payment', path: '/payment' },
];

export const MAIN_NAV = ALL_NAV.filter((item) => isShown(item.key));

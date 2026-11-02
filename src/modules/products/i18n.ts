import type { Locale } from '@i18n/config';
import type { PRODUCT_CATEGORIES } from './schema';

type Category = (typeof PRODUCT_CATEGORIES)[number];

export const productsText: Record<Locale, {
  eyebrow: string; title: string; desc: string; all: string; features: string; demo: string; filter: string;
  categories: Record<Category, string>;
}> = {
  vi: {
    eyebrow: 'Sản phẩm',
    title: 'Mã nguồn, phần mềm & giải pháp sẵn sàng triển khai',
    desc: 'Sản phẩm do DEFEAT phát triển và duy trì: mua mã nguồn, dùng dạng dịch vụ hoặc tuỳ biến theo nhu cầu.',
    all: 'Tất cả',
    features: 'Tính năng chính',
    demo: 'Xem demo',
    filter: 'Lọc theo loại sản phẩm',
    categories: { 'source-code': 'Mã nguồn', saas: 'SaaS', solution: 'Giải pháp', template: 'Template' },
  },
  en: {
    eyebrow: 'Products',
    title: 'Source code, software & ready-to-deploy solutions',
    desc: 'Products built and maintained by DEFEAT: buy the source code, use as a service, or customise to your needs.',
    all: 'All',
    features: 'Key features',
    demo: 'View demo',
    filter: 'Filter by product type',
    categories: { 'source-code': 'Source code', saas: 'SaaS', solution: 'Solution', template: 'Template' },
  },
};

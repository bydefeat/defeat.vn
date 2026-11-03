import type { IconName } from '@shared/components/Icon.astro';
import type { Locale } from '@i18n/config';

type L10n = Record<Locale, string>;
export interface Service {
  slug: string;
  icon: IconName;
  title: L10n;
  summary: L10n;
  points: Record<Locale, string[]>;
}

export const SERVICES: Service[] = [
  {
    slug: 'custom-software',
    icon: 'code',
    title: { vi: 'Phát triển phần mềm theo yêu cầu', en: 'Custom Software Development' },
    summary: {
      vi: 'Thiết kế và xây dựng hệ thống riêng cho nghiệp vụ của bạn: ERP, CRM, quản lý vận hành, tích hợp hệ thống.',
      en: 'Design and build systems tailored to your business: ERP, CRM, operations management and system integration.',
    },
    points: {
      vi: ['Phân tích nghiệp vụ & thiết kế giải pháp', 'Kiến trúc mở rộng, dễ bảo trì', 'Bàn giao mã nguồn & tài liệu đầy đủ'],
      en: ['Business analysis & solution design', 'Scalable, maintainable architecture', 'Full source code & documentation handover'],
    },
  },
  {
    slug: 'web-development',
    icon: 'globe',
    title: { vi: 'Website & Web App', en: 'Websites & Web Apps' },
    summary: {
      vi: 'Website doanh nghiệp, thương mại điện tử, cổng thông tin và web app hiệu năng cao, chuẩn SEO.',
      en: 'Corporate websites, e-commerce, portals and high-performance, SEO-ready web apps.',
    },
    points: {
      vi: ['Tối ưu Core Web Vitals', 'Đa ngôn ngữ, chuẩn SEO kỹ thuật', 'Quản trị nội dung dễ dùng'],
      en: ['Optimised Core Web Vitals', 'Multilingual, technical SEO', 'Easy content management'],
    },
  },
  {
    slug: 'mobile-apps',
    icon: 'phone',
    title: { vi: 'Ứng dụng di động', en: 'Mobile Apps' },
    summary: {
      vi: 'Ứng dụng iOS/Android đa nền tảng, từ MVP đến sản phẩm quy mô lớn, kèm hỗ trợ phát hành store.',
      en: 'Cross-platform iOS/Android apps, from MVP to large-scale products, including store release support.',
    },
    points: {
      vi: ['Đa nền tảng một mã nguồn', 'Thông báo đẩy, thanh toán trong app', 'Hỗ trợ phát hành App Store / Google Play'],
      en: ['Single cross-platform codebase', 'Push notifications, in-app payments', 'App Store / Google Play release support'],
    },
  },
  {
    slug: 'dedicated-team',
    icon: 'users',
    title: { vi: 'Đội ngũ phát triển riêng', en: 'Dedicated Development Team' },
    summary: {
      vi: 'Mở rộng nhanh năng lực kỹ thuật với đội ngũ chuyên trách làm việc theo quy trình của bạn.',
      en: 'Scale engineering capacity quickly with a dedicated team that works within your process.',
    },
    points: {
      vi: ['Linh hoạt quy mô theo giai đoạn', 'Quy trình Agile/Scrum minh bạch', 'Báo cáo tiến độ định kỳ'],
      en: ['Flexible team size per phase', 'Transparent Agile/Scrum process', 'Regular progress reporting'],
    },
  },
  {
    slug: 'source-code-solutions',
    icon: 'box',
    title: { vi: 'Mã nguồn & giải pháp đóng gói', en: 'Source Code & Packaged Solutions' },
    summary: {
      vi: 'Mã nguồn và giải pháp có sẵn, triển khai nhanh, tuỳ biến theo thương hiệu và nghiệp vụ.',
      en: 'Ready-made source code and solutions, deployed fast and customised to your brand and workflow.',
    },
    points: {
      vi: ['Giảm thời gian ra mắt', 'Giấy phép rõ ràng', 'Hỗ trợ cài đặt & tuỳ biến'],
      en: ['Faster time to market', 'Clear licensing', 'Installation & customisation support'],
    },
  },
  {
    slug: 'cloud-devops',
    icon: 'cloud',
    title: { vi: 'Cloud, DevOps & bảo trì', en: 'Cloud, DevOps & Maintenance' },
    summary: {
      vi: 'Hạ tầng cloud, CI/CD, giám sát và bảo trì giúp hệ thống vận hành ổn định, an toàn.',
      en: 'Cloud infrastructure, CI/CD, monitoring and maintenance to keep systems stable and secure.',
    },
    points: {
      vi: ['CI/CD tự động', 'Giám sát & cảnh báo 24/7', 'Sao lưu, bảo mật, tối ưu chi phí'],
      en: ['Automated CI/CD', '24/7 monitoring & alerting', 'Backups, security, cost optimisation'],
    },
  },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);

export const serviceStaticPaths = () => SERVICES.map((service) => ({ params: { slug: service.slug }, props: { service } }));

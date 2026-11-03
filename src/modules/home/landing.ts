import type { Locale } from '@i18n/config';
import type { IconName } from '@shared/components/Icon.astro';

export type Illo = 'custom-software' | 'security' | 'infrastructure' | 'growth' | 'web' | 'mobile' | 'dashboard' | 'cloud';
export type Accent = 'red' | 'teal' | 'violet' | 'sky' | 'yellow';

interface Landing {
  logosTitle: string;
  benefits: { title: string; items: { illo: Illo; title: string; desc: string }[] };
  steps: { title: string; items: { icon: IconName; title: string; desc: string }[] };
  features: { illo: Illo; accent: Accent; service: string; eyebrow: string; title: string; desc: string; points: string[] }[];
  highlights: { icon: IconName; title: string; desc: string }[];
  showcase: { title: string; desc: string };
}

export const landing: Record<Locale, Landing> = {
  vi: {
    logosTitle: 'Công nghệ chúng tôi làm chủ',
    benefits: {
      title: 'Tăng tốc doanh nghiệp cùng DEFEAT.',
      items: [
        { illo: 'custom-software', title: 'Phần mềm đúng nghiệp vụ', desc: 'Thiết kế theo quy trình thực tế của bạn, không ép theo khuôn có sẵn.' },
        { illo: 'security', title: 'Bảo mật ngay từ thiết kế', desc: 'Phân quyền, mã hoá và kiểm thử bảo mật trước mỗi lần phát hành.' },
        { illo: 'infrastructure', title: 'Vận hành ổn định', desc: 'Hạ tầng giám sát liên tục, sao lưu tự động, sẵn sàng mở rộng.' },
        { illo: 'growth', title: 'Tối ưu chi phí', desc: 'Tận dụng mã nguồn sẵn có để rút ngắn thời gian và ngân sách.' },
      ],
    },
    steps: {
      title: 'Bắt đầu dự án trong 3 bước.',
      items: [
        { icon: 'mail', title: 'Gửi yêu cầu', desc: 'Mô tả ngắn bài toán của bạn' },
        { icon: 'clipboard', title: 'Tư vấn & báo giá', desc: 'Phạm vi, timeline, chi phí rõ ràng' },
        { icon: 'rocket', title: 'Triển khai & bàn giao', desc: 'Demo định kỳ, bàn giao mã nguồn' },
      ],
    },
    features: [
      {
        illo: 'web', accent: 'red', service: 'web-development', eyebrow: 'Website & Web App',
        title: 'Website tải nhanh, chuẩn SEO.',
        desc: 'Từ website doanh nghiệp đến cổng thông tin và web app quy mô lớn.',
        points: ['Core Web Vitals đạt chuẩn', 'Đa ngôn ngữ, SEO kỹ thuật', 'Quản trị nội dung dễ dùng', 'Tích hợp thanh toán, CRM'],
      },
      {
        illo: 'mobile', accent: 'teal', service: 'mobile-apps', eyebrow: 'Ứng dụng di động',
        title: 'Một mã nguồn, hai nền tảng.',
        desc: 'Ứng dụng iOS và Android mượt mà, phát hành và cập nhật nhanh.',
        points: ['Flutter / React Native', 'Thông báo đẩy, thanh toán trong app', 'Hoạt động cả khi mất mạng', 'Hỗ trợ phát hành store'],
      },
      {
        illo: 'dashboard', accent: 'violet', service: 'custom-software', eyebrow: 'Phần mềm quản trị',
        title: 'Số liệu vận hành trong một màn hình.',
        desc: 'ERP, CRM, quản lý kho, nhân sự — xây theo đúng quy trình của bạn.',
        points: ['Báo cáo thời gian thực', 'Phân quyền chi tiết theo vai trò', 'Tích hợp hệ thống sẵn có', 'Xuất dữ liệu, API mở'],
      },
      {
        illo: 'cloud', accent: 'sky', service: 'cloud-devops', eyebrow: 'Cloud & DevOps',
        title: 'Hạ tầng sẵn sàng cho tăng trưởng.',
        desc: 'Triển khai tự động, giám sát liên tục, mở rộng theo lưu lượng.',
        points: ['CI/CD tự động', 'Giám sát & cảnh báo 24/7', 'Sao lưu và khôi phục', 'Tối ưu chi phí cloud'],
      },
    ],
    highlights: [
      { icon: 'search', title: 'Tư vấn miễn phí', desc: 'Làm rõ bài toán trước khi báo giá' },
      { icon: 'code', title: 'Bàn giao 100% mã nguồn', desc: 'Bạn sở hữu toàn bộ sản phẩm' },
      { icon: 'shield', title: 'Cam kết bảo mật', desc: 'Ký NDA, quy trình kiểm soát truy cập' },
      { icon: 'clock', title: 'Hỗ trợ dài hạn', desc: 'Bảo hành và đồng hành sau bàn giao' },
    ],
    showcase: { title: 'Sản phẩm & dự án.', desc: 'Giải pháp đóng gói sẵn và các dự án DEFEAT đã triển khai.' },
  },
  en: {
    logosTitle: 'Technologies we master',
    benefits: {
      title: 'Accelerate your business with DEFEAT.',
      items: [
        { illo: 'custom-software', title: 'Software that fits your process', desc: 'Built around how you actually work, not a one-size-fits-all template.' },
        { illo: 'security', title: 'Secure by design', desc: 'Access control, encryption and security testing before every release.' },
        { illo: 'infrastructure', title: 'Reliable operations', desc: 'Continuously monitored infrastructure, automated backups, ready to scale.' },
        { illo: 'growth', title: 'Lower costs', desc: 'Reuse proven source code to cut both timeline and budget.' },
      ],
    },
    steps: {
      title: 'Start your project in 3 steps.',
      items: [
        { icon: 'mail', title: 'Send a request', desc: 'Briefly describe your challenge' },
        { icon: 'clipboard', title: 'Consult & quote', desc: 'Clear scope, timeline and cost' },
        { icon: 'rocket', title: 'Build & hand over', desc: 'Regular demos, full source handover' },
      ],
    },
    features: [
      {
        illo: 'web', accent: 'red', service: 'web-development', eyebrow: 'Websites & Web Apps',
        title: 'Fast, SEO-ready websites.',
        desc: 'From corporate websites to portals and large-scale web apps.',
        points: ['Passing Core Web Vitals', 'Multilingual, technical SEO', 'Easy content management', 'Payment & CRM integrations'],
      },
      {
        illo: 'mobile', accent: 'teal', service: 'mobile-apps', eyebrow: 'Mobile Apps',
        title: 'One codebase, two platforms.',
        desc: 'Smooth iOS and Android apps, shipped and updated quickly.',
        points: ['Flutter / React Native', 'Push notifications, in-app payments', 'Works offline', 'Store release support'],
      },
      {
        illo: 'dashboard', accent: 'violet', service: 'custom-software', eyebrow: 'Business Software',
        title: 'Your operations on one screen.',
        desc: 'ERP, CRM, inventory, HR — built around your exact workflow.',
        points: ['Real-time reporting', 'Fine-grained role permissions', 'Integrates with existing systems', 'Data export & open API'],
      },
      {
        illo: 'cloud', accent: 'sky', service: 'cloud-devops', eyebrow: 'Cloud & DevOps',
        title: 'Infrastructure ready to grow.',
        desc: 'Automated deployments, continuous monitoring, scaling with traffic.',
        points: ['Automated CI/CD', '24/7 monitoring & alerts', 'Backup and recovery', 'Cloud cost optimisation'],
      },
    ],
    highlights: [
      { icon: 'search', title: 'Free consultation', desc: 'Clarify the problem before quoting' },
      { icon: 'code', title: '100% source handover', desc: 'You own the entire product' },
      { icon: 'shield', title: 'Security commitment', desc: 'NDAs and controlled access' },
      { icon: 'clock', title: 'Long-term support', desc: 'Warranty and support after launch' },
    ],
    showcase: { title: 'Products & projects.', desc: 'Packaged solutions and projects delivered by DEFEAT.' },
  },
};

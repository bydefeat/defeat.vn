import type { Locale } from '@i18n/config';

export const homeText: Record<Locale, {
  seoTitle: string; seoDesc: string;
  hero: { eyebrow: string; title: string; highlight: string; desc: string; primary: string; secondary: string; bullets: string[] };
  stats: { value: string; label: string }[];
  services: { eyebrow: string; title: string; desc: string };
  why: { eyebrow: string; title: string; desc: string; items: { title: string; desc: string }[] };
  process: { eyebrow: string; title: string; steps: { title: string; desc: string }[] };
  tech: { eyebrow: string; title: string; desc: string; count: string; note: string };
  products: { eyebrow: string; title: string; desc: string };
  cases: { eyebrow: string; title: string; desc: string };
  news: { eyebrow: string; title: string };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
}> = {
  vi: {
    seoTitle: 'Gia công phần mềm & giải pháp mã nguồn cho doanh nghiệp',
    seoDesc: 'DEFEAT cung cấp dịch vụ gia công phần mềm (outsourcing), phát triển web, mobile app, đội ngũ riêng và mã nguồn, giải pháp sẵn sàng triển khai cho doanh nghiệp.',
    hero: {
      eyebrow: 'Software Outsourcing · Solutions · Source Code',
      title: 'Xây dựng phần mềm',
      highlight: 'nhanh, chuẩn, bền vững',
      desc: 'DEFEAT đồng hành cùng doanh nghiệp từ ý tưởng đến vận hành: phát triển phần mềm theo yêu cầu, đội ngũ kỹ thuật riêng và mã nguồn, giải pháp sẵn sàng triển khai.',
      primary: 'Nhận báo giá miễn phí',
      secondary: 'Xem sản phẩm',
      bullets: ['Bàn giao 100% mã nguồn', 'Quy trình Agile minh bạch', 'Bảo hành & hỗ trợ dài hạn'],
    },
    stats: [
      { value: '6+', label: 'Nhóm dịch vụ cốt lõi' },
      { value: '2', label: 'Ngôn ngữ làm việc (VI/EN)' },
      { value: '1–2', label: 'Ngày phản hồi báo giá' },
      { value: '100%', label: 'Bàn giao mã nguồn' },
    ],
    services: { eyebrow: 'Dịch vụ', title: 'Năng lực toàn diện cho mọi giai đoạn sản phẩm', desc: 'Một đối tác cho cả tư vấn, thiết kế, phát triển và vận hành.' },
    why: {
      eyebrow: 'Vì sao chọn DEFEAT',
      title: 'Đối tác kỹ thuật bạn có thể tin cậy',
      desc: 'Chúng tôi tập trung vào chất lượng mã nguồn, sự minh bạch và kết quả kinh doanh của khách hàng.',
      items: [
        { title: 'Chất lượng kỹ thuật', desc: 'Code review, kiểm thử tự động và kiến trúc rõ ràng ngay từ đầu.' },
        { title: 'Minh bạch', desc: 'Báo cáo tiến độ định kỳ, truy cập trực tiếp repo và công cụ quản lý dự án.' },
        { title: 'Bảo mật', desc: 'Ký NDA, phân quyền truy cập và tuân thủ quy trình bảo mật dữ liệu.' },
        { title: 'Tốc độ', desc: 'Tận dụng mã nguồn và giải pháp sẵn có để rút ngắn thời gian ra mắt.' },
      ],
    },
    process: {
      eyebrow: 'Quy trình',
      title: 'Quy trình làm việc rõ ràng, có thể đo lường',
      steps: [
        { title: 'Khám phá', desc: 'Làm rõ mục tiêu, phạm vi, người dùng và ràng buộc.' },
        { title: 'Thiết kế', desc: 'Kiến trúc hệ thống, UX/UI và kế hoạch triển khai.' },
        { title: 'Phát triển', desc: 'Sprint 1–2 tuần, demo định kỳ, kiểm thử liên tục.' },
        { title: 'Bàn giao & vận hành', desc: 'Triển khai, đào tạo, bảo hành và hỗ trợ dài hạn.' },
      ],
    },
    tech: {
      eyebrow: 'Công nghệ',
      title: 'Làm chủ công nghệ hiện đại',
      desc: 'Lựa chọn công nghệ theo bài toán: ổn định cho vận hành dài hạn, đủ hiện đại để mở rộng.',
      count: 'nền tảng & công cụ',
      note: 'Logo là thương hiệu của các chủ sở hữu tương ứng.',
    },
    products: { eyebrow: 'Sản phẩm', title: 'Sản phẩm & mã nguồn nổi bật', desc: 'Giải pháp đã đóng gói, triển khai nhanh và tuỳ biến theo nhu cầu.' },
    cases: { eyebrow: 'Dự án', title: 'Dự án tiêu biểu', desc: 'Kết quả thực tế từ các dự án DEFEAT đã thực hiện.' },
    news: { eyebrow: 'Tin tức', title: 'Tin tức & chia sẻ mới nhất' },
    faq: {
      eyebrow: 'Câu hỏi thường gặp',
      title: 'Câu hỏi thường gặp.',
      items: [
        { q: 'DEFEAT nhận những loại dự án nào?', a: 'Phần mềm quản trị doanh nghiệp, website, web app, ứng dụng di động, tích hợp hệ thống và cung cấp đội ngũ phát triển riêng.' },
        { q: 'Tôi có nhận được toàn bộ mã nguồn không?', a: 'Có. Với dự án gia công, khách hàng sở hữu toàn bộ mã nguồn và tài liệu sau khi nghiệm thu.' },
        { q: 'Chi phí được tính như thế nào?', a: 'Theo trọn gói (fixed price) cho phạm vi rõ ràng, hoặc theo thời gian & nguồn lực (time & material / dedicated team) cho dự án linh hoạt.' },
        { q: 'Mua mã nguồn có được hỗ trợ cài đặt không?', a: 'Có. Mỗi sản phẩm đi kèm hướng dẫn, hỗ trợ cài đặt và gói tuỳ biến theo yêu cầu.' },
      ],
    },
  },
  en: {
    seoTitle: 'Software outsourcing & source code solutions for businesses',
    seoDesc: 'DEFEAT provides software outsourcing, web and mobile development, dedicated teams, and ready-to-deploy source code and solutions for businesses.',
    hero: {
      eyebrow: 'Software Outsourcing · Solutions · Source Code',
      title: 'Build software',
      highlight: 'fast, right and built to last',
      desc: 'DEFEAT partners with businesses from idea to operation: custom software development, dedicated engineering teams and ready-to-deploy source code and solutions.',
      primary: 'Get a free quote',
      secondary: 'Explore products',
      bullets: ['100% source code handover', 'Transparent Agile process', 'Long-term warranty & support'],
    },
    stats: [
      { value: '6+', label: 'Core service lines' },
      { value: '2', label: 'Working languages (VI/EN)' },
      { value: '1–2', label: 'Days to quote' },
      { value: '100%', label: 'Source code handover' },
    ],
    services: { eyebrow: 'Services', title: 'Full capabilities for every product stage', desc: 'One partner for consulting, design, development and operations.' },
    why: {
      eyebrow: 'Why DEFEAT',
      title: 'An engineering partner you can trust',
      desc: 'We focus on code quality, transparency and our clients’ business outcomes.',
      items: [
        { title: 'Engineering quality', desc: 'Code review, automated testing and clear architecture from day one.' },
        { title: 'Transparency', desc: 'Regular progress reports and direct access to repos and project tools.' },
        { title: 'Security', desc: 'NDAs, access control and data-protection processes.' },
        { title: 'Speed', desc: 'Reuse proven code and solutions to shorten time to market.' },
      ],
    },
    process: {
      eyebrow: 'Process',
      title: 'A clear, measurable delivery process',
      steps: [
        { title: 'Discovery', desc: 'Clarify goals, scope, users and constraints.' },
        { title: 'Design', desc: 'System architecture, UX/UI and delivery plan.' },
        { title: 'Development', desc: '1–2 week sprints, regular demos, continuous testing.' },
        { title: 'Launch & operate', desc: 'Deployment, training, warranty and long-term support.' },
      ],
    },
    tech: {
      eyebrow: 'Technology',
      title: 'Modern technology, mastered',
      desc: 'We choose technology to fit the problem: stable for long-term operations, modern enough to scale.',
      count: 'platforms & tools',
      note: 'Logos are trademarks of their respective owners.',
    },
    products: { eyebrow: 'Products', title: 'Featured products & source code', desc: 'Packaged solutions, deployed fast and customised to your needs.' },
    cases: { eyebrow: 'Case studies', title: 'Selected projects', desc: 'Real results from projects delivered by DEFEAT.' },
    news: { eyebrow: 'News', title: 'Latest news & insights' },
    faq: {
      eyebrow: 'FAQ',
      title: 'Frequently asked questions.',
      items: [
        { q: 'What kinds of projects does DEFEAT take on?', a: 'Business management software, websites, web apps, mobile apps, system integration and dedicated development teams.' },
        { q: 'Do I get the full source code?', a: 'Yes. For outsourced projects, the client owns all source code and documentation after acceptance.' },
        { q: 'How is pricing calculated?', a: 'Fixed price for well-defined scope, or time & material / dedicated team for flexible projects.' },
        { q: 'Is installation support included when buying source code?', a: 'Yes. Every product includes documentation, installation support and optional customisation packages.' },
      ],
    },
  },
};

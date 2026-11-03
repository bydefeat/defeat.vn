import type { Locale } from '@i18n/config';

export const contactText: Record<Locale, {
  eyebrow: string; title: string; desc: string; quickTitle: string; communityTitle: string; stepsTitle: string; moreInfo: string;
  actions: { zalo: string; telegram: string; email: string; phone: string };
  steps: { title: string; desc: string }[];
}> = {
  vi: {
    eyebrow: 'Liên hệ',
    title: 'Trao đổi về dự án của bạn',
    desc: 'Nhắn trực tiếp qua Zalo, Telegram hoặc email để được tư vấn giải pháp, timeline và báo giá.',
    quickTitle: 'Liên hệ nhanh',
    communityTitle: 'Cộng đồng',
    stepsTitle: 'Quy trình làm việc',
    moreInfo: 'Xem đầy đủ thông tin liên hệ',
    actions: { zalo: 'Nhắn Zalo', telegram: 'Mở Telegram', email: 'Gửi email', phone: 'Gọi ngay' },
    steps: [
      { title: 'Tiếp nhận', desc: 'Chúng tôi xem yêu cầu và liên hệ lại để làm rõ.' },
      { title: 'Tư vấn', desc: 'Buổi trao đổi miễn phí về bài toán và giải pháp.' },
      { title: 'Đề xuất', desc: 'Gửi phạm vi, timeline và báo giá chi tiết.' },
    ],
  },
  en: {
    eyebrow: 'Contact',
    title: 'Let’s talk about your project',
    desc: 'Message us on Zalo, Telegram or email for a proposed solution, timeline and quote.',
    quickTitle: 'Quick contact',
    communityTitle: 'Community',
    stepsTitle: 'How we work',
    moreInfo: 'See full contact information',
    actions: { zalo: 'Message on Zalo', telegram: 'Open Telegram', email: 'Send email', phone: 'Call now' },
    steps: [
      { title: 'Intake', desc: 'We review your request and get back to clarify.' },
      { title: 'Consultation', desc: 'A free call about your challenge and options.' },
      { title: 'Proposal', desc: 'Scope, timeline and a detailed quote.' },
    ],
  },
};

export const contactInfoText: Record<Locale, {
  eyebrow: string; title: string; desc: string;
  companyTitle: string; legalName: string; taxId: string; address: string; email: string; phone: string; hours: string;
  channelsTitle: string; needsTitle: string;
  needs: { title: string; desc: string; cta: string; href: string }[];
  officialTitle: string; officialDesc: string;
}> = {
  vi: {
    eyebrow: 'Liên hệ',
    title: 'Thông tin liên hệ',
    desc: 'Các kênh liên hệ chính thức của DEFEAT. Chúng tôi phản hồi trong 1–2 ngày làm việc.',
    companyTitle: 'Thông tin doanh nghiệp',
    legalName: 'Tên đơn vị', taxId: 'Mã số thuế', address: 'Địa chỉ', email: 'Email', phone: 'Điện thoại', hours: 'Giờ làm việc',
    channelsTitle: 'Nhắn tin trực tiếp & cộng đồng',
    needsTitle: 'Liên hệ theo nhu cầu',
    needs: [
      { title: 'Tư vấn và báo giá', desc: 'Dự án phần mềm, website, ứng dụng hoặc mua mã nguồn.', cta: 'Gửi yêu cầu', href: '/contact' },
      { title: 'Sản phẩm và mã nguồn', desc: 'Xem tính năng, giá và công nghệ của từng sản phẩm.', cta: 'Xem sản phẩm', href: '/products' },
      { title: 'Thanh toán', desc: 'Tài khoản nhận tiền chính thức và quy trình thanh toán.', cta: 'Thông tin thanh toán', href: '/payment' },
    ],
    officialTitle: 'Kênh chính thức',
    officialDesc: 'DEFEAT chỉ liên hệ qua các kênh trên trang này. Nếu nhận được tin nhắn đáng ngờ nhân danh DEFEAT, vui lòng xác minh qua email trước khi làm theo.',
  },
  en: {
    eyebrow: 'Contact',
    title: 'Contact information',
    desc: 'DEFEAT’s official contact channels. We reply within 1–2 business days.',
    companyTitle: 'Company details',
    legalName: 'Company', taxId: 'Tax ID', address: 'Address', email: 'Email', phone: 'Phone', hours: 'Business hours',
    channelsTitle: 'Direct message & community',
    needsTitle: 'Contact by topic',
    needs: [
      { title: 'Consulting and quotes', desc: 'Software, website or app projects, or buying source code.', cta: 'Send a request', href: '/contact' },
      { title: 'Products and source code', desc: 'Features, pricing and tech stack for each product.', cta: 'View products', href: '/products' },
      { title: 'Payment', desc: 'Official receiving accounts and payment process.', cta: 'Payment information', href: '/payment' },
    ],
    officialTitle: 'Official channels',
    officialDesc: 'DEFEAT only contacts you through the channels on this page. If you receive a suspicious message in DEFEAT’s name, please verify by email before acting on it.',
  },
};

import type { Locale } from '@i18n/config';
export const servicesText: Record<Locale, { eyebrow: string; title: string; desc: string; included: string }> = {
  vi: {
    eyebrow: 'Dịch vụ',
    title: 'Dịch vụ phát triển phần mềm trọn gói',
    desc: 'Từ tư vấn, thiết kế, phát triển đến vận hành — DEFEAT đồng hành cùng doanh nghiệp trong toàn bộ vòng đời sản phẩm.',
    included: 'Bao gồm',
  },
  en: {
    eyebrow: 'Services',
    title: 'End-to-end software development services',
    desc: 'From consulting and design to development and operations — DEFEAT supports your product across its entire lifecycle.',
    included: 'What’s included',
  },
};

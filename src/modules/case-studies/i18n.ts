import type { Locale } from '@i18n/config';
export const caseStudiesText: Record<Locale, { eyebrow: string; title: string; desc: string; client: string; results: string }> = {
  vi: {
    eyebrow: 'Dự án tiêu biểu',
    title: 'Dự án DEFEAT đã triển khai',
    desc: 'Một số dự án tiêu biểu: bài toán của khách hàng, giải pháp và kết quả đạt được.',
    client: 'Khách hàng',
    results: 'Kết quả',
  },
  en: {
    eyebrow: 'Case studies',
    title: 'Projects delivered by DEFEAT',
    desc: 'Selected projects: the client’s challenge, our solution and the results achieved.',
    client: 'Client',
    results: 'Results',
  },
};

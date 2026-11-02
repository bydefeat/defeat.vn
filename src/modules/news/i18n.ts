import type { Locale } from '@i18n/config';
export const newsText: Record<Locale, { eyebrow: string; title: string; desc: string; related: string }> = {
  vi: {
    eyebrow: 'Tin tức & chia sẻ',
    title: 'Tin tức, kiến thức công nghệ và cập nhật từ DEFEAT',
    desc: 'Chia sẻ kinh nghiệm phát triển phần mềm, xu hướng công nghệ và tin tức về sản phẩm của DEFEAT.',
    related: 'Bài viết khác',
  },
  en: {
    eyebrow: 'News & insights',
    title: 'News, tech insights and updates from DEFEAT',
    desc: 'Software development lessons, technology trends and product news from DEFEAT.',
    related: 'More articles',
  },
};

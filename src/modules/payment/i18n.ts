import type { Locale } from '@i18n/config';

export const paymentText: Record<Locale, {
  title: string; eyebrow: string; desc: string;
  accountsTitle: string; bank: string; number: string; holder: string; branch: string; copy: string; copied: string; qr: string;
  noAccounts: string; noteTitle: string; noteDesc: string;
  stepsTitle: string; steps: { title: string; desc: string }[];
  termsTitle: string; terms: string[];
  safetyTitle: string; safety: string[];
  help: string; helpCta: string;
}> = {
  vi: {
    eyebrow: 'Thanh toán',
    title: 'Thông tin thanh toán',
    desc: 'Tài khoản nhận tiền chính thức của DEFEAT, quy trình thanh toán và những lưu ý để giao dịch an toàn.',
    accountsTitle: 'Tài khoản nhận thanh toán',
    bank: 'Ngân hàng', number: 'Số tài khoản', holder: 'Chủ tài khoản', branch: 'Chi nhánh',
    copy: 'Sao chép', copied: 'Đã sao chép', qr: 'Quét mã VietQR bằng ứng dụng ngân hàng',
    noAccounts: 'Thông tin tài khoản được gửi kèm báo giá hoặc hợp đồng. Vui lòng liên hệ DEFEAT để nhận thông tin chính thức.',
    noteTitle: 'Nội dung chuyển khoản',
    noteDesc: 'Ghi đúng mã báo giá hoặc mã đơn hàng để giao dịch được xác nhận nhanh.',
    stepsTitle: 'Quy trình thanh toán',
    steps: [
      { title: 'Nhận báo giá', desc: 'DEFEAT gửi báo giá hoặc hợp đồng kèm mã và số tiền cần thanh toán.' },
      { title: 'Chuyển khoản', desc: 'Chuyển đúng số tiền vào tài khoản trên trang này, ghi đúng nội dung.' },
      { title: 'Gửi xác nhận', desc: 'Gửi ảnh chụp giao dịch qua email hoặc Telegram để đối soát nhanh.' },
      { title: 'Xác nhận và bàn giao', desc: 'DEFEAT xác nhận đã nhận tiền, gửi biên nhận và tiến hành bàn giao.' },
    ],
    termsTitle: 'Điều khoản thanh toán',
    terms: [
      'Số tiền, số đợt và thời hạn thanh toán được ghi trong báo giá hoặc hợp đồng của từng dự án.',
      'Giá niêm yết của sản phẩm mã nguồn chưa bao gồm các khoản tuỳ biến thêm ngoài phạm vi đã thống nhất.',
      'Phí chuyển khoản (nếu có) do bên chuyển chi trả.',
      'Cần chứng từ hoặc hoá đơn, vui lòng báo trước khi thanh toán để DEFEAT chuẩn bị.',
    ],
    safetyTitle: 'Lưu ý an toàn',
    safety: [
      'DEFEAT chỉ nhận thanh toán vào các tài khoản được công bố trên trang này hoặc ghi trong hợp đồng.',
      'DEFEAT không bao giờ yêu cầu chuyển tiền vào tài khoản cá nhân khác qua tin nhắn.',
      'Khi nghi ngờ, hãy xác nhận lại qua email hoặc kênh liên hệ chính thức trước khi chuyển.',
    ],
    help: 'Cần hỗ trợ về thanh toán?',
    helpCta: 'Xem thông tin liên hệ',
  },
  en: {
    eyebrow: 'Payment',
    title: 'Payment information',
    desc: 'DEFEAT’s official receiving accounts, payment process and tips for safe transactions.',
    accountsTitle: 'Receiving accounts',
    bank: 'Bank', number: 'Account number', holder: 'Account holder', branch: 'Branch',
    copy: 'Copy', copied: 'Copied', qr: 'Scan the VietQR code with your banking app',
    noAccounts: 'Account details are sent with each quote or contract. Please contact DEFEAT to receive the official details.',
    noteTitle: 'Transfer reference',
    noteDesc: 'Use the exact quote or order code so the payment can be confirmed quickly.',
    stepsTitle: 'Payment process',
    steps: [
      { title: 'Receive a quote', desc: 'DEFEAT sends a quote or contract with the reference code and amount due.' },
      { title: 'Transfer', desc: 'Transfer the exact amount to an account listed here with the correct reference.' },
      { title: 'Send confirmation', desc: 'Send a screenshot of the transaction by email or Telegram for fast matching.' },
      { title: 'Confirmation and delivery', desc: 'DEFEAT confirms receipt, issues a receipt and proceeds with delivery.' },
    ],
    termsTitle: 'Payment terms',
    terms: [
      'Amounts, instalments and due dates are set out in each project’s quote or contract.',
      'Listed source code prices exclude customisation beyond the agreed scope.',
      'Transfer fees, if any, are paid by the sender.',
      'If you need invoices or documents, please let us know before paying.',
    ],
    safetyTitle: 'Safety notes',
    safety: [
      'DEFEAT only accepts payment to the accounts published on this page or stated in the contract.',
      'DEFEAT never asks you by message to pay into a different personal account.',
      'If in doubt, confirm through our official email or contact channels before transferring.',
    ],
    help: 'Need help with a payment?',
    helpCta: 'See contact information',
  },
};

import type { Locale } from '@i18n/config';

export interface ContactFormLabels {
  name: string; email: string; phone: string; company: string; service: string; budget: string;
  message: string; submit: string; sending: string; success: string; error: string; required: string;
  serviceOptions: string[]; budgetOptions: string[]; consent: string;
}

export const contactText: Record<Locale, {
  eyebrow: string; title: string; desc: string; infoTitle: string; channelsTitle: string; email: string; phone: string; address: string;
  steps: { title: string; desc: string }[]; form: ContactFormLabels;
}> = {
  vi: {
    eyebrow: 'Liên hệ',
    title: 'Trao đổi về dự án của bạn',
    desc: 'Gửi yêu cầu, chúng tôi phản hồi trong 1–2 ngày làm việc với đề xuất giải pháp, timeline và báo giá sơ bộ.',
    infoTitle: 'Thông tin liên hệ',
    channelsTitle: 'Nhắn tin trực tiếp & cộng đồng',
    email: 'Email', phone: 'Điện thoại', address: 'Địa chỉ',
    steps: [
      { title: 'Tiếp nhận', desc: 'Chúng tôi xem yêu cầu và liên hệ lại để làm rõ.' },
      { title: 'Tư vấn', desc: 'Buổi trao đổi miễn phí về bài toán và giải pháp.' },
      { title: 'Đề xuất', desc: 'Gửi phạm vi, timeline và báo giá chi tiết.' },
    ],
    form: {
      name: 'Họ và tên', email: 'Email công việc', phone: 'Số điện thoại', company: 'Công ty',
      service: 'Dịch vụ quan tâm', budget: 'Ngân sách dự kiến', message: 'Mô tả dự án',
      submit: 'Gửi yêu cầu', sending: 'Đang gửi…', required: 'bắt buộc',
      success: 'Cảm ơn bạn! Yêu cầu đã được gửi, DEFEAT sẽ liên hệ sớm.',
      error: 'Gửi không thành công. Vui lòng kiểm tra thông tin hoặc email trực tiếp cho chúng tôi.',
      serviceOptions: ['Phần mềm theo yêu cầu', 'Website / Web App', 'Ứng dụng di động', 'Đội ngũ riêng', 'Mua mã nguồn / sản phẩm', 'Khác'],
      budgetOptions: ['Dưới 50 triệu', '50 – 200 triệu', '200 – 500 triệu', 'Trên 500 triệu', 'Chưa xác định'],
      consent: 'Tôi đồng ý để DEFEAT liên hệ theo thông tin đã cung cấp.',
    },
  },
  en: {
    eyebrow: 'Contact',
    title: 'Let’s talk about your project',
    desc: 'Send your request and we will reply within 1–2 business days with a proposed solution, timeline and initial quote.',
    infoTitle: 'Contact information',
    channelsTitle: 'Direct message & community',
    email: 'Email', phone: 'Phone', address: 'Address',
    steps: [
      { title: 'Intake', desc: 'We review your request and get back to clarify.' },
      { title: 'Consultation', desc: 'A free call about your challenge and options.' },
      { title: 'Proposal', desc: 'Scope, timeline and a detailed quote.' },
    ],
    form: {
      name: 'Full name', email: 'Work email', phone: 'Phone number', company: 'Company',
      service: 'Service of interest', budget: 'Estimated budget', message: 'Project description',
      submit: 'Send request', sending: 'Sending…', required: 'required',
      success: 'Thank you! Your request has been sent and DEFEAT will be in touch soon.',
      error: 'Sending failed. Please check your details or email us directly.',
      serviceOptions: ['Custom software', 'Website / Web app', 'Mobile app', 'Dedicated team', 'Buy source code / product', 'Other'],
      budgetOptions: ['Under $2k', '$2k – $8k', '$8k – $20k', 'Over $20k', 'Not sure yet'],
      consent: 'I agree to be contacted by DEFEAT using the details provided.',
    },
  },
};

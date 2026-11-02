import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } from 'astro:env/server';

/**
 * Action xử lý form liên hệ. Actions luôn chạy on-demand (SSR) dù trang chứa form là SSG.
 */
export const contactInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(150).optional(),
  service: z.string().trim().max(100).optional(),
  budget: z.string().trim().max(100).optional(),
  message: z.string().trim().min(10).max(5000),
  locale: z.enum(['vi', 'en']).default('vi'),
  consent: z.literal('on'),
  /** Honeypot chống bot: người thật không nhìn thấy nên luôn để trống. */
  website: z.string().max(0).optional(),
});

export const contactAction = defineAction({
  accept: 'form',
  input: contactInput,
  handler: async (input) => {
    if (input.website) return { ok: true };

    const subject = `[defeat.vn] ${input.service ?? 'Liên hệ'} — ${input.name}`;
    const text = [
      `Họ tên: ${input.name}`,
      `Email: ${input.email}`,
      `Điện thoại: ${input.phone ?? '-'}`,
      `Công ty: ${input.company ?? '-'}`,
      `Dịch vụ: ${input.service ?? '-'}`,
      `Ngân sách: ${input.budget ?? '-'}`,
      `Ngôn ngữ: ${input.locale}`,
      '',
      input.message,
    ].join('\n');

    if (!RESEND_API_KEY) {
      console.info('[contact] RESEND_API_KEY chưa cấu hình — ghi log thay vì gửi email.\n' + text);
      return { ok: true };
    }

    const { Resend } = await import('resend');
    const { error } = await new Resend(RESEND_API_KEY).emails.send({
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      replyTo: input.email,
      subject,
      text,
    });
    if (error) {
      console.error('[contact] Resend error', error);
      throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Email delivery failed' });
    }
    return { ok: true };
  },
});

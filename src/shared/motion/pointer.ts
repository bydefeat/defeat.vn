/**
 * Tương tác con trỏ:
 *  - [data-magnetic="0.2"]: nút hút nhẹ theo con trỏ (chỉ thiết bị có chuột).
 *  - [data-brand="#hex"]: gán biến --brand (dùng cho logo công nghệ đổi màu thương hiệu khi rê chuột).
 * Chỉ đổi style qua CSSOM nên tương thích CSP.
 */
import { isFinePointer, prefersReducedMotion } from './env';

export function initPointer() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-brand]')) {
    el.style.setProperty('--brand', el.dataset.brand!);
  }
  if (!isFinePointer() || prefersReducedMotion()) return;
  for (const el of document.querySelectorAll<HTMLElement>('[data-magnetic]')) {
    const strength = Number(el.dataset.magnetic) || 0.2;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.translate = `${(e.clientX - r.left - r.width / 2) * strength}px ${(e.clientY - r.top - r.height / 2) * strength}px`;
    });
    el.addEventListener('pointerleave', () => (el.style.translate = ''));
  }
}

/**
 * Hệ thống reveal theo cuộn.
 *
 * Chống nháy (đặc biệt khi chuyển trang / đổi ngôn ngữ):
 *  - Chỉ những [data-reveal] nằm DƯỚI màn hình lúc tải mới bị ẩn (gắn data-pending) để chờ cuộn tới.
 *  - Phần tử đã thấy được lúc tải giữ nguyên, không bao giờ "hiện → ẩn → hiện lại".
 *  - Không có cơ chế tự hiện sau X giây (cơ chế đó gây nháy khi người dùng cuộn tới).
 * Kiểu chuyển động do giá trị data-reveal quyết định (xem global.css, mục MOTION).
 * [data-reveal-group="ms"]: các con được so le qua biến --reveal-delay.
 * [data-odometer]: luôn chạy khi vào màn hình (trạng thái ban đầu do CSS đặt sẵn ở 0, không nháy).
 */
import { prefersReducedMotion } from './env';

export function initReveal() {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  const odometers = Array.from(document.querySelectorAll<HTMLElement>('[data-odometer]'));
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    [...items, ...odometers].forEach((el) => el.classList.add('is-in'));
    return;
  }

  for (const group of document.querySelectorAll<HTMLElement>('[data-reveal-group]')) {
    const step = Number(group.dataset.revealGroup) || 80;
    let i = 0;
    for (const child of group.querySelectorAll<HTMLElement>('[data-reveal]')) {
      child.style.setProperty('--reveal-delay', `${Math.min(i++ * step, 720)}ms`);
    }
  }

  const vh = window.innerHeight;
  const pending: HTMLElement[] = [];
  for (const el of items) {
    const r = el.getBoundingClientRect();
    const visibleNow = r.top < vh && r.bottom > 0 && r.width > 0;
    if (visibleNow) continue; // đã thấy → không ẩn
    el.dataset.pending = '';
    pending.push(el);
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  pending.forEach((el) => io.observe(el));
  odometers.forEach((el) => io.observe(el));
}

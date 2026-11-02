/** Đếm số cho [data-count] (vd. "100%", "6+", "1–2"): số đầu tiên chạy từ 0 → giá trị. */
import { easeOutExpo, onceVisible, prefersReducedMotion } from './env';

export function initCounters() {
  if (prefersReducedMotion()) return;
  for (const el of document.querySelectorAll<HTMLElement>('[data-count]')) {
    const text = el.textContent ?? '';
    const match = text.match(/^(\D*)(\d+)(.*)$/s);
    if (!match) continue;
    const [, prefix = '', num = '0', suffix = ''] = match;
    const target = Number(num);
    if (target < 2) continue;
    el.textContent = `${prefix}0${suffix}`;
    onceVisible(el, () => {
      const start = performance.now();
      const duration = 1600;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        el.textContent = `${prefix}${Math.round(easeOutExpo(p) * target)}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }
}

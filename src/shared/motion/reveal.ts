/**
 * Scroll reveal "dither dissolve": [data-reveal] hiện qua các mức Bayer khi vào viewport.
 * Nhóm [data-reveal-group="ms"] tự stagger các con theo thứ tự (biến CSS --reveal-delay).
 */
import { prefersReducedMotion } from './env';

export function initReveal() {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!items.length) return;
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }

  for (const group of document.querySelectorAll<HTMLElement>('[data-reveal-group]')) {
    const step = Number(group.dataset.revealGroup) || 80;
    group.querySelectorAll<HTMLElement>(':scope [data-reveal]').forEach((child, i) => {
      child.style.setProperty('--reveal-delay', `${Math.min(i * step, 720)}ms`);
    });
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
  );
  items.forEach((el) => io.observe(el));
}

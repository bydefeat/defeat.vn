/**
 * Scroll reveal: phần tử [data-reveal] hiện dần khi vào viewport.
 * Nhóm [data-reveal-group] tự stagger các con [data-reveal] theo thứ tự.
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
    group.querySelectorAll<HTMLElement>('[data-reveal]').forEach((child, i) => {
      child.style.transitionDelay = `${Math.min(i * step, 600)}ms`;
    });
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add('is-in');
        el.dispatchEvent(new CustomEvent('reveal', { bubbles: false }));
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  items.forEach((el) => io.observe(el));
}

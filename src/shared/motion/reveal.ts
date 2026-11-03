import { prefersReducedMotion } from './env';

export function initReveal() {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!items.length || prefersReducedMotion() || !('IntersectionObserver' in window)) return;

  for (const group of document.querySelectorAll<HTMLElement>('[data-reveal-group]')) {
    const step = Number(group.dataset.revealGroup) || 70;
    let i = 0;
    for (const child of group.querySelectorAll<HTMLElement>('[data-reveal]')) {
      child.style.setProperty('--reveal-delay', `${Math.min(i++ * step, 420)}ms`);
    }
  }

  const vh = window.innerHeight;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
  );
  for (const el of items) {
    const r = el.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) continue;
    el.dataset.pending = '';
    io.observe(el);
  }
}

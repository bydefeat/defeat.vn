/**
 * Spotlight dither theo con trỏ cho .card-fx (CSS đọc --mx/--my).
 * Nam châm nhẹ cho [data-magnetic].
 * Dùng CSSOM (style.setProperty) nên tương thích CSP.
 */
import { isFinePointer, prefersReducedMotion } from './env';

export function initSpotlight() {
  if (!isFinePointer()) return;
  document.addEventListener(
    'pointermove',
    (e) => {
      const card = (e.target as Element | null)?.closest?.<HTMLElement>('.card-fx');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    },
    { passive: true },
  );

  if (prefersReducedMotion()) return;
  for (const el of document.querySelectorAll<HTMLElement>('[data-magnetic]')) {
    const strength = Number(el.dataset.magnetic) || 0.25;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * strength;
      const y = (e.clientY - r.top - r.height / 2) * strength;
      el.style.translate = `${x}px ${y}px`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.translate = '';
    });
  }
}

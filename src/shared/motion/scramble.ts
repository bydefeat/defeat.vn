/**
 * Hiệu ứng "decode" chữ kiểu terminal/dither cho [data-scramble].
 * Chỉ dùng cho chữ font mono (eyebrow, nhãn) để không gây layout shift.
 * Kích hoạt khi vào viewport; [data-scramble="hover"] kích hoạt thêm khi rê chuột.
 */
import { prefersReducedMotion, onceVisible } from './env';

const GLYPHS = '░▒▓█▚▞▖▗▘▝01#/\\<>+*';

export function scramble(el: HTMLElement, duration = 900) {
  const original = (el.dataset.text ??= el.textContent ?? '');
  if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', original);
  const start = performance.now();
  const len = original.length;
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const revealed = Math.floor(p * len);
    let out = '';
    for (let i = 0; i < len; i++) {
      const ch = original[i]!;
      out += i < revealed || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = original;
  };
  requestAnimationFrame(tick);
}

export function initScramble() {
  if (prefersReducedMotion()) return;
  for (const el of document.querySelectorAll<HTMLElement>('[data-scramble]')) {
    onceVisible(el, () => scramble(el));
    if (el.dataset.scramble === 'hover') {
      const target = el.closest<HTMLElement>('a, button') ?? el;
      target.addEventListener('pointerenter', () => scramble(el, 500));
    }
  }
}

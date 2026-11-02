/** Tiện ích môi trường cho motion. */
export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isFinePointer = (): boolean => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Gọi `fn` khi phần tử vào viewport (một lần). */
export function onceVisible(el: Element, fn: () => void, rootMargin = '0px 0px -10% 0px') {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          io.disconnect();
          fn();
        }
      }
    },
    { rootMargin },
  );
  io.observe(el);
}

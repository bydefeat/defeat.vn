import { prefersReducedMotion } from './env';

const HOLD = [2600, 2800, 3400];
const COMPLETE = 2600;
const RESET = 700;

export function initSteps() {
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;
  for (const root of document.querySelectorAll<HTMLElement>('[data-steps]')) setup(root);
}

function setup(root: HTMLElement) {
  const items = Array.from(root.querySelectorAll<HTMLElement>(':scope > .fstep'));
  if (!items.length) return;
  const last = items.length;
  let current = -1;
  let timer = 0;
  let visible = false;
  let hovering = false;

  const render = (k: number) => {
    current = k;
    items.forEach((el, i) => {
      el.dataset.state = k < 0 ? 'todo' : i < k ? 'done' : i === k ? 'active' : 'todo';
    });
  };

  const schedule = () => {
    clearTimeout(timer);
    if (!visible || hovering || document.hidden) return;
    const delay = current < 0 ? RESET : current >= last ? COMPLETE : HOLD[current] ?? HOLD[HOLD.length - 1];
    timer = window.setTimeout(() => {
      render(current >= last ? -1 : current + 1);
      schedule();
    }, delay);
  };

  render(-1);

  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && current < 0) {
        clearTimeout(timer);
        timer = window.setTimeout(() => { render(0); schedule(); }, 250);
      } else schedule();
    },
    { threshold: 0.35 },
  ).observe(root);

  items.forEach((el, i) => {
    el.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch') return;
      hovering = true;
      clearTimeout(timer);
      if (current !== i) render(i);
    });
    el.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'touch') return;
      hovering = false;
      schedule();
    });
    el.addEventListener('click', () => {
      if (current === i) return;
      render(i);
      schedule();
    });
  });

  document.addEventListener('visibilitychange', schedule);
}

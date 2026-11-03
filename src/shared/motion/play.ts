import { prefersReducedMotion } from './env';

export function initPlay() {
  const hosts = Array.from(document.querySelectorAll<HTMLElement>('[data-play]'));
  if (!hosts.length || prefersReducedMotion() || !('IntersectionObserver' in window)) return;

  const play = (el: HTMLElement) => {
    delete el.dataset.playWait;
    el.classList.remove('is-play');
    void el.offsetWidth;
    el.classList.add('is-play');
    el.dataset.playAt = String(performance.now());
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        play(entry.target as HTMLElement);
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.4 },
  );

  for (const el of hosts) {
    el.dataset.playWait = '';
    io.observe(el);
    el.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch' || el.dataset.playWait !== undefined) return;
      if (performance.now() - Number(el.dataset.playAt || 0) < 1800) return;
      el.style.setProperty('--stagger', '0s');
      play(el);
    });
  }
}

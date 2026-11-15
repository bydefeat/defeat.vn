import type { TransitionBeforePreparationEvent } from 'astro:transitions/client';

/**
 * Before the view-transition snapshot of the old page is taken, pick which
 * elements morph: drop the hero morph when scrolled away, and morph the clicked
 * card title into the destination page title.
 */
export function initTransitions() {
  document.addEventListener('astro:before-preparation', (e) => {
    const to = (e as TransitionBeforePreparationEvent).to;
    // Reset names left over from an earlier, interrupted navigation (avoids duplicate names).
    document
      .querySelectorAll<HTMLElement>('.vt-hero, .vt-title, .card-title')
      .forEach((el) => (el.style.viewTransitionName = ''));
    const unname = (sel: string) =>
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => (el.style.viewTransitionName = 'none'));

    if (window.scrollY > 80) unname('.vt-hero');

    const link = Array.from(document.querySelectorAll<HTMLAnchorElement>('.card-title a')).find(
      (a) => a.pathname === to.pathname,
    );
    const title = link?.closest<HTMLElement>('.card-title');
    if (title) {
      const r = title.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        unname('.vt-title');
        title.style.viewTransitionName = 'page-title';
      }
    }
  });
}

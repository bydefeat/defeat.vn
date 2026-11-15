const KEY = 'defeat-theme';

function apply(theme: 'dark' | 'light') {
  const root = document.documentElement;
  root.dataset.theme = `defeat-${theme}`;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
  document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(theme === 'dark')));
}

const current = (): 'dark' | 'light' => (document.documentElement.dataset.theme === 'defeat-light' ? 'light' : 'dark');

/**
 * Client-side navigation swaps <html> attributes and <head>; keep the active theme on the incoming page.
 * Only plain attributes go on the incoming document: the router copies them with setAttribute, and CSP
 * blocks a copied `style` attribute, so color-scheme is re-applied through CSSOM after the swap.
 */
export function initThemeCarry() {
  let theme: 'dark' | 'light' = 'dark';
  document.addEventListener('astro:before-swap', (e) => {
    theme = current();
    e.newDocument.documentElement.dataset.theme = `defeat-${theme}`;
    e.newDocument.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
  });
  document.addEventListener('astro:after-swap', () => {
    document.documentElement.style.colorScheme = theme;
  });
}

export function initTheme() {
  apply(current());
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    btn.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(KEY, next);
      } catch {
      }
      const doc = document as Document & {
        startViewTransition?: (o: { update: () => void; types: string[] }) => unknown;
      };
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (doc.startViewTransition && !reduce) {
        try {
          doc.startViewTransition({ update: () => apply(next), types: ['theme'] });
          return;
        } catch {
        }
      }
      apply(next);
    });
  }
}

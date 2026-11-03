export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;
  const menu = header.querySelector<HTMLDetailsElement>('[data-mobile-menu]');
  const megaItems = Array.from(header.querySelectorAll<HTMLElement>('[data-mega]'));

  const setMega = (item: HTMLElement, open: boolean) => {
    item.dataset.open = String(open);
    item.querySelector('[data-mega-toggle]')?.setAttribute('aria-expanded', String(open));
  };
  const closeAllMega = () => megaItems.forEach((i) => setMega(i, false));

  for (const item of megaItems) {
    item.querySelector('[data-mega-toggle]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = item.dataset.open !== 'true';
      closeAllMega();
      setMega(item, open);
    });
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget as Node | null)) setMega(item, false);
    });
  }
  for (const root of header.querySelectorAll<HTMLElement>('[data-preview-root]')) {
    const previews = root.querySelectorAll<HTMLElement>('[data-preview]');
    const show = (i: string) => previews.forEach((p) => { p.hidden = p.dataset.preview !== i; });
    for (const target of root.querySelectorAll<HTMLElement>('[data-preview-target]')) {
      const i = target.dataset.previewTarget!;
      target.addEventListener('mouseenter', () => show(i));
      target.addEventListener('focus', () => show(i));
    }
  }

  document.addEventListener('click', (e) => {
    if (!header.contains(e.target as Node)) closeAllMega();
  });

  let ticking = false;
  const update = () => {
    header.dataset.scrolled = String(window.scrollY > 4);
    ticking = false;
  };
  update();
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );

  menu?.addEventListener('toggle', () => document.documentElement.classList.toggle('menu-open', menu.open));
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (mq) => {
    if (mq.matches && menu?.open) menu.open = false;
  });
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    if (menu) menu.open = false;
    document.documentElement.classList.remove('menu-open');
    closeAllMega();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (menu?.open) {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
    const openItem = megaItems.find((i) => i.dataset.open === 'true');
    if (openItem) {
      setMega(openItem, false);
      openItem.querySelector<HTMLElement>('[data-mega-toggle]')?.focus();
    }
  });
}

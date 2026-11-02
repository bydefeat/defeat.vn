/**
 * Header:
 *  - data-scrolled: nền đặc + viền khi đã cuộn.
 *  - data-hidden: ẩn khi cuộn xuống, hiện khi cuộn lên (không ẩn khi menu/mega đang mở).
 *  - Mega menu: nút [data-mega-toggle] mở/đóng (aria-expanded), Esc / click ra ngoài để đóng.
 *  - Menu mobile (<details>): khoá cuộn trang, Esc để đóng, đóng khi chuyển sang desktop.
 */
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
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target as Node)) closeAllMega();
  });

  let lastY = window.scrollY;
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    header.dataset.scrolled = String(y > 8);
    const busy = menu?.open || megaItems.some((i) => i.dataset.open === 'true') || header.matches(':hover');
    if (!busy && y > lastY + 6 && y > 240) header.dataset.hidden = 'true';
    else if (y < lastY - 6 || y <= 240) header.dataset.hidden = 'false';
    lastY = y;
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
  header.addEventListener('focusin', () => (header.dataset.hidden = 'false'));

  menu?.addEventListener('toggle', () => {
    document.documentElement.classList.toggle('menu-open', menu.open);
    if (menu.open) header.dataset.hidden = 'false';
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (mq) => {
    if (mq.matches && menu?.open) menu.open = false;
  });
  // Quay lại trang từ bfcache (nút Back): đóng mọi menu, mở khoá cuộn, hiện header.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    if (menu) menu.open = false;
    document.documentElement.classList.remove('menu-open');
    closeAllMega();
    header.dataset.hidden = 'false';
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

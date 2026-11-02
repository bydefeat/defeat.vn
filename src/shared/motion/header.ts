/**
 * Header thông minh:
 *  - data-scrolled: đổi nền/thu gọn topbar khi cuộn.
 *  - data-hidden: ẩn khi cuộn xuống, hiện khi cuộn lên.
 *  - Khoá cuộn trang khi mở menu mobile.
 */
export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    header.dataset.scrolled = String(y > 24);
    const menuOpen = document.documentElement.classList.contains('menu-open');
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (!menuOpen && goingDown && y > 320) header.dataset.hidden = 'true';
    else if (goingUp || y < 320) header.dataset.hidden = 'false';
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
  // Rời focus khỏi header (bàn phím) → luôn hiện header.
  header.addEventListener('focusin', () => (header.dataset.hidden = 'false'));

  const menu = header.querySelector<HTMLDetailsElement>('[data-mobile-menu]');
  menu?.addEventListener('toggle', () => {
    document.documentElement.classList.toggle('menu-open', menu.open);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu?.open) {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  });
}

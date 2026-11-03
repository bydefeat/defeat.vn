/**
 * Chuẩn bị chuyển trang trên TRANG CŨ (sự kiện pageswap, trước khi chụp ảnh):
 *  - Bấm vào card → tiêu đề card mang tên "page-title" để biến hình thành tiêu đề trang chi tiết.
 *  - Đã cuộn xa đầu trang → bỏ biến hình dải đầu trang (tránh khối trượt từ ngoài màn hình vào).
 * Chỉ đổi style qua CSSOM nên tương thích CSP.
 */
export function initTransitions() {
  window.addEventListener('pageswap', (e: Event) => {
    const ev = e as Event & { viewTransition?: unknown; activation?: { entry?: { url?: string } } };
    if (!ev.viewTransition || !ev.activation?.entry?.url) return;
    const to = new URL(ev.activation.entry.url);
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
        unname('.vt-title'); // tránh trùng tên với h1 của trang hiện tại
        title.style.viewTransitionName = 'page-title';
      }
    }
  });
}

/** Đồng hồ giờ Việt Nam cho [data-clock] (footer). */
export function initClock() {
  const els = document.querySelectorAll<HTMLElement>('[data-clock]');
  if (!els.length) return;
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const tick = () => els.forEach((el) => (el.textContent = fmt.format(new Date())));
  tick();
  setInterval(tick, 1000);
}

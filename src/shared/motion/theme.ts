/**
 * Chuyển chế độ sáng/tối.
 * - Theme ban đầu được đặt bởi script inline trong <head> (trước khi vẽ → không nháy sai màu).
 * - Nút [data-theme-toggle] đổi theme, lưu localStorage, chuyển màu mượt bằng View Transition (type "theme").
 */
const KEY = 'defeat-theme';

function apply(theme: 'dark' | 'light') {
  const root = document.documentElement;
  root.dataset.theme = `defeat-${theme}`;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
  document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(theme === 'dark')));
}

export function initTheme() {
  const current = () => (document.documentElement.dataset.theme === 'defeat-light' ? 'light' : 'dark');
  apply(current());
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    btn.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* chế độ riêng tư: bỏ qua */
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
          /* trình duyệt cũ không nhận object → đổi thẳng */
        }
      }
      apply(next);
    });
  }
}

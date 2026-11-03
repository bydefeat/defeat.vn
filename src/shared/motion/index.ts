/**
 * Script giao diện dùng chung (BaseLayout nạp một lần cho mọi trang).
 * Mỗi module độc lập, tự bỏ qua nếu trang không có phần tử tương ứng.
 */
import { initHeader } from './header';
import { initReveal } from './reveal';
import { initBrandColors } from './brand';
import { initTransitions } from './transitions';
import { initTheme } from './theme';
import { initIlloCanvases } from './illo-canvas';

function boot() {
  initTheme();
  initHeader();
  initBrandColors();
  initReveal();
  initTransitions();
  initIlloCanvases();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

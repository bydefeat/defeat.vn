/**
 * Điểm vào hệ thống motion (BaseLayout nạp một lần cho mọi trang).
 * Mỗi module độc lập, tự bỏ qua nếu trang không có phần tử tương ứng.
 */
import { initReveal } from './reveal';
import { initHeader } from './header';
import { initPointer } from './pointer';
import { initDitherCanvases } from './dither-canvas';

function boot() {
  initHeader();
  initPointer();
  initReveal();
  initDitherCanvases();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

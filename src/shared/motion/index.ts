/**
 * Điểm vào hệ thống motion (được BaseLayout nạp một lần cho mọi trang).
 * Mỗi module độc lập, tự bỏ qua nếu trang không có phần tử tương ứng.
 */
import { initReveal } from './reveal';
import { initScramble } from './scramble';
import { initCounters } from './counter';
import { initHeader } from './header';
import { initSpotlight } from './spotlight';
import { initClock } from './clock';
import { initDitherCanvases } from './dither-canvas';

function boot() {
  initHeader();
  initReveal();
  initScramble();
  initCounters();
  initSpotlight();
  initClock();
  initDitherCanvases();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

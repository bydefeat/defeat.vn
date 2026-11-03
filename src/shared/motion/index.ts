import { initHeader } from './header';
import { initReveal } from './reveal';
import { initBrandColors } from './brand';
import { initTransitions } from './transitions';
import { initTheme } from './theme';
import { initIlloCanvases } from './illo-canvas';
import { initAsciiFields } from './ascii-field';

function boot() {
  initTheme();
  initHeader();
  initBrandColors();
  initReveal();
  initTransitions();
  initIlloCanvases();
  initAsciiFields();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

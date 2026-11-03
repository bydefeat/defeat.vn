import { initHeader } from './header';
import { initReveal } from './reveal';
import { initTransitions } from './transitions';
import { initTheme } from './theme';
import { initIlloCanvases } from './illo-canvas';
import { initAsciiFields } from './ascii-field';
import { initSteps } from './steps';
import { initPlay } from './play';

function boot() {
  initTheme();
  initHeader();
  initReveal();
  initTransitions();
  initIlloCanvases();
  initAsciiFields();
  initSteps();
  initPlay();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

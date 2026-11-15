import { initHeader } from './header';
import { initReveal } from './reveal';
import { initTransitions } from './transitions';
import { initTheme, initThemeCarry } from './theme';
import { initIlloCanvases } from './illo-canvas';
import { initAsciiFields } from './ascii-field';
import { initSteps } from './steps';
import { initPlay } from './play';
import { teardownPage } from './lifecycle';
import { initServerIslands } from './server-islands';

function boot() {
  initTheme();
  initHeader();
  initReveal();
  initIlloCanvases();
  initAsciiFields();
  initSteps();
  initPlay();
}

// Fires on the initial load and after every client-side navigation.
document.addEventListener('astro:page-load', boot);

document.addEventListener('astro:before-swap', teardownPage);

initThemeCarry();
initTransitions();
initServerIslands();

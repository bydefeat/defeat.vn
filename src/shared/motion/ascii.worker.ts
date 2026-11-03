/// <reference lib="webworker" />
import { AsciiCore } from './ascii-core';

let core: AsciiCore | null = null;
let running = false;
let last = 0;
const FPS = 20;
const tick = () => {
  if (!running || !core) return;
  const now = performance.now();
  if (now - last >= 1000 / FPS) {
    last = now;
    core.draw(now);
  }
  setTimeout(tick, 1000 / FPS / 2);
};

self.onmessage = (e: MessageEvent) => {
  const m = e.data;
  switch (m.type) {
    case 'init': {
      const canvas = m.canvas as OffscreenCanvas;
      core = new AsciiCore(canvas, canvas.getContext('2d')!, (w, h) => new OffscreenCanvas(w, h));
      break;
    }
    case 'resize': core?.resize(m.w, m.h, m.dpr); core?.draw(performance.now()); break;
    case 'colors': core?.setColors(m.ink, m.hot); core?.draw(performance.now()); break;
    case 'logo': if (core) { core.logo = m.logo; core.draw(performance.now()); } break;
    case 'mouse': if (core) { core.mx = m.x; core.my = m.y; core.mta = m.active ? 1 : 0; } break;
    case 'play': if (!running) { running = true; tick(); } break;
    case 'pause': running = false; break;
    case 'frame': core?.draw(performance.now()); break;
  }
};

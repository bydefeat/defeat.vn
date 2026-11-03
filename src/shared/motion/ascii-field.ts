/**
 * Nền ASCII art động cho khối CTA ([data-ascii-field]).
 *  - Vẽ trong Web Worker (OffscreenCanvas) khi trình duyệt hỗ trợ → không chiếm luồng chính;
 *    nếu không hỗ trợ: vẽ trên luồng chính ở 12fps.
 *  - Logo (data-ascii-src, PNG có alpha) raster sẵn trên luồng chính rồi gửi sang worker.
 *  - Màu lấy từ CSS (--ascii-ink, --ascii-hot) → theo theme; chỉ chạy khi khối trên màn hình;
 *    prefers-reduced-motion → 1 khung tĩnh.
 */
import { AsciiCore, CELL_H, CELL_W } from './ascii-core';

export function initAsciiFields() {
  for (const host of document.querySelectorAll<HTMLElement>('[data-ascii-field]')) start(host);
}

interface Driver {
  resize(w: number, h: number, dpr: number): void;
  colors(ink: string, hot: string): void;
  logo(l: Float32Array): void;
  mouse(x: number, y: number, active: boolean): void;
  play(): void;
  pause(): void;
  frame(): void;
}

function workerDriver(canvas: HTMLCanvasElement): Driver | null {
  if (!('transferControlToOffscreen' in canvas) || typeof Worker === 'undefined') return null;
  try {
    const off = canvas.transferControlToOffscreen();
    const w = new Worker(new URL('./ascii.worker.ts', import.meta.url), { type: 'module' });
    w.postMessage({ type: 'init', canvas: off }, [off]);
    const post = (m: object) => w.postMessage(m);
    return {
      resize: (wd, h, dpr) => post({ type: 'resize', w: wd, h, dpr }),
      colors: (ink, hot) => post({ type: 'colors', ink, hot }),
      logo: (l) => post({ type: 'logo', logo: l }),
      mouse: (x, y, active) => post({ type: 'mouse', x, y, active }),
      play: () => post({ type: 'play' }),
      pause: () => post({ type: 'pause' }),
      frame: () => post({ type: 'frame' }),
    };
  } catch {
    return null;
  }
}

function mainDriver(canvas: HTMLCanvasElement): Driver {
  const core = new AsciiCore(canvas, canvas.getContext('2d')!, (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h }));
  let raf = 0, last = 0, running = false;
  const loop = () => {
    raf = requestAnimationFrame((now) => {
      if (!running) return;
      if (now - last > 1000 / 12) { last = now; core.draw(now); }
      loop();
    });
  };
  return {
    resize: (w, h, dpr) => { core.resize(w, h, dpr); core.draw(performance.now()); },
    colors: (ink, hot) => { core.setColors(ink, hot); core.draw(performance.now()); },
    logo: (l) => { core.logo = l; core.draw(performance.now()); },
    mouse: (x, y, active) => { core.mx = x; core.my = y; core.mta = active ? 1 : 0; },
    play: () => { if (!running) { running = true; loop(); } },
    pause: () => { running = false; cancelAnimationFrame(raf); },
    frame: () => core.draw(performance.now()),
  };
}

function start(host: HTMLElement) {
  const canvas = document.createElement('canvas');
  canvas.className = 'ascii-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const drv = workerDriver(canvas) ?? mainDriver(canvas);
  let visible = false;

  const sendColors = () => {
    const cs = getComputedStyle(host);
    drv.colors(cs.getPropertyValue('--ascii-ink').trim() || '#666', cs.getPropertyValue('--ascii-hot').trim() || '#e11');
  };
  const sendLogo = (img: HTMLImageElement) => {
    const r = host.getBoundingClientRect();
    const cols = Math.ceil(r.width / CELL_W), rows = Math.ceil(r.height / CELL_H);
    if (!cols || !rows || !img.naturalWidth) return;
    const off = document.createElement('canvas');
    off.width = cols;
    off.height = rows;
    const o = off.getContext('2d', { willReadFrequently: true })!;
    const hCells = rows * 0.72;
    const wCells = hCells * (img.naturalWidth / img.naturalHeight) * (CELL_H / CELL_W);
    o.drawImage(img, (cols - wCells) / 2, (rows - hCells) / 2, wCells, hCells);
    const d = o.getImageData(0, 0, cols, rows).data;
    const logo = new Float32Array(cols * rows);
    for (let i = 0; i < logo.length; i++) logo[i] = d[i * 4 + 3]! / 255;
    drv.logo(logo);
  };
  const img = host.dataset.asciiSrc ? Object.assign(new Image(), { src: host.dataset.asciiSrc }) : null;

  const resize = () => {
    const r = host.getBoundingClientRect();
    drv.resize(r.width, r.height, Math.min(2, window.devicePixelRatio || 1));
    if (img?.complete) sendLogo(img);
  };
  sendColors();
  resize();
  img?.addEventListener('load', () => sendLogo(img));
  new ResizeObserver(resize).observe(host);

  const update = () => (visible && !document.hidden && !reduced ? drv.play() : drv.pause());
  new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; update(); }).observe(host);
  document.addEventListener('visibilitychange', update);
  new MutationObserver(sendColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  host.addEventListener('pointermove', (e) => {
    const b = host.getBoundingClientRect();
    drv.mouse(e.clientX - b.left, e.clientY - b.top, true);
    if (reduced) drv.frame();
  });
  host.addEventListener('pointerleave', () => drv.mouse(-1e4, -1e4, false));
}

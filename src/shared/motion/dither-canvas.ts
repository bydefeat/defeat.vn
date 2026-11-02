/**
 * DitherCanvas — engine canvas 2D vẽ hình ảnh + trường nhiễu động bằng ordered dithering (Bayer 8x8).
 *
 * - Hình (logo/wordmark) lấy từ kênh alpha của ảnh PNG trong /public.
 * - Hiệu ứng intro: các "pixel" lắp ghép dần theo ngưỡng ngẫu nhiên.
 * - Con trỏ tạo vùng sáng (glow) trên trường dither.
 * - Vẽ ở độ phân giải thấp (1 cell = N px CSS), phóng to bằng `image-rendering: pixelated`.
 * - Tạm dừng khi ngoài viewport / tab ẩn; prefers-reduced-motion → vẽ 1 khung tĩnh.
 */
import { clamp, prefersReducedMotion } from './env';

const B8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);

type RGB = readonly [number, number, number];
export interface Rect { x: number; y: number; w: number; h: number }

export interface DitherOptions {
  /** Ảnh PNG có alpha làm hình. */
  src: string;
  /** Kích thước 1 cell (px CSS). */
  cell?: number;
  /** Vị trí/kích thước hình theo đơn vị cell. `aspect` = width/height của ảnh. */
  place: (w: number, h: number, aspect: number, cssWidth: number) => Rect;
  shapeColor?: RGB;
  fieldColor?: RGB;
  glowColor?: RGB;
  /** Độ đậm cơ bản của hình (0–1). */
  shapeLevel?: number;
  /** Biên độ trường nhiễu nền (0 = tắt). */
  fieldLevel?: number;
  /** Bán kính glow con trỏ (cell). */
  glowRadius?: number;
  /** Thời gian intro (ms). */
  intro?: number;
  fps?: number;
}

const pack = ([r, g, b]: RGB, a = 255) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;

export class DitherCanvas {
  private ctx: CanvasRenderingContext2D;
  private host: HTMLElement;
  private img = new Image();
  private w = 0;
  private h = 0;
  private data!: ImageData;
  private buf!: Uint32Array;
  private shape = new Float32Array(0);
  private rnd = new Float32Array(0);
  private colX = new Float32Array(0);
  private rowShift = new Float32Array(0);
  private raf = 0;
  private last = 0;
  private t0 = 0;
  private visible = false;
  private pointer = { x: -999, y: -999, tx: -999, ty: -999, a: 0, ta: 0 };
  private o: Required<DitherOptions>;
  private reduced = prefersReducedMotion();

  constructor(private canvas: HTMLCanvasElement, opts: DitherOptions) {
    this.ctx = canvas.getContext('2d', { alpha: true })!;
    this.host = canvas.parentElement!;
    this.o = {
      cell: 4,
      shapeColor: [232, 32, 36],
      fieldColor: [52, 52, 58],
      glowColor: [150, 24, 28],
      shapeLevel: 0.82,
      fieldLevel: 0.3,
      glowRadius: 26,
      intro: 1600,
      fps: 30,
      ...opts,
    };
  }

  async start() {
    this.img.decoding = 'async';
    this.img.src = this.o.src;
    try {
      await this.img.decode();
    } catch {
      return;
    }
    this.resize();
    new ResizeObserver(() => this.resize()).observe(this.host);
    this.host.classList.add('is-live');
    this.t0 = performance.now();

    if (this.reduced) {
      this.draw(this.t0 + this.o.intro * 2);
      return;
    }
    new IntersectionObserver(([e]) => {
      this.visible = !!e?.isIntersecting;
      if (this.visible) this.loop();
    }).observe(this.host);
    document.addEventListener('visibilitychange', () => !document.hidden && this.visible && this.loop());
    this.host.addEventListener('pointermove', (e) => {
      const r = this.canvas.getBoundingClientRect();
      this.pointer.tx = ((e.clientX - r.left) / r.width) * this.w;
      this.pointer.ty = ((e.clientY - r.top) / r.height) * this.h;
      if (this.pointer.a < 0.01) {
        this.pointer.x = this.pointer.tx;
        this.pointer.y = this.pointer.ty;
      }
      this.pointer.ta = 1;
    });
    this.host.addEventListener('pointerleave', () => (this.pointer.ta = 0));
  }

  private resize() {
    const cw = this.host.clientWidth;
    const ch = this.host.clientHeight;
    const w = Math.max(1, Math.ceil(cw / this.o.cell));
    const h = Math.max(1, Math.ceil(ch / this.o.cell));
    if (w === this.w && h === this.h) return;
    this.w = w;
    this.h = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.data = this.ctx.createImageData(w, h);
    this.buf = new Uint32Array(this.data.data.buffer);
    this.rnd = Float32Array.from({ length: w * h }, () => Math.random());
    this.colX = new Float32Array(w);
    this.rowShift = new Float32Array(h);

    // Raster hình vào lưới cell.
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const octx = off.getContext('2d', { willReadFrequently: true })!;
    const rect = this.o.place(w, h, this.img.naturalWidth / this.img.naturalHeight, cw);
    octx.drawImage(this.img, rect.x, rect.y, rect.w, rect.h);
    const px = octx.getImageData(0, 0, w, h).data;
    this.shape = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) this.shape[i] = px[i * 4 + 3]! / 255;
    if (this.reduced) this.draw(performance.now() + this.o.intro * 2);
  }

  private loop = () => {
    cancelAnimationFrame(this.raf);
    const step = (now: number) => {
      if (!this.visible || document.hidden) return;
      if (now - this.last >= 1000 / this.o.fps) {
        this.last = now;
        this.draw(now);
      }
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  };

  private draw(now: number) {
    const { w, h, buf, shape, rnd, o, pointer: p } = this;
    const t = (now - this.t0) / 1000;
    const intro = clamp((now - this.t0) / o.intro, 0, 1);

    // Con trỏ di chuyển mượt.
    p.x += (p.tx - p.x) * 0.18;
    p.y += (p.ty - p.y) * 0.18;
    p.a += (p.ta - p.a) * 0.08;
    const R2 = o.glowRadius * o.glowRadius;

    const shapeC = pack(o.shapeColor);
    const fieldC = pack(o.fieldColor);
    const glowC = pack(o.glowColor);

    for (let x = 0; x < w; x++) this.colX[x] = (x / w) * 5.2 + t * 0.35;
    for (let y = 0; y < h; y++) this.rowShift[y] = Math.sin((y / h) * 3.1 + t * 0.22) * 2.2;

    for (let y = 0; y < h; y++) {
      const ny = y / h;
      const rowFade = 1 - ny * 0.35;
      const by = (y & 7) << 3;
      const dy = y - p.y;
      const cosRow = 0.5 + 0.5 * Math.cos(ny * 4.2 - t * 0.27);
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const th = B8[by + (x & 7)]!;
        const dx = x - p.x;
        const g = p.a > 0.01 ? Math.exp(-(dx * dx + dy * dy) / R2) * p.a : 0;

        const s = shape[i]!;
        if (s > 0.02) {
          // Intro: mỗi cell xuất hiện theo ngưỡng ngẫu nhiên → hiệu ứng "lắp ghép pixel".
          const born = clamp((intro * 1.6 - rnd[i]! * 0.6) / 0.4, 0, 1);
          const wave = 0.5 + 0.5 * Math.sin(x * 0.11 + y * 0.07 - t * 1.6);
          const v = s * born * (o.shapeLevel + (1 - o.shapeLevel) * wave) + g * 0.55;
          if (v > th) {
            buf[i] = shapeC;
            continue;
          }
        }
        if (o.fieldLevel > 0) {
          const f = (0.5 + 0.5 * Math.sin(this.colX[x]! + this.rowShift[y]!)) * cosRow;
          const fv = f * f * o.fieldLevel * rowFade * intro + g * 0.42;
          if (fv > th) {
            buf[i] = g > 0.22 ? glowC : fieldC;
            continue;
          }
        } else if (g * 0.35 > th) {
          buf[i] = glowC;
          continue;
        }
        buf[i] = 0;
      }
    }
    this.ctx.putImageData(this.data, 0, 0);
  }
}

/** Khởi tạo mọi canvas có [data-dither="hero" | "wordmark"]. */
export function initDitherCanvases() {
  for (const canvas of document.querySelectorAll<HTMLCanvasElement>('canvas[data-dither]')) {
    const kind = canvas.dataset.dither;
    const src = canvas.dataset.src;
    if (!src) continue;

    if (kind === 'hero') {
      new DitherCanvas(canvas, {
        src,
        cell: 4,
        place: (w, h, aspect, cssWidth) => {
          const desktop = cssWidth >= 1024;
          const size = desktop ? Math.min(h * 0.78, w * 0.4) : Math.min(w * 0.85, h * 0.55);
          const cx = desktop ? w * 0.76 : w * 0.62;
          const cy = desktop ? h * 0.46 : h * 0.3;
          return { x: cx - (size * aspect) / 2, y: cy - size / 2, w: size * aspect, h: size };
        },
        shapeLevel: 0.8,
        fieldLevel: 0.34,
        glowRadius: 30,
      }).start();
    } else if (kind === 'wordmark') {
      new DitherCanvas(canvas, {
        src,
        cell: 3,
        place: (w, h, aspect) => {
          const width = w * 0.96;
          const height = width / aspect;
          return { x: (w - width) / 2, y: h - height - h * 0.04, w: width, h: height };
        },
        shapeLevel: 0.42,
        fieldLevel: 0,
        glowRadius: 40,
        intro: 2000,
        glowColor: [90, 16, 18],
      }).start();
    }
  }
}

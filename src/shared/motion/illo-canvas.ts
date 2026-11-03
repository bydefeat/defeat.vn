/**
 * Renderer canvas cho minh hoạ nét chấm (cơ chế giống các template Framer kiểu "Jet"):
 *  - SVG gốc (đã render sẵn trong HTML, dùng làm fallback khi không có JS) được raster hoá thành 2 lớp:
 *    nét vẽ (lines) và vệt hạt (dots), ở độ phân giải thấp rồi phóng to bằng image-rendering: pixelated
 *    → nét chấm thành hạt pixel sắc nét.
 *  - Lớp nền halftone: chấm toả tia từ tâm, chỉ hiện khi rê chuột.
 *  - Rê chuột vào vùng [data-illo-hover]: nét + hạt chuyển dần sang màu nhấn (--acc), hạt lấp lánh,
 *    halftone hiện lên. Rời chuột: trở về màu mực.
 *  - Chỉ chạy requestAnimationFrame khi đang chuyển đổi/đang rê chuột; đứng yên thì không tốn CPU.
 *  - Đổi theme sáng/tối → vẽ lại với màu mới.
 */
const SCALE = 1.5; // 1 pixel canvas = 1.5px CSS → hạt pixel to, sắc (giống phong cách Jet)
const HALF = 0.62; // tỉ lệ độ phân giải lớp halftone

type RGB = [number, number, number];

function parseColor(css: string, probe: HTMLElement): RGB {
  probe.style.color = css;
  const m = getComputedStyle(probe).color.match(/[\d.]+/g) ?? ['0', '0', '0'];
  // oklab/oklch có thể trả về dạng khác → dựa vào canvas để chuẩn hoá
  if (!/^rgb/.test(getComputedStyle(probe).color)) {
    const c = document.createElement('canvas').getContext('2d')!;
    c.fillStyle = getComputedStyle(probe).color;
    c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0]!, d[1]!, d[2]!];
  }
  return [Number(m[0]), Number(m[1]), Number(m[2])];
}

async function rasterize(svg: SVGSVGElement, keep: 'lines' | 'dots', w: number, h: number): Promise<Float32Array> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.querySelector(keep === 'lines' ? '.illo-dots' : '.illo-lines')?.remove();
  clone.setAttribute('width', String(w));
  clone.setAttribute('height', String(h));
  clone.setAttribute('color', '#ffffff');
  if (keep === 'lines') {
    // Nét liền mảnh ~1px ở độ phân giải canvas; kết cấu chấm được tạo ở bước vẽ (xen kẽ pixel).
    const lines = clone.querySelector<SVGGElement>('.illo-lines');
    const scale = w / svg.viewBox.baseVal.width;
    lines?.setAttribute('stroke-dasharray', 'none');
    lines?.setAttribute('stroke-width', String(1.05 / scale));
  }
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = '.f{fill:#000}.n{fill:none}';
  clone.prepend(style);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data;
    const out = new Float32Array(w * h);
    for (let i = 0; i < out.length; i++) out[i] = (d[i * 4]! / 255) * (d[i * 4 + 3]! / 255);
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

class IlloCanvas {
  private lines!: Float32Array;
  private dots!: Float32Array;
  private phase!: Float32Array;
  private w = 0;
  private h = 0;
  private hw = 0;
  private hh = 0;
  private main = document.createElement('canvas');
  private halo = document.createElement('canvas');
  private mctx = this.main.getContext('2d')!;
  private hctx = this.halo.getContext('2d')!;
  private mimg!: ImageData;
  private himg!: ImageData;
  private t = 0; // tiến độ hover 0..1
  private target = 0;
  private raf = 0;
  private last = 0;
  private ink: RGB = [220, 220, 220];
  private acc: RGB = [46, 230, 197];
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private host: HTMLElement, private svg: SVGSVGElement) {}

  async init() {
    const vb = this.svg.viewBox.baseVal;
    const cssW = Math.max(160, this.host.getBoundingClientRect().width || 400);
    this.w = Math.round(cssW / SCALE);
    this.h = Math.round((this.w * vb.height) / vb.width);
    this.hw = Math.round(this.w * HALF);
    this.hh = Math.round(this.h * HALF);
    [this.lines, this.dots] = await Promise.all([
      rasterize(this.svg, 'lines', this.w, this.h),
      rasterize(this.svg, 'dots', this.w, this.h),
    ]);
    this.phase = Float32Array.from({ length: this.w * this.h }, () => Math.random() * Math.PI * 2);

    for (const [cv, w, h, cls] of [
      [this.halo, this.hw, this.hh, 'illo-halo'],
      [this.main, this.w, this.h, 'illo-main'],
    ] as const) {
      cv.width = w;
      cv.height = h;
      cv.className = cls;
      cv.setAttribute('aria-hidden', 'true');
      this.host.append(cv);
    }
    this.mimg = this.mctx.createImageData(this.w, this.h);
    this.himg = this.hctx.createImageData(this.hw, this.hh);
    this.readColors();
    this.host.classList.add('is-canvas');
    this.draw(0);

    const trigger = this.host.closest<HTMLElement>('[data-illo-hover]') ?? this.host;
    trigger.addEventListener('pointerenter', () => this.setTarget(1));
    trigger.addEventListener('pointerleave', () => this.setTarget(0));
    trigger.addEventListener('focusin', () => this.setTarget(1));
    trigger.addEventListener('focusout', () => this.setTarget(0));
    new MutationObserver(() => {
      this.readColors();
      this.draw(performance.now());
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  private readColors() {
    const cs = getComputedStyle(this.host);
    const probe = document.createElement('span');
    probe.style.display = 'none';
    this.host.append(probe);
    this.ink = parseColor(cs.getPropertyValue('--illo-ink').trim() || cs.color, probe);
    this.acc = parseColor(cs.getPropertyValue('--acc').trim() || '#2ee6c5', probe);
    probe.remove();
  }

  private setTarget(v: number) {
    this.target = v;
    if (this.reduced) {
      this.t = v;
      this.draw(performance.now());
      return;
    }
    if (!this.raf) this.loop();
  }

  private loop = () => {
    this.raf = requestAnimationFrame((now) => {
      const dt = Math.min(64, now - (this.last || now));
      this.last = now;
      this.t += (this.target - this.t) * Math.min(1, dt / 140);
      if (Math.abs(this.target - this.t) < 0.002) this.t = this.target;
      this.draw(now);
      if (this.t !== this.target || this.target === 1) this.loop();
      else {
        this.raf = 0;
        this.last = 0;
      }
    });
  };

  private draw(now: number) {
    const { w, h, t, ink, acc, lines, dots, phase } = this;
    const time = now / 1000;
    const r = ink[0] + (acc[0] - ink[0]) * t;
    const g = ink[1] + (acc[1] - ink[1]) * t;
    const b = ink[2] + (acc[2] - ink[2]) * t;
    const px = this.mimg.data;
    for (let i = 0, n = w * h; i < n; i++) {
      const x = i % w;
      const y = (i / w) | 0;
      const d = dots[i]!;
      // Kết cấu nét: pixel xen kẽ đậm/nhạt → đường "chấm pixel" như bản in
      const l = lines[i]! * (((x + y) & 1) === 0 ? 1 : 0.38);
      let a = l * (0.62 + 0.38 * t);
      if (d > 0.02) {
        // hạt: lấp lánh khi rê chuột
        const tw = 0.55 + 0.45 * Math.sin(time * 3.2 + phase[i]!);
        a = Math.max(a, Math.min(1, d * 1.6) * (0.55 * (1 - t) + tw * t));
      }
      const o = i * 4;
      px[o] = r;
      px[o + 1] = g;
      px[o + 2] = b;
      px[o + 3] = a > 0.08 ? Math.min(255, a * 255) : 0;
    }
    this.mctx.putImageData(this.mimg, 0, 0);

    // Lớp halftone toả tia (chỉ khi đang hover)
    const hp = this.himg.data;
    if (t > 0.01) {
      const { hw, hh } = this;
      const cx = hw * 0.5, cy = hh * 0.42, rot = time * 0.08;
      for (let y = 0; y < hh; y++) {
        for (let x = 0; x < hw; x++) {
          const o = (y * hw + x) * 4;
          if ((x & 1) || (y & 1)) { hp[o + 3] = 0; continue; }
          const dx = (x - cx) / hw, dy = (y - cy) / hh;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ang = Math.atan2(dy, dx);
          const ray = 0.5 + 0.5 * Math.cos(ang * 9 + rot);
          const v = ray * Math.max(0, 1 - dist * 1.6) * t;
          const on = v > BAYER4[((y >> 1) & 3) * 4 + ((x >> 1) & 3)]! * 0.9;
          hp[o] = acc[0]; hp[o + 1] = acc[1]; hp[o + 2] = acc[2];
          hp[o + 3] = on ? 46 : 0;
        }
      }
    } else hp.fill(0);
    this.hctx.putImageData(this.himg, 0, 0);
  }
}

export function initIlloCanvases() {
  for (const host of document.querySelectorAll<HTMLElement>('[data-illo-canvas]')) {
    const svg = host.querySelector<SVGSVGElement>('svg');
    if (!svg) continue;
    new IlloCanvas(host, svg).init().catch(() => {
      /* lỗi raster → giữ SVG fallback */
    });
  }
}

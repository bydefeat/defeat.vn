/**
 * Lõi vẽ ASCII art (dùng chung cho Web Worker và luồng chính).
 * Trường ký tự ` .:-=+*#%@` theo sóng nhiễu trôi chậm + logo mờ + vùng "nở" màu nhấn quanh con trỏ.
 * Ký tự vẽ sẵn vào glyph atlas (2 màu) rồi sao chép bằng drawImage.
 */
export const RAMP = ' .:-=+*#%@';
export const CELL_W = 10;
export const CELL_H = 17;

type Ctx = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
type AtlasCanvas = OffscreenCanvas | HTMLCanvasElement;

export class AsciiCore {
  cols = 0;
  rows = 0;
  dpr = 1;
  ink = '#666';
  hot = '#e11';
  logo: Float32Array | null = null;
  mx = -1e4;
  my = -1e4;
  ma = 0;
  mta = 0;
  private atlas: AtlasCanvas | null = null;

  constructor(private canvas: AtlasCanvas, private ctx: Ctx, private makeCanvas: (w: number, h: number) => AtlasCanvas) {}

  resize(w: number, h: number, dpr: number) {
    this.dpr = dpr;
    this.cols = Math.ceil(w / CELL_W);
    this.rows = Math.ceil(h / CELL_H);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.buildAtlas();
  }

  setColors(ink: string, hot: string) {
    this.ink = ink;
    this.hot = hot;
    this.buildAtlas();
  }

  private buildAtlas() {
    const a = this.makeCanvas(Math.round(CELL_W * RAMP.length * this.dpr), Math.round(CELL_H * 2 * this.dpr));
    const c = a.getContext('2d') as Ctx;
    c.scale(this.dpr, this.dpr);
    c.font = `500 ${CELL_H - 4}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    c.textBaseline = 'top';
    [this.ink, this.hot].forEach((color, row) => {
      c.fillStyle = color;
      for (let i = 1; i < RAMP.length; i++) c.fillText(RAMP[i]!, i * CELL_W, row * CELL_H);
    });
    this.atlas = a;
  }

  draw(now: number) {
    const { ctx, atlas, cols, rows, dpr } = this;
    if (!atlas) return;
    const t = now / 1000;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ma += (this.mta - this.ma) * 0.15;
    const ma = this.ma;
    const cw = CELL_W * dpr, chh = CELL_H * dpr;
    const n = RAMP.length;
    for (let y = 0; y < rows; y++) {
      const ny = y / rows;
      const rowWave = Math.cos(ny * 7 - t * 0.4);
      const py = y * CELL_H;
      const dy = (py - this.my) / 90;
      for (let x = 0; x < cols; x++) {
        const nx = x / cols;
        let v = 0.5 + 0.25 * Math.sin(nx * 9 + t * 0.6) * rowWave + 0.25 * Math.sin((nx + ny) * 12 - t * 0.9);
        const edge = Math.min(1, Math.abs(nx - 0.5) * 2.4); // nhạt ở giữa để chữ CTA dễ đọc
        v *= 0.25 + 0.75 * edge;
        if (this.logo) v = Math.max(v, this.logo[y * cols + x]! * 0.5);
        const px = x * CELL_W;
        let g = 0;
        if (ma > 0.01) {
          const dx = (px - this.mx) / 90;
          g = ma * Math.exp(-(dx * dx + dy * dy));
        }
        const idx = Math.floor(Math.min(0.999, v * 0.75 + g * 0.9) * n);
        if (idx === 0) continue;
        ctx.drawImage(atlas, idx * cw, g > 0.25 ? chh : 0, cw, chh, px * dpr, py * dpr, cw, chh);
      }
    }
  }
}

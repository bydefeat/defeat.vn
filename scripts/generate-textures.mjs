/**
 * Sinh texture dither (Bayer 8x8, ordered dithering) cho hệ thống giao diện.
 * Chạy lại khi cần đổi kích thước / mật độ:  node scripts/generate-textures.mjs
 *
 * Output (public/textures):
 *  - dither-{6,13,25,38,50,63,75,88}.png: tile 16x16, pixel trắng trên nền trong suốt — dùng làm mask tô màu bất kỳ.
 *  - fade.png                : dải chuyển dither theo chiều dọc (đặc ở trên → trong suốt ở dưới), lặp ngang.
 *  - wipe-y.png              : mask quét dọc cho hiệu ứng chuyển trang.
 *  - wipe-x.png              : mask quét ngang cho hiệu ứng hiện chữ.
 * Output (public/brand):
 *  - defeat_logo_dither.png  : logo dither tĩnh (fallback khi không có JS cho canvas hero).
 *  - defeat-text_dither.png  : wordmark dither tĩnh (fallback cho canvas footer).
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = new URL('../public/textures/', import.meta.url);
const BRAND = new URL('../public/brand/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const B8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];
const th = (x, y) => (B8[y & 7][x & 7] + 0.5) / 64;

/** Tạo PNG RGBA từ hàm (x, y) => [r,g,b,a] ở độ phân giải "cell", rồi phóng to nearest-neighbor. */
async function png(file, cw, ch, scale, fn) {
  const buf = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++)
    for (let x = 0; x < cw; x++) buf.set(fn(x, y), (y * cw + x) * 4);
  await sharp(buf, { raw: { width: cw, height: ch, channels: 4 } })
    .resize(cw * scale, ch * scale, { kernel: 'nearest' })
    .png({ compressionLevel: 9, palette: true })
    .toFile(new URL(file, file.startsWith('defeat') ? BRAND : OUT).pathname);
  console.log('✓', file, `${cw * scale}x${ch * scale}`);
}

const ON = [255, 255, 255, 255];
const OFF = [0, 0, 0, 0];

// 1) Tile mật độ cố định.
for (const d of [6, 13, 25, 38, 50, 63, 75, 88]) {
  await png(`dither-${d}.png`, 8, 8, 2, (x, y) => (d / 100 > th(x, y) ? ON : OFF));
}

// 2) Dải fade dọc: 32 cell, mỗi cell 4px → 32x128.
await png('fade.png', 8, 32, 4, (x, y) => (1 - y / 31 > th(x, y) ? ON : OFF));

// 3) Mask quét dọc cho View Transition: 400 cell đặc + 64 cell ramp + 400 cell trống (cell 4px).
{
  const solid = 400, ramp = 64;
  await png('wipe-y.png', 8, solid * 2 + ramp, 4, (x, y) => {
    if (y < solid) return ON;
    if (y >= solid + ramp) return OFF;
    return 1 - (y - solid) / ramp > th(x, y) ? ON : OFF;
  });
}

// 4) Mask quét ngang cho hiệu ứng hiện chữ: 500 đặc + 48 ramp + 500 trống (cell 3px).
{
  const solid = 500, ramp = 48;
  await png('wipe-x.png', solid * 2 + ramp, 8, 3, (x, y) => {
    if (x < solid) return ON;
    if (x >= solid + ramp) return OFF;
    return 1 - (x - solid) / ramp > th(x, y) ? ON : OFF;
  });
}

// 5) Fallback dither tĩnh cho logo & wordmark.
async function ditherImage(src, file, cells, scale, color, intensity = 0.9) {
  const { data, info } = await sharp(new URL(src, BRAND).pathname)
    .resize({ width: cells, fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  await png(file, info.width, info.height, scale, (x, y) => {
    const a = data[(y * info.width + x) * 4 + 3] / 255;
    return a * intensity > th(x, y) ? [...color, 255] : OFF;
  });
}
await ditherImage('defeat_logo.png', 'defeat_logo_dither.png', 190, 4, [232, 32, 36]);
await ditherImage('defeat-text.png', 'defeat-text_dither.png', 300, 4, [232, 32, 36], 0.75);

// 6) Nhúng texture vào CSS dạng data URI → không phải tải ảnh, mask không bao giờ "trống" trong lúc chờ (tránh nháy).
{
  const { readFileSync, writeFileSync } = await import('node:fs');
  const names = ['dither-6', 'dither-13', 'dither-25', 'dither-38', 'dither-50', 'dither-63', 'dither-75', 'dither-88', 'fade', 'wipe-y', 'wipe-x'];
  const vars = names.map((n) => {
    const b64 = readFileSync(new URL(`${n}.png`, OUT)).toString('base64');
    return `  --tex-${n}: url("data:image/png;base64,${b64}");`;
  });
  writeFileSync(
    new URL('../src/styles/textures.css', import.meta.url),
    `/* Tự sinh bởi scripts/generate-textures.mjs — KHÔNG sửa tay. */\n:root {\n${vars.join('\n')}\n}\n`,
  );
  console.log('✓ src/styles/textures.css');
}

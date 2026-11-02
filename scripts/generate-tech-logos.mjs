/**
 * Sinh logo công nghệ dạng DITHER SVG từ các SVG đơn sắc (nguồn: https://thesvg.org, thư mục scripts/assets/tech).
 * Chạy:  node scripts/generate-tech-logos.mjs
 *
 * Mỗi logo được raster hoá thành lưới N×N, đổ bóng chéo rồi ordered-dither (Bayer 8x8).
 * Pixel được chia vào 4 lớp theo ngưỡng Bayer → CSS có thể "dựng" logo theo từng mức dither (hiệu ứng build-up).
 * Output: src/modules/home/data/tech-logos.ts
 *
 * Logo là thương hiệu của chủ sở hữu tương ứng; chỉ dùng để nêu công nghệ DEFEAT sử dụng.
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const N = 40; // số cell mỗi cạnh
const PAD = 3; // lề (cell)
const LAYERS = 4;

const TECH = [
  { slug: 'typescript', name: 'TypeScript', color: '#3178C6' },
  { slug: 'react', name: 'React', color: '#61DAFB' },
  { slug: 'nextdotjs', name: 'Next.js', color: '#FFFFFF' },
  { slug: 'astro', name: 'Astro', color: '#FF5D01' },
  { slug: 'nodedotjs', name: 'Node.js', color: '#5FA04E' },
  { slug: 'nestjs', name: 'NestJS', color: '#E0234E' },
  { slug: 'flutter', name: 'Flutter', color: '#42A5F5' },
  { slug: 'postgresql', name: 'PostgreSQL', color: '#4169E1' },
  { slug: 'mongodb', name: 'MongoDB', color: '#47A248' },
  { slug: 'redis', name: 'Redis', color: '#FF4438' },
  { slug: 'docker', name: 'Docker', color: '#2496ED' },
  { slug: 'kubernetes', name: 'Kubernetes', color: '#326CE5' },
  { slug: 'aws', name: 'AWS', color: '#FF9900' },
  { slug: 'cloudflare', name: 'Cloudflare', color: '#F38020' },
  { slug: 'tailwind-css', name: 'Tailwind CSS', color: '#06B6D4' },
  { slug: 'figma', name: 'Figma', color: '#F24E1E' },
];

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

async function ditherLogo(slug) {
  const svg = readFileSync(new URL(`./assets/tech/${slug}.svg`, import.meta.url), 'utf8').replace(/currentColor/g, '#000');
  const inner = N - PAD * 2;
  const { data, info } = await sharp(Buffer.from(svg), { density: 600 })
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const layers = Array.from({ length: LAYERS }, () => []);
  for (let y = 0; y < info.height; y++) {
    let run = null; // [x0, layer]
    const flush = (xEnd) => {
      if (run) layers[run[1]].push(`M${run[0]} ${y}h${xEnd - run[0]}v1h${run[0] - xEnd}z`);
      run = null;
    };
    for (let x = 0; x < info.width; x++) {
      const a = data[(y * info.width + x) * 4 + 3] / 255;
      // Đổ bóng chéo: góc trên-trái đặc, góc dưới-phải thưa dần.
      const shade = 0.58 + 0.42 * (1 - (x + y) / (2 * N));
      const t = th(x, y);
      const on = a * shade > t;
      const layer = Math.min(LAYERS - 1, Math.floor(t * LAYERS));
      if (on && run && run[1] === layer) continue;
      flush(x);
      if (on) run = [x, layer];
    }
    flush(info.width);
  }
  return layers.map((l) => l.join(''));
}

const out = [];
for (const t of TECH) {
  out.push({ ...t, layers: await ditherLogo(t.slug) });
  console.log('✓', t.name);
}

const file = new URL('../src/modules/home/data/tech-logos.ts', import.meta.url);
writeFileSync(
  file,
  `/* Tự sinh bởi scripts/generate-tech-logos.mjs — KHÔNG sửa tay. Nguồn SVG: https://thesvg.org */\n` +
    `export interface TechLogo { slug: string; name: string; color: string; layers: string[] }\n` +
    `export const TECH_GRID = ${N};\n` +
    `export const TECH_LOGOS: TechLogo[] = ${JSON.stringify(out, null, 1)};\n`,
);
console.log('→', file.pathname);

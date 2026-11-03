/**
 * Sinh dữ liệu logo công nghệ (SVG đơn sắc, nguồn https://thesvg.org) cho dải logo trang chủ.
 * Chạy: node scripts/generate-tech-logos.mjs   →   src/modules/home/data/tech-logos.ts
 * Logo hiển thị màu xám, rê chuột chuyển sang màu thương hiệu (fill="currentColor").
 * Logo là thương hiệu của chủ sở hữu tương ứng; chỉ dùng để nêu công nghệ DEFEAT sử dụng.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const TECH = [
  { slug: 'typescript', name: 'TypeScript', color: '#3178C6' },
  { slug: 'react', name: 'React', color: '#149ECA' },
  { slug: 'nextdotjs', name: 'Next.js', color: '#000000' },
  { slug: 'astro', name: 'Astro', color: '#FF5D01' },
  { slug: 'nodedotjs', name: 'Node.js', color: '#5FA04E' },
  { slug: 'nestjs', name: 'NestJS', color: '#E0234E' },
  { slug: 'flutter', name: 'Flutter', color: '#02569B' },
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

const out = TECH.map((t) => {
  const svg = readFileSync(new URL(`./assets/tech/${t.slug}.svg`, import.meta.url), 'utf8');
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 24 24';
  const fillRule = /fill-rule="evenodd"/.test(svg.match(/<svg[^>]*>/)[0]) ? 'evenodd' : undefined;
  const body = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(/fill="(?!none)[^"]*"/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return { ...t, viewBox, fillRule, body };
});

writeFileSync(
  new URL('../src/modules/home/data/tech-logos.ts', import.meta.url),
  `/* Tự sinh bởi scripts/generate-tech-logos.mjs — KHÔNG sửa tay. Nguồn SVG: https://thesvg.org */\n` +
    `export interface TechLogo { slug: string; name: string; color: string; viewBox: string; fillRule?: 'evenodd'; body: string }\n` +
    `export const TECH_LOGOS: TechLogo[] = ${JSON.stringify(out, null, 1)};\n`,
);
console.log('✓', out.length, 'logos');

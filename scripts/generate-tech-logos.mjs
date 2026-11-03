/**
 * Sinh dữ liệu logo công nghệ (SVG đơn sắc, nguồn https://thesvg.org) cho dải logo trang chủ.
 * Chạy: node scripts/generate-tech-logos.mjs   →   src/modules/home/data/tech-logos.ts
 * Logo hiển thị màu xám, rê chuột chuyển sang màu thương hiệu (fill="currentColor").
 * Logo là thương hiệu của chủ sở hữu tương ứng; chỉ dùng để nêu công nghệ DEFEAT sử dụng.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const TECH = [
  // Ngôn ngữ & runtime web
  { slug: 'typescript', name: 'TypeScript', color: '#3178C6' },
  { slug: 'react', name: 'React', color: '#149ECA' },
  { slug: 'nextdotjs', name: 'Next.js', color: '#000000' },
  { slug: 'astro', name: 'Astro', color: '#FF5D01' },
  { slug: 'nodedotjs', name: 'Node.js', color: '#5FA04E' },
  { slug: 'bun', name: 'Bun', color: '#C9A27A' },
  { slug: 'nestjs', name: 'NestJS', color: '#E0234E' },
  // Ngôn ngữ hệ thống & backend
  { slug: 'go', name: 'Go', color: '#00ADD8' },
  { slug: 'rust', name: 'Rust', color: '#CE422B' },
  { slug: 'c', name: 'C', color: '#659AD2' },
  { slug: 'cplusplus', name: 'C++', color: '#00599C' },
  { slug: 'csharp', name: 'C#', color: '#9B4F96' },
  { slug: 'dotnet', name: '.NET', color: '#512BD4' },
  { slug: 'blazor', name: 'Blazor', color: '#7B3FE4' },
  { slug: 'python', name: 'Python', color: '#3776AB' },
  { slug: 'java', name: 'Java', color: '#E76F00' },
  { slug: 'spring-boot', name: 'Spring Boot', color: '#6DB33F' },
  // Mobile
  { slug: 'flutter', name: 'Flutter', color: '#02569B' },
  // Dữ liệu
  { slug: 'postgresql', name: 'PostgreSQL', color: '#4169E1' },
  { slug: 'mysql', name: 'MySQL', color: '#4479A1' },
  { slug: 'mongodb', name: 'MongoDB', color: '#47A248' },
  { slug: 'redis', name: 'Redis', color: '#FF4438' },
  // Hạ tầng
  { slug: 'docker', name: 'Docker', color: '#2496ED' },
  { slug: 'kubernetes', name: 'Kubernetes', color: '#326CE5' },
  { slug: 'aws', name: 'AWS', color: '#FF9900' },
  { slug: 'cloudflare', name: 'Cloudflare', color: '#F38020' },
  // Giao diện & thiết kế
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
    // Phần tô trắng (chữ/biểu tượng khoét trên nền màu, vd. C#) → "lỗ khoét" tô bằng màu nền
    .replace(/fill="(?:#fff|#ffffff|white)"/gi, 'class="tech-cut"')
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

export interface TechLogo { slug: string; name: string; dark: boolean }

export const TECH_LOGOS: TechLogo[] = [
  { slug: 'typescript', name: 'TypeScript', dark: false },
  { slug: 'react', name: 'React', dark: true },
  { slug: 'nextdotjs', name: 'Next.js', dark: false },
  { slug: 'astro', name: 'Astro', dark: true },
  { slug: 'nodedotjs', name: 'Node.js', dark: false },
  { slug: 'bun', name: 'Bun', dark: false },
  { slug: 'nestjs', name: 'NestJS', dark: false },
  { slug: 'go', name: 'Go', dark: false },
  { slug: 'rust', name: 'Rust', dark: true },
  { slug: 'c', name: 'C', dark: false },
  { slug: 'cplusplus', name: 'C++', dark: false },
  { slug: 'csharp', name: 'C#', dark: false },
  { slug: 'dotnet', name: '.NET', dark: false },
  { slug: 'blazor', name: 'Blazor', dark: false },
  { slug: 'python', name: 'Python', dark: false },
  { slug: 'java', name: 'Java', dark: false },
  { slug: 'spring-boot', name: 'Spring Boot', dark: false },
  { slug: 'flutter', name: 'Flutter', dark: false },
  { slug: 'postgresql', name: 'PostgreSQL', dark: false },
  { slug: 'mysql', name: 'MySQL', dark: true },
  { slug: 'mongodb', name: 'MongoDB', dark: true },
  { slug: 'redis', name: 'Redis', dark: false },
  { slug: 'docker', name: 'Docker', dark: false },
  { slug: 'kubernetes', name: 'Kubernetes', dark: false },
  { slug: 'aws', name: 'AWS', dark: true },
  { slug: 'cloudflare', name: 'Cloudflare', dark: false },
  { slug: 'tailwind-css', name: 'Tailwind CSS', dark: false },
  { slug: 'figma', name: 'Figma', dark: false },
];

const MORE_LOGOS: TechLogo[] = [
  { slug: 'drizzle', name: 'Drizzle ORM', dark: false },
  { slug: 'valkey', name: 'Valkey', dark: false },
  { slug: 'better-auth', name: 'Better Auth', dark: true },
  { slug: 'ant-design', name: 'Ant Design', dark: false },
  { slug: 'model-context-protocol', name: 'MCP', dark: true },
];

const BY_NAME = new Map([...TECH_LOGOS, ...MORE_LOGOS].map((logo) => [logo.name.toLowerCase(), logo]));

export const techLogo = (name: string): TechLogo | undefined => BY_NAME.get(name.replace(/\s+[\d.]+$/, '').toLowerCase());

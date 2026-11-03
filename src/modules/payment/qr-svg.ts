import { encode, QrCodeDataType } from 'uqr';
import mbLogo from './logos/mb.png?inline';

interface Logo { href: string; ratio: number }

const BANK_LOGOS: Record<string, Logo> = {
  '970422': { href: mbLogo, ratio: 150 / 360 },
};

export function vietQrSvg(payload: string, bin?: string): string {
  const { size: n, data, types } = encode(payload, { ecc: 'H', border: 0 });
  const q = 2;
  const full = n + q * 2;
  const logo = bin ? BANK_LOGOS[bin] : undefined;

  const lw = logo ? Math.round(n * 0.36) : 0;
  const lh = logo ? lw * logo.ratio : 0;
  const hole = { x0: (n - lw) / 2 - 0.8, x1: (n + lw) / 2 + 0.8, y0: (n - lh) / 2 - 0.8, y1: (n + lh) / 2 + 0.8 };
  const inHole = (x: number, y: number) => !!logo && x + 1 > hole.x0 && x < hole.x1 && y + 1 > hole.y0 && y < hole.y1;

  const r = 0.45;
  let dots = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!data[y]![x] || inHole(x, y) || types[y]![x] === QrCodeDataType.Position) continue;
      const cx = x + q + 0.5, cy = y + q + 0.5;
      dots += `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
    }
  }

  const eyes = [[0, 0], [n - 7, 0], [0, n - 7]]
    .map(([x, y]) => `<rect x="${x! + q + 0.5}" y="${y! + q + 0.5}" width="6" height="6" rx="1.6" fill="none" stroke="#000"/><rect x="${x! + q + 2}" y="${y! + q + 2}" width="3" height="3" rx="0.9"/>`)
    .join('');

  const logoTag = logo
    ? `<image href="${logo.href}" x="${q + (n - lw) / 2}" y="${q + (n - lh) / 2}" width="${lw}" height="${lh}" preserveAspectRatio="xMidYMid meet"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${full} ${full}"><rect width="${full}" height="${full}" fill="#fff"/><path d="${dots}"/>${eyes}${logoTag}</svg>`;
}

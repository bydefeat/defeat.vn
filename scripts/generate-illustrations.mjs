/**
 * Sinh minh hoạ isometric nét chấm — tranh gốc của DEFEAT.
 * Chạy: node scripts/generate-illustrations.mjs  →  src/assets/illustrations/*.svg
 *
 * Bộ máy 3D tối giản nhưng đúng hình học:
 *  - Phép chiếu isometric trực giao: X = (x − y)·cos30°, Y = (x + y)·sin30° − z. Hướng nhìn V = (1,1,1).
 *  - Loại bỏ mặt khuất (back-face culling): chỉ vẽ mặt có pháp tuyến hướng về người xem (n·V > 0).
 *  - Sắp thứ tự theo VẬT THỂ (xa → gần), trong vật thể theo độ sâu mặt; mặt tô màu nền để che nét phía sau.
 *  - Chi tiết (decal) gắn vào đúng mặt của khối, vẽ ngay sau mặt đó → không đè lên vật ở phía trước.
 *  - Hình cầu: viền ngoài là đường tròn chuẩn; vĩ/kinh tuyến chỉ vẽ phần nửa trước.
 *  - Hình trụ: thân + nắp, đường viền bên tính đúng điểm tiếp tuyến.
 * Kết xuất: <g class="illo-dots"> (vệt hạt, phía sau) + <g class="illo-lines"> (path class f = có tô nền, n = chỉ nét).
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = new URL('../src/assets/illustrations/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const C = Math.cos(Math.PI / 6);
const S = 0.5;
const P = ([x, y, z]) => [(x - y) * C, (x + y) * S - z];
const SPH = Math.sqrt(1.5); // hệ số phóng của phép chiếu (bán kính viền cầu trên màn hình)
const V = [1, 1, 1];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const depth = (p) => p[0] + p[1] + p[2];
const f1 = (n) => Math.round(n * 10) / 10;
const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];

function normal(pts) {
  // Newell
  let n = [0, 0, 0];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    n = add(n, [(a[1] - b[1]) * (a[2] + b[2]), (a[2] - b[2]) * (a[0] + b[0]), (a[0] - b[0]) * (a[1] + b[1])]);
  }
  return n;
}
const centroid = (pts) => mul(pts.reduce(add, [0, 0, 0]), 1 / pts.length);
const ring = (c, U, W, r, n = 48, a0 = 0, a1 = Math.PI * 2) =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return add(c, add(mul(U, r * Math.cos(a)), mul(W, r * Math.sin(a)))); });

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

/** Mặt phẳng gắn chi tiết: origin + u·U + v·W (toạ độ cục bộ). */
class Surface {
  constructor(obj, origin, U, W, key) { Object.assign(this, { obj, origin, U, W, key }); }
  at(u, v) { return add(this.origin, add(mul(this.U, u), mul(this.W, v))); }
  line(pts, closed = false) { this.obj.item(pts.map(([u, v]) => this.at(u, v)), { fill: false, closed, key: this.key + 0.001 }); return this; }
  rect(u0, v0, u1, v1, fill = false) { this.obj.item([[u0, v0], [u1, v0], [u1, v1], [u0, v1]].map(([u, v]) => this.at(u, v)), { fill, closed: true, key: this.key + 0.001 }); return this; }
  circle(cu, cv, r, fill = false) { this.obj.item(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return this.at(cu + r * Math.cos(a), cv + r * Math.sin(a)); }), { fill, closed: true, key: this.key + 0.001 }); return this; }
  grid(u0, v0, u1, v1, n, m) {
    for (let i = 0; i <= n; i++) this.line([[u0 + ((u1 - u0) * i) / n, v0], [u0 + ((u1 - u0) * i) / n, v1]]);
    for (let j = 0; j <= m; j++) this.line([[u0, v0 + ((v1 - v0) * j) / m], [u1, v0 + ((v1 - v0) * j) / m]]);
    return this;
  }
  /** Lưới phím/ô: n×m ô vuông nhỏ có khe. */
  keys(u0, v0, u1, v1, n, m, gap = 1.5) {
    const du = (u1 - u0) / n, dv = (v1 - v0) / m;
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) this.rect(u0 + i * du + gap / 2, v0 + j * dv + gap / 2, u0 + (i + 1) * du - gap / 2, v0 + (j + 1) * dv - gap / 2);
    return this;
  }
}

class Obj {
  constructor(scene, key) { this.scene = scene; this.key = key; this.items = []; }
  item(pts, { fill = true, closed = true, key } = {}) { this.items.push({ pts, fill, closed, key: key ?? depth(centroid(pts)) }); return this; }
  /** Mặt đa giác 3D có cull. Trả về Surface nếu mặt nhìn thấy (để gắn chi tiết). */
  face(pts, U, W, origin, center) {
    if (center && dot(normal(pts), sub(centroid(pts), center)) < 0) pts = [...pts].reverse(); // pháp tuyến hướng ra ngoài
    if (dot(normal(pts), V) <= 1e-6) return null;
    const k = depth(centroid(pts));
    this.item(pts, { key: k });
    return new Surface(this, origin ?? pts[0], U, W, k);
  }
  /** Hộp: trả về { top, front (+y), side (+x) } các mặt để gắn chi tiết. */
  box(x, y, z, w, d, h) {
    const p = (a, b, c) => [x + a * w, y + b * d, z + c * h];
    const ctr = p(0.5, 0.5, 0.5);
    const front = this.face([p(0, 1, 0), p(1, 1, 0), p(1, 1, 1), p(0, 1, 1)], X, Z, p(0, 1, 0), ctr);
    const side = this.face([p(1, 1, 0), p(1, 0, 0), p(1, 0, 1), p(1, 1, 1)], mul(Y, -1), Z, p(1, 1, 0), ctr);
    const top = this.face([p(0, 0, 1), p(0, 1, 1), p(1, 1, 1), p(1, 0, 1)], X, Y, p(0, 0, 1), ctr);
    return { front, side, top };
  }
  /** Lăng trụ: đa giác 2D trong mặt (U,W) tại origin, đùn theo N một đoạn d. Trả về mặt trước (phía +N). */
  prism(poly, origin, U, W, N, d) {
    const back = poly.map(([u, v]) => add(origin, add(mul(U, u), mul(W, v))));
    const frontPts = back.map((q) => add(q, mul(N, d)));
    const c = centroid([...back, ...frontPts]);
    const orient = (pts) => (dot(normal(pts), sub(centroid(pts), c)) < 0 ? [...pts].reverse() : pts);
    for (let i = 0; i < back.length; i++) {
      const j = (i + 1) % back.length;
      this.face(orient([back[i], back[j], frontPts[j], frontPts[i]]), U, W);
    }
    this.face(orient(back), U, W, back[0]);
    return this.face(orient(frontPts), U, W, add(origin, mul(N, d)));
  }
  /** Trụ đứng (trục z) tâm đáy (cx,cy,z), bán kính r, cao h. Trả về Surface nắp trên. */
  cylinder(cx, cy, z, r, h, bands = []) {
    const a0 = -Math.PI / 4, a1 = (3 * Math.PI) / 4; // điểm tiếp tuyến viền bên (hướng ±(1,−1))
    const front = (zz) => ring([cx, cy, zz], X, Y, r, 32, a0, a1);
    const body = [...front(z), ...front(z + h).reverse()];
    const k = depth([cx, cy, z + h / 2]);
    this.item(body, { key: k });
    for (const t of bands) this.item(front(z + t), { fill: false, closed: false, key: k + 0.0006 });
    this.item(ring([cx, cy, z + h], X, Y, r, 48).slice(0, 48), { key: k + 0.001 });
    return new Surface(this, [cx, cy, z + h], X, Y, k + 0.001);
  }
  /** Cầu tâm c bán kính r: viền tròn chuẩn + vĩ tuyến/kinh tuyến (chỉ nửa trước). */
  sphere(c, r, { lats = [-0.5, 0, 0.5], meridians = 3 } = {}) {
    const [sx, sy] = P(c);
    const R = r * SPH;
    const k = depth(c);
    this.items.push({ pts2: Array.from({ length: 64 }, (_, i) => { const a = (i / 64) * Math.PI * 2; return [sx + R * Math.cos(a), sy + R * Math.sin(a)]; }), fill: true, closed: true, key: k });
    const frontOnly = (pts) => {
      const segs = []; let cur = [];
      for (const q of pts) { if (dot(sub(q, c), V) > 0) cur.push(q); else if (cur.length) { segs.push(cur); cur = []; } }
      if (cur.length) segs.push(cur);
      return segs.filter((s) => s.length > 1);
    };
    for (const t of lats) {
      const zz = r * t, rr = Math.sqrt(r * r - zz * zz);
      for (const seg of frontOnly(ring(add(c, [0, 0, zz]), X, Y, rr, 96))) this.item(seg, { fill: false, closed: false, key: k + 0.001 });
    }
    for (let i = 0; i < meridians; i++) {
      const a = (i / meridians) * Math.PI;
      const U = [Math.cos(a), Math.sin(a), 0];
      for (const seg of frontOnly(ring(c, U, Z, r, 96))) this.item(seg, { fill: false, closed: false, key: k + 0.001 });
    }
    return this;
  }
}

class Scene {
  constructor() { this.objs = []; this.dots = []; this.top = []; }
  obj(anchor) { const o = new Obj(this, depth(anchor)); this.objs.push(o); return o; }
  ground() { const o = new Obj(this, -1e9); this.objs.push(o); return o; }
  /** Lấp lánh 4 cánh (toạ độ 3D), vẽ trên cùng. */
  sparkle(p3, r = 10) {
    const [cx, cy] = P(p3), k = r * 0.2;
    this.top.push({ pts2: [[cx, cy - r], [cx + k, cy - k], [cx + r, cy], [cx + k, cy + k], [cx, cy + r], [cx - k, cy + k], [cx - r, cy], [cx - k, cy - k]], fill: true, closed: true });
    return this;
  }
  rays(p3, r0, r1, n = 6, a0 = 0) {
    const [cx, cy] = P(p3);
    for (let i = 0; i < n; i++) { const a = a0 + (i / n) * Math.PI * 2; this.top.push({ pts2: [[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], fill: false, closed: false }); }
    return this;
  }
  /** Vệt hạt mịn dọc đường thẳng (màn hình) — lớp sau cùng. */
  streak(x1, y1, x2, y2, width, count, seed) {
    const r = rng(seed), dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    for (let i = 0; i < count; i++) {
      const t = r(), g = (r() + r() + r() - 1.5) / 1.5; // phân bố dày ở giữa vệt
      this.dots.push([x1 + dx * t + nx * g * width * (0.25 + t * 0.75), y1 + dy * t + ny * g * width * (0.25 + t * 0.75), 0.3 + r() * 0.35]);
    }
    return this;
  }
  svg() {
    const items = [];
    for (const o of [...this.objs].sort((a, b) => a.key - b.key)) for (const it of [...o.items].sort((a, b) => a.key - b.key)) items.push(it);
    items.push(...this.top);
    const pts2 = (it) => it.pts2 ?? it.pts.map(P);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const it of items) for (const [x, y] of pts2(it)) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
    const padX = (maxX - minX) * 0.12, padY = (maxY - minY) * 0.12;
    const vb = [f1(minX - padX), f1(minY - padY), f1(maxX - minX + padX * 2), f1(maxY - minY + padY * 2)];
    const paths = items.map((it) => `<path d="M${pts2(it).map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}${it.closed ? 'Z' : ''}" class="${it.fill ? 'f' : 'n'}"/>`);
    const dots = this.dots
      .filter(([x, y]) => x > vb[0] && y > vb[1] && x < vb[0] + vb[2] && y < vb[1] + vb[3])
      .map(([x, y, r]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}"/>`);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" fill="none" class="illo">` +
      `<g class="illo-dots" fill="currentColor">${dots.join('')}</g>` +
      `<g class="illo-lines" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0 2.8">${paths.join('')}</g>` +
      `</svg>\n`;
  }
}

/** Vệt hạt theo hướng chéo (trái-dưới → phải-trên) quanh một tâm màn hình. */
function streaks(s, cx, cy, seed, spread = 1) {
  s.streak(cx - 260 * spread, cy + 40, cx - 40, cy - 70, 26, 900, seed);
  s.streak(cx + 60, cy + 60, cx + 290 * spread, cy - 70, 22, 700, seed + 1);
}

const out = {};

/* 1. Laptop mở với trình soạn code — Phần mềm theo yêu cầu */
{
  const s = new Scene();
  const o = s.obj([70, 50, 0]);
  const base = o.box(0, 0, 0, 140, 96, 7);
  base.top.rect(8, 10, 132, 62).keys(10, 12, 130, 60, 12, 4, 2).rect(48, 70, 92, 88);
  base.front?.line([[60, 3.5], [80, 3.5]]);
  const scr = s.obj([70, -2, 50]);
  const lid = scr.box(0, -6, 7, 140, 6, 92);
  lid.front.rect(6, 6, 134, 86).rect(10, 76, 130, 82);
  for (const u of [14, 20, 26]) lid.front.circle(u, 79, 1.4);
  const code = [[14, 66, 40], [22, 58, 70], [22, 50, 56], [30, 42, 82], [30, 34, 64], [22, 26, 48], [14, 18, 30]];
  code.forEach(([u, v, l]) => lid.front.line([[u, v], [u + l * 0.55, v]]).line([[u + l * 0.55 + 4, v], [u + l, v]]));
  lid.front.line([[104, 60], [96, 50], [104, 40]]).line([[118, 60], [126, 50], [118, 40]]).line([[114, 62], [108, 38]]);
  s.sparkle([-10, -10, 120], 12).sparkle([160, 10, 120], 9).sparkle([150, -40, 60], 7);
  s.rays([118, -6, 58], 30, 40, 7, 0.2);
  streaks(s, 0, 20, 11);
  out['custom-software'] = s;
}

/* 2. Khiên có ổ khoá trên bệ trụ — Bảo mật */
{
  const s = new Scene();
  const ped = s.obj([60, 60, 0]);
  ped.cylinder(60, 60, 0, 58, 14, [5]).circle(0, 0, 46);
  const ped2 = s.obj([60, 60, 14]);
  ped2.cylinder(60, 60, 14, 44, 8);
  const sh = s.obj([60, 66, 70]);
  const shield = [[0, 0], [80, 0], [80, 52], [62, 86], [40, 100], [18, 86], [0, 52]].map(([u, v]) => [u - 40, 122 - v]);
  const front = sh.prism(shield, [60, 58, 0], X, Z, Y, 12);
  if (front) {
    front.line(shield.map(([u, v]) => [u * 0.82, 22 + (v - 22) * 0.84]), true);
    front.rect(-14, 34, 14, 58);
    front.line([[-9, 58], [-9, 68], [-5, 74], [5, 74], [9, 68], [9, 58]]);
    front.circle(0, 48, 3).line([[0, 45], [0, 40]]);
  }
  s.sparkle([-20, 40, 140], 11).sparkle([140, 30, 150], 13).sparkle([130, 120, 60], 7);
  s.rays([60, 64, 70], 72, 84, 10, 0.15);
  streaks(s, 0, 10, 21);
  out['security'] = s;
}

/* 3. Tủ máy chủ + cơ sở dữ liệu trên sàn lưới — Vận hành ổn định */
{
  const s = new Scene();
  const g = s.ground();
  const fl = g.box(-30, -20, -6, 200, 150, 6);
  fl.top.grid(10, 10, 190, 140, 8, 6);
  const rack = s.obj([40, 40, 70]);
  const r = rack.box(0, 0, 0, 80, 70, 150);
  for (let i = 0; i < 5; i++) {
    const v0 = 8 + i * 28;
    r.front.rect(6, v0, 74, v0 + 22).rect(10, v0 + 4, 30, v0 + 18);
    for (let k = 0; k < 5; k++) r.front.line([[36 + k * 7, v0 + 6], [36 + k * 7, v0 + 16]]);
    r.front.circle(68, v0 + 11, 1.6);
  }
  r.side.line([[10, 20], [60, 20]]).line([[10, 130], [60, 130]]);
  r.top.grid(10, 10, 70, 60, 6, 5);
  const db = s.obj([130, 95, 30]);
  db.cylinder(130, 95, 0, 30, 70, [18, 36, 54]).circle(0, 0, 18);
  s.sparkle([150, 20, 150], 12).sparkle([-30, 80, 120], 8).sparkle([170, 140, 90], 7);
  streaks(s, 10, 0, 31);
  out['infrastructure'] = s;
}

/* 4. Biểu đồ cột tăng trưởng với mũi tên đi lên + đồng xu — Tối ưu chi phí */
{
  const s = new Scene();
  const g = s.ground();
  const pl = g.box(0, 0, 0, 190, 110, 8);
  pl.top.grid(8, 8, 182, 102, 10, 6);
  pl.front.line([[10, 4], [180, 4]]);
  [36, 62, 90, 128].forEach((h, i) => {
    const o = s.obj([32 + i * 40, 54, h / 2]);
    const b = o.box(18 + i * 40, 40, 8, 28, 28, h);
    for (let k = 12; k < h - 6; k += 14) b.front.line([[4, k], [24, k]]);
    b.side.line([[4, h - 8], [24, h - 8]]);
  });
  const ar = s.obj([140, 90, 170]);
  const arrow = [[0, 0], [118, 0], [118, -12], [150, 12], [118, 36], [118, 24], [0, 24]];
  ar.prism(arrow, [14, 84, 40], [0.74, 0, 0.67], [-0.67, 0, 0.74], Y, 10)?.line([[10, 12], [108, 12]]);
  const coin = s.obj([-20, 100, 10]);
  coin.cylinder(-20, 100, 0, 16, 20, [7, 14]).circle(0, 0, 10);
  s.sparkle([200, 30, 170], 13).sparkle([150, 0, 190], 8).sparkle([-30, 30, 100], 8);
  s.rays([128, 90, 154], 18, 28, 7);
  streaks(s, 0, 0, 41);
  out['growth'] = s;
}

/* 5. Hai cửa sổ trình duyệt + con trỏ — Website & Web App */
{
  const s = new Scene();
  const g = s.ground();
  g.box(-10, 0, 0, 200, 140, 6).top.grid(10, 100, 70, 136, 4, 2);
  const win = (x, y, k) => {
    const o = s.obj([x + 60, y, 60 + k]);
    const f = o.box(x, y, 6, 120, 6, 100).front;
    f.rect(4, 84, 116, 96);
    for (const u of [9, 14, 19]) f.circle(u, 90, 1.3);
    f.rect(28, 87, 104, 93);
    f.rect(8, 50, 60, 80);
    f.line([[12, 54], [26, 68], [34, 60], [44, 72], [56, 54]]).circle(48, 74, 3);
    for (const v of [76, 68, 60]) f.line([[66, v], [112, v]]);
    f.rect(66, 50, 92, 56);
    [8, 44, 80].forEach((u) => f.rect(u, 12, u + 32, 42).line([[u + 4, 18], [u + 28, 18]]).line([[u + 4, 24], [u + 22, 24]]));
  };
  win(0, 40, 0);
  win(50, 100, 1);
  const cur = s.obj([150, 125, 30]);
  const arrow = [[0, 0], [0, 34], [9, 26], [16, 40], [22, 37], [15, 23], [27, 23]].map(([u, v]) => [u, 40 - v]);
  cur.prism(arrow, [150, 120, 8], X, Z, Y, 5);
  s.sparkle([200, 60, 130], 12).sparkle([-30, 60, 110], 9).sparkle([140, 20, 140], 7);
  streaks(s, 10, 10, 51);
  out['web'] = s;
}

/* 6. Điện thoại + bong bóng chat + chuông thông báo — Ứng dụng di động */
{
  const s = new Scene();
  const g = s.ground();
  g.box(0, 0, 0, 150, 120, 6).top.grid(90, 10, 140, 60, 4, 4);
  const ph = s.obj([40, 70, 70]);
  const p = ph.box(10, 60, 6, 70, 10, 140);
  const f = p.front;
  f.rect(5, 6, 65, 134);
  f.rect(25, 128, 45, 131);
  f.line([[9, 122], [20, 122]]).line([[50, 122], [61, 122]]);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const u = 12 + c * 17, v = 96 - r * 18; f.rect(u, v, u + 12, v + 12); }
  f.rect(10, 12, 60, 24);
  for (const u of [16, 29, 42, 55]) f.circle(u, 18, 2.6);
  p.side.line([[2, 100], [2, 112]]);
  const ch = s.obj([110, 90, 110]);
  const bubble = [[0, 0], [56, 0], [56, 30], [20, 30], [10, 40], [12, 30], [0, 30]];
  ch.prism(bubble, [95, 85, 100], X, Z, Y, 8)?.line([[8, 21], [46, 21]]).line([[8, 13], [36, 13]]);
  const bell = s.obj([125, 40, 18]);
  bell.cylinder(125, 40, 6, 12, 22, [8, 15]).circle(0, 0, 6);
  s.sparkle([0, 20, 160], 11).sparkle([170, 40, 150], 13).sparkle([150, 130, 50], 7);
  s.rays([45, 70, 76], 92, 102, 12, 0.1);
  streaks(s, 0, 0, 61);
  out['mobile'] = s;
}

/* 7. Màn hình quản trị trên chân đế + biểu đồ tròn — Phần mềm quản lý */
{
  const s = new Scene();
  const g = s.ground();
  g.box(0, 20, 0, 190, 110, 6);
  const st = s.obj([70, 80, 10]);
  st.box(45, 70, 6, 50, 30, 5);
  st.box(64, 82, 11, 12, 6, 28);
  const m = s.obj([70, 76, 90]);
  const f = m.box(0, 70, 39, 140, 8, 100).front;
  f.rect(4, 4, 136, 96);
  f.rect(8, 8, 30, 92);
  for (let i = 0; i < 6; i++) f.line([[12, 82 - i * 10], [26, 82 - i * 10]]);
  [34, 68, 102].forEach((u) => f.rect(u, 72, u + 30, 92).line([[u + 4, 86], [u + 16, 86]]).line([[u + 4, 78], [u + 24, 78]]));
  f.rect(34, 30, 92, 68).line([[38, 36], [48, 48], [58, 42], [68, 56], [78, 50], [88, 62]]);
  [96, 104, 112, 120, 128].forEach((u, i) => f.rect(u, 30, u + 5, 36 + i * 6));
  f.rect(34, 8, 132, 26);
  for (let i = 0; i < 3; i++) f.line([[38, 22 - i * 6], [128, 22 - i * 6]]);
  const pie = s.obj([165, 110, 11]);
  pie.cylinder(165, 110, 6, 24, 10).line([[0, 0], [24, 0]]).line([[0, 0], [-12, 20.8]]).line([[0, 0], [-6, -23.2]]);
  s.sparkle([180, 40, 150], 13).sparkle([-30, 70, 140], 9).sparkle([210, 110, 70], 7);
  s.rays([70, 74, 89], 98, 108, 14, 0.1);
  streaks(s, 0, 10, 71);
  out['dashboard'] = s;
}

/* 8. Địa cầu + vệ tinh trên quỹ đạo nghiêng, đặt trên bệ — Cloud & DevOps */
{
  const s = new Scene();
  const ped = s.obj([60, 60, 0]);
  ped.cylinder(60, 60, 0, 52, 12, [5]).circle(0, 0, 40);
  const neck = s.obj([60, 60, 12]);
  neck.cylinder(60, 60, 12, 14, 18);
  const c = [60, 60, 80];
  const globe = s.obj(c);
  globe.sphere(c, 50, { lats: [-0.6, -0.3, 0, 0.3, 0.6], meridians: 4 });
  // Quỹ đạo: phần sau cầu vẽ trước cầu (bị che), phần trước vẽ sau cầu.
  const orbit = ring(c, [0.7071, -0.7071, 0], [0.5, 0.5, 0.7071], 78, 120);
  const back = s.obj(sub(c, [40, 40, 40]));
  const fr = s.obj(add(c, [40, 40, 40]));
  let segB = [], segF = [];
  for (const q of orbit) {
    if (dot(sub(q, c), V) > 0) { if (segB.length > 1) back.item(segB, { fill: false, closed: false }); segB = []; segF.push(q); }
    else { if (segF.length > 1) fr.item(segF, { fill: false, closed: false }); segF = []; segB.push(q); }
  }
  if (segB.length > 1) back.item(segB, { fill: false, closed: false });
  if (segF.length > 1) fr.item(segF, { fill: false, closed: false });
  const satPos = orbit[100];
  const sat = s.obj(add(satPos, [50, 50, 50]));
  const [sx, sy, sz] = satPos;
  sat.box(sx - 6, sy - 6, sz - 6, 12, 12, 12).front?.circle(6, 6, 3);
  sat.box(sx + 6, sy - 3, sz - 1, 26, 6, 2).top?.grid(0, 0, 26, 6, 4, 1);
  sat.box(sx - 32, sy - 3, sz - 1, 26, 6, 2).top?.grid(0, 0, 26, 6, 4, 1);
  s.sparkle([-10, 0, 170], 12).sparkle([150, 30, 170], 9).sparkle([140, 140, 40], 7);
  s.rays(satPos, 18, 26, 5, 0.6);
  streaks(s, 0, 0, 81);
  out['cloud'] = s;
}

for (const [name, scene] of Object.entries(out)) {
  writeFileSync(new URL(`${name}.svg`, OUT), scene.svg());
  console.log('✓', name);
}

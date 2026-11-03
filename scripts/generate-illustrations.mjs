/**
 * Sinh minh hoạ isometric nét chấm (dotted line-art) — tranh gốc của DEFEAT.
 * Chạy: node scripts/generate-illustrations.mjs  →  src/assets/illustrations/*.svg
 *
 * - Hình khối 3D đơn giản (hộp, trụ, đường gấp khúc trên mặt phẳng) chiếu isometric.
 * - Vẽ theo thứ tự xa → gần; mặt khối tô bằng màu nền (class "f") để che nét phía sau.
 * - Nét vẽ là chuỗi chấm tròn (stroke-dasharray 0 + linecap round), màu currentColor → tự đổi theo theme.
 * - Thêm các "vệt hạt" (speed streaks) bằng chấm ngẫu nhiên có seed cố định.
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = new URL('../src/assets/illustrations/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const C = Math.cos(Math.PI / 6);
const S = 0.5;
const P = ([x, y, z]) => [(x - y) * C, (x + y) * S - z];
const f = (n) => Math.round(n * 10) / 10;

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

class Scene {
  constructor() { this.items = []; }
  /** poly3: danh sách điểm 3D; closed: đóng; fill: tô màu nền; key: độ sâu để sắp xếp */
  add(poly3, { closed = true, fill = true, key, cls = '' } = {}) {
    const k = key ?? poly3.reduce((a, [x, y, z]) => a + x + y + z * 0.9, 0) / poly3.length;
    this.items.push({ pts: poly3.map(P), closed, fill, key: k, cls });
    return this;
  }
  /** Hộp: 3 mặt nhìn thấy (trên, phải +x, trái +y). */
  box(x, y, z, w, d, h, opt = {}) {
    const k = opt.key ?? x + w / 2 + y + d / 2 + z;
    this.add([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], { key: k, cls: opt.cls });
    this.add([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], { key: k + 0.01, cls: opt.cls });
    this.add([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], { key: k + 0.02, cls: opt.cls });
    return this;
  }
  /** Đế (luôn nằm sau mọi vật). */
  base(x, y, z, w, d, h) { return this.box(x, y, z, w, d, h, { key: -1000 }); }
  /** Đường tròn trong mặt phẳng (U,V) quanh tâm c. */
  circle(c, U, V, r, opt = {}) {
    const N = 48;
    const pts = Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2; return [0, 1, 2].map((k) => c[k] + r * Math.cos(a) * U[k] + r * Math.sin(a) * V[k]); });
    return this.add(pts, { closed: true, fill: opt.fill ?? false, key: opt.key ?? 1e6 });
  }

  /** Trụ đứng: thân + mặt trên. */
  cyl(cx, cy, z, r, h, opt = {}) {
    const N = 40;
    const ring = (zz) => Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2; return [cx + r * Math.cos(a), cy + r * Math.sin(a), zz]; });
    const k = opt.key ?? cx + cy + z;
    // thân: nửa trước của vòng dưới + nửa trước vòng trên (đảo chiều)
    const front = (zz) => Array.from({ length: N / 2 + 1 }, (_, i) => { const a = -Math.PI / 4 + (i / (N / 2)) * Math.PI; return [cx + r * Math.cos(a), cy + r * Math.sin(a), zz]; });
    this.add([...front(z), ...front(z + h).reverse()], { key: k });
    this.add(ring(z + h), { key: k + 0.01 });
    return this;
  }
  /** Đường gấp khúc trên một mặt phẳng: origin + u*U + v*V. */
  plane(origin, U, V, pts2, opt = {}) {
    const pts = pts2.map(([u, v]) => [origin[0] + u * U[0] + v * V[0], origin[1] + u * U[1] + v * V[1], origin[2] + u * U[2] + v * V[2]]);
    return this.add(pts, { closed: opt.closed ?? false, fill: opt.fill ?? false, key: opt.key ?? 1e6, cls: opt.cls });
  }
  rect(origin, U, V, u0, v0, u1, v1, opt = {}) {
    return this.plane(origin, U, V, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], { closed: true, ...opt });
  }
  /** Hình 2D trên màn hình (toạ độ đã chiếu), vẽ trên cùng. */
  add2d(pts, { closed = true, fill = true, key = 1e7 } = {}) {
    this.items.push({ pts, closed, fill, key, cls: '' });
    return this;
  }
  /** Tia lấp lánh 4 cánh tại điểm 3D. */
  sparkle(p3, r = 10, opt = {}) {
    const [cx, cy] = P(p3);
    const k = r * 0.22;
    return this.add2d([[cx, cy - r], [cx + k, cy - k], [cx + r, cy], [cx + k, cy + k], [cx, cy + r], [cx - k, cy + k], [cx - r, cy], [cx - k, cy - k]], opt);
  }
  /** Lưới ô trên mặt phẳng ngang z, từ (x,y) kích thước w×d, n×m ô. */
  grid(x, y, z, w, d, n, m, key = 1e6) {
    for (let i = 0; i <= n; i++) this.add([[x + (w * i) / n, y, z], [x + (w * i) / n, y + d, z]], { closed: false, fill: false, key });
    for (let j = 0; j <= m; j++) this.add([[x, y + (d * j) / m, z], [x + w, y + (d * j) / m, z]], { closed: false, fill: false, key });
    return this;
  }
  /** Các tia ngắn toả ra quanh một điểm 3D (hiệu ứng "phát sáng"). */
  rays(p3, r0, r1, n = 6, a0 = 0) {
    const [cx, cy] = P(p3);
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * Math.PI * 2;
      this.add2d([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], { closed: false, fill: false });
    }
    return this;
  }

  /** Vệt hạt: dải chấm ngẫu nhiên dọc một đường (toạ độ màn hình). */
  streak(x1, y1, x2, y2, width, count, seed) {
    const r = rng(seed);
    // kéo dài vệt ra hai phía cho giống vệt sáng xuyên khung
    const ex = (x2 - x1) * 0.35, ey = (y2 - y1) * 0.35;
    x1 -= ex; y1 -= ey; x2 += ex; y2 += ey;
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    this.dots = this.dots ?? [];
    for (let i = 0; i < Math.round(count * 3.2); i++) {
      const t = r(); const spread = (r() - 0.5) * width * (0.3 + t);
      this.dots.push([x1 + dx * t + nx * spread, y1 + dy * t + ny * spread, 0.32 + r() * 0.3]);
    }
    return this;
  }
  svg() {
    const items = [...this.items].sort((a, b) => a.key - b.key);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const it of items) for (const [x, y] of it.pts) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
    const pad = 10;
    const vb = [f(minX - pad), f(minY - pad), f(maxX - minX + pad * 2), f(maxY - minY + pad * 2)];
    const paths = items.map((it) => {
      const d = 'M' + it.pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + (it.closed ? 'Z' : '');
      return `<path d="${d}" class="${it.fill ? 'f' : 'n'}${it.cls ? ' ' + it.cls : ''}"/>`;
    });
    const dots = (this.dots ?? [])
      .filter(([x, y]) => x > vb[0] && y > vb[1] && x < vb[0] + vb[2] && y < vb[1] + vb[3])
      .map(([x, y, r]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" fill="none" class="illo">` +
      (dots.length ? `<g class="illo-dots" fill="currentColor">${dots.join('')}</g>` : '') +
      `<g class="illo-lines" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0 2.8">${paths.join('')}</g>` +
      `</svg>\n`;
  }
}

const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
const out = {};

/* 1. Cửa sổ ứng dụng với dấu ngoặc code và con trỏ — "Phần mềm theo yêu cầu" */
{
  const s = new Scene();
  s.base(20, 40, 0, 120, 110, 8); // đế
  s.box(30, 70, 10, 100, 8, 90); // tấm màn hình đứng
  const o = [30, 78, 10];
  s.rect(o, X, Z, 6, 70, 94, 84, {}); // thanh tiêu đề
  for (const u of [12, 20, 28]) s.plane(o, X, Z, [[u, 77], [u + 2, 77]]);
  s.plane(o, X, Z, [[28, 50], [16, 38], [28, 26]]); // <
  s.plane(o, X, Z, [[72, 50], [84, 38], [72, 26]]); // >
  s.plane(o, X, Z, [[56, 54], [44, 22]]); // /
  s.plane([110, 100, 10], X, Y, [[0, 0], [0, 30], [8, 22], [14, 34], [19, 31], [13, 20], [24, 20]], { closed: true, fill: true, key: 400 }); // con trỏ
  s.streak(-160, 40, 60, -60, 50, 260, 1).streak(150, 120, 330, 30, 40, 200, 2);
  s.grid(10, 10, 10, 60, 60, 4, 4, -500);
  s.sparkle([140, 40, 120], 13).sparkle([150, 60, 70], 8).sparkle([10, 60, 120], 9);
  s.rays([128, 70, 105], 14, 24, 5, -0.3);
  out['custom-software'] = s;
}

/* 2. Khiên trên bệ — "Bảo mật & ổn định" */
{
  const s = new Scene();
  s.base(0, 0, 0, 130, 130, 26);
  s.box(15, 15, 26, 100, 100, 12, { key: -900 });
  const sh = (t) => [[0, 0], [70, 0], [70, 45], [35, 80 - 0], [0, 45]].map(([u, v]) => [u, 95 - v]);
  s.plane([30, 70, 38], X, Z, sh(), { closed: true, fill: true, key: 300 });
  s.plane([30, 64, 38], X, Z, sh(), { closed: true, fill: true, key: 301 });
  s.plane([30, 64, 38], X, Z, [[20, 52], [32, 40], [52, 64]], { key: 302 }); // dấu tick
  s.streak(-140, -10, 40, -110, 40, 220, 3).streak(120, 60, 300, -40, 46, 230, 4);
  s.grid(20, 20, 38, 90, 90, 6, 6, -800);
  s.sparkle([110, 60, 150], 12).sparkle([20, 110, 120], 8);
  s.rays([65, 64, 110], 70, 82, 8, 0.2);
  out['security'] = s;
}

/* 3. Chồng máy chủ — "Hạ tầng & vận hành" */
{
  const s = new Scene();
  for (let i = 0; i < 3; i++) {
    const z = i * 34;
    s.box(0, 0, z, 110, 80, 28, { key: z });
    const o = [0, 80, z];
    for (let k = 0; k < 4; k++) s.plane(o, X, Z, [[12 + k * 8, 14], [12 + k * 8, 14]]);
    s.plane(o, X, Z, [[50, 9], [96, 9]]);
    s.plane(o, X, Z, [[50, 19], [96, 19]]);
  }
  s.plane([55, 40, 102], Z, X, [[0, 0], [30, 0]], { key: 500 }); // ăng-ten
  s.streak(-120, 10, 80, -100, 44, 220, 5).streak(80, 110, 260, 30, 36, 180, 6);
  s.grid(-40, 90, 0, 60, 60, 4, 4, -2000);
  s.sparkle([130, 20, 120], 11).sparkle([-20, 60, 90], 8);
  for (let i = 0; i < 3; i++) s.rays([110, 40, 14 + i * 34], 4, 9, 4, 0.78);
  out['infrastructure'] = s;
}

/* 4. Biểu đồ cột đi lên — "Tối ưu chi phí, tăng hiệu quả" */
{
  const s = new Scene();
  s.base(5, 20, 0, 165, 90, 8);
  [30, 55, 80, 115].forEach((h, i) => s.box(18 + i * 38, 35, 8, 24, 24, h));
  s.plane([10, 30, 30], X, Z, [[0, 0], [45, 25], [85, 45], [150, 120]], { key: 400 });
  s.plane([10, 30, 30], X, Z, [[136, 122], [150, 120], [146, 106]], { key: 401 });
  s.streak(-150, 30, 30, -90, 46, 230, 7).streak(160, 80, 320, -20, 40, 200, 8);
  s.grid(10, 70, 8, 150, 30, 10, 2, -500);
  s.sparkle([168, 30, 150], 12).sparkle([120, 20, 170], 7);
  s.rays([160, 30, 150], 16, 26, 6);
  out['growth'] = s;
}

/* 5. Hai cửa sổ trình duyệt chồng nhau — "Website & Web App" */
{
  const s = new Scene();
  s.base(10, 30, 0, 170, 130, 8);
  const win = (x, y, k) => {
    s.box(x, y, 8, 120, 6, 96, { key: k });
    const o = [x, y + 6, 8];
    s.rect(o, X, Z, 6, 82, 114, 92, { key: k + 0.5 });
    s.rect(o, X, Z, 10, 46, 56, 74, { key: k + 0.5 });
    for (const v of [70, 62, 54]) s.plane(o, X, Z, [[64, v], [108, v]], { key: k + 0.5 });
    for (const v of [34, 24, 14]) s.plane(o, X, Z, [[10, v], [108, v]], { key: k + 0.5 });
  };
  win(20, 40, 100);
  win(50, 100, 200);
  s.streak(-170, 20, 20, -90, 44, 240, 9).streak(170, 120, 340, 10, 44, 220, 10);
  s.grid(10, 10, 8, 50, 50, 4, 4, -500);
  s.sparkle([180, 90, 130], 12).sparkle([10, 120, 90], 8).sparkle([150, 40, 130], 7);
  out['web'] = s;
}

/* 6. Điện thoại đứng với lưới ứng dụng — "Ứng dụng di động" */
{
  const s = new Scene();
  s.base(15, 30, 0, 95, 85, 8);
  s.box(30, 60, 8, 60, 10, 116, { key: 100 });
  const o = [30, 70, 8];
  s.rect(o, X, Z, 5, 8, 55, 108, { key: 200 });
  s.plane(o, X, Z, [[24, 104], [36, 104]], { key: 200 });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) s.rect(o, X, Z, 10 + c * 14, 78 - r * 16, 20 + c * 14, 88 - r * 16, { key: 201 });
  s.rect(o, X, Z, 10, 16, 48, 32, { key: 201 });
  s.streak(-130, 0, 40, -120, 42, 220, 11).streak(110, 90, 270, -10, 40, 200, 12);
  s.grid(70, 10, 8, 40, 40, 4, 4, -500);
  s.sparkle([95, 60, 140], 12).sparkle([20, 50, 110], 8);
  s.rays([60, 70, 130], 50, 60, 10, 0.1);
  out['mobile'] = s;
}

/* 7. Màn hình quản trị trên chân đế — "Phần mềm quản lý doanh nghiệp" */
{
  const s = new Scene();
  s.base(40, 50, 0, 60, 40, 6);
  s.box(64, 66, 6, 12, 8, 34, { key: 20 });
  s.box(0, 74, 40, 140, 10, 90, { key: 100 });
  const o = [0, 84, 40];
  s.rect(o, X, Z, 6, 6, 134, 84, { key: 200 });
  s.rect(o, X, Z, 12, 54, 40, 78, { key: 201 });
  s.rect(o, X, Z, 46, 54, 74, 78, { key: 201 });
  s.rect(o, X, Z, 80, 54, 128, 78, { key: 201 });
  s.plane(o, X, Z, [[12, 14], [34, 30], [56, 22], [80, 42], [104, 34], [128, 48]], { key: 202 });
  s.streak(-150, 40, 20, -80, 44, 230, 13).streak(140, 150, 310, 40, 40, 200, 14);
  s.sparkle([150, 70, 150], 12).sparkle([-10, 80, 140], 8);
  s.rays([70, 84, 85], 82, 92, 12, 0.15);
  out['dashboard'] = s;
}

/* 8. Quả địa cầu với quỹ đạo vệ tinh trên bệ — "Cloud & DevOps" */
{
  const s = new Scene();
  s.base(20, 20, 0, 100, 100, 8);
  s.box(45, 45, 8, 50, 50, 14, { key: -900 });
  const c = [70, 70, 92], R = 52;
  s.circle(c, [0.7071, -0.7071, 0], Z, R, { fill: true, key: 200 }); // viền cầu (mặt phẳng hướng về người xem)
  s.circle(c, X, Y, R, { key: 201 }); // xích đạo
  s.circle([c[0], c[1], c[2] + 30], X, Y, R * 0.8, { key: 201 });
  s.circle([c[0], c[1], c[2] - 30], X, Y, R * 0.8, { key: 201 });
  s.circle(c, [0.7071, 0.7071, 0], Z, R, { key: 201 }); // kinh tuyến
  s.circle(c, X, [0, 0.42, 0.9], R * 1.55, { key: 202 }); // quỹ đạo
  s.box(c[0] + R * 1.5, c[1] - 6, c[2] + 20, 12, 12, 10, { key: 203 }); // vệ tinh
  s.plane(c, X, Z, [[0, -R], [0, -R - 8]], { key: 199 });
  s.streak(-160, 0, 20, -120, 46, 240, 15).streak(150, 100, 320, -10, 42, 210, 16);
  s.grid(10, 10, 8, 40, 40, 4, 4, -500);
  s.sparkle([20, 120, 160], 10).sparkle([140, 30, 170], 13).sparkle([150, 100, 60], 7);
  out['cloud'] = s;
}

for (const [name, scene] of Object.entries(out)) {
  writeFileSync(new URL(`${name}.svg`, OUT), scene.svg());
  console.log('✓', name);
}

// ஆழி — course thumbnails as SVG strings.
// export renderThumb(course) → "<svg …>" (free: viewBox 0 0 400 300, paid: 0 0 640 280)
// Free = a paper-sheet collage poster (ref 2). Paid = a concert ticket (ref 3).
// Colours are inlined from css/tokens.css (SVG used as data can't read CSS vars).

const C = {
  chilli: '#e5470e', chilliDeep: '#c53a08', oxblood: '#2b0908', maroon: '#6e1a17',
  paper: '#ece7dc', paper2: '#e0d9ca', paper3: '#d3cbb8',
  ink: '#161311', ink2: '#3a3430', ink3: '#6b625a',
  lavender: '#b8b0ee', salmon: '#f2875f', violet: '#6a4be8', stamp: '#c42a1f',
  biro: '#1f3be0', sea: '#0f3d44',
};
const ACCENTS = ['chilli', 'lavender', 'salmon', 'violet', 'sea', 'stamp'];

const F = {
  display: "Anton, Impact, 'Arial Narrow', sans-serif",
  mono: "'JetBrains Mono', ui-monospace, Menlo, monospace",
  narrow: "'Archivo Narrow', 'Arial Narrow', sans-serif",
  tamil: "Catamaran, 'Noto Sans Tamil', 'Tamil Sangam MN', sans-serif",
  hand: "Caveat, 'Comic Sans MS', cursive",
  stencil: "'Stardos Stencil', Stencil, Anton, Impact, sans-serif",
};

const NO = { python: '01', git: '02', dsa: '03', sql: '04', docker: '05', prompt: '06', backend: '01', cloud: '02', ai: '03' };
const WORD = { python: 'Python', git: 'Git', dsa: 'DSA', sql: 'SQL', docker: 'Docker', prompt: 'Prompt', backend: 'Backend', cloud: 'Cloud', ai: 'AI Agents' };
const FREE_ACCENT = { python: 'lavender', git: 'salmon', dsa: 'lavender', sql: 'salmon', docker: 'lavender', prompt: 'salmon' };
const PAID_ACCENT = { backend: 'stamp', cloud: 'sea', ai: 'violet' };
const STAMP = { backend: 'SEATS FILLING', cloud: 'BATCH OPEN', ai: 'LIVE' };

// ---------- small utils ----------
let seq = 0;
const SALT = Math.random().toString(36).slice(2, 6);
const uid = () => `az${SALT}${(++seq).toString(36)}`;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const f1 = (v) => Math.round(v * 10) / 10;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

function hash(str) {
  let h = 2166136261;
  for (const ch of String(str)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const txt = (x, y, s, a = '') => `<text x="${f1(x)}" y="${f1(y)}" ${a}>${esc(s)}</text>`;
const mono = (size, fill = C.ink2, extra = '') => `font-family="${F.mono}" font-size="${size}" fill="${fill}" ${extra}`;
const hand = (size, fill = C.biro, extra = '') => `font-family="${F.hand}" font-size="${size}" font-weight="700" fill="${fill}" ${extra}`;
const clip = (s, n) => { s = String(s ?? ''); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };

// ---------- public ----------
export function renderThumb(course) {
  const c = course && typeof course === 'object' ? course : {};
  const id = String(c.id || '');
  const t = c.thumb && typeof c.thumb === 'object' ? c.thumb : {};
  const kind = c.kind === 'paid' || c.kind === 'free' ? c.kind : /^p-/.test(id) || c.price ? 'paid' : 'free';
  let motif = String(t.motif || id.replace(/^[fp]-/, '') || '').toLowerCase();
  if (kind === 'paid' && !PAID_PANEL[motif]) motif = 'backend';
  if (kind === 'free' && !FREE_MOTIFS[motif]) motif = 'sea';
  const accName = ACCENTS.includes(t.accent) ? t.accent : (kind === 'paid' ? PAID_ACCENT : FREE_ACCENT)[motif] || 'lavender';
  const ctx = {
    c, id: id || `${kind}-${motif}`, motif, kind,
    no: esc(c.no || NO[motif] || '00'),
    word: String(t.word || WORD[motif] || (c.title || 'Aazhi').split(/[:\s]/)[0]).toUpperCase(),
    accent: C[accName], accName,
    title: c.title || WORD[motif] || 'Aazhi course',
  };
  return kind === 'paid' ? paidThumb(ctx) : freeThumb(ctx);
}

// =====================================================================
// FREE — paper-sheet collage poster (400 × 300)
// =====================================================================

function fitWord(word, maxW, maxSize, k = 0.54, split = true) {
  const lines = split && word.length > 8 && word.includes(' ') ? [word.slice(0, word.indexOf(' ')), word.slice(word.indexOf(' ') + 1)] : [word];
  const longest = Math.max(...lines.map((l) => l.length), 1);
  const size = Math.min(maxSize, maxW / (longest * k));
  return { lines, size, w: (l) => l.length * size * 0.5 };
}

function wordBlock(ctx, L, u) {
  const fit = fitWord(ctx.word, L.maxW, L.size);
  const { lines } = fit;
  const size = lines.length > 1 ? Math.min(fit.size, L.size * 0.56) : fit.size;
  const w = (l) => l.length * size * 0.5;
  const lh = size * 0.88;
  const end = L.anchor === 'end';
  // top-anchored words grow downward so extra lines never hit the header
  const by = L.y < 170 ? Math.max(L.y, 58 + size * 0.8 + (lines.length - 1) * lh) : L.y;
  let out = '';
  // highlighter behind the last line + selection handles
  const last = lines[lines.length - 1];
  const hw = w(last) + 18;
  const hx = end ? L.x - hw + 8 : L.x - 9;
  const hy = by - size * 0.44;
  const hh = size * 0.52;
  out += `<g transform="rotate(${L.hl ?? -1.6} ${f1(hx + hw / 2)} ${f1(hy + hh / 2)})"><rect x="${f1(hx)}" y="${f1(hy)}" width="${f1(hw)}" height="${f1(hh)}" fill="${ctx.accent}" opacity=".88"/>`;
  out += `<path d="M${f1(hx)} ${f1(hy - 3)}v${f1(hh + 3)}M${f1(hx + hw)} ${f1(hy)}v${f1(hh + 3)}" stroke="${C.biro}" stroke-width="1.6"/><circle cx="${f1(hx)}" cy="${f1(hy - 5)}" r="3.6" fill="${C.biro}"/><circle cx="${f1(hx + hw)}" cy="${f1(hy + hh + 5)}" r="3.6" fill="${C.biro}"/></g>`;
  out += `<text font-family="${F.display}" font-size="${f1(size)}" fill="${C.ink}" letter-spacing="-.01em" ${end ? 'text-anchor="end"' : ''}>`;
  lines.forEach((l, i) => { out += `<tspan x="${f1(L.x)}" y="${f1(by - (lines.length - 1 - i) * lh)}">${esc(l)}</tspan>`; });
  return out + '</text>';
}

// decorations
const paperclip = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})" fill="none" stroke-linecap="round"><path d="M0 4V-50a9 9 0 0 1 18 0V12a13 13 0 0 1-26 0V-38" stroke="${C.ink3}" stroke-width="3.6"/><path d="M0 4V-50a9 9 0 0 1 18 0V12a13 13 0 0 1-26 0V-38" stroke="${C.paper}" stroke-width="1" opacity=".55" transform="translate(-.8 -.6)"/></g>`;
const tape = (x, y, a, fill = C.paper3) => `<path transform="translate(${x} ${y}) rotate(${a})" d="M-48-12l4 4-3 4 4 4-3 4 2 8H48l-3-5 3-4-4-4 3-4-3-7z" fill="${fill}" opacity=".78"/>`;

function sheet(u, L, ctx, inner) {
  const fold = L.deco.includes('fold');
  const front = fold ? 'M18 16H382V242L340 284H18Z' : 'M18 16H382V284H18Z';
  const s = hash(ctx.id) % 97;
  let o = `<defs>`;
  o += `<filter id="sh${u}" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="${C.oxblood}" flood-opacity=".38"/></filter>`;
  o += `<filter id="fb${u}" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".008 .55" numOctaves="2" seed="${s}" result="a"/><feColorMatrix in="a" values="0 0 0 0 .36 0 0 0 0 .26 0 0 0 0 .16 0 0 0 .34 -.05" result="b"/><feTurbulence type="fractalNoise" baseFrequency=".75" seed="${s + 3}" result="c"/><feColorMatrix in="c" values="0 0 0 0 .22 0 0 0 0 .16 0 0 0 0 .1 0 0 0 12 -8.3" result="d"/><feMerge><feMergeNode in="b"/><feMergeNode in="d"/></feMerge><feComposite in2="SourceAlpha" operator="in"/></filter>`;
  o += `</defs>`;
  // back sheet peeking out
  o += `<rect x="26" y="20" width="350" height="262" fill="${C.paper2}" transform="rotate(${L.back ?? 2.4} 200 150)" filter="url(#sh${u})"/>`;
  o += `<g transform="rotate(${L.tilt ?? -0.8} 200 150)">`;
  o += `<path d="${front}" fill="${C.paper}" filter="url(#sh${u})"/><path d="${front}" filter="url(#fb${u})"/>`;
  // header: number + section label
  o += txt(36, 46, ctx.no, mono(13, C.ink, 'font-weight="700" letter-spacing=".3em"'));
  o += `<path d="M68 42h22" stroke="${C.ink}" stroke-width="1.4"/>`;
  o += `<text x="364" y="46" text-anchor="end" ${mono(9.5, C.ink3, 'letter-spacing=".24em"')}><tspan font-family="${F.tamil}" font-size="12" font-weight="700" letter-spacing="0" fill="${C.ink}">கரை</tspan> · KARAI · FREE</text>`;
  o += inner;
  o += wordBlock(ctx, L.word, u);
  if (fold) o += `<path d="M382 242L340 284 348 248Z" fill="${C.ink}" opacity=".16"/><path d="M382 242L340 284 340 242Z" fill="${C.paper3}"/><path d="M382 242L340 284" stroke="${C.ink3}" stroke-width=".8" opacity=".6"/>`;
  o += `</g>`;
  if (L.deco.includes('clip')) o += paperclip(...(L.clipAt || [334, 40, 8]));
  if (L.deco.includes('tape')) (L.tapeAt || [[44, 24, -32]]).forEach((p) => { o += tape(...p); });
  return o;
}

// ---------- free motifs ----------
const FREE_MOTIFS = {
  python: {
    L: { word: { x: 36, y: 134, maxW: 300, size: 94 }, deco: ['clip'], clipAt: [170, 34, 4], tilt: -0.9 },
    draw(ctx, u) {
      const cx = 282, cy = 204, R = 46, A = 15, N = 96;
      const t0 = -Math.PI / 2 + 0.55, t1 = t0 + Math.PI * 2 - 0.8;
      const pts = [];
      for (let i = 0; i <= N; i++) {
        const t = t0 + ((t1 - t0) * i) / N, r = R + A * Math.cos(4 * t);
        pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
      }
      const seg = (a, b) => 'M' + pts.slice(a, b + 1).map((p) => `${f1(p[0])} ${f1(p[1])}`).join('L');
      let o = '';
      // kolam pulli (dots): inside each lobe, outside each waist, one in the centre
      o += `<g fill="${C.ink}">` + `<circle cx="${cx}" cy="${cy}" r="3.4"/>`;
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4, rr = k % 2 ? R + 4 : R - 2;
        o += `<circle cx="${f1(cx + rr * Math.cos(a))}" cy="${f1(cy + rr * Math.sin(a))}" r="3.2"/>`;
      }
      o += `</g>`;
      o += `<defs><path id="sn${u}" d="${seg(10, N)}"/></defs>`;
      o += `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${seg(0, 6)}" stroke="${C.sea}" stroke-width="3.6"/><path d="${seg(4, 13)}" stroke="${C.sea}" stroke-width="7"/>`;
      o += `<use href="#sn${u}" stroke="${C.sea}" stroke-width="11"/><use href="#sn${u}" stroke="${C.salmon}" stroke-width="3.4" stroke-dasharray="2.5 6"/></g>`;
      const [hx, hy] = pts[N], [px, py] = pts[N - 2];
      const ang = f1((Math.atan2(hy - py, hx - px) * 180) / Math.PI);
      o += `<g transform="translate(${f1(hx)} ${f1(hy)}) rotate(${ang})"><path d="M11 0h8l4-3.5M19 0l4 3.5" stroke="${C.stamp}" stroke-width="1.6" fill="none" stroke-linecap="round"/><ellipse cx="3" rx="10.5" ry="8" fill="${C.sea}"/><circle cx="6" cy="-3.6" r="2" fill="${C.paper}"/><circle cx="6.4" cy="-3.6" r=".9" fill="${C.ink}"/></g>`;
      // notes
      o += txt(36, 180, '>>> print("vanakkam")', mono(11, C.ink2));
      o += txt(36, 214, 'first game', hand(22, C.biro, 'transform="rotate(-4 36 214)"'));
      o += txt(40, 238, 'inga start aagudhu →', hand(19, C.biro, 'transform="rotate(-4 40 238)"'));
      o += txt(36, 270, 'pulli kolam × python', mono(8.5, C.ink3, 'letter-spacing=".18em"'));
      return o;
    },
  },

  git: {
    L: { word: { x: 364, y: 150, maxW: 190, size: 112, anchor: 'end' }, deco: ['tape'], tapeAt: [[19, 150, 84], [360, 278, -24]], tilt: 0.7, back: -2 },
    draw(ctx, u) {
      let o = '';
      const y = 230, by = 182;
      o += `<g fill="none" stroke-linecap="round"><path d="M40 ${y}H360" stroke="${C.ink}" stroke-width="7"/><path d="M104 ${y}C138 ${y} 136 ${by} 170 ${by}H262C296 ${by} 294 ${y} 328 ${y}" stroke="${C.violet}" stroke-width="7"/><path d="M104 ${y}C138 ${y} 136 ${by} 170 ${by}H262C296 ${by} 294 ${y} 328 ${y}" stroke="${C.paper}" stroke-width="1.2" stroke-dasharray="3 5"/></g>`;
      const stop = (x, yy, col, big) => `<circle cx="${x}" cy="${yy}" r="${big ? 8 : 5.5}" fill="${C.paper}" stroke="${col}" stroke-width="${big ? 3.4 : 2.6}"/>` + (big ? `<circle cx="${x}" cy="${yy}" r="2.6" fill="${col}"/>` : '');
      [40, 104, 168, 226, 328, 360].forEach((x, i) => { o += stop(x, y, C.ink, i === 0 || i === 5 || x === 104 || x === 328); });
      [196, 236].forEach((x) => { o += stop(x, by, C.violet); });
      o += txt(54, y - 12, 'main', mono(11, C.ink, 'font-weight="700"'));
      o += txt(150, by - 14, 'feature/amma-shop', mono(10.5, C.violet, 'font-weight="700"'));
      o += txt(168, y + 18, '3e1f', mono(7.5, C.ink3, 'text-anchor="middle"')) + txt(226, y + 18, '7ab2', mono(7.5, C.ink3, 'text-anchor="middle"'));
      o += txt(30, y + 34, 'Kovilpatti', hand(17)) + txt(370, y + 34, 'Bengaluru', hand(17, C.biro, 'text-anchor="end"'));
      o += txt(36, 84, '$ git commit -m', mono(10.5)) + txt(36, 100, '  "amma kadai v1"', mono(10.5));
      o += txt(36, 138, 'save-point', hand(24, C.stamp, 'transform="rotate(-5 36 138)"'));
      o += txt(44, 160, 'for your life ↓', hand(18, C.stamp, 'transform="rotate(-5 44 160)"'));
      return o;
    },
  },

  dsa: {
    L: { word: { x: 36, y: 264, maxW: 190, size: 100 }, deco: ['fold'], tilt: -1.1, back: 3 },
    draw(ctx, u) {
      let o = '';
      const tier = (y, label, h = 40) => `<rect x="248" y="${y}" width="84" height="${h}" rx="7" fill="${C.paper3}" stroke="${C.ink}" stroke-width="2.2"/><path d="M249 ${y + 8}H331" stroke="${C.ink}" stroke-width="1" opacity=".45"/><rect x="257" y="${y + 11}" width="7" height="${h - 16}" rx="3" fill="${C.paper}" opacity=".85"/>` + txt(296, y + 29, label, hand(16, C.ink2, 'text-anchor="middle"'));
      // frame rods + latch
      o += `<path d="M242 270V180h6M338 270V180h-6" stroke="${C.ink2}" stroke-width="4" fill="none" stroke-linejoin="round"/>`;
      o += tier(228, 'curd rice') + tier(184, 'sambar');
      // top tier being popped
      o += `<g transform="rotate(-8 290 120) translate(8 -2)"><path d="M250 116C254 94 326 94 330 116Z" fill="${C.paper2}" stroke="${C.ink}" stroke-width="2.2"/><rect x="282" y="91" width="16" height="8" rx="3" fill="${C.ink2}"/>${tier(116, 'poriyal')}</g>`;
      o += `<path d="M282 166v8M298 164v8M314 162v8" stroke="${C.ink3}" stroke-width="1.6" stroke-linecap="round"/>`;
      // pop / push arrows (biro)
      o += `<g fill="none" stroke="${C.biro}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M358 126V88"/><path d="M352 95l6-8 6 8"/><path d="M206 170C222 172 232 184 238 200"/><path d="M229 196l9 5 1-10"/></g>`;
      o += txt(358, 80, 'pop()', hand(21, C.biro, 'text-anchor="middle"')) + txt(146, 172, 'push()', hand(21));
      o += txt(342, 214, '[1]', mono(9, C.ink3)) + txt(342, 258, '[0]', mono(9, C.ink3)) + txt(352, 140, 'top', mono(9, C.stamp));
      o += txt(36, 82, 'stack = tiffin box', mono(10.5)) + txt(36, 98, 'LIFO: last in, first out', mono(10.5, C.ink3));
      o += txt(36, 128, 'last-a vechadhu,', hand(21, C.biro, 'transform="rotate(-3 36 128)"')) + txt(40, 150, 'first-a varum!', hand(21, C.biro, 'transform="rotate(-3 40 150)"'));
      return o;
    },
  },

  sql: {
    L: { word: { x: 36, y: 136, maxW: 180, size: 98 }, deco: ['clip'], clipAt: [340, 170, 14], tilt: 0.6, back: -2.6 },
    draw(ctx, u) {
      let o = '';
      o += txt(222, 84, 'SELECT item, kg', mono(10.5)) + txt(222, 100, 'FROM ration', mono(10.5)) + txt(222, 116, 'WHERE card = 1043;', mono(10.5, C.ink3));
      // ledger sheet
      o += `<g transform="rotate(-2.2 210 210)"><rect x="56" y="146" width="304" height="126" fill="${C.paper2}" stroke="${C.paper3}"/>`;
      o += txt(70, 164, 'நியாய விலைக் கடை · LEDGER', `font-family="${F.tamil}" font-size="10.5" font-weight="700" fill="${C.ink2}"`);
      let rules = '';
      for (let y = 190; y <= 266; y += 19) rules += `M58 ${y}H358`;
      o += `<path d="${rules}" stroke="${C.biro}" stroke-width=".8" opacity=".35"/>`;
      o += `<path d="M114 172V270M258 172V270M302 172V270" stroke="${C.stamp}" stroke-width=".9" opacity=".6"/>`;
      const head = mono(8, C.ink3, 'letter-spacing=".2em"');
      o += txt(66, 186, 'CARD', head) + txt(122, 186, 'ITEM', head) + txt(266, 186, 'KG', head) + txt(310, 186, '₹', head);
      const row = (y, a, b, kg, rs) => txt(66, y, a, mono(10.5, C.ink)) + txt(122, y, b, mono(10.5, C.ink)) + txt(266, y, kg, mono(10.5, C.ink)) + txt(310, y, rs, mono(10.5, C.ink));
      o += row(204, '1041', 'arisi', '20', '0') + row(223, '1042', 'sakkarai', '2', '50');
      const h = hand(19, C.biro);
      o += txt(64, 244, '1043', h) + txt(120, 244, 'paruppu', h) + txt(266, 244, '1', h) + txt(308, 244, '30', h);
      o += `<path d="M334 236l5 6 10-14" stroke="${C.biro}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      o += `<ellipse cx="226" cy="260" rx="40" ry="10" fill="none" stroke="${C.stamp}" stroke-width="1.6" transform="rotate(-4 226 260)"/>` + txt(198, 264, 'new row!', hand(14, C.stamp));
      return o + '</g>';
    },
  },

  docker: {
    L: { word: { x: 36, y: 132, maxW: 300, size: 82 }, deco: ['tape'], tapeAt: [[34, 276, 34], [366, 276, -32]], tilt: -0.6, back: 2 },
    draw(ctx, u) {
      let o = '';
      const box = (x, y, w, h, fill, label, lc = C.paper) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${C.ink}" stroke-opacity=".55" stroke-width="1.4"/><path d="M${x + 4} ${y + h / 2}H${x + w - 4}" stroke="${C.ink}" stroke-opacity=".2" stroke-width="${h - 8}" stroke-dasharray="1.6 4.4"/>` + (label ? txt(x + 7, y + 12, label, mono(7, lc, 'letter-spacing=".1em"')) : '');
      o += `<path d="M24 274H376" stroke="${C.ink}" stroke-width="2.4"/>`;
      o += box(32, 236, 102, 36, C.maroon, 'AAZH 0427 1') + box(136, 236, 102, 36, C.chilli, 'AAZH 0612 3') + box(240, 236, 102, 36, C.ink2, '');
      o += box(84, 198, 102, 36, C.salmon, 'AAZH 1101 7', C.ink) + box(188, 198, 102, 36, C.violet, '');
      // crane boom + hanging container
      o += `<path d="M262 142H380" stroke="${C.ink}" stroke-width="5"/><rect x="298" y="137" width="20" height="10" fill="${C.ink2}"/><path d="M308 147V156M296 156h24" stroke="${C.ink}" stroke-width="1.6"/>`;
      o += `<g transform="rotate(2.5 308 176)">${box(244, 158, 132, 36, C.sea, '')}` + txt(310, 181, 'TUTICORIN PORT', `font-family="${F.stencil}" font-size="12.5" fill="${C.paper}" text-anchor="middle" letter-spacing=".08em"`) + `</g>`;
      o += txt(36, 162, 'works on my machine', hand(16, C.ink3)) + `<path d="M34 156h126" stroke="${C.stamp}" stroke-width="2.4" stroke-linecap="round"/>`;
      o += txt(38, 186, 'works on every machine.', hand(16, C.biro, 'transform="rotate(-3 38 186)"'));
      return o;
    },
  },

  prompt: {
    L: { word: { x: 36, y: 266, maxW: 290, size: 78 }, deco: ['fold', 'tape'], tapeAt: [[204, 17, -3]], tilt: 1, back: -2.2 },
    draw(ctx, u) {
      let o = '';
      // you
      o += `<path d="M150 60H354a8 8 0 0 1 8 8V96a8 8 0 0 1-8 8H344l6 12-18-12H150a8 8 0 0 1-8-8V68a8 8 0 0 1 8-8Z" fill="${C.ink}"/>`;
      o += txt(156, 79, 'தமிழ்ல சொல்லு,', `font-family="${F.tamil}" font-size="14" font-weight="700" fill="${C.paper}"`);
      o += txt(156, 96, 'simple-aa. step by step.', mono(10.5, C.paper));
      o += txt(36, 70, 'YOU · 10:42', mono(7.5, C.ink3, 'letter-spacing=".2em"'));
      // ai
      o += txt(36, 120, 'AI · TYPING', mono(7.5, C.ink3, 'letter-spacing=".2em"'));
      o += `<path d="M44 126H268a8 8 0 0 1 8 8V170a8 8 0 0 1-8 8H68l-20 12 6-12H44a8 8 0 0 1-8-8V134a8 8 0 0 1 8-8Z" fill="${C.paper2}" stroke="${C.ink}" stroke-width="2"/>`;
      o += txt(48, 147, 'Sure, nanba. Step 1:', mono(10.5, C.ink));
      o += txt(48, 167, 'முதல்ல goal சொல்லு', `font-family="${F.tamil}" font-size="13" font-weight="700" fill="${C.ink}"`);
      o += `<style>.cu${u}{animation:bl${u} 1.1s steps(1) infinite}@keyframes bl${u}{50%{opacity:0}}@media (prefers-reduced-motion:reduce){.cu${u}{animation:none}}</style>`;
      o += `<rect class="cu${u}" x="196" y="155" width="7" height="15" fill="${C.biro}"/>`;
      return o;
    },
  },

  // fallback: the sea itself
  sea: {
    L: { word: { x: 36, y: 132, maxW: 310, size: 100 }, deco: ['tape'], tapeAt: [[200, 17, 2]], tilt: -0.8 },
    draw() {
      let d = '';
      for (let i = 0; i < 5; i++) {
        const y = 176 + i * 20;
        d += `M30 ${y}`;
        for (let x = 30; x < 370; x += 34) d += `q8.5 -${7 - i} 17 0t17 0`;
      }
      return `<path d="${d}" fill="none" stroke="${C.sea}" stroke-width="2.4" stroke-linecap="round"/>` + txt(364, 166, 'ஆழி', `font-family="${F.tamil}" font-size="22" font-weight="900" fill="${C.sea}" text-anchor="end"`);
    },
  },
};

function freeThumb(ctx) {
  const u = uid();
  const M = FREE_MOTIFS[ctx.motif];
  const label = `${ctx.title} — free Karai course ${ctx.no}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="${esc(label)}" class="az-thumb az-thumb--free">` + sheet(u, M.L, ctx, M.draw(ctx, u)) + `</svg>`;
}

// =====================================================================
// PAID — concert ticket (640 × 280)
// =====================================================================

const RAMP = '\u00a0.:-=+*o#%@';

// intensity fields in panel units (x ≈ -1..1, y ≈ -1.45..1.45); n = per-cell noise
const sdBox = (x, y, cx, cy, hw, hh, r = 0) => {
  const qx = Math.abs(x - cx) - hw + r, qy = Math.abs(y - cy) - hh + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};
const sdCirc = (x, y, cx, cy, r) => Math.hypot(x - cx, y - cy) - r;
const sdSeg = (x, y, ax, ay, bx, by) => {
  const px = x - ax, py = y - ay, dx = bx - ax, dy = by - ay;
  const h = clamp01((px * dx + py * dy) / (dx * dx + dy * dy));
  return Math.hypot(px - dx * h, py - dy * h);
};
const deep = (y, n) => 0.03 + n * 0.16 * clamp01(0.75 - y * 0.35);

const PAID_PANEL = {
  backend: {
    cap: 'server · key',
    f(x, y, n) {
      let v = deep(y, n);
      for (const cy of [-1.02, -0.56, -0.1]) {
        const d = sdBox(x, y, 0, cy, 0.8, 0.19, 0.05);
        if (d < -0.07) {
          v = 0.36 + 0.22 * clamp01((cy - y + 0.19) / 0.38);
          if (x > -0.68 && x < -0.12 && Math.abs(y - cy) < 0.11) v = Math.floor((x + 1) * 13) % 2 ? 0.78 : 0.12;
          if (Math.hypot(x - 0.4, y - cy) < 0.08 || Math.hypot(x - 0.6, y - cy) < 0.08) v = 1;
        } else if (d < 0) v = 0.92;
      }
      const k = Math.min(Math.abs(sdCirc(x, y, 0.46, 0.66, 0.26)) - 0.08, sdSeg(x, y, 0.2, 0.66, -0.8, 0.66) - 0.075, sdSeg(x, y, -0.74, 0.66, -0.74, 0.92) - 0.07, sdSeg(x, y, -0.52, 0.66, -0.52, 0.88) - 0.07);
      if (k < 0) v = 1;
      else if (k < 0.09) v = 0;
      return v;
    },
  },
  cloud: {
    cap: 'cloud · sea',
    f(x, y, n) {
      let v = deep(y, n) * 0.8;
      const d = Math.min(sdCirc(x, y, -0.44, -0.66, 0.32), sdCirc(x, y, 0.02, -0.86, 0.42), sdCirc(x, y, 0.46, -0.62, 0.3), sdBox(x, y, 0, -0.5, 0.76, 0.14, 0.12));
      if (d < -0.08) v = 0.45 + 0.55 * clamp01((-0.5 - y) / 0.7 + 0.35);
      else if (d < 0) v = 0.95;
      for (const cx of [-0.42, -0.02, 0.4]) if (Math.abs(x - cx) < 0.05 && y > -0.22 && y < 0.3 && Math.floor((y + 2) * 9) % 2 === 0) v = 0.72;
      if (y > 0.3) {
        v = 0.03 + n * 0.1;
        for (let k = 0; k < 5; k++) {
          const crest = 0.42 + k * 0.22 + 0.07 * Math.sin(x * 5.5 + k * 1.4);
          const d = Math.abs(y - crest);
          if (d < 0.07) v = Math.max(v, (1 - d / 0.07) * (1 - k * 0.14));
        }
      }
      return v;
    },
  },
  ai: {
    cap: 'pearl · eye',
    f(x, y, n) {
      let v = deep(y, n);
      const hy = 0.55;
      // neural threads to three nodes above the shell
      for (const [nx, ny] of [[-0.66, -0.92], [0, -1.12], [0.66, -0.92]]) {
        if (sdSeg(x, y, 0, hy, nx, ny) < 0.05) v = 0.62;
        if (Math.hypot(x - nx, y - ny) < 0.13) v = 1;
      }
      // upper shell: scalloped fan opening upward from the hinge
      const r = Math.hypot(x, y - hy), a = Math.atan2(hy - y, x);
      if (y < hy && a > 0.18 && a < Math.PI - 0.18) {
        const edge = 1 + 0.06 * Math.cos(a * 18);
        if (r < edge - 0.1) v = Math.pow(Math.abs(Math.cos(a * 6)), 10) > 0.4 ? 0.6 : 0.16;
        else if (r < edge) v = 0.92;
      }
      // lower shell bowl with growth ridges
      const e = (x / 1.0) ** 2 + ((y - hy) / 0.6) ** 2;
      if (y >= hy && e < 1) v = e > 0.78 ? 0.92 : Math.floor(Math.sqrt(e) * 5) % 2 ? 0.42 : 0.18;
      // the pearl, which is also an eye
      const pr = Math.hypot(x, y - hy);
      if (pr < 0.4) {
        v = 0.86 + 0.14 * clamp01(1 - Math.hypot(x + 0.15, y - hy + 0.15) / 0.3);
        if (pr > 0.13 && pr < 0.25) v = 0.06;
        if (pr < 0.075) v = 1;
      } else if (pr < 0.47) v = 0;
      return v;
    },
  },
};

function asciiPanel(motif, seed, x0, y0, w, h, fg, hi) {
  const P = PAID_PANEL[motif];
  const r = rng(seed ^ 0x9e3779b9);
  const cols = 28, rows = 30, cw = w / cols, ch = h / rows;
  // one <text> per row; bright cells switch to a highlight <tspan> (duotone).
  // Blank cells are NBSP so nothing collapses; font-size = cell width / 0.6 (mono advance).
  const HI = `<tspan fill="${hi}">`;
  let rowsOut = '';
  for (let j = 0; j < rows; j++) {
    let line = '', on = false;
    for (let i = 0; i < cols; i++) {
      const px = (i + 0.5) * cw, py = (j + 0.5) * ch;
      const v = clamp01(P.f((px - w / 2) / (w / 2), (py - h / 2) / (w / 2), r()));
      if (v > 0.84 !== on) { line += on ? '</tspan>' : HI; on = !on; }
      line += RAMP[Math.round(v * (RAMP.length - 1))];
    }
    if (on) line += '</tspan>';
    rowsOut += `<text x="${x0}" y="${f1(y0 + (j + 0.8) * ch)}">${line}</text>`;
  }
  return `<g font-family="${F.mono}" font-size="${f1(cw / 0.6)}" font-weight="700" style="white-space:pre" fill="${fg}">${rowsOut}</g>`;
}

function qrPath(r, n = 21) {
  const res = (x, y) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
  const finder = (x, y) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
  let d = finder(0, 0) + finder(n - 7, 0) + finder(0, n - 7);
  for (let y = 0; y < n; y++) {
    let run = -1;
    for (let x = 0; x <= n; x++) {
      const on = x < n && !res(x, y) && (y === 6 ? x % 2 === 0 : x === 6 ? y % 2 === 0 : r() < 0.48);
      if (on && run < 0) run = x;
      if (!on && run >= 0) { d += `M${run} ${y}h${x - run}v1h-${x - run}z`; run = -1; }
    }
  }
  return d;
}

function barcodePath(r, len, w) {
  let d = `M0 0h${w}v2.4h-${w}z`, y = 4;
  while (y < len - 6) {
    const bw = [1, 1, 1.4, 2, 2.8][(r() * 5) | 0];
    d += `M0 ${f1(y)}h${w}v${bw}h-${w}z`;
    y += bw + [1, 1.4, 2, 2.6][(r() * 4) | 0];
  }
  return d + `M0 ${f1(len - 2.4)}h${w}v2.4h-${w}z`;
}

const fieldVal = (v, label, fb) => String(v ?? fb).replace(new RegExp(`^\\s*${label}\\s*`, 'i'), '').trim() || fb;
const rupee = (v) => (Number.isFinite(+v) && v !== null && v !== '' ? '₹' + Number(v).toLocaleString('en-IN') : '');

function paidThumb(ctx) {
  const { c, motif } = ctx;
  const u = uid();
  const seed = hash(ctx.id);
  const r = rng(seed);
  const T = 494; // tear line
  const duo = {
    chilli: [C.oxblood, C.chilli, C.paper], stamp: [C.oxblood, C.salmon, C.paper], salmon: [C.maroon, C.salmon, C.paper],
    sea: [C.sea, C.salmon, C.paper], violet: [C.ink, C.lavender, C.paper], lavender: [C.ink, C.lavender, C.paper],
  }[ctx.accName] || [C.oxblood, C.salmon, C.paper];

  const stampText = String(c.thumb?.stamp || c.stamp || STAMP[motif] || (c.seats && c.seatsLeft / c.seats < 0.35 ? 'SEATS FILLING' : 'BATCH OPEN')).toUpperCase();
  const batch = String(c.nextBatch || 'Soon').toUpperCase();
  const sub = String(c.title || '').includes(':') ? String(c.title).split(':').slice(1).join(':').trim() : c.title || 'Live cohort';
  const meta = [c.duration, c.format].filter(Boolean).join(' · ') || 'Live Tamil classes · English notes';
  const full = rupee(c.price?.full), emi = rupee(c.price?.emi);
  const seatsLine = c.seats ? `${c.seatsLeft ?? c.seats} / ${c.seats} SEATS LEFT` : 'LIMITED SEATS';
  const gate = fieldVal(c.gate, 'GATE', ctx.no), row = fieldVal(c.row, 'ROW', String(1 + (seed % 7))), seat = fieldVal(c.seat, 'SEAT', String(1 + (seed % 40)));

  let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 280" role="img" aria-label="${esc(`${ctx.title} — Muthukuli cohort ticket, ${stampText.toLowerCase()}, next batch ${c.nextBatch || 'soon'}`)}" class="az-thumb az-thumb--paid">`;
  o += `<defs>`;
  o += `<mask id="m${u}" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="280"><rect width="640" height="280" fill="#fff"/><circle cx="${T}" cy="6" r="13"/><circle cx="${T}" cy="274" r="13"/></mask>`;
  o += `<linearGradient id="pg${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.paper}"/><stop offset="1" stop-color="${C.paper2}"/></linearGradient>`;
  o += `<radialGradient id="gl${u}" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="${duo[1]}" stop-opacity=".32"/><stop offset="1" stop-color="${duo[1]}" stop-opacity="0"/></radialGradient>`;
  o += `<filter id="sh${u}" x="-5%" y="-8%" width="110%" height="125%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity=".45"/></filter>`;
  o += `<filter id="gr${u}" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${seed % 89}"/><feColorMatrix values="0 0 0 0 .17 0 0 0 0 .05 0 0 0 0 .03 0 0 0 1.1 -.42"/><feComposite in2="SourceAlpha" operator="in"/></filter>`;
  o += `<filter id="rs${u}" x="-8%" y="-20%" width="116%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="${seed % 71}" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="${(seed % 71) + 5}" result="s"/><feColorMatrix in="s" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -5 3.35" result="h"/><feComposite in="d" in2="h" operator="in"/></filter>`;
  o += `<clipPath id="pc${u}"><rect x="20" y="22" width="168" height="236" rx="6"/></clipPath>`;
  o += `</defs>`;

  // ticket body
  o += `<g filter="url(#sh${u})"><g mask="url(#m${u})">`;
  o += `<rect x="4" y="6" width="632" height="268" rx="14" fill="url(#pg${u})"/>`;
  o += `<path d="M${T} 6H622a14 14 0 0 1 14 14V260a14 14 0 0 1-14 14H${T}Z" fill="${C.paper2}"/>`;
  o += `<rect x="4" y="6" width="632" height="268" rx="14" filter="url(#gr${u})"/>`;
  o += `</g></g>`;
  o += `<path d="M${T} 24V256" stroke="${C.ink3}" stroke-width="2" stroke-dasharray=".1 7" stroke-linecap="round"/>`;

  // photo panel: duotone ASCII emblem
  o += `<g clip-path="url(#pc${u})"><rect x="20" y="22" width="168" height="236" fill="${duo[0]}"/><rect x="20" y="22" width="168" height="236" fill="url(#gl${u})"/>`;
  o += asciiPanel(motif, seed, 21, 22, 168, 236, duo[1], duo[2]);
  o += `<rect x="20" y="240" width="168" height="18" fill="${duo[0]}" opacity=".88"/>` + txt(28, 252.5, `MUTHU ${ctx.no} · ${PAID_PANEL[motif].cap}`, mono(7.5, duo[2], 'letter-spacing=".18em"'));
  o += `</g><rect x="26" y="28" width="156" height="224" rx="3" fill="none" stroke="${duo[2]}" stroke-opacity=".28"/>`;

  // info block
  const X = 206, W = 272;
  o += `<text x="${X}" y="38" ${mono(9.5, C.ink2, 'letter-spacing=".42em"')}><tspan font-family="${F.tamil}" font-size="12.5" font-weight="900" letter-spacing="0" fill="${C.ink}">ஆழி</tspan> · MUTHUKULI · 2026</text>`;
  o += txt(X + W, 39, `№ ${ctx.no}`, `font-family="${F.display}" font-size="15" fill="${C.ink}" text-anchor="end"`);
  o += `<path d="M${X} 48H${X + W}" stroke="${C.ink}" stroke-width="1.3"/>`;
  o += txt(X, 68, 'ADMIT ONE · LIVE COHORT', `font-family="${F.narrow}" font-size="10" font-weight="700" fill="${C.stamp}" letter-spacing=".3em"`);
  const { lines, size } = fitWord(ctx.word, W, 70, 0.52, false);
  const lh = size * 0.9;
  o += `<text font-family="${F.display}" font-size="${f1(size)}" fill="${C.ink}" letter-spacing="-.01em">` + lines.map((l, i) => `<tspan x="${X - 2}" y="${f1(130 - (lines.length - 1 - i) * lh)}">${esc(l)}</tspan>`).join('') + `</text>`;
  o += txt(X, 152, clip(sub, 34).toUpperCase(), `font-family="${F.narrow}" font-size="13" font-weight="700" fill="${C.ink2}" letter-spacing=".06em"`);
  o += txt(X, 170, clip(meta, 46).toUpperCase(), mono(8, C.ink3, 'letter-spacing=".1em"'));
  o += `<path d="M${X} 184H${X + W}" stroke="${C.ink3}" stroke-width="1" stroke-dasharray="3 3"/>`;
  const fl = mono(7.5, C.ink3, 'letter-spacing=".28em"');
  const fv = (s, sz = 24) => `font-family="${F.display}" font-size="${sz}" fill="${C.ink}"`;
  o += txt(X, 202, 'GATE', fl) + txt(X, 230, clip(gate, 4), fv()) + txt(X + 56, 202, 'ROW', fl) + txt(X + 56, 230, clip(row, 4), fv()) + txt(X + 108, 202, 'SEAT', fl) + txt(X + 108, 230, clip(seat, 4), fv()) + txt(X + 162, 202, 'BATCH', fl) + txt(X + 162, 228, clip(batch, 12), fv(0, 17));
  o += `<path d="M${X + 46} 192V236M${X + 98} 192V236M${X + 152} 192V236" stroke="${C.ink3}" stroke-width=".8" opacity=".6"/>`;
  o += txt(X, 256, 'UPI · EMI · SCHOLARSHIP FOR FIRST-GEN GRADS', mono(7, C.ink3, 'letter-spacing=".08em"'));

  // stub
  const SX = (T + 636) / 2;
  o += txt(SX, 32, 'ADMIT ONE', mono(7.5, C.ink2, 'text-anchor="middle" letter-spacing=".32em"'));
  o += `<path transform="translate(533 42) scale(3.14)" d="${qrPath(r)}" fill="${C.ink}" shape-rendering="crispEdges"/>`;
  if (full) {
    o += txt(SX, 134, full, `font-family="${F.display}" font-size="23" fill="${C.ink}" text-anchor="middle"`);
    if (emi) o += txt(SX, 148, `or ${emi}/mo`, mono(8, C.ink3, 'text-anchor="middle"'));
  } else o += txt(SX, 140, 'FREE CLASS FIRST', mono(8, C.ink2, 'text-anchor="middle" letter-spacing=".1em"'));
  o += `<path transform="translate(512 162)" d="${barcodePath(r, 94, 58)}" fill="${C.ink}"/>`;
  o += txt(0, 0, seatsLine, `font-family="${F.narrow}" font-size="8.5" font-weight="700" fill="${C.stamp}" letter-spacing=".1em" transform="translate(588 256) rotate(-90)"`);
  o += txt(0, 0, `AZ-${ctx.id.toUpperCase()}-${String(seed % 10000).padStart(4, '0')}`.slice(0, 22), mono(6.5, C.ink3, 'transform="translate(604 256) rotate(-90)"'));
  o += `<path d="M616 162V256" stroke="${C.ink3}" stroke-width=".8"/>`;

  // rubber stamp
  const pos = { backend: [414, 158, -8], cloud: [404, 152, 6], ai: [420, 160, -11] }[motif] || [414, 158, -8];
  const ssz = stampText.length > 10 ? 22 : 28;
  const sw = Math.max(118, stampText.length * ssz * 0.5 + 34), sh = 56;
  o += `<g transform="translate(${pos[0]} ${pos[1]}) rotate(${pos[2]})" opacity=".9" style="mix-blend-mode:multiply"><g filter="url(#rs${u})" fill="none" stroke="${C.stamp}">`;
  o += `<rect x="${f1(-sw / 2)}" y="${-sh / 2}" width="${f1(sw)}" height="${sh}" rx="7" stroke-width="3.6"/><rect x="${f1(-sw / 2 + 5)}" y="${-sh / 2 + 5}" width="${f1(sw - 10)}" height="${sh - 10}" rx="4" stroke-width="1.3"/>`;
  o += txt(0, 6, stampText, `font-family="${F.display}" font-size="${ssz}" fill="${C.stamp}" stroke="none" text-anchor="middle" letter-spacing=".04em"`);
  o += txt(0, 19, `★ ${clip(batch, 14)} ★`, mono(7, C.stamp, 'stroke="none" text-anchor="middle" letter-spacing=".24em"'));
  o += `</g></g>`;
  return o + `</svg>`;
}

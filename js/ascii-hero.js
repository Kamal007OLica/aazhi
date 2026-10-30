// ஆழி — ASCII hero, round 2: "vaasal at dawn".
// A random young Tamil person stands in a doorway: a dark chaanam-washed plate with a
// mango-leaf thoranam across the top and a rice-flour pulli kolam behind them. The scene is
// painted procedurally into small buffers (luminance, coverage, accent id), then rasterised to
// monospace characters. Base characters are rice-flour white; culturally coded parts (kumkum,
// vibhuti, jasmine, gold, turmeric, mango leaf, kaavi) go to colour layers: one absolutely
// positioned <span> per colour, laid exactly over the <pre>, each written as one string.
// No libraries. The painter is pure math so it runs (and is tested) headless.
//
//   import { mountAsciiHero } from './js/ascii-hero.js';
//   const hero = mountAsciiHero(pre, { caption, interval: 10000, seed });
//   hero.next(); hero.destroy();
//
// Round 3, the landing page: a tribute portrait instead of the random person.
//   mountAsciiHero(pre, { portrait: 'kalam', caption, backdrop: seaEl, interval: 10000 })
// loads assets/portrait/kalam-source.png (a pencil sketch), turns it into ink characters
// (imageToScene → sceneToAscii in "ink" mode), scrambles it in once, then shimmers: a few dozen
// cells flick through code glyphs in chilli every couple of seconds. No face swap. `backdrop`
// gets mountSeaBackdrop(): a faint ASCII sea whose swell rolls in every `interval` ms.

export const SRC_W = 180;
export const SRC_H = 220;
const TOP = 12;                          // the person sits this far below the thoranam
const FW_SCALE = 0.92;                   // head size, so a little chest (thundu, dhavani, chain) shows

const LINE_H = 1;                        // line-height of the <pre>, in em
const RAMP = ' .:!*+d9K';                // dark → light (light characters on a dark plate)
const ALT = ' ..:!*+d9';                 // texture partner one step lighter
const SCRAMBLE = '01{}[]<>/\\|=+-*;:!?#%&$@K9dx';
const TRANSITION_MS = 1150;

// colour layers. 0 is the <pre> itself.
export const LAYERS = ['base', 'maavu', 'kumkum', 'manjal', 'malli', 'pon', 'ilai', 'kaavi', 'mudi'];
const LAYER_FALLBACK = {
  maavu: 'rgba(234, 224, 204, .5)', kumkum: '#e3263f', manjal: '#eaa61c', malli: '#fffbf1',
  pon: '#dcae4c', ilai: '#79a845', kaavi: '#d6633a', mudi: 'rgba(234, 224, 204, .5)',
};
const LY = { base: 0, maavu: 1, kumkum: 2, manjal: 3, malli: 4, pon: 5, ilai: 6, kaavi: 7, mudi: 8 };

// accent ids painted per source pixel → which layer, a minimum ramp level, how many of the 9
// sub-samples must agree, and optional glyphs (indexed by brightness).
const A = { KUMKUM: 1, ASH: 2, SANDAL: 3, JASMINE: 4, GOLD: 5, STONE: 6, LEAF: 7, MARIGOLD: 8, KAAVI: 9, BEAD: 10, GREEN: 11, RED: 12, THREAD: 13, HAIR: 15, MEESAI: 16, BEARD: 17 };
const ACC = [];
ACC[A.KUMKUM] = { layer: LY.kumkum, min: 6, need: 2 };
ACC[A.ASH] = { layer: LY.malli, min: 4, need: 3, glyph: '=' };
ACC[A.SANDAL] = { layer: LY.manjal, min: 5, need: 3 };
ACC[A.JASMINE] = { layer: LY.malli, min: 5, need: 2, glyph: 'oo@' };
ACC[A.GOLD] = { layer: LY.pon, min: 5, need: 2 };
ACC[A.STONE] = { layer: LY.pon, min: 0, need: 1, glyph: '*' };
ACC[A.LEAF] = { layer: LY.ilai, min: 5, need: 3 };
ACC[A.MARIGOLD] = { layer: LY.manjal, min: 5, need: 3, glyph: '*%@' };
ACC[A.KAAVI] = { layer: LY.kaavi, min: 4, need: 3 };
ACC[14] = { layer: LY.kaavi, min: 5, need: 3, glyph: '*%@' };   // orange marigold
ACC[A.BEAD] = { layer: LY.kaavi, min: 5, need: 2, glyph: 'o0@' };
ACC[A.GREEN] = { layer: LY.ilai, min: 4, need: 3 };
ACC[A.RED] = { layer: LY.kumkum, min: 4, need: 3 };
ACC[A.THREAD] = { layer: LY.kaavi, min: 2, need: 2, glyph: '~' };
// hair (mudi) is drawn in thinner flour so the face is the brightest thing on the plate;
// the meesai gets its own strokes, the way a hand-drawn ASCII moustache would.
ACC[A.HAIR] = { layer: LY.mudi, min: 1, need: 5 };
ACC[A.MEESAI] = { layer: LY.mudi, min: 0, need: 4, glyph: '~' };
ACC[A.BEARD] = { layer: LY.mudi, min: 0, need: 4, glyph: ';' };

// [Latin, Tamil script]
const TOWNS = [
  ['Kovilpatti', 'கோவில்பட்டி'], ['Madurai', 'மதுரை'], ['Tirunelveli', 'திருநெல்வேலி'],
  ['Thoothukudi', 'தூத்துக்குடி'], ['Salem', 'சேலம்'], ['Erode', 'ஈரோடு'], ['Namakkal', 'நாமக்கல்'],
  ['Dindigul', 'திண்டுக்கல்'], ['Karur', 'கரூர்'], ['Thanjavur', 'தஞ்சாவூர்'], ['Kumbakonam', 'கும்பகோணம்'],
  ['Pudukkottai', 'புதுக்கோட்டை'], ['Villupuram', 'விழுப்புரம்'], ['Nagercoil', 'நாகர்கோவில்'],
  ['Theni', 'தேனி'], ['Sivakasi', 'சிவகாசி'], ['Virudhunagar', 'விருதுநகர்'],
  ['Ramanathapuram', 'ராமநாதபுரம்'], ['Tenkasi', 'தென்காசி'], ['Karaikudi', 'காரைக்குடி'],
  ['Sivaganga', 'சிவகங்கை'], ['Ariyalur', 'அரியலூர்'], ['Perambalur', 'பெரம்பலூர்'],
  ['Tiruvarur', 'திருவாரூர்'], ['Nagapattinam', 'நாகப்பட்டினம்'], ['Mayiladuthurai', 'மயிலாடுதுறை'],
  ['Krishnagiri', 'கிருஷ்ணகிரி'], ['Dharmapuri', 'தருமபுரி'], ['Tiruvannamalai', 'திருவண்ணாமலை'],
  ['Cuddalore', 'கடலூர்'], ['Pollachi', 'பொள்ளாச்சி'], ['Rajapalayam', 'ராஜபாளையம்'],
  ['Paramakudi', 'பரமக்குடி'], ['Aruppukkottai', 'அருப்புக்கோட்டை'], ['Sankarankovil', 'சங்கரன்கோவில்'],
  ['Palani', 'பழனி'], ['Kallakurichi', 'கள்ளக்குறிச்சி'], ['Gobichettipalayam', 'கோபிசெட்டிபாளையம்'],
  ['Udumalaipettai', 'உடுமலைப்பேட்டை'],
];
const CITIES = ['Bengaluru', 'Chennai', 'Hyderabad', 'Pune', 'Coimbatore', 'remote'];
const TRACKS = ['backend', 'cloud', 'ai', 'data', 'devops'];
const HAIR = ['sidepart', 'curly', 'buzz', 'long', 'plait', 'bun', 'wavy', 'plait', 'sidepart'];

// ───────────────────────────────────────────────────────── utilities
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const mix = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const sq = (x) => x * x;

function mulberry32(a) {
  a >>>= 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(x, y) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function makeNoise(seed) {
  const r = mulberry32(seed ^ 0x5bd1e995);
  const g = new Float32Array(256);
  const p = new Uint8Array(512);
  for (let i = 0; i < 256; i++) { g[i] = r(); p[i] = i; }
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; }
  for (let i = 0; i < 256; i++) p[i + 256] = p[i];
  const at = (x, y) => g[p[(p[x & 255] + y) & 255]];
  return function (x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return mix(mix(at(xi, yi), at(xi + 1, yi), u), mix(at(xi, yi + 1), at(xi + 1, yi + 1), u), v);
  };
}

function sdSeg(px, py, ax, ay, bx, by) {
  const pax = px - ax, pay = py - ay, bax = bx - ax, bay = by - ay;
  const h = clamp((pax * bax + pay * bay) / (bax * bax + bay * bay || 1e-9), 0, 1);
  return Math.hypot(pax - bax * h, pay - bay * h);
}

// Distance to a polyline with a radius that tapers from r0 to r1 along it.
function sdStroke(px, py, pts, r0, r1 = r0) {
  const n = pts.length / 2 - 1;
  let best = 1e9;
  for (let k = 0; k < n; k++) {
    const ax = pts[2 * k], ay = pts[2 * k + 1], bx = pts[2 * k + 2], by = pts[2 * k + 3];
    const pax = px - ax, pay = py - ay, bax = bx - ax, bay = by - ay;
    const h = clamp((pax * bax + pay * bay) / (bax * bax + bay * bay || 1e-9), 0, 1);
    const d = Math.hypot(pax - bax * h, pay - bay * h) - mix(r0, r1, (k + h) / n);
    if (d < best) best = d;
  }
  return best;
}

// Nearest point on a polyline: distance, arc length along it, and signed side.
function onPath(px, py, pts) {
  let best = 1e9, along = 0, side = 0, acc = 0;
  for (let k = 0; k < pts.length / 2 - 1; k++) {
    const ax = pts[2 * k], ay = pts[2 * k + 1], bx = pts[2 * k + 2], by = pts[2 * k + 3];
    const bax = bx - ax, bay = by - ay, len = Math.hypot(bax, bay) || 1e-9;
    const h = clamp(((px - ax) * bax + (py - ay) * bay) / (len * len), 0, 1);
    const dx = px - ax - bax * h, dy = py - ay - bay * h;
    const d = Math.hypot(dx, dy);
    if (d < best) { best = d; along = acc + h * len; side = (bax * dy - bay * dx) / len; }
    acc += len;
  }
  return { d: best, along, side };
}

// Quadratic bezier → flat polyline.
function bez(ax, ay, cx, cy, bx, by, n = 10) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, m = 1 - t;
    out.push(m * m * ax + 2 * m * t * cx + t * t * bx, m * m * ay + 2 * m * t * cy + t * t * by);
  }
  return out;
}

// ───────────────────────────────────────────────────────── the person
export function personTraits(seed) {
  seed >>>= 0;
  const r = mulberry32(seed);
  const rnd = (a, b) => a + (b - a) * r();
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  const chance = (p) => r() < p;

  const hair = pick(HAIR);
  const longHair = hair === 'long' || hair === 'plait' || hair === 'bun';
  let fem;
  if (longHair) fem = true;
  else if (hair === 'sidepart' || hair === 'buzz') fem = false;
  else fem = chance(hair === 'wavy' ? 0.45 : 0.3);

  // the classic Tamil meesai is the default, not the exception
  let facial = 'none';
  if (!fem) facial = pick(['meesai', 'meesai', 'meesai', 'murukku', 'murukku', 'beard', 'beard', 'stubble']);

  const turned = chance(0.3);
  const yaw = (turned ? rnd(0.16, 0.3) : rnd(0, 0.06)) * (chance(0.5) ? 1 : -1);

  let top;
  if (fem) top = pick(longHair ? ['dhavani', 'dhavani', 'kurta', 'tee', 'hoodie'] : ['dhavani', 'kurta', 'tee', 'hoodie', 'hoodie']);
  else top = pick(['sattai', 'sattai', 'sattai', 'tee', 'hoodie', 'hoodie', 'kurta']);
  const hood = top === 'hoodie' && !longHair && chance(0.4);

  // ── "techy now"
  const audioRoll = r();
  let audio = audioRoll < 0.13 ? 'earphones' : audioRoll < 0.38 ? 'headphones' : 'none';
  if (audio === 'headphones' && (hood || hair === 'bun')) audio = 'earphones';
  const specsRoll = r();
  let specs = specsRoll < 0.2 ? 'rect' : specsRoll < 0.33 ? 'round' : 'none';
  let lanyard = chance(0.28);
  if (audio === 'none' && specs === 'none' && !lanyard && top !== 'hoodie' && chance(0.8)) {
    const f = r();
    if (f < 0.45) audio = hair === 'bun' ? 'earphones' : 'headphones';
    else if (f < 0.75) lanyard = true;
    else specs = 'rect';
  }

  // ── "rural roots"
  let mark;
  const mr = r();
  if (fem) mark = mr < 0.68 ? 'pottu' : mr < 0.86 ? 'pottu-vibhuti' : 'none';
  else mark = mr < 0.38 ? 'vibhuti' : mr < 0.55 ? 'santhanam' : mr < 0.67 ? 'kumkum' : 'none';
  const nr = r();
  let neck = 'none';
  if (fem) neck = nr < 0.4 ? 'chain' : 'none';
  else if (nr < 0.26) neck = 'chain';
  else if (nr < (mark === 'vibhuti' ? 0.6 : 0.36)) neck = 'rudraksha';
  const thundu = !fem && chance(top === 'hoodie' ? 0.3 : 0.6);

  let cloth;
  if (top === 'hoodie') cloth = rnd(0.12, 0.36);
  else if (top === 'sattai') cloth = pick([rnd(0.62, 0.74), rnd(0.62, 0.74), rnd(0.4, 0.52)]);
  else if (top === 'kurta') cloth = pick([rnd(0.14, 0.28), rnd(0.55, 0.72)]);
  else if (top === 'dhavani') cloth = rnd(0.2, 0.38);
  else cloth = pick([rnd(0.1, 0.24), rnd(0.35, 0.5), rnd(0.7, 0.82)]);

  return {
    seed, hair, fem, facial, top, hood, audio, specs, mark, neck, thundu,
    jasmine: longHair ? chance(0.92) : fem && chance(0.5),
    stud: fem && chance(0.6),
    earrings: fem ? chance(0.85) : chance(0.2),          // jhumka / kadukkan
    kajal: fem && chance(0.65),
    lanyard,
    part: chance(0.5) ? 1 : -1,
    side: chance(0.5) ? 1 : -1,          // which shoulder the plait / garland falls on
    drape: chance(0.5) ? 1 : -1,         // which shoulder the thundu / dhavani sits on
    light: chance(0.5) ? 1 : -1,         // key light side
    yaw,
    tilt: rnd(-0.08, 0.08),
    fw: (fem ? rnd(42, 45.5) : rnd(44, 48)) * FW_SCALE,
    offX: rnd(-4, 4),
    eyeY: rnd(84, 89) + TOP,
    jawP: fem ? rnd(1.9, 2.3) : rnd(2.1, 3.0),
    taper: fem ? rnd(0.12, 0.24) : rnd(0.02, 0.16),
    skin: rnd(0.66, 0.82),
    hairAlb: rnd(0.07, 0.13),
    eye: rnd(0.95, 1.12),
    nose: rnd(0.95, 1.25),
    lip: fem ? rnd(1.05, 1.3) : rnd(0.9, 1.15),
    mouthW: rnd(0.23, 0.29),
    smile: rnd(-0.1, 1),
    brow: fem ? rnd(0.8, 1.0) : rnd(1.05, 1.4),
    browArch: rnd(0.04, 0.1),
    cloth,
    drapeTone: rnd(0.5, 0.72),
    thunduBorder: pick([A.KAAVI, A.KAAVI, A.GREEN, A.RED]),
    dhavaniStripe: pick([A.RED, A.GREEN, A.RED]),
    kolam: { shape: pick(['diamond', 'diamond', 'round']), p: rnd(12.5, 15), q: rnd(1.1, 1.45), r: rnd(0.5, 0.58), n: pick([5, 6, 6, 7]), dots: chance(0.25) },
    thoranam: { pitch: rnd(11, 12.5), sag: rnd(1.5, 4), flowers: pick([0, 3, 3, 4]), len: rnd(22, 27), phase: r() },
    noiseSeed: (seed * 2654435761) >>> 0,
    no: Math.floor(r() * 10000),
    ...(() => { const tw = pick(TOWNS); return { town: tw[0], townTa: tw[1] }; })(),
    city: pick(CITIES),
    track: pick(TRACKS),
  };
}

// Tamil first: the word and the home town in Tamil script, the destination in English.
export function captionParts(t) {
  let word = 'நண்பா';
  const clearlyFem = t.fem && (t.hair === 'long' || t.hair === 'plait' || t.hair === 'bun' || t.top === 'dhavani' || t.jasmine || (t.mark || '').startsWith('pottu'));
  const clearlyMasc = !t.fem && (t.facial !== 'none' || t.hair === 'sidepart' || t.hair === 'buzz');
  if (clearlyFem) word = 'நண்பி';
  else if (clearlyMasc) word = 'நண்பன்';
  return { word, no: '#' + String(t.no).padStart(4, '0'), town: t.townTa || t.town, city: t.city, track: t.track };
}
export function captionFor(t) {
  const c = captionParts(t);
  return `${c.word} ${c.no} · ${c.town} → ${c.city} · ${c.track}`;
}

// ───────────────────────────────────────────────────────── the painter
// Returns the scene: { w, h, lum, mask, acc, kolam } where lum is a Float32Array of light
// (0 = the dark plate, 1 = full rice-flour white), mask is person/prop coverage, acc the
// accent id per pixel.
export function renderPortrait(t) {
  const W = SRC_W, H = SRC_H, N = W * H;
  const L = new Float32Array(N);
  const M = new Float32Array(N);
  const AC = new Uint8Array(N);
  const U = new Float32Array(N), V = new Float32Array(N);
  const noise = makeNoise(t.noiseSeed);

  const fw = t.fw, cx = W / 2 + t.offX, eyeY = t.eyeY;
  const s = Math.sin(t.yaw), cyw = Math.cos(t.yaw);
  const pivX = cx, pivY = eyeY + 1.5 * fw;
  const ct = Math.cos(t.tilt), st = Math.sin(t.tilt);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x, dx = x + 0.5 - pivX, dy = y + 0.5 - pivY;
      U[i] = (dx * ct + dy * st + pivX - cx) / fw;
      V[i] = (-dx * st + dy * ct + pivY - eyeY) / fw;
    }
  }
  const px = 1 / fw;                                   // one pixel, in head units
  const aa = (sd) => clamp(0.5 - sd * fw, 0, 1);       // sd in head units → coverage
  const toScreen = (u, v) => {
    const rx = u * fw + cx - pivX, ry = v * fw + eyeY - pivY;
    return [rx * ct - ry * st + pivX, rx * st + ry * ct + pivY];
  };

  // paint(alpha(u,v,x,y,i), value | value(u,v,x,y,i), [u0,v0,u1,v1] head-space bbox, accent | accent(...))
  function paint(alphaFn, val, bb, acc = 0) {
    let x0 = 0, y0 = 0, x1 = W - 1, y1 = H - 1;
    if (bb) {
      const c = [toScreen(bb[0], bb[1]), toScreen(bb[2], bb[1]), toScreen(bb[0], bb[3]), toScreen(bb[2], bb[3])];
      x0 = Math.max(0, Math.floor(Math.min(c[0][0], c[1][0], c[2][0], c[3][0])) - 2);
      x1 = Math.min(W - 1, Math.ceil(Math.max(c[0][0], c[1][0], c[2][0], c[3][0])) + 2);
      y0 = Math.max(0, Math.floor(Math.min(c[0][1], c[1][1], c[2][1], c[3][1])) - 2);
      y1 = Math.min(H - 1, Math.ceil(Math.max(c[0][1], c[1][1], c[2][1], c[3][1])) + 2);
    }
    const fn = typeof val === 'function';
    const afn = typeof acc === 'function';
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = y * W + x;
        let a = alphaFn(U[i], V[i], x, y, i);
        if (!(a > 0)) continue;
        if (a > 1) a = 1;
        const c = fn ? val(U[i], V[i], x, y, i) : val;
        L[i] += (c - L[i]) * a;
        M[i] += (1 - M[i]) * a;
        if (a > 0.5) AC[i] = afn ? acc(U[i], V[i], x, y, i) : acc;
      }
    }
  }
  const fill = (sdFn, val, bb, acc) => paint((u, v, x, y, i) => aa(sdFn(u, v, x, y, i)), val, bb, acc);

  // Key light (toward the light), a soft side light from above.
  const ls = t.light;
  let Lx = ls * 0.78, Ly = -0.42, Lz = 0.52;
  { const n = Math.hypot(Lx, Ly, Lz); Lx /= n; Ly /= n; Lz /= n; }
  const lambert = (nx, ny, nz) => nx * Lx + ny * Ly + nz * Lz;

  // Projection of a frontal feature at u0 with depth d (how far it sits in front of the skull).
  const P = (u0, d) => u0 * cyw + s * d;
  const fsc = (u0) => clamp(1 - 0.95 * s * Math.sign(u0), 0.62, 1.2);   // foreshortening per side
  const bx = -s * 0.2;                                                  // skull centre drifts back when turned

  // Face outline: normalised radius, 1 on the silhouette.
  const jp = t.jawP;
  function faceR(u, v) {
    const tt = clamp((v - 0.1) / 1.24, 0, 1);
    const us = u - s * (0.1 + 0.5 * tt);
    if (v < 0.1) return Math.hypot(us / (1 - 0.04 * sq((v - 0.1) / 1.1)), (v - 0.1) / 1.18);
    const w = 1 - t.taper * tt;
    const a = Math.abs(us) / w, b = (v - 0.1) / 1.24;
    return Math.pow(Math.pow(a, jp) + Math.pow(b, jp), 1 / jp);
  }
  const skullR = (u, v, k) => Math.hypot((u - bx) / k, (v + 0.02) / (1.13 * k));
  const uf = (u) => (u - s * 0.5) / cyw;           // un-project for forehead-level features

  const masc = !t.fem;
  const skin = t.skin;
  const hairAlb = t.hairAlb;
  const side = t.side, part = t.part;

  // ── hair style definitions ────────────────────────────────────────
  const H_ = { k: 1.08, sideV: 0.05, hl: () => -0.6, lobes: 0, back: null, tex: 'strand' };
  const temple = (f, to) => to * sstep(0.8, 0.96, Math.abs(f));
  switch (t.hair) {
    case 'sidepart':
      H_.k = 1.1;
      H_.hl = (f) => -0.6 + 0.22 * f * f + 0.14 * sstep(-0.1, 0.75, -part * f) * (1 - sstep(0.75, 0.95, Math.abs(f))) + temple(f, 0.85);
      H_.quiff = true;
      break;
    case 'buzz':
      H_.k = 1.03; H_.tex = 'buzz';
      H_.hl = (f) => -0.68 + 0.24 * f * f + temple(f, 0.85);
      break;
    case 'curly':
      H_.k = 1.22; H_.lobes = 1; H_.tex = 'curl'; H_.sideV = 0.18;
      H_.hl = (f) => -0.5 + 0.16 * f * f + 0.05 * Math.sin(f * 17 + t.seed) + temple(f, 0.8);
      break;
    case 'wavy':
      H_.k = 1.16; H_.sideV = 0.95; H_.tex = 'wave';
      H_.hl = (f) => -0.5 + 0.16 * f * f + 0.2 * sstep(-0.3, 0.7, -part * f) * (1 - sstep(0.7, 0.92, Math.abs(f))) + temple(f, 0.9);
      break;
    case 'long':
      H_.k = 1.08; H_.sideV = 3.5;
      H_.hl = (f) => -0.74 + 0.5 * Math.pow(Math.abs(f), 1.7) + temple(f, 0.7);
      H_.back = true; H_.centre = true;
      break;
    case 'plait':
      H_.k = 1.04; H_.sideV = 0.22; H_.centre = true;
      H_.hl = (f) => -0.68 + 0.3 * f * f + temple(f, 0.75);
      H_.plait = true;
      break;
    case 'bun':
      H_.k = 1.04; H_.sideV = 0.1;
      H_.hl = (f) => -0.66 + 0.26 * f * f + temple(f, 0.72);
      H_.bun = true;
      break;
  }
  if (t.hood) H_.k = Math.min(H_.k, 1.12);

  function hairK(u, v) {
    let k = H_.k;
    if (H_.lobes) {
      const a = Math.atan2(v + 0.02, u - bx);
      k += 0.06 * Math.sin(a * 9 + t.seed % 7) + 0.07 * (noise(u * 5 + 3, v * 5) - 0.5);
    }
    if (H_.quiff) k += 0.09 * Math.exp(-sq(uf(u) + part * 0.35) / 0.15) * sstep(-0.3, -0.8, v);
    return k;
  }
  function hairAlpha(u, v) {
    const sr = skullR(u, v, hairK(u, v));
    const out = (sr - 1) * 1.05;                       // >0 outside volume
    if (out > 2 * px) return 0;
    const f = uf(u);
    const hl = H_.hl(f);
    const fr = faceR(u, v);
    let inHair = 0;
    if (v < hl) inHair = aa(v - hl);
    if (fr > 0.97 && v < H_.sideV + px) inHair = Math.max(inHair, Math.min(aa(1 - fr), aa(v - H_.sideV)));
    return Math.min(inHair, aa(out));
  }
  const hairNormal = (u, v) => {
    const R = H_.k * 1.15;
    const nx = clamp((u - bx) / R, -1, 1), ny = clamp((v + 0.2) / R, -1, 1);
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    return lambert(nx, v > 0.4 ? 0 : ny, v > 0.4 ? Math.sqrt(1 - nx * nx) : nz);
  };
  // coconut-oiled hair: a strong, narrow sheen
  function hairVal(u, v, x, y) {
    const lam = Math.max(0, hairNormal(u, v));
    let val = hairAlb * (0.55 + 0.9 * lam);
    if (H_.tex === 'strand') {
      const a = Math.atan2(v + 0.6, u - bx - (H_.centre ? 0 : part * 0.35));
      const st = 0.5 + 0.5 * Math.sin(a * 30 + noise(u * 4, v * 4) * 6);
      val += Math.pow(lam, 2) * 0.34 * st * (0.6 + 0.4 * noise(u * 9, v * 2));
    } else if (H_.tex === 'curl') {
      const cs = 0.15, gx = Math.floor(u / cs), gy = Math.floor(v / cs);
      let dm = 9, lx = 0, ly = 0;
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const qx = (gx + ox + 0.15 + 0.7 * hash2(gx + ox, gy + oy)) * cs;
        const qy = (gy + oy + 0.15 + 0.7 * hash2(gy + oy + 91, gx + ox)) * cs;
        const d = Math.hypot(u - qx, v - qy);
        if (d < dm) { dm = d; lx = (u - qx) / (cs * 0.75); ly = (v - qy) / (cs * 0.75); }
      }
      const lr = Math.min(1, Math.hypot(lx, ly));
      const loc = Math.max(0, lambert(lx * 0.8, ly * 0.8, Math.sqrt(Math.max(0, 1 - lr * lr))));
      val = hairAlb * (0.45 + 0.5 * lam) + 0.4 * Math.pow(loc, 2.5) * (0.35 + 0.65 * lam) * (1 - lr * 0.6);
    } else if (H_.tex === 'wave') {
      const w = 0.5 + 0.5 * Math.sin(v * 24 + 2.2 * Math.sin(u * 7 + 1) + (u - bx) * 3 + 2 * noise(u * 3, v * 3));
      val += Math.pow(lam, 1.8) * 0.4 * w;
    } else if (H_.tex === 'buzz') {
      val = mix(skin * 0.4, hairAlb * 1.5, 0.75) * (0.6 + 0.7 * lam);
      val *= hash2(x, y) < 0.5 ? 0.75 : 1.08;
    }
    return clamp(val, 0, 1);
  }

  // ── 1. long hair behind the shoulders ────────────────────────────
  if (H_.back) {
    const vb = 3.3 + 0.15 * Math.sin(t.seed);
    paint((u, v) => {
      if (v < -0.4 || v > vb + 0.2) return 0;
      const halfW = 1.12 + 0.2 * clamp(v, 0, 2.5);
      const sdx = Math.abs(u - bx) - halfW;
      const bottom = v - (vb + 0.12 * Math.sin(u * 7));
      return Math.min(aa(sdx), aa(bottom));
    }, (u, v) => {
      const nx = clamp((u - bx) / 1.5, -1, 1);
      const lam = Math.max(0, lambert(nx, 0, Math.sqrt(1 - nx * nx)));
      const w = 0.5 + 0.5 * Math.sin(u * 40 + 3 * noise(u * 2, v * 2));
      return clamp(hairAlb * (0.5 + 0.7 * lam) + Math.pow(lam, 2) * 0.26 * w, 0, 1);
    }, null, A.HAIR);
  }

  // ── 2. bun (behind the crown) ─────────────────────────────────────
  if (H_.bun) {
    const bcx = bx * 1.4, bcy = -1.16, br = 0.36;
    fill((u, v) => Math.hypot(u - bcx, (v - bcy) * 1.12) - br, (u, v) => {
      const nx = (u - bcx) / br, ny = (v - bcy) / br;
      const lam = Math.max(0, lambert(nx, ny, Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny))));
      const sw = 0.5 + 0.5 * Math.sin(Math.atan2(ny, nx) * 5 + Math.hypot(nx, ny) * 9);
      return clamp(hairAlb * (0.55 + 0.9 * lam) + Math.pow(lam, 2) * 0.34 * sw, 0, 1);
    }, [bcx - 0.5, bcy - 0.5, bcx + 0.5, bcy + 0.5], A.HAIR);
  }

  // ── 3. hood (behind the head) ────────────────────────────────────
  const clothVal = (base, nx, ny) => {
    const nz = Math.sqrt(Math.max(0.05, 1 - nx * nx - ny * ny));
    const lam = Math.max(0, lambert(nx, ny, nz));
    return clamp((base * (0.4 + 0.85 * lam) + 0.03) * 0.8, 0, 1);   // clothes never outshine the face
  };
  if (t.hood) {
    paint((u, v) => {
      const k = 1.36;
      const top = skullR(u, v, k) - 1;
      const body = v > 0.1 ? Math.abs(u - bx * 0.6) - (k * 0.97 - 0.06 * clamp(v - 0.1, 0, 1.4)) : top;
      return aa(Math.min(top, body) * 1.1);
    }, (u, v) => {
      const nx = clamp((u - bx) / 1.7, -1, 1);
      return clothVal(t.cloth, nx, clamp((v + 0.2) / 1.8, -1, 1) * (v < 0 ? 1 : 0.2)) * 0.8;
    });
  }

  // ── 4. neck ──────────────────────────────────────────────────────
  const chinY = eyeY + 1.32 * fw;
  const nw = fw * (masc ? 0.5 : 0.42);
  const ncx = cx + s * fw * 0.18;
  const shY = eyeY + 1.84 * fw;
  paint((u, v, x, y) => {
    if (y < eyeY + 0.5 * fw) return 0;
    const flare = y > shY - 0.2 * fw ? sq((y - (shY - 0.2 * fw)) / fw) * fw * 0.9 : 0;
    return clamp(nw + flare - Math.abs(x + 0.5 - ncx) + 0.5, 0, 1);
  }, (u, v, x, y) => {
    const nx = clamp((x + 0.5 - ncx) / (nw * 1.15), -1, 1);
    const lam = lambert(nx, 0, Math.sqrt(1 - nx * nx));
    let val = skin * (0.5 + 0.85 * Math.max(0, lam));
    const under = 1 - sstep(chinY, chinY + 0.5 * fw, y + 0.5);       // cast shadow under the jaw
    val *= 1 - 0.55 * under;
    if (masc) {                                                     // adam's apple hint
      const d = Math.hypot((x + 0.5 - ncx) / (0.1 * fw), (y - (chinY + 0.45 * fw)) / (0.12 * fw));
      val *= 1 - 0.12 * Math.exp(-d * d);
    }
    return clamp(val, 0, 1);
  });

  // ── 5. torso + clothes ───────────────────────────────────────────
  const sw = fw * (masc ? 2.3 : 2.05);
  const neckline = (x) => {                         // y of the neckline cut, or -1 if none
    const dx = Math.abs(x + 0.5 - ncx);
    if (t.top === 'sattai') return dx < nw * 1.05 ? shY + fw * (0.95 - dx / nw * 0.75) : -1;
    if (t.top === 'kurta') return dx < nw * 1.02 ? shY - 0.05 * fw + fw * 0.12 * (1 - sq(dx / nw)) : -1;
    if (t.top === 'hoodie') return dx < nw * 1.3 ? shY - 0.05 * fw + fw * 0.22 * Math.sqrt(1 - sq(dx / (nw * 1.3))) : -1;
    if (t.top === 'dhavani') return dx < nw * 1.6 ? shY - 0.14 * fw + fw * 0.42 * Math.sqrt(1 - sq(dx / (nw * 1.6))) : -1;
    return dx < nw * 1.4 ? shY - 0.12 * fw + fw * 0.38 * Math.sqrt(1 - sq(dx / (nw * 1.4))) : -1;
  };
  const yTop = (x) => {
    const tx = Math.abs(x + 0.5 - cx) / sw;
    return shY - 0.32 * fw + 0.5 * fw * tx + (tx > 0.72 ? 1.5 * fw * sq((tx - 0.72) / 0.28) : 0);
  };
  const torsoA = (x, y) => {
    const tx = Math.abs(x + 0.5 - cx) / sw;
    if (tx > 1) return 0;
    return clamp(y + 1.5 - yTop(x), 0, 1);
  };
  paint((u, v, x, y) => {
    const tx = Math.abs(x + 0.5 - cx) / sw;
    if (tx > 1) return 0;
    const nl = neckline(x);
    const yt = Math.max(yTop(x), nl);
    return clamp(y + 1.5 - yt, 0, 1);
  }, (u, v, x, y) => {
    const nx = clamp((x + 0.5 - cx) / sw, -1, 1);
    const ny = -0.75 * Math.exp(-(y + 0.5 - yTop(x)) / (0.3 * fw));
    let val = clothVal(t.cloth, nx * 0.9, ny);
    const dx = Math.abs(x + 0.5 - ncx);
    val *= 1 - 0.35 * (1 - sstep(nw * 0.8, nw * 1.8, dx)) * (1 - sstep(shY, shY + 0.6 * fw, y));
    val *= 0.94 + 0.12 * noise(x * 0.05, y * 0.12);
    return clamp(val, 0, 1);
  });

  const dark = t.cloth < 0.5;
  const trim = dark ? Math.min(1, t.cloth + 0.32) : t.cloth * 0.45;
  if (t.top === 'tee' || t.top === 'hoodie' || t.top === 'dhavani') {
    paint((u, v, x, y) => {
      const nl = neckline(x);
      if (nl < 0) return 0;
      const d = y + 0.5 - nl;
      return d >= -0.5 && d < 0.075 * fw ? 1 : 0;
    }, t.top === 'dhavani' ? 0.75 : trim, null, t.top === 'dhavani' ? A.GOLD : 0);
  }
  if (t.top === 'kurta') {
    paint((u, v, x, y) => {
      const nl = neckline(x);
      const dx = x + 0.5 - ncx;
      const band = nl > 0 && y + 0.5 >= nl - 0.5 && y + 0.5 < nl + 0.16 * fw ? 1 : 0;
      const placket = Math.abs(dx - 0.05 * fw) < 0.1 * fw && y > shY && y < shY + 1.2 * fw ? 1 : 0;
      return Math.max(band, placket * 0.75);
    }, trim);
    for (let b = 0; b < 3; b++) {
      const by = shY + (0.35 + b * 0.32) * fw, bxx = ncx + 0.05 * fw;
      paint((u, v, x, y) => aa((Math.hypot(x + 0.5 - bxx, y + 0.5 - by) - 0.05 * fw) / fw), dark ? 0.95 : 0.1);
    }
  }
  if (t.top === 'sattai') {
    // the veshti-sattai shirt: a crisp collar, a placket, a chest pocket with a pen
    const pk = -t.drape;
    const pkx = ncx + pk * 0.95 * fw, pky = shY + 0.42 * fw;
    paint((u, v, x, y) => {
      const dx = Math.abs(x + 0.5 - pkx), dy = y + 0.5 - pky;
      const edge = (Math.abs(dx - 0.32 * fw) < 0.7 && dy > 0) || (Math.abs(dy) < 0.6 && dx < 0.32 * fw);
      return edge ? 0.8 : 0;
    }, dark ? t.cloth + 0.25 : t.cloth * 0.55);
    const penX = pkx + pk * 0.12 * fw;
    paint((u, v, x, y) => (Math.abs(x + 0.5 - penX) < 0.055 * fw && y + 0.5 > pky - 0.3 * fw && y + 0.5 < pky + 0.35 * fw ? 1 : 0),
      (u, v, x, y) => (y + 0.5 < pky - 0.12 * fw ? 0.9 : 0.12), null, (u, v, x, y) => (y + 0.5 < pky - 0.12 * fw ? A.GOLD : 0));
    for (const k of [-1, 1]) {
      const pts = [ncx + k * nw * 0.95, shY - 0.3 * fw, ncx + k * nw * 2.0, shY + 0.32 * fw, ncx + k * 0.12 * fw, shY + 0.8 * fw];
      const inside = (x, y) => {
        const [ax, ay, bx2, by2, cx2, cy2] = pts;
        const d1 = (x - bx2) * (ay - by2) - (ax - bx2) * (y - by2);
        const d2 = (x - cx2) * (by2 - cy2) - (bx2 - cx2) * (y - cy2);
        const d3 = (x - ax) * (cy2 - ay) - (cx2 - ax) * (y - ay);
        const neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
        return !(neg && pos);
      };
      const collarTone = clamp(t.cloth * 1.1 + 0.08, 0, 1);
      paint((u, v, x, y) => (inside(x + 0.5, y + 0.5) ? 1 : 0), (u, v, x, y) => {
        const nx = clamp((x + 0.5 - cx) / sw, -1, 1);
        return clothVal(collarTone, nx + k * 0.3, -0.4);
      });
      paint((u, v, x, y) => {
        const d = Math.min(sdSeg(x + 0.5, y + 0.5, pts[0], pts[1], pts[2], pts[3]), sdSeg(x + 0.5, y + 0.5, pts[2], pts[3], pts[4], pts[5]));
        return clamp(1.2 - d, 0, 1);
      }, 0.04);
    }
    paint((u, v, x, y) => (Math.abs(x + 0.5 - ncx) < 0.6 && y > shY + 0.8 * fw ? 1 : 0), 0.06);
  }
  if (t.top === 'hoodie') {
    for (const k of [-1, 1]) {
      const sx = ncx + k * nw * 0.7;
      const pts = [sx, shY + 0.1 * fw, sx + k * 0.06 * fw, shY + 0.7 * fw, sx + k * 0.02 * fw, H + 4];
      paint((u, v, x, y) => clamp(1.4 - sdStroke(x + 0.5, y + 0.5, pts, 0), 0, 1), 0.82);
    }
  }

  // ── 5b. dhavani (half-saree): a silk drape across the chest, zari border along its edge
  if (t.top === 'dhavani') {
    const k = t.drape;
    const ax = ncx + k * nw * 0.7, ay = shY - 0.3 * fw;
    const ex = ncx - k * 2.1 * fw, ey = H + 0.4 * fw;
    const dxl = ex - ax, dyl = ey - ay, len = Math.hypot(dxl, dyl);
    let sgn = 1;
    const sdRaw = (x, y) => ((x - ax) * dyl - (y - ay) * dxl) / len;
    if (sdRaw(ncx + k * 2 * fw, H) < 0) sgn = -1;
    const sd = (x, y) => sgn * sdRaw(x + 0.5, y + 0.5);       // > 0 on the draped side
    const zari = 0.17 * fw, stripe0 = 0.21 * fw, stripe1 = 0.28 * fw;
    paint((u, v, x, y) => Math.min(torsoA(x, y), clamp(sd(x, y) + 0.5, 0, 1)), (u, v, x, y) => {
      const d = sd(x, y);
      const nx = clamp((x + 0.5 - cx) / sw, -1, 1);
      if (d < zari) return clamp(0.7 + 0.3 * hash2(x * 3, y) * (((x + y) & 3) === 0 ? 1 : 0.4), 0, 1);
      if (d > stripe0 && d < stripe1) return 0.62;
      const fold = 0.5 + 0.5 * Math.sin(d * 0.9 + 2.5 * noise(x * 0.08, y * 0.08));
      return clamp(clothVal(t.drapeTone, nx * 0.8, -0.2) * (0.78 + 0.32 * fold), 0, 1);
    }, null, (u, v, x, y) => {
      const d = sd(x, y);
      return d < zari ? A.GOLD : d > stripe0 && d < stripe1 ? t.dhavaniStripe : 0;
    });
  }

  // ── 5c. chain / rudraksha mala ────────────────────────────────────
  if (t.neck !== 'none') {
    const rud = t.neck === 'rudraksha';
    const drop = rud ? 0.66 : masc ? 0.5 : 0.42;
    const lx = ncx - nw * 1.02, rx = ncx + nw * 1.02, ey = shY - 0.22 * fw;
    const my = shY + drop * fw;
    const path = bez(lx, ey, ncx, 2 * my - ey, rx, ey, 18);
    if (rud) {
      const beads = [];
      let accl = 0;
      for (let j = 0; j < path.length / 2 - 1; j++) {
        const sx = path[2 * j], sy = path[2 * j + 1], tx = path[2 * j + 2], ty = path[2 * j + 3];
        const seg = Math.hypot(tx - sx, ty - sy);
        const step = 0.15 * fw;
        for (let d = (step - accl % step) % step; d < seg; d += step) beads.push(sx + (tx - sx) * d / seg, sy + (ty - sy) * d / seg);
        accl += seg;
      }
      const br = 0.06 * fw;
      for (let j = 0; j < beads.length; j += 2) {
        const qx = beads[j], qy = beads[j + 1];
        paint((u, v, x, y) => clamp(br + 0.5 - Math.hypot(x + 0.5 - qx, y + 0.5 - qy), 0, 1), (u, v, x, y) => {
          const d = Math.hypot(x + 0.5 - qx + ls * br * 0.35, y + 0.5 - qy + br * 0.35) / br;
          return clamp(0.85 - 0.45 * d, 0.3, 0.9);
        }, null, A.BEAD);
      }
    } else {
      const r0 = (masc ? 0.042 : 0.032) * fw;
      paint((u, v, x, y) => {
        const o = onPath(x + 0.5, y + 0.5, path);
        return clamp(r0 + 0.5 - o.d, 0, 1);
      }, (u, v, x, y) => {
        const o = onPath(x + 0.5, y + 0.5, path);
        return 0.72 + 0.28 * Math.max(0, Math.sin(o.along * 1.6));
      }, null, A.GOLD);
      if (!masc) {
        const qy = my + 0.12 * fw;
        fill((u, v, x, y) => (Math.hypot((x + 0.5 - ncx) / 0.75, y + 0.5 - qy) - 0.09 * fw) / fw, 0.95, null, A.STONE);
      }
    }
  }

  // ── 5d. thundu over one shoulder: cotton towel with a coloured border
  if (t.thundu) {
    const k = t.drape;
    const pts = [ncx + k * nw * 0.55, shY - 0.36 * fw, ncx + k * 1.0 * fw, shY - 0.12 * fw, ncx + k * 1.18 * fw, shY + 0.5 * fw, ncx + k * 1.24 * fw, H + 8];
    const hw = 0.32 * fw;
    paint((u, v, x, y) => {
      const o = onPath(x + 0.5, y + 0.5, pts);
      return clamp(hw - o.d + 0.5, 0, 1);
    }, (u, v, x, y) => {
      const o = onPath(x + 0.5, y + 0.5, pts);
      const q = o.side / hw;
      const aq = Math.abs(q);
      if (aq > 0.6 && aq < 0.8) return 0.66;
      const lam = Math.max(0, lambert(clamp(q, -1, 1) * 0.8 * k, -0.2, 0.6));
      const fold = 0.85 + 0.15 * Math.sin(o.along * 0.35 + q * 3);
      return clamp(0.62 * (0.55 + 0.6 * lam) * fold + 0.06 * hash2(x, y * 3), 0, 1);
    }, null, (u, v, x, y) => {
      const aq = Math.abs(onPath(x + 0.5, y + 0.5, pts).side / hw);
      return aq > 0.6 && aq < 0.8 ? t.thunduBorder : 0;
    });
  }

  // ── 6. lanyard + ID card ─────────────────────────────────────────
  if (t.lanyard) {
    const cardX = ncx - fw * 0.12 * t.drape, cardTop = H - 0.4 * fw, cw = 0.3 * fw;
    for (const k of [-1, 1]) {
      const x0 = ncx + k * nw * 1.08;
      const pts = [x0, Math.max(yTop(x0 - 0.5), neckline(x0 - 0.5)) + 0.5, cardX + k * 0.06 * fw, cardTop + 1];
      paint((u, v, x, y) => clamp(0.045 * fw + 0.5 - sdStroke(x + 0.5, y + 0.5, pts, 0), 0, 1), 0.55);
    }
    const inCard = (x, y, g) => Math.abs(x + 0.5 - cardX) < cw + g && y + 0.5 > cardTop - g;
    paint((u, v, x, y) => (inCard(x, y, 1) ? 1 : 0), 0.08);
    paint((u, v, x, y) => (inCard(x, y, 0) ? 1 : 0), 0.9);
    paint((u, v, x, y) => (Math.abs(x + 0.5 - (cardX - cw * 0.4)) < cw * 0.38 && y + 0.5 > cardTop + 0.1 * fw ? 1 : 0), 0.18);
    paint((u, v, x, y) => (Math.abs(x + 0.5 - (cardX + cw * 0.45)) < cw * 0.36 && y + 0.5 > cardTop + 0.12 * fw && (y & 3) === 0 ? 1 : 0), 0.4);
    paint((u, v, x, y) => (Math.abs(x + 0.5 - cardX) < 0.07 * fw && Math.abs(y + 0.5 - cardTop) < 0.06 * fw ? 1 : 0), 0.25);
  }

  // ── 7. ears ──────────────────────────────────────────────────────
  for (const k of [-1, 1]) {
    const ex = bx + k * 0.98 * cyw + s * 0.05, ey = 0.2;
    fill((u, v) => Math.hypot((u - ex) / 0.15, (v - ey) / 0.27) * 0.15 - 0.15, (u, v) => {
      const nx = clamp((u - ex) / 0.15, -1, 1) * 0.6 + k * 0.6;
      let val = skin * (0.45 + 1.0 * Math.max(0, lambert(nx, (v - ey) * 1.5, 0.6)));
      const inner = Math.hypot((u - ex - k * 0.02) / 0.08, (v - ey + 0.02) / 0.16);
      val *= 1 - 0.45 * Math.exp(-inner * inner * 1.5);
      return clamp(val, 0, 1);
    }, [ex - 0.2, ey - 0.32, ex + 0.2, ey + 0.32]);
  }

  // ── 8. face: height field → normals → key light ──────────────────
  const EX = 0.41, EYE_V = 0;
  const bumps = [
    // [u0, depth, v, sigma_u, sigma_v, amp]
    [0, 0.95, 0.5, 0.12 * t.nose, 0.1, 0.17],              // nose tip
    [-0.13 * t.nose, 0.82, 0.54, 0.07, 0.06, 0.07],         // alae
    [0.13 * t.nose, 0.82, 0.54, 0.07, 0.06, 0.07],
    [-EX, 0.5, 0.0, 0.2, 0.12, -0.08],                      // eye sockets
    [EX, 0.5, 0.0, 0.2, 0.12, -0.08],
    [-0.38, 0.55, -0.22, 0.26, 0.07, 0.06],                 // brow ridge
    [0.38, 0.55, -0.22, 0.26, 0.07, 0.06],
    [-0.6, 0.4, 0.34, 0.17, 0.16, 0.07],                    // cheekbones
    [0.6, 0.4, 0.34, 0.17, 0.16, 0.07],
    [0, 0.78, 0.76, 0.2 * t.mouthW / 0.26, 0.05, 0.05 * t.lip], // upper lip
    [0, 0.76, 0.9, 0.18 * t.mouthW / 0.26, 0.06, 0.06 * t.lip], // lower lip
    [0, 0.72, 1.01, 0.14, 0.035, -0.04],                    // mentolabial groove
    [0, 0.7, 1.16, 0.2, 0.11, 0.07],                        // chin
  ].map((b) => [P(b[0], b[1]), b[2], b[3], b[4], b[5]]);
  const noseX = P(0, 0.9);

  const fb = [-1.3, -1.35, 1.3, 1.5];
  const c4 = [toScreen(fb[0], fb[1]), toScreen(fb[2], fb[1]), toScreen(fb[0], fb[3]), toScreen(fb[2], fb[3])];
  const fx0 = Math.max(1, Math.floor(Math.min(...c4.map((c) => c[0]))));
  const fx1 = Math.min(W - 2, Math.ceil(Math.max(...c4.map((c) => c[0]))));
  const fy0 = Math.max(1, Math.floor(Math.min(...c4.map((c) => c[1]))));
  const fy1 = Math.min(H - 2, Math.ceil(Math.max(...c4.map((c) => c[1]))));
  const Hf = new Float32Array(N);
  const Fa = new Float32Array(N);                       // face coverage
  for (let y = fy0 - 1; y <= fy1 + 1; y++) {
    for (let x = fx0 - 1; x <= fx1 + 1; x++) {
      const i = y * W + x, u = U[i], v = V[i];
      const r = faceR(u, v);
      Fa[i] = clamp(0.5 - (r - 1) * fw, 0, 1);
      let h = Math.sqrt(Math.max(0, 1 - r * r)) * 0.9;
      if (r < 1.02) {
        for (const b of bumps) h += b[4] * Math.exp(-sq((u - b[0]) / b[2]) - sq((v - b[1]) / b[3]));
        const nb = sstep(-0.15, 0.1, v) * (1 - sstep(0.45, 0.55, v));
        const ridgeX = mix(P(0, 0.62), noseX, clamp((v + 0.1) / 0.6, 0, 1));
        h += (0.06 + 0.1 * clamp(v + 0.1, 0, 0.6)) * nb * Math.exp(-sq((u - ridgeX) / (0.085 * t.nose)));
      }
      Hf[i] = h;
    }
  }
  const lipTop = (u0) => 0.8 - 0.065 * t.lip * (1 - sq(u0 / t.mouthW)) + 0.02 * Math.exp(-sq(u0 / 0.05));
  const lipBot = (u0) => 0.8 + 0.085 * t.lip * (1 - sq(u0 / (t.mouthW * 0.92)));
  const mouthY = (u0) => 0.8 - 0.035 * t.smile * sq(u0 / t.mouthW) + 0.008 * t.smile;
  const mouthX = P(0, 0.76);

  for (let y = fy0; y <= fy1; y++) {
    for (let x = fx0; x <= fx1; x++) {
      const i = y * W + x;
      const a = Fa[i];
      if (a <= 0) continue;
      const u = U[i], v = V[i];
      const dhx = (Hf[i + 1] - Hf[i - 1]) * fw * 0.5;
      const dhy = (Hf[i + W] - Hf[i - W]) * fw * 0.5;
      let nx = -dhx, ny = -dhy, nz = 1;
      const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
      const lam = lambert(nx, ny, nz);
      let shade = 0.6 + 0.4 * Math.pow(clamp((lam + 0.15) / 1.1, 0, 1), 1.2);   // more fill: the face must read on a dark plate
      let alb = skin;
      const lu = (u - mouthX) / fsc(u - mouthX);
      if (Math.abs(lu) < t.mouthW) {
        if (v > lipTop(lu) && v < mouthY(lu)) alb *= 0.55;
        else if (v >= mouthY(lu) && v < lipBot(lu)) alb *= 0.66 + 0.25 * Math.exp(-sq(lu / 0.1) - sq((v - 0.86) / 0.03));
      }
      for (const k of [-1, 1]) {
        const ec = P(k * EX, 0.5);
        alb *= 1 - 0.1 * Math.exp(-sq((u - ec) / 0.25) - sq((v - 0.04) / 0.11));
      }
      const dn = (u - noseX) * -ls;
      if (dn > 0 && v > 0.05 && v < 0.62) {
        const reach = 0.06 + 0.22 * clamp((v - 0.05) / 0.5, 0, 1);
        shade *= 1 - 0.5 * (1 - sstep(reach * 0.6, reach, dn)) * sstep(0.05, 0.25, v) * (1 - sstep(0.52, 0.62, v));
      }
      shade *= 1 - 0.35 * Math.exp(-sq((u - P(0, 0.85)) / 0.12) - sq((v - 0.63) / 0.04));
      if (t.facial === 'stubble' || t.facial === 'beard') {
        const fu = Math.abs((u - P(0, 0.7)) / cyw);
        const line = fu > 0.92 ? 0.12 : mix(1.0, 0.5, sstep(0.2, 0.75, fu)) - (fu > 0.75 ? (fu - 0.75) * 2.2 : 0);
        const mouthHole = Math.hypot(lu / (t.mouthW + 0.04), (v - 0.83) / 0.11) < 1;
        const mous = v > 0.63 && v < lipTop(clamp(lu, -t.mouthW, t.mouthW)) + 0.01 && Math.abs(lu) < t.mouthW + 0.06;
        if ((v > line || mous) && !mouthHole) {
          const g = hash2(x * 3 + 1, y * 7 + 2);
          if (t.facial === 'stubble') alb *= g < 0.5 ? 0.58 : 0.82;
          else alb = mix(alb, hairAlb * 1.4, 0.92) * (g < 0.4 ? 0.8 : 1.15);
        }
      }
      const hlv = H_.hl(uf(u));
      shade *= 1 - 0.3 * (1 - sstep(hlv, hlv + 0.14, v)) * (v > hlv ? 1 : 0);
      const rim = 0.12 * Math.pow(1 - nz, 3) * (nx * ls < 0 ? 1 : 0);
      const val = clamp(alb * shade * 1.42 + rim, 0, 1);
      L[i] += (val - L[i]) * a;
      M[i] += (1 - M[i]) * a;
      if (a > 0.5) AC[i] = 0;
    }
  }

  // ── 9. features ──────────────────────────────────────────────────
  const skinAt = (i) => L[i];
  for (const k of [-1, 1]) {
    const ec = P(k * EX, 0.5), ew = 0.205 * t.eye * fsc(k), eh = 0.095 * t.eye;
    const inner = k * -1;
    const lidUp = (q) => EYE_V - eh * (1 - q * q) * 1.15 - eh * 0.25 * q * inner;
    const lidLo = (q) => EYE_V + eh * (1 - q * q) * 0.8;
    const bb = [ec - ew * 1.6, -0.25, ec + ew * 1.6, 0.2];
    paint((u, v) => {
      const q = (u - ec) / ew;
      if (Math.abs(q) >= 1) return 0;
      return v > lidUp(q) && v < lidLo(q) ? 1 : 0;
    }, (u, v, x, y, i) => {
      const irisX = ec + s * 0.05;
      const d = Math.hypot((u - irisX) / fsc(k), v - 0.004);
      if (d < eh * 1.18) {
        const hl = Math.hypot(u - (irisX + ls * eh * 0.35), v + eh * 0.35);
        return hl < eh * 0.3 ? 0.95 : 0.03;
      }
      return clamp(skinAt(i) * 0.45, 0.22, 0.34);     // eyes read as dark almonds with a spark
    }, bb);
    const lash = [];
    for (let j = 0; j <= 12; j++) { const q = -1 + (2 * j) / 12; lash.push(ec + q * ew, lidUp(q)); }
    if (t.kajal) lash.push(ec + k * ew * 1.28, lidUp(k) - eh * 0.75);
    fill((u, v) => sdStroke(u, v, lash, t.kajal ? 0.042 : 0.032, t.kajal ? 0.022 : 0.016), 0.02, bb);
    const low = [];
    for (let j = 1; j <= 11; j++) { const q = -1 + (2 * j) / 12; low.push(ec + q * ew, lidLo(q)); }
    paint((u, v) => aa(sdStroke(u, v, low, t.kajal ? 0.018 : 0.01)) * 0.7, 0.08, bb);
    const cr = [];
    for (let j = 1; j <= 9; j++) { const q = -1 + (2 * j) / 10; cr.push(ec + q * ew * 1.05, lidUp(q) - eh * 0.85); }
    paint((u, v) => aa(sdStroke(u, v, cr, 0.01)) * 0.25, 0.2, bb);

    const bw = t.brow, by0 = -0.25;
    const b0x = P(k * 0.12, 0.55), b2x = P(k * 0.68, 0.45);
    const b1x = P(k * 0.42, 0.52);
    const brow = bez(b0x, by0 + 0.02, b1x, by0 - 0.1 - t.browArch, b2x, by0 + 0.03, 10);
    const bbB = [Math.min(b0x, b2x) - 0.12, -0.45, Math.max(b0x, b2x) + 0.12, -0.05];
    fill((u, v, x, y) => sdStroke(u, v, brow, 0.06 * bw, 0.028 * bw) + (hash2(x, y) - 0.5) * 0.012, (u, v, x, y) => 0.03 + 0.08 * hash2(x + 9, y), bbB);
  }

  for (const k of [-1, 1]) {
    const nx = P(k * 0.095 * t.nose, 0.86), ny = 0.575;
    fill((u, v) => Math.hypot((u - nx) / 0.05, (v - ny) / 0.026) * 0.026 - 0.026, 0.05, [nx - 0.1, ny - 0.06, nx + 0.1, ny + 0.06]);
    const wing = bez(P(k * 0.15 * t.nose, 0.8), 0.43, P(k * 0.23 * t.nose, 0.8), 0.53, P(k * 0.12 * t.nose, 0.82), 0.6, 8);
    paint((u, v) => aa(sdStroke(u, v, wing, 0.014)) * (k === ls ? 0.4 : 0.8), 0.1, [P(k * 0.25, 0.8) - 0.15, 0.38, P(k * 0.25, 0.8) + 0.15, 0.66]);
  }

  {
    const mpts = [];
    for (let j = 0; j <= 14; j++) { const q = -1 + (2 * j) / 14; const lu = q * t.mouthW; mpts.push(mouthX + lu * fsc(lu), mouthY(lu)); }
    fill((u, v) => sdStroke(u, v, mpts, 0.026, 0.026), 0.03, [mouthX - 0.4, 0.6, mouthX + 0.4, 1.0]);
    for (const k of [-1, 1]) {
      const qx = mouthX + k * t.mouthW * fsc(k) * 1.02, qy = mouthY(t.mouthW);
      fill((u, v) => Math.hypot(u - qx, v - qy) - 0.022, 0.08, [qx - 0.06, qy - 0.06, qx + 0.06, qy + 0.06]);
    }
  }

  // ── forehead marks: vibhuti, santhanam, kumkum, pottu
  const kx = P(0, 0.6);
  const fbb = [P(-0.6, 0.5), -0.75, P(0.6, 0.5), -0.15];
  const dot = (cxx, cyy, rx, ry, val, acc) => fill((u, v) => Math.hypot((u - cxx) / rx, (v - cyy) / ry) * Math.min(rx, ry) - Math.min(rx, ry), val, [cxx - rx - 0.05, cyy - ry - 0.05, cxx + rx + 0.05, cyy + ry + 0.05], acc);
  if (t.mark === 'vibhuti') {
    for (let j = 0; j < 3; j++) {
      const vy = -0.37 - j * 0.105;
      const pts = [P(-0.44, 0.5), vy + 0.012, P(-0.2, 0.6), vy - 0.004, P(0.2, 0.6), vy - 0.004, P(0.44, 0.5), vy + 0.012];
      paint((u, v, x, y) => aa(sdStroke(u, v, pts, 0.03, 0.026)) * (0.8 + 0.2 * hash2(x, y)), 0.97, fbb, A.ASH);
    }
    dot(kx, -0.475, 0.05, 0.055, 0.8, A.KUMKUM);
  } else if (t.mark === 'santhanam') {
    dot(kx, -0.38, 0.075, 0.1, 0.85, A.SANDAL);
    dot(kx, -0.37, 0.036, 0.04, 0.75, A.KUMKUM);
  } else if (t.mark === 'kumkum') {
    dot(kx, -0.37, 0.034, 0.09, 0.75, A.KUMKUM);
  } else if (t.mark === 'pottu' || t.mark === 'pottu-vibhuti') {
    if (t.mark === 'pottu-vibhuti') {
      const pts = [P(-0.16, 0.6), -0.43, P(0.16, 0.6), -0.43];
      paint((u, v) => aa(sdStroke(u, v, pts, 0.028, 0.028)), 0.95, fbb, A.ASH);
    }
    dot(kx, -0.29, 0.056, 0.056, 0.8, A.KUMKUM);
  }

  // the meesai: thick, full, past the corners of the mouth (murukku: twirled up)
  if (t.facial === 'meesai' || t.facial === 'murukku' || t.facial === 'beard') {
    const tw = t.facial === 'murukku';
    const mw = t.mouthW + 0.1;
    const reach = tw ? 1.42 : 1.12;
    paint((u, v, x, y) => {
      const q = (u - mouthX) / fsc(u - mouthX) / mw;
      const aq = Math.abs(q);
      if (aq > reach + 0.05) return 0;
      let c, h;
      if (tw) {
        c = 0.71 + 0.06 * aq * aq - 0.2 * sstep(0.85, 1.42, aq) - 0.04 * sstep(1.2, 1.42, aq);
        h = 0.085 * (1 - 0.72 * sstep(0.55, 1.42, aq));
      } else {
        c = 0.705 + 0.075 * Math.pow(aq, 2.2);
        h = 0.09 * (1 - 0.6 * Math.pow(clamp(aq / 1.12, 0, 1), 3));
      }
      const notch = 0.018 * Math.exp(-sq(q / 0.08));            // the philtrum parting
      const feather = (hash2(x * 5, y * 3) - 0.5) * 0.022;
      const dTop = (c - h + notch) - v + feather, dBot = v - (c + h);
      return Math.min(aa(dTop), aa(dBot), aa(aq - reach));
    }, (u, v, x, y) => (hash2(x, y * 2) < 0.22 ? 0.13 : 0.03), [mouthX - 0.6, 0.5, mouthX + 0.6, 0.92], A.MEESAI);
  }
  if (t.facial === 'beard') {
    paint((u, v) => {
      if (v < 0.55) return 0;
      const r = faceR(u, v);
      if (r < 1) return 0;
      return aa((r - 1.07 - 0.05 * noise(u * 9, v * 9)) * 0.9) * sstep(0.45, 0.8, v);
    }, (u, v, x, y) => (hash2(x, y) < 0.35 ? 0.18 : 0.06), [-1.3, 0.4, 1.3, 1.6], A.BEARD);
  }

  // mookuthi (nose stud): a single gold spark
  if (t.stud) {
    const sx = P(t.side * 0.15 * t.nose, 0.82), sy = 0.5;
    fill((u, v) => Math.hypot(u - sx, v - sy) - 0.034, 1, [sx - 0.06, sy - 0.06, sx + 0.06, sy + 0.06], A.STONE);
  }

  // ── 10. hair (front / top) ───────────────────────────────────────
  paint(hairAlpha, hairVal, [-1.6, -1.6, 1.6, Math.min(H_.sideV + 0.1, 3.6)], A.HAIR);
  if (t.hair === 'sidepart') {
    const ptx = part * 0.36;
    const pts = [P(ptx, 0.3), -0.64, P(ptx * 0.95, 0.2), -0.95, P(ptx * 0.85, 0), -1.2];
    paint((u, v) => aa(sdStroke(u, v, pts, 0.016, 0.008)) * 0.8, 0.42, [-0.8, -1.3, 0.8, -0.5]);
  }
  if (H_.centre) {
    const pts = [P(0, 0.5), -0.72, P(0, 0.3), -0.95, bx * 0.5, -1.12];
    paint((u, v) => aa(sdStroke(u, v, pts, 0.013, 0.006)) * 0.75, 0.36, [-0.4, -1.3, 0.4, -0.6]);
  }
  if (t.hair === 'long') {
    const k = side;
    const pts = bez(bx + k * 0.92, 0.2, bx + k * 1.18, 1.5, bx + k * 1.0, 3.2, 12);
    paint((u, v) => {
      const o = onPath(u, v, pts);
      const w = 0.17 + 0.08 * Math.sin(o.along * 3);
      return aa(o.d - w);
    }, (u, v) => {
      const o = onPath(u, v, pts);
      const lam = Math.max(0, lambert(clamp(o.side / 0.25, -1, 1) * 0.8, 0, 0.6));
      return clamp(hairAlb * (0.5 + 0.8 * lam) + Math.pow(lam, 2) * 0.34 * (0.5 + 0.5 * Math.sin(o.side * 70 + o.along * 4)), 0, 1);
    }, [bx + k * 0.6, 0, bx + k * 1.5, 3.5], A.HAIR);
  }
  let plaitPts = null;
  if (H_.plait) {
    const k = side;
    plaitPts = bez(bx + k * 0.86, 0.45, bx + k * 1.22, 1.5, bx + k * 1.05, 3.4, 14);
    paint((u, v) => {
      const o = onPath(u, v, plaitPts);
      const w = 0.15 - 0.03 * clamp(o.along / 3, 0, 1);
      return aa(o.d - w);
    }, (u, v) => {
      const o = onPath(u, v, plaitPts);
      const seg = 0.19;
      const f = ((o.along + Math.abs(o.side) * 0.7) / seg) % 1;
      const lam = Math.max(0, lambert(clamp(o.side / 0.15, -1, 1) * 0.7, -0.3, 0.6));
      const lobe = Math.sin(f * Math.PI);
      return clamp(hairAlb * (0.4 + 0.9 * lam * lobe) + Math.pow(lam, 2) * 0.32 * lobe * lobe + (f < 0.12 ? -0.05 : 0), 0, 1);
    }, [bx + k * 0.5, 0.2, bx + k * 1.6, 3.6], A.HAIR);
  }

  if (t.hood) {
    paint((u, v) => {
      if (v > 0.55) return 0;
      const r = skullR(u, v, 1.36);
      const band = Math.max(r - 1, (1 - r) - 0.14);
      return aa(band * 1.2) * sstep(0.55, 0.2, v);
    }, (u, v) => {
      const nx = clamp((u - bx) / 1.6, -1, 1);
      return clothVal(t.cloth, nx, clamp((v + 0.3) / 1.6, -1, 0.5)) * 1.05;
    });
  }

  // ── 11. jasmine (malli poo) ─────────────────────────────────────
  const bud = (bxu, bvv, r) => {
    fill((u, v) => Math.hypot(u - bxu, (v - bvv) * 0.85) - r - 0.016, 0.02, [bxu - r - 0.05, bvv - r - 0.05, bxu + r + 0.05, bvv + r + 0.05]);
    fill((u, v) => Math.hypot(u - bxu, (v - bvv) * 0.85) - r, (u, v) => {
      const d = Math.hypot(u - bxu - ls * r * 0.3, v - bvv + r * 0.3) / r;
      return clamp(1 - 0.2 * d * d, 0.7, 1);
    }, [bxu - r - 0.05, bvv - r - 0.05, bxu + r + 0.05, bvv + r + 0.05], A.JASMINE);
  };
  if (t.jasmine) {
    if (H_.bun) {
      for (let j = 0; j <= 9; j++) {
        const a = Math.PI * (0.05 + 0.9 * j / 9);
        bud(bx * 1.4 + Math.cos(a) * 0.44, -0.98 + Math.sin(a) * 0.05 - 0.1 * Math.sin(a), 0.058);
      }
    } else if (plaitPts) {
      const k = side;
      const path = bez(bx + k * 0.93, -0.35, bx + k * 1.45, 1.3, bx + k * 1.28, 2.9, 19);
      for (let j = 0; j < 20; j++) {
        const q = j / 19;
        bud(path[j * 2] + (j % 2 ? 0.04 : -0.04) * k, path[j * 2 + 1], 0.058 - 0.012 * q);
      }
    } else {
      const k = -side;
      const path = bez(bx + k * 0.95, -0.7, bx + k * 1.42, 0.9, bx + k * 1.3, 2.7, 19);
      for (let j = 0; j <= 19; j++) bud(path[j * 2] + (j % 2 ? 0.035 : -0.035), path[j * 2 + 1], 0.056);
    }
  }

  // ── 12. accessories ──────────────────────────────────────────────
  // jhumka (bell earrings) / kadukkan (a man's gold stud)
  if (t.earrings) {
    for (const k of [-1, 1]) {
      const ex = bx + k * 0.98 * cyw + s * 0.05, ey = 0.46;
      if (k * s > 0.15) continue;
      const goldV = (cxx, cyy, rr) => (u, v) => {
        const nx = clamp((u - cxx) / rr, -1, 1), ny = clamp((v - cyy) / rr, -1, 1);
        return clamp(0.55 + 0.45 * Math.max(0, lambert(nx, ny, Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)))), 0, 1);
      };
      if (masc) {
        fill((u, v) => Math.hypot(u - ex, v - ey) - 0.034, goldV(ex, ey, 0.034), [ex - 0.08, ey - 0.08, ex + 0.08, ey + 0.08], A.GOLD);
        continue;
      }
      fill((u, v) => Math.hypot(u - ex, v - ey) - 0.036, goldV(ex, ey, 0.036), [ex - 0.08, ey - 0.08, ex + 0.08, ey + 0.08], A.STONE);
      const dt = ey + 0.1, db = ey + 0.25;
      fill((u, v) => sdSeg(u, v, ex, ey, ex, dt) - 0.012, 0.7, [ex - 0.05, ey, ex + 0.05, dt], A.GOLD);
      // the bell: narrow at the top, flaring to the rim
      fill((u, v) => {
        if (v < dt - 0.02 || v > db + 0.02) return 1;
        const f = sstep(dt, db, v);
        const w = 0.028 + 0.075 * Math.pow(f, 0.6);
        return Math.max(Math.abs(u - ex) - w, dt - v, v - db);
      }, goldV(ex, (dt + db) / 2, 0.1), [ex - 0.14, dt - 0.04, ex + 0.14, db + 0.04], A.GOLD);
      for (let j = -2; j <= 2; j++) {
        const qx = ex + j * 0.036, qy = db + 0.035 + 0.012 * (2 - Math.abs(j));
        fill((u, v) => Math.hypot(u - qx, v - qy) - 0.017, 0.9, [qx - 0.04, qy - 0.04, qx + 0.04, qy + 0.04], A.GOLD);
      }
    }
  }

  if (t.specs !== 'none') {
    const rect = t.specs === 'rect';
    const fr = rect ? 0.036 : 0.028;
    const FRAME = 0.42;            // frames catch the lamp light: a mid-tone ring, not a hole in the face
    const lens = [];
    for (const k of [-1, 1]) {
      const ec = P(k * EX, 0.62), w = (rect ? 0.24 : 0.2) * fsc(k), hh = rect ? 0.14 : 0.2;
      lens.push([ec, w, hh, k]);
      const sdLens = (u, v) => {
        if (!rect) return Math.hypot((u - ec) / w, (v - 0.02) / hh) * Math.min(w, hh) - Math.min(w, hh);
        const qx = Math.abs(u - ec) - w + 0.06, qy = Math.abs(v - 0.0) - hh + 0.06;
        return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - 0.06;
      };
      paint((u, v) => (sdLens(u, v) < -fr ? 0.3 * sstep(0.04, 0, Math.abs((u - ec) + (v - 0.02) * 0.9 + ls * 0.04) - 0.03) : 0), 0.98, [ec - w - 0.1, -0.3, ec + w + 0.1, 0.3]);
      fill((u, v) => Math.abs(sdLens(u, v)) - fr * (rect && v < -0.05 ? 1.35 : 1), FRAME, [ec - w - 0.1, -0.3, ec + w + 0.1, 0.3]);
    }
    const [l, r] = lens[0][3] < 0 ? [lens[0], lens[1]] : [lens[1], lens[0]];
    const bridge = bez(l[0] + l[1], -0.03, (l[0] + r[0]) / 2, -0.09, r[0] - r[1], -0.03, 6);
    fill((u, v) => sdStroke(u, v, bridge, fr * 0.8), FRAME, [l[0], -0.2, r[0], 0.1]);
    for (const q of [l, r]) {
      const k = q[3];
      if (k * s > 0.12) continue;
      const ex = bx + k * 0.98 * cyw;
      fill((u, v) => sdSeg(u, v, q[0] + k * q[1], -0.02, ex, 0.06) - fr * 0.8, FRAME, [Math.min(q[0], ex) - 0.3, -0.2, Math.max(q[0], ex) + 0.3, 0.2]);
    }
  }

  // over-ear headphones: cream, so they read against dark hair on a dark plate
  if (t.audio === 'headphones') {
    const R = H_.k * 1.08 + 0.06;
    paint((u, v) => {
      if (v > 0.15) return 0;
      const r = skullR(u, v, R);
      return aa(Math.abs(r - 1) * R - 0.06);
    }, (u, v) => {
      const nx = clamp((u - bx) / R, -1, 1);
      return 0.38 + 0.5 * Math.pow(Math.max(0, lambert(nx, -0.6, 0.5)), 2);
    }, [-1.6, -1.6, 1.6, 0.3]);
    for (const k of [-1, 1]) {
      const ex = bx + k * (H_.k * 1.02) * cyw, ey = 0.22;
      fill((u, v) => Math.hypot((u - ex) / 0.17, (v - ey) / 0.29) * 0.17 - 0.17, (u, v) => {
        const nx = clamp((u - ex) / 0.17, -1, 1), ny = clamp((v - ey) / 0.29, -1, 1);
        const rr = Math.hypot(nx, ny);
        return (rr > 0.78 ? 0.18 : 0.42) + 0.5 * Math.pow(Math.max(0, lambert(nx, ny, Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)))), 2);
      }, [ex - 0.2, ey - 0.33, ex + 0.2, ey + 0.33]);
    }
  } else if (t.audio === 'earphones') {
    for (const k of [-1, 1]) {
      if (k * s > 0.15) continue;
      const ex = bx + k * 0.93 * cyw + s * 0.05, ey = 0.27;
      const wire = bez(ex, ey + 0.05, ex + k * 0.05, 1.2, P(k * 0.25, 0) + k * 0.08, 2.9, 14);
      fill((u, v) => sdStroke(u, v, wire, 0.018), 0.9, [Math.min(ex, 0) - 0.4, ey, Math.max(ex, 0) + 0.4, 3.0]);
      fill((u, v) => Math.hypot(u - ex, v - ey) - 0.075, 0.95, [ex - 0.1, ey - 0.1, ex + 0.1, ey + 0.1]);
      paint((u, v) => aa(Math.abs(Math.hypot(u - ex, v - ey) - 0.075) - 0.012), 0.35, [ex - 0.12, ey - 0.12, ex + 0.12, ey + 0.12]);
    }
  }

  for (let i = 0; i < N; i++) { L[i] = clamp(L[i], 0, 1); M[i] = clamp(M[i], 0, 1); }
  return { w: W, h: H, lum: L, mask: M, acc: AC, px: { cx, eyeY, fw } };
}

// ───────────────────────────────────────────────────────── the plate
// Mango-leaf thoranam strung across the top of the doorway, with marigolds. Painted in front
// of the person into the same buffers.
function paintThoranam(sc, t) {
  const { w: W, h: H, lum: L, mask: M, acc: AC } = sc;
  const th = t.thoranam;
  const r = mulberry32((t.seed ^ 0x9e3779b9) >>> 0);
  const ropeY = (x) => 2.2 + th.sag * (1 - sq((x - W / 2) / (W / 2)));
  const put = (i, a, val, acc) => {
    if (!(a > 0)) return;
    if (a > 1) a = 1;
    L[i] += (val - L[i]) * a;
    M[i] += (1 - M[i]) * a;
    if (a > 0.5) AC[i] = acc;
  };
  // the rope
  for (let x = 0; x < W; x++) {
    const ry = ropeY(x + 0.5);
    for (let y = Math.max(0, Math.floor(ry - 2)); y <= Math.min(H - 1, Math.ceil(ry + 2)); y++) {
      put(y * W + x, clamp(1.1 - Math.abs(y + 0.5 - ry), 0, 1), 0.42, A.THREAD);
    }
  }
  const n = Math.round(W / th.pitch);
  const step = W / n;
  const items = [];
  for (let j = 0; j < n; j++) {
    const x = (j + 0.5) * step + (r() - 0.5) * 1.5;
    const flower = th.flowers && (j + Math.floor(th.phase * th.flowers)) % th.flowers === 0;
    items.push({ x, flower, tilt: (r() - 0.5) * 0.16 + (x - W / 2) / W * 0.1, len: th.len * (j % 2 ? 0.86 : 1) * (0.94 + 0.12 * r()), w: 6.2 + r() * 1.2, tone: r(), orange: r() < 0.45 });
  }
  // leaves first, flowers over the rope
  for (const it of items) {
    if (it.flower) continue;
    const ax = it.x, ay = ropeY(it.x) - 1.2;
    const dx0 = Math.sin(it.tilt), dy0 = Math.cos(it.tilt);
    const x0 = Math.max(0, Math.floor(ax - it.len * Math.abs(dx0) - it.w)), x1 = Math.min(W - 1, Math.ceil(ax + it.len * Math.abs(dx0) + it.w));
    const y1 = Math.min(H - 1, Math.ceil(ay + it.len + 2));
    for (let y = Math.max(0, Math.floor(ay)); y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const px = x + 0.5 - ax, py = y + 0.5 - ay;
        const along = px * dx0 + py * dy0, across = px * dy0 - py * dx0;
        const sN = along / it.len;
        if (sN < 0 || sN > 1.02) continue;
        // lanceolate: widest about a third down, a long pointed tip
        const prof = Math.pow(clamp(sN, 0, 1), 0.55) * Math.pow(clamp(1 - sN, 0, 1), 1.15) / 0.335;
        const hw = it.w / 2 * prof;
        const a = clamp(hw - Math.abs(across) + 0.5, 0, 1);
        if (a <= 0) continue;
        const val = 0.7 + 0.2 * it.tone;
        put(y * W + x, a, clamp(val, 0, 1), A.LEAF);
      }
    }
  }
  for (const it of items) {
    if (!it.flower) continue;
    const fx = it.x, fy = ropeY(it.x) + 4.2, rr = 5.4;
    for (let y = Math.max(0, Math.floor(fy - rr - 2)); y <= Math.ceil(fy + rr + 2); y++) {
      for (let x = Math.max(0, Math.floor(fx - rr - 2)); x <= Math.min(W - 1, Math.ceil(fx + rr + 2)); x++) {
        const dx = x + 0.5 - fx, dy = y + 0.5 - fy;
        const ang = Math.atan2(dy, dx);
        const edge = rr + 0.7 * Math.sin(ang * 9 + it.tone * 6);
        const d = Math.hypot(dx, dy);
        const a = clamp(edge - d + 0.5, 0, 1);
        if (a <= 0) continue;
        const ruffle = 0.5 + 0.5 * Math.sin(d * 2.4 + ang * 3);
        put(y * W + x, a, clamp(0.62 + 0.3 * ruffle - 0.15 * (d / rr), 0, 1), it.orange ? 14 : A.MARIGOLD);
      }
    }
  }
}

export function renderScene(t) {
  const sc = renderPortrait(t);
  const { cx, eyeY, fw } = sc.px;
  sc.kolam = { ...t.kolam, cx, cy: eyeY + 0.2 * fw };
  // hair falls away from the crown (or the parting): strand glyphs follow that direction
  const crownX = cx + (t.hair === 'sidepart' || t.hair === 'wavy' ? t.part * 0.34 * fw : 0);
  sc.hair = { tex: t.hair, cx: crownX, cy: eyeY - 1.75 * fw };
  sc.thoranam = { ...t.thoranam, seed: t.seed, light: t.light };
  return sc;
}

// The thoranam is drawn in character space, so the leaves come out as crisp ASCII leaves:
//      ~~~~~~~~~~~~~~~~~
//       |   %@%   |
//      /|\  @@@  /|\
//      (|)   %   (|)
//      \|/       \|/
//       v         v
function drawThoranam(codes, layer, cols, rows, th) {
  const r = mulberry32((th.seed ^ 0x9e3779b9) >>> 0);
  const set = (c, rr, ch, ly) => {
    if (c < 0 || c >= cols || rr < 0 || rr >= rows) return;
    const i = rr * cols + c;
    codes[i] = ch.charCodeAt(0); layer[i] = ly;
  };
  const ropeRow = () => 0;
  for (let c = 0; c < cols; c++) set(c, 0, c % 3 === 0 ? '-' : '~', LY.kaavi);
  const P = Math.max(4, Math.round(cols / 17));        // slot width in columns
  const wide = P >= 6;
  const n = Math.floor(cols / P);
  const off = Math.floor((cols - n * P) / 2);
  const baseLen = Math.max(4, Math.round(rows * (wide ? 0.105 : 0.1)));
  for (let j = 0; j < n; j++) {
    const xc = off + j * P + (P >> 1);
    const top = ropeRow(xc) + 1;
    const flower = th.flowers && (j + Math.floor(th.phase * th.flowers)) % th.flowers === 0;
    if (flower) {
      const ly = r() < 0.5 ? LY.manjal : LY.kaavi;
      set(xc - 1, top, '%', ly); set(xc, top, '@', ly); set(xc + 1, top, '%', ly);
      set(xc - 1, top + 1, '@', ly); set(xc, top + 1, '@', ly); set(xc + 1, top + 1, '@', ly);
      set(xc, top + 2, '%', ly);
      if (wide) { set(xc - 2, top + 1, '(', ly); set(xc + 2, top + 1, ')', ly); }
      continue;
    }
    const len = baseLen + (j % 2 ? -1 : 0) + (r() < 0.3 ? 1 : 0);
    set(xc, top, '|', LY.ilai);
    for (let k = 1; k < len; k++) {
      const rr = top + k;
      const f = k / len;                              // 0 at the stem, 1 at the tip
      let l, rt, mid = '|';
      if (f < 0.3) { l = '/'; rt = '\\'; }
      else if (f < 0.72) { l = '('; rt = ')'; }
      else { l = '\\'; rt = '/'; }
      if (wide && f >= 0.25 && f < 0.75) {            // broad middle: a two-column blade each side
        set(xc - 2, rr, l, LY.ilai); set(xc + 2, rr, rt, LY.ilai);
        set(xc - 1, rr, k % 2 ? '.' : ' ', LY.ilai); set(xc + 1, rr, k % 2 ? ' ' : '.', LY.ilai);
      } else {
        set(xc - 1, rr, l, LY.ilai); set(xc + 1, rr, rt, LY.ilai);
      }
      set(xc, rr, mid, LY.ilai);
    }
    set(xc, top + len, 'v', LY.ilai);
  }
}

// ───────────────────────────────────────────────────────── kolam (character space)
// A pulli kolam: rice-flour dots on a square lattice, each wrapped in a rounded diamond loop
// that crosses its neighbours' loops like the sikku line. Drawn with direction glyphs.
const KOLAM_GLYPH = ['-', '\\', '|', '/'];
function kolamAt(x, y, K, p, sx, sy) {
  const fx = (x - K.cx) / p, fy = (y - K.cy) / p;
  const i0 = Math.round(fx), j0 = Math.round(fy);
  const has = (i, j) => (K.shape === 'diamond' ? Math.abs(i) + Math.abs(j) <= K.n
    : K.shape === 'round' ? i * i + j * j <= K.n * K.n + 1 : true);
  let best = 1e9, gx = 0, gy = 0, dotD = 1e9;
  for (let j = j0 - 1; j <= j0 + 1; j++) {
    for (let i = i0 - 1; i <= i0 + 1; i++) {
      if (!has(i, j)) continue;
      const dx = fx - i, dy = fy - j;
      const ax = Math.abs(dx), ay = Math.abs(dy);
      const dd = Math.hypot(dx, dy);
      if (dd < dotD) dotD = dd;
      const se = Math.pow(Math.pow(ax, K.q) + Math.pow(ay, K.q), 1 / K.q);
      const g = Math.abs(se - K.r);
      if (g < best) {
        best = g;
        gx = Math.sign(dx) * Math.pow(ax + 1e-6, K.q - 1);
        gy = Math.sign(dy) * Math.pow(ay + 1e-6, K.q - 1);
      }
    }
  }
  if (dotD < 0.3 && Math.abs(fx - Math.round(fx)) * p < sx / 2 && Math.abs(fy - Math.round(fy)) * p < sy / 2 && has(Math.round(fx), Math.round(fy))) return 0x2022;   // •
  if (dotD * p < 0.9 * Math.max(sx, sy)) return 0;
  if (best > 1) return 0;
  const nl = Math.hypot(gx, gy) || 1, nx = gx / nl, ny = gy / nl;
  const ext = 0.5 * (Math.abs(nx) * sx + Math.abs(ny) * sy) / p;
  if (best > ext) return 0;
  let a = Math.atan2(nx, -ny);                                       // tangent angle, screen space
  if (a < 0) a += Math.PI;
  return KOLAM_GLYPH[Math.round(a / (Math.PI / 4)) % 4].charCodeAt(0);
}

// ───────────────────────────────────────────────────────── from an image (the Kalam tribute)
// Turns an RGBA image into an ink-on-paper scene for sceneToAscii: lum is INK DENSITY (0 = bare
// paper, 1 = solid ink), mask is the drawing's coverage (its alpha), so a white or transparent
// background maps to spaces. Alpha is composited onto white first. A local-contrast pass lifts
// the pencil work (eyes, smile lines, knuckles, hair strands) out of the flat washes.
// img: { width, height, data: RGBA bytes } — ImageData, or anything shaped like it.
export const KALAM_SRC = new URL('../assets/portrait/kalam-source.png', import.meta.url).href;
export const KALAM_CAPTION = 'Dr. A. P. J. Abdul Kalam · இராமேஸ்வரம் → ISRO → Rashtrapati Bhavan';

// a separable box blur, in place-safe (returns a new buffer)
function boxBlur(src, W, H, R) {
  const N = W * H, tmp = new Float32Array(N), out = new Float32Array(N);
  for (let y = 0; y < H; y++) {
    let acc = 0;
    for (let x = -R; x <= R; x++) acc += src[y * W + clamp(x, 0, W - 1)];
    for (let x = 0; x < W; x++) {
      tmp[y * W + x] = acc / (2 * R + 1);
      acc += src[y * W + Math.min(W - 1, x + R + 1)] - src[y * W + Math.max(0, x - R)];
    }
  }
  for (let x = 0; x < W; x++) {
    let acc = 0;
    for (let y = -R; y <= R; y++) acc += tmp[clamp(y, 0, H - 1) * W + x];
    for (let y = 0; y < H; y++) {
      out[y * W + x] = acc / (2 * R + 1);
      acc += tmp[Math.min(H - 1, y + R + 1) * W + x] - tmp[Math.max(0, y - R) * W + x];
    }
  }
  return out;
}

export function imageToScene(img, { local = 0.6, radius, blur = 1, crop } = {}) {
  const W = img.width, H = img.height, N = W * H, D = img.data;
  const L = new Float32Array(N), M = new Float32Array(N), AC = new Uint8Array(N), S = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = D[i * 4 + 3] / 255;
    // composite onto white, then perceptual luma of the (gamma-encoded) colour
    const r = D[i * 4] * a + 255 * (1 - a), g = D[i * 4 + 1] * a + 255 * (1 - a), b = D[i * 4 + 2] * a + 255 * (1 - a);
    const y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    L[i] = 1 - y;
    M[i] = a > 0.04 && y < 0.985 ? a : 0;         // near-white paper counts as background
    // "strand" weight: light, unsaturated, opaque pencil (silver hair, a white shirt), not skin
    const sat = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
    S[i] = a > 0.5 ? (1 - sstep(0.1, 0.2, sat)) * sstep(0.35, 0.6, y) : 0;
  }
  // soften the pencil grain a touch, then local contrast: ink + k·(ink − blur(ink)), a soft
  // unsharp mask at the scale of the features (eyes, smile lines, knuckles)
  const Ls = blur > 0 ? boxBlur(L, W, H, blur) : L;
  const R = radius ?? Math.max(2, Math.round(W / 40));
  const Bl = boxBlur(Ls, W, H, R);
  for (let i = 0; i < N; i++) L[i] = clamp(Ls[i] + local * (Ls[i] - Bl[i]), 0, 1) * (M[i] > 0 ? 1 : 0);
  const sc = { w: W, h: H, lum: L, mask: M, acc: AC, strand: boxBlur(S, W, H, 2), ink: true, px: { cx: W / 2, eyeY: H * 0.4, fw: W / 4 } };
  // tone for a pencil sketch, tuned on the Kalam source: airy washes, dark eyes and smile lines,
  // the white hair a light mass outlined by its silhouette (rim) with strand strokes in it
  sc.tone = { lo: 0.2, hi: 0.72, gamma: 1.6, punch: 0.8, edge: 0.7, floor: 0.12, rim: 0.9, stroke: 1, strokeMax: 0.9, dither: 0 };
  sc.ramp = ' .:-=+*#%@';
  sc.alt = sc.ramp;
  if (crop) Object.assign(sc, crop);
  return sc;
}

// Load an image (same origin) into a scene, at most `maxW` source pixels wide.
export function loadImageScene(src, { doc = globalThis.document, maxW = 420, ...sceneOpts } = {}) {
  return new Promise((resolve, reject) => {
    const im = new doc.defaultView.Image();
    im.decoding = 'async';
    im.onload = () => {
      try {
        const k = Math.min(1, maxW / im.naturalWidth);
        const w = Math.max(1, Math.round(im.naturalWidth * k)), h = Math.max(1, Math.round(im.naturalHeight * k));
        const cv = doc.createElement('canvas');
        cv.width = w; cv.height = h;
        const ctx = cv.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(im, 0, 0, w, h);
        resolve(imageToScene(ctx.getImageData(0, 0, w, h), sceneOpts));
      } catch (err) { reject(err); }
    };
    im.onerror = () => reject(new Error('could not load ' + src));
    im.src = src;
  });
}

// ───────────────────────────────────────────────────────── to ASCII
// Returns { cols, rows, codes: Uint16Array, layer: Uint8Array } (layer indexes LAYERS).
export function sceneToAscii(sc, cols, cellAspect = 0.6, opts) {
  opts = { ...(sc.tone || {}), ...(opts || {}) };
  const { w: W, h: H, lum, mask } = sc;
  const accBuf = sc.acc;
  const edgeK = opts.edge ?? 0.55;
  const gamma = opts.gamma ?? 0.9;
  const punch = opts.punch ?? 0.5;
  const lo = opts.lo ?? 0.11, hi = opts.hi ?? 0.86;
  const floor = opts.floor ?? 0.06;
  const rimK = opts.rim ?? 0.5;
  const strokeE = opts.stroke ?? 0.32, strokeMax = opts.strokeMax ?? 1;   // ink mode: stroke glyphs
  const rows = Math.max(1, Math.round(cols * (H / W) * cellAspect));
  const N = W * H;
  // ink mode (an image scene): density is ink on paper, edges ADD ink and become stroke glyphs
  // (only where sc.strand says hair or cloth, so the face keeps its tone)
  const ink = !!sc.ink;
  const STR = ink ? sc.strand || null : null;

  // coverage blur → rim light along silhouettes, and an "interior" weight for edge carving
  const tmp = new Float32Array(N), Bm = new Float32Array(N);
  const R = ink ? Math.max(2, Math.round((W / cols) * 0.9)) : 2;
  for (let y = 0; y < H; y++) {
    let acc = 0;
    for (let x = -R; x <= R; x++) acc += mask[y * W + clamp(x, 0, W - 1)];
    for (let x = 0; x < W; x++) {
      tmp[y * W + x] = acc / (2 * R + 1);
      acc += mask[y * W + Math.min(W - 1, x + R + 1)] - mask[y * W + Math.max(0, x - R)];
    }
  }
  for (let x = 0; x < W; x++) {
    let acc = 0;
    for (let y = -R; y <= R; y++) acc += tmp[clamp(y, 0, H - 1) * W + x];
    for (let y = 0; y < H; y++) {
      Bm[y * W + x] = acc / (2 * R + 1);
      acc += tmp[Math.min(H - 1, y + R + 1) * W + x] - tmp[Math.max(0, y - R) * W + x];
    }
  }
  const B = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const m = mask[i];
    const rim = clamp((m - Bm[i]) * 2.4, 0, 1);
    B[i] = clamp(lum[i] * (1 - floor) + floor * m + rimK * rim * (1 - lum[i]), 0, 1);
  }
  const E = new Float32Array(N);
  const GX = ink ? new Float32Array(N) : null, GY = ink ? new Float32Array(N) : null;
  let src = lum;
  if (ink) {
    // edges of a lightly smoothed image (about half a cell): structure, not pencil grain
    const r2 = Math.max(1, Math.round((W / cols) * 0.5));
    const t2 = new Float32Array(N);
    src = new Float32Array(N);
    for (let y = 0; y < H; y++) {
      let acc = 0;
      for (let x = -r2; x <= r2; x++) acc += lum[y * W + clamp(x, 0, W - 1)];
      for (let x = 0; x < W; x++) {
        t2[y * W + x] = acc / (2 * r2 + 1);
        acc += lum[y * W + Math.min(W - 1, x + r2 + 1)] - lum[y * W + Math.max(0, x - r2)];
      }
    }
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let y = -r2; y <= r2; y++) acc += t2[clamp(y, 0, H - 1) * W + x];
      for (let y = 0; y < H; y++) {
        src[y * W + x] = acc / (2 * r2 + 1);
        acc += t2[Math.min(H - 1, y + r2 + 1) * W + x] - t2[Math.max(0, y - r2) * W + x];
      }
    }
  }
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const a = src[i - W - 1], b = src[i - W], c = src[i - W + 1];
      const d = src[i - 1], f = src[i + 1];
      const g = src[i + W - 1], h = src[i + W], k = src[i + W + 1];
      const gx = (c + 2 * f + k) - (a + 2 * d + g);
      const gy = (g + 2 * h + k) - (a + 2 * b + c);
      E[i] = Math.hypot(gx, gy) * (ink ? sstep(0.2, 0.6, Bm[i]) : sstep(0.9, 0.995, Bm[i]));
      if (ink) { GX[i] = gx; GY[i] = gy; }
    }
  }

  const n = rows * cols;
  const codes = new Uint16Array(n);
  const layer = new Uint8Array(n);
  const cm = new Float32Array(n);
  const sx = W / cols, sy = H / rows;
  const SS = 3;
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const ramp = opts.ramp || sc.ramp || RAMP, alt = opts.ramp || sc.alt || ALT;
  const levels = ramp.length - 1;
  const hist = new Uint8Array(32);
  // hair strands: direction glyphs radiating from the crown; curls and waves get their own marks
  const HS = sc.hair;
  const hairGlyph = (x, y, c, r) => {
    if (HS.tex === 'curly') return '%&o@'[Math.floor(hash2(c * 3 + 1, r * 5 + 2) * 4)];
    if (HS.tex === 'buzz') return ':';
    if (HS.tex === 'wavy' && hash2(c, r * 3) < 0.45) return '~';
    let a = Math.atan2(y - HS.cy, x - HS.cx);
    if (a < 0) a += Math.PI;
    return KOLAM_GLYPH[Math.round(a / (Math.PI / 4)) % 4];
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let l = 0, e = 0, m = 0, jxx = 0, jyy = 0, jxy = 0, st = 0;
      hist.fill(0);
      for (let j = 0; j < SS; j++) {
        const yy = Math.min(H - 1, Math.floor((r + (j + 0.5) / SS) * sy));
        for (let q = 0; q < SS; q++) {
          const xx = Math.min(W - 1, Math.floor((c + (q + 0.5) / SS) * sx));
          const i = yy * W + xx;
          l += B[i]; e += E[i]; m += mask[i];
          hist[accBuf[i]]++;
          if (ink) { const gx = GX[i], gy = GY[i]; jxx += gx * gx; jyy += gy * gy; jxy += gx * gy; if (STR) st += STR[i]; }
        }
      }
      l /= SS * SS; e /= SS * SS; m /= SS * SS; st = STR ? st / (SS * SS) : 1;
      const ci = r * cols + c;
      cm[ci] = m;
      let d = l;
      if (ink) d += edgeK * Math.min(1, e * 0.9) * (1 - d) * 0.6;
      else d -= edgeK * Math.min(1, e * 0.8) * d * 0.45;
      d = clamp((d - lo) / (hi - lo), 0, 1);
      d = Math.pow(d, gamma);
      const s2 = d < 0.5 ? 2 * d * d : 1 - 2 * (1 - d) * (1 - d);
      d = d + (s2 - d) * punch;
      const dith = (bayer[(r & 3) * 4 + (c & 3)] / 16 - 0.47) * (ink ? opts.dither ?? 0.06 : m > 0.5 ? 0.14 : 0.22);
      let lv = d < 0.02 ? 0 : clamp(Math.round(d * levels + dith), 0, levels);
      if (m > 0.35 && m < 0.92 && lv === 0) lv = 1;   // keep silhouettes a little lit
      let best = 0, bc = 0;
      for (let k = 1; k < hist.length; k++) if (hist[k] > bc) { bc = hist[k]; best = k; }
      const spec = best ? ACC[best] : null;
      if (spec && bc >= spec.need) {
        const lvA = Math.max(lv, spec.min);
        let ch;
        if (spec.glyph) ch = spec.glyph[Math.min(spec.glyph.length - 1, Math.floor(d * spec.glyph.length))];
        else if (best === A.HAIR && HS && (lv >= 2 || hash2(c * 13 + 7, r * 3 + 1) < 0.55)) ch = hairGlyph((c + 0.5) * sx, (r + 0.5) * sy, c, r);
        else ch = ramp[lvA];
        codes[ci] = ch.charCodeAt(0);
        layer[ci] = spec.layer;
      } else if (ink && lv >= 2 && d <= strokeMax && e > strokeE && m > 0.4 && st > 0.45) {
        // a strong, coherent edge: draw it as a stroke along the edge (hair strands, contours)
        const coh = Math.hypot(jxx - jyy, 2 * jxy) / (jxx + jyy + 1e-6);
        let a = 0.5 * Math.atan2(2 * jxy, jxx - jyy) + Math.PI / 2;   // gradient → tangent
        a = ((a % Math.PI) + Math.PI) % Math.PI;
        codes[ci] = (coh > 0.45 ? KOLAM_GLYPH[Math.round(a / (Math.PI / 4)) % 4] : ramp[lv]).charCodeAt(0);
        layer[ci] = 0;
      } else {
        const ch = !ink && lv >= 6 && hash2(c * 7 + 3, r * 13 + 1) < 0.3 ? alt[lv] : ramp[lv];
        codes[ci] = ch.charCodeAt(0);
        layer[ci] = 0;
      }
    }
  }

  // kolam in the clear background, kept a little away from the person and the thoranam
  const K = sc.kolam;
  const kolamTop = sc.thoranam ? Math.round(rows * 0.13) + 2 : 0;
  if (K) {
    const p = K.p * clamp(96 / cols, 1, 1.7);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ci = r * cols + c;
        if (codes[ci] !== 32) continue;
        let near = 0;
        for (let rr = Math.max(0, r - 1); rr <= Math.min(rows - 1, r + 1) && !near; rr++) {
          for (let cc = Math.max(0, c - 3); cc <= Math.min(cols - 1, c + 3); cc++) if (cm[rr * cols + cc] > 0.12) { near = 1; break; }
        }
        if (near) continue;
        if (r < kolamTop) continue;
        const g = kolamAt((c + 0.5) * sx, (r + 0.5) * sy, K, p, sx, sy);
        if (g) { codes[ci] = g; layer[ci] = (g === 0x2022 && K.dots) ? LY.manjal : LY.maavu; }
      }
    }
  }
  if (sc.thoranam) drawThoranam(codes, layer, cols, rows, sc.thoranam);
  return { cols, rows, codes, layer };
}

export function codesToText(codes, cols, rows) {
  const lines = new Array(rows);
  for (let r = 0; r < rows; r++) lines[r] = String.fromCharCode.apply(null, codes.subarray(r * cols, (r + 1) * cols));
  return lines.join('\n');
}

// ───────────────────────────────────────────────────────── mount
// mountAsciiHero(pre, opts)
//   default: a new random person every `interval` ms, with a scramble transition.
//   portrait: 'kalam' → the tribute: assets/portrait/kalam-source.png (a pencil sketch) turned into
//     ink characters. `image` overrides the source URL. It scrambles in once, then lives: every
//     `shimmer` ms a few dozen cells flick through code glyphs in chilli and settle. No face swap.
//     Until the image is in, the <pre>'s own text (a static fallback) stays on screen.
//   backdrop: optional element; filled with the ASCII dawn sea (see mountSeaBackdrop), whose
//     swell cycles every `interval` ms, so the hero still changes over time.
export function mountAsciiHero(pre, { caption, interval = 10000, seed, cols: fixedCols, tone, onChange, portrait, image, imageOpts, backdrop, shimmer = 2400 } = {}) {
  if (!pre) throw new Error('mountAsciiHero: missing <pre>');
  const doc = pre.ownerDocument;
  const win = doc.defaultView;
  const mq = win.matchMedia ? win.matchMedia('(prefers-reduced-motion: reduce)') : null;
  let reduced = !!(mq && mq.matches);
  const tribute = portrait === 'kalam' || !!image;
  if (tribute) pre.dataset.portrait = 'kalam';
  const sea = backdrop ? mountSeaBackdrop(backdrop, { interval }) : null;
  const period = tribute ? shimmer : interval;

  Object.assign(pre.style, {
    whiteSpace: 'pre',
    overflow: 'hidden',
    lineHeight: String(LINE_H),
    letterSpacing: '0',
    fontVariantLigatures: 'none',
    fontFeatureSettings: '"liga" 0, "calt" 0',
    fontKerning: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'left',
  });
  if (win.getComputedStyle(pre).position === 'static') pre.style.position = 'relative';
  pre.classList.add('is-live');

  // layer 0 is a text node in the <pre>; every colour layer is a span laid exactly over it,
  // centred the same way, so the glyph cells line up to the pixel.
  const fallbackText = pre.textContent;
  pre.textContent = '';
  const nodes = [doc.createTextNode('')];
  pre.appendChild(nodes[0]);
  const spans = [];
  for (let k = 1; k < LAYERS.length; k++) {
    const name = LAYERS[k];
    const sp = doc.createElement('span');
    sp.className = `ascii-layer ascii-layer--${name}`;
    Object.assign(sp.style, {
      position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center',
      whiteSpace: 'pre', pointerEvents: 'none', font: 'inherit', lineHeight: 'inherit', letterSpacing: '0',
      textAlign: 'left', color: `var(--ah-${name}, ${LAYER_FALLBACK[name]})`,
    });
    const tn = doc.createTextNode('');
    sp.appendChild(tn);
    pre.appendChild(sp);
    spans.push(sp);
    nodes.push(tn);
  }
  const lastText = new Array(LAYERS.length).fill('');

  let destroyed = false;
  let ratio = measureRatio();
  let lastWidth = -1;
  let cols = 0, rows = 0;
  let current = null;               // { seed, traits, img, caption }
  let shown = null;                 // { codes, layer } currently on screen (final state)
  let bufs = null;
  let raf = 0, timer = 0, resizeT = 0;
  let remaining = period, dueAt = 0;
  let onscreen = true;
  let tr = null;
  let seedNext = seed == null ? null : seed >>> 0;
  let pending = null, idleId = 0;
  const ric = win.requestIdleCallback ? (f) => win.requestIdleCallback(f, { timeout: 2000 }) : (f) => win.setTimeout(f, 300);
  const cic = win.cancelIdleCallback ? (id) => win.cancelIdleCallback(id) : (id) => win.clearTimeout(id);

  function measureRatio() {
    const probe = doc.createElement('span');
    const cs = win.getComputedStyle(pre);
    Object.assign(probe.style, {
      position: 'absolute', visibility: 'hidden', left: '-9999px', top: '0',
      whiteSpace: 'pre', fontFamily: cs.fontFamily, fontSize: '100px', fontWeight: cs.fontWeight,
      letterSpacing: '0', fontVariantLigatures: 'none', fontKerning: 'none',
    });
    probe.textContent = 'K9d.:!*+'.repeat(10);
    doc.body.appendChild(probe);
    const w = probe.getBoundingClientRect().width / 80 / 100;
    probe.remove();
    return w > 0.3 && w < 1 ? w : 0.6;
  }

  function newSeed() {
    if (seedNext != null) { const sd = seedNext; seedNext = (Math.imul(seedNext, 1664525) + 1013904223) >>> 0; return sd; }
    return (Math.random() * 4294967296) >>> 0;
  }

  let tributeImg = null;
  function pickPerson() {
    if (tribute) return { seed: 0, traits: { portrait: portrait || 'image' }, img: tributeImg, caption: KALAM_CAPTION };
    let sd = newSeed(), traits = personTraits(sd);
    for (let tries = 0; current && tries < 8 && (traits.hair === current.traits.hair || traits.fem === current.traits.fem && tries < 3); tries++) {
      sd = newSeed(); traits = personTraits(sd);
    }
    const img = renderScene(traits);
    return { seed: sd, traits, img, caption: captionFor(traits) };
  }

  function setCaption() {
    if (!caption) return;
    if (tribute) { if (!caption.textContent.trim()) caption.textContent = KALAM_CAPTION; return; }
    const c = captionParts(current.traits);
    caption.textContent = '';
    const ta = (txt) => { const sp = doc.createElement('span'); sp.lang = 'ta'; sp.textContent = txt; return sp; };
    caption.append(ta(c.word), ` ${c.no} · `, ta(c.town), ` → ${c.city} · ${c.track}`);
  }

  function grid() {
    return sceneToAscii(current.img, cols, ratio / LINE_H, tone);
  }

  function write(codes, lay) {
    const n = codes.length;
    for (const b of bufs) b.fill(32);
    for (let i = 0; i < n; i++) bufs[lay[i]][i] = codes[i];
    for (let k = 0; k < bufs.length; k++) {
      const txt = codesToText(bufs[k], cols, rows);
      if (txt !== lastText[k]) { nodes[k].data = txt; lastText[k] = txt; }
    }
  }

  function layout(force) {
    if (!current || !current.img) return false;
    const cs = win.getComputedStyle(pre);
    const width = pre.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    if (width <= 0) return false;
    if (!force && Math.abs(width - lastWidth) < 1) return false;
    lastWidth = width;
    cols = fixedCols || (tribute
      ? clamp(Math.round(10 + width * 0.225), 72, 160)                 // the likeness needs a finer grid
      : clamp(Math.round(6 + width * 0.16), 56, 140));                 // ~92 at 540px, 56 on a phone
    const fs = Math.floor((width / (cols * ratio)) * 100) / 100;
    pre.style.fontSize = fs + 'px';
    for (const sp of spans) sp.style.padding = cs.padding;
    const g = grid();
    rows = g.rows;
    bufs = LAYERS.map(() => new Uint16Array(rows * cols));
    stopTransition();
    shown = g;
    write(g.codes, g.layer);
    return true;
  }

  function stopTransition() {
    if (raf) win.cancelAnimationFrame(raf);
    raf = 0; tr = null;
  }

  function transitionTo(next) {
    stopTransition();
    const n = next.codes.length;
    const from = shown && shown.codes.length === n ? shown : { codes: new Uint16Array(n).fill(32), layer: new Uint8Array(n) };
    shown = next;
    if (reduced) { write(next.codes, next.layer); return; }
    const start = new Float32Array(n), end = new Float32Array(n);
    const cxm = cols / 2, cym = rows * 0.42;
    const maxD = Math.hypot(cxm * ratio, Math.max(cym, rows - cym) * LINE_H);
    const D = TRANSITION_MS;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (from.codes[i] === 32 && next.codes[i] === 32) { start[i] = end[i] = -1; continue; }
        const d = Math.hypot((c - cxm) * ratio, (r - cym) * LINE_H) / maxD;
        const j = hash2(c + 11, r + 5);
        start[i] = (d * 0.58 + j * 0.1) * D;
        end[i] = start[i] + (0.18 + 0.14 * hash2(r + 3, c + 17)) * D;
      }
    }
    const buf = new Uint16Array(n), lay = new Uint8Array(n);
    const t0 = win.performance.now();
    tr = { t0 };
    const step = (now) => {
      if (!tr) return;
      const t = now - tr.t0;
      const tick = Math.floor(t / 45);
      let done = true;
      for (let i = 0; i < n; i++) {
        const st = start[i];
        if (st < 0 || t >= end[i]) { buf[i] = next.codes[i]; lay[i] = next.layer[i]; continue; }
        done = false;
        if (t < st) { buf[i] = from.codes[i]; lay[i] = from.layer[i]; continue; }
        buf[i] = SCRAMBLE.charCodeAt(Math.floor(hash2(i, tick) * SCRAMBLE.length));
        lay[i] = next.codes[i] !== 32 ? next.layer[i] : from.layer[i];
      }
      write(buf, lay);
      if (done) { tr = null; raf = 0; return; }
      raf = win.requestAnimationFrame(step);
    };
    raf = win.requestAnimationFrame(step);
  }

  // the living shimmer: a few dozen cells flick through code glyphs (in chilli) and settle
  function flicker() {
    if (reduced || tr || !shown || destroyed) return;
    const n = shown.codes.length;
    const pick = [];
    const want = Math.round(clamp(n / 280, 20, 48));
    for (let tries = 0; pick.length < want && tries < want * 40; tries++) {
      const i = Math.floor(Math.random() * n);
      if (shown.codes[i] === 32) continue;
      pick.push(i);
    }
    if (!pick.length) return;
    const ends = pick.map(() => 220 + Math.random() * 420);
    const starts = pick.map(() => Math.random() * 260);
    const buf = shown.codes.slice(), lay = shown.layer.slice();
    let lastTick = -1;
    tr = { t0: win.performance.now() };
    const step = (now) => {
      if (!tr) return;
      const t = now - tr.t0;
      const tick = Math.floor(t / 55);
      if (tick !== lastTick) {
        lastTick = tick;
        let done = true;
        for (let k = 0; k < pick.length; k++) {
          const i = pick[k];
          if (t < starts[k]) { done = false; continue; }
          if (t >= starts[k] + ends[k]) { buf[i] = shown.codes[i]; lay[i] = shown.layer[i]; continue; }
          done = false;
          buf[i] = SCRAMBLE.charCodeAt(Math.floor(hash2(i, tick) * SCRAMBLE.length));
          lay[i] = LY.kaavi;
        }
        write(buf, lay);
        if (done) { tr = null; raf = 0; return; }
      }
      raf = win.requestAnimationFrame(step);
    };
    raf = win.requestAnimationFrame(step);
  }

  function prefetch() {
    if (tribute || idleId || pending || destroyed) return;
    idleId = ric(() => { idleId = 0; if (!destroyed) pending = pickPerson(); });
  }

  function advance() {
    current = pending || pickPerson();
    pending = null;
    prefetch();
    setCaption();
    if (typeof onChange === 'function') onChange({ ...current });
    if (!cols) { layout(true); return; }
    transitionTo(grid());
  }

  const running = () => !destroyed && !doc.hidden && onscreen;
  function arm() {
    if (timer || !running()) return;
    dueAt = win.performance.now() + remaining;
    timer = win.setTimeout(tick, remaining);
  }
  function disarm() {
    if (!timer) return;
    win.clearTimeout(timer);
    timer = 0;
    remaining = Math.max(0, dueAt - win.performance.now());
  }
  function tick() {
    timer = 0;
    if (tribute) { remaining = period * (0.75 + 0.5 * Math.random()); flicker(); }
    else { remaining = interval; advance(); }
    arm();
  }
  const update = () => (running() ? arm() : disarm());

  function start() {
    current = pickPerson();
    setCaption();
    if (typeof onChange === 'function') onChange({ ...current });
    if (layout(true) && !reduced) {
      const first = shown;
      shown = null;
      transitionTo(first);
    }
  }
  if (tribute) {
    nodes[0].data = fallbackText;               // the static fallback stays until the image is in
    loadImageScene(image || KALAM_SRC, { doc, ...(imageOpts || {}) }).then((sc) => {
      if (destroyed) return;
      tributeImg = sc;
      start();
    }).catch((err) => { if (win.console) win.console.warn('[aazhi] portrait image failed; static fallback stays.', err); });
  } else {
    start();
  }

  const onVis = () => update();
  doc.addEventListener('visibilitychange', onVis);
  const onMotion = (e) => { reduced = e.matches; if (reduced && tr) { stopTransition(); write(shown.codes, shown.layer); } };
  if (mq) (mq.addEventListener ? mq.addEventListener('change', onMotion) : mq.addListener(onMotion));

  let io = null;
  if ('IntersectionObserver' in win) {
    io = new win.IntersectionObserver((entries) => {
      for (const e of entries) onscreen = e.isIntersecting;
      update();
    }, { threshold: 0 });
    io.observe(pre);
  }
  let ro = null;
  const onResize = () => {
    win.clearTimeout(resizeT);
    resizeT = win.setTimeout(() => { if (!destroyed) layout(false); }, 150);
  };
  if ('ResizeObserver' in win) { ro = new win.ResizeObserver(onResize); ro.observe(pre); }
  else win.addEventListener('resize', onResize);

  if (doc.fonts && doc.fonts.ready) {
    doc.fonts.ready.then(() => {
      if (destroyed) return;
      const r2 = measureRatio();
      if (Math.abs(r2 - ratio) > 0.002) { ratio = r2; layout(true); }
    }).catch(() => {});
  }

  arm();
  prefetch();

  return {
    next() { if (destroyed) return; disarm(); remaining = period; advance(); arm(); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (sea) sea.destroy();
      stopTransition();
      if (timer) win.clearTimeout(timer);
      timer = 0;
      win.clearTimeout(resizeT);
      if (idleId) cic(idleId);
      idleId = 0;
      doc.removeEventListener('visibilitychange', onVis);
      if (mq) (mq.removeEventListener ? mq.removeEventListener('change', onMotion) : mq.removeListener(onMotion));
      if (io) io.disconnect();
      if (ro) ro.disconnect(); else win.removeEventListener('resize', onResize);
    },
  };
}

// ───────────────────────────────────────────────────────── the dawn sea (hero backdrop)
// ஆழி is the deep sea. Fills `el` with ASCII waves, the sun's path glinting in chilli at
// --sun-x, and (unless data-sky="off") a sparse ASCII sky of twinkling stars above them. Every `interval` ms a
// swell rolls in from the horizon: the hero's slow, ambient change. One text node per colour,
// never a span per character. Static under reduced motion; pauses when hidden or off-screen.
// CSS owns the look: font size, line height, colours (--sea-*), and --sun-x (the glint column).
export function mountSeaBackdrop(el, { interval = 10000, fps = 12 } = {}) {
  if (!el) throw new Error('mountSeaBackdrop: missing element');
  const doc = el.ownerDocument;
  const win = doc.defaultView;
  const mq = win.matchMedia ? win.matchMedia('(prefers-reduced-motion: reduce)') : null;
  let reduced = !!(mq && mq.matches);
  el.textContent = '';

  function plate(cls, names) {
    const pre = doc.createElement('pre');
    pre.className = cls;
    pre.setAttribute('aria-hidden', 'true');
    const nodes = [doc.createTextNode('')];
    pre.appendChild(nodes[0]);
    for (const name of names) {
      const sp = doc.createElement('span');
      sp.className = `sea-layer sea-layer--${name}`;
      Object.assign(sp.style, { position: 'absolute', inset: '0', whiteSpace: 'pre', pointerEvents: 'none', font: 'inherit', lineHeight: 'inherit', letterSpacing: '0' });
      const tn = doc.createTextNode('');
      sp.appendChild(tn);
      pre.appendChild(sp);
      nodes.push(tn);
    }
    el.appendChild(pre);
    return { pre, nodes, last: nodes.map(() => ''), cols: 0, rows: 0, bufs: null };
  }
  const wantSky = el.dataset.sky !== 'off';      // data-sky="off": waves only
  const sky = wantSky ? plate('sea__sky', ['bright']) : null;
  const water = plate('sea__water', ['crest', 'glint']);
  const noise = makeNoise(0xa021);

  function measure(p) {
    const cs = win.getComputedStyle(p.pre);
    const probe = doc.createElement('span');
    Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', whiteSpace: 'pre', font: 'inherit', letterSpacing: '0' });
    probe.textContent = '~-.+*'.repeat(8);
    p.pre.appendChild(probe);
    const cw = probe.getBoundingClientRect().width / 40 || 8;
    probe.remove();
    const fs = parseFloat(cs.fontSize) || 13;
    const lh = parseFloat(cs.lineHeight) || fs * 1.2;
    p.cols = Math.max(1, Math.ceil(p.pre.clientWidth / cw));
    p.rows = Math.max(1, Math.floor(p.pre.clientHeight / lh));
    p.bufs = p.nodes.map(() => new Uint16Array(p.cols * p.rows));
  }
  function flush(p) {
    for (let k = 0; k < p.nodes.length; k++) {
      const txt = codesToText(p.bufs[k], p.cols, p.rows);
      if (txt !== p.last[k]) { p.nodes[k].data = txt; p.last[k] = txt; }
    }
  }
  const sunX = () => {
    const v = win.getComputedStyle(el).getPropertyValue('--sun-x').trim();
    const f = parseFloat(v);
    return Number.isFinite(f) ? f / (v.endsWith('%') ? 100 : 1) : 0.7;
  };

  let sun = 0.7;
  function drawWater(t) {
    const { cols, rows, bufs } = water;
    if (!rows) return;
    for (const b of bufs) b.fill(32);
    const cyc = (t % interval) / interval;
    const swellR = cyc * rows * 2.4 - 1;              // rolls in during the first ~40% of a cycle
    const sc = sun * cols;
    for (let r = 0; r < rows; r++) {
      const z = (r + 0.5) / rows;                     // 0 at the horizon, 1 nearest
      const fx = 0.5 / (0.35 + 1.5 * z);              // far waves are small and quick
      const sp = t * 0.00045 * (0.5 + z);
      const swell = 0.34 * Math.exp(-sq((r - swellR) / 0.85));
      const thin = 0.14 * (1 - z);                    // sparser toward the horizon
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        let v = 0.55 * noise(c * fx + sp * 3, r * 2.3 + sp) + 0.45 * (0.5 + 0.5 * Math.sin(c * fx * 1.7 - sp * 5 + r * 1.9));
        v += swell * (0.7 + 0.3 * noise(c * 0.08, r + 9));
        v -= thin;
        const dx = Math.abs(c + 0.5 - sc) / cols;
        const glintW = 0.01 + 0.035 * z * z;
        const glint = dx < glintW * (0.55 + 0.6 * noise(c * 0.3, r * 3 + sp * 4)) && v > 0.36;
        let ch = 0, k = 0;
        if (v > 0.8) { ch = z > 0.55 ? 0x5e : 0x7e; k = 1; }           // ^ ~  crest
        else if (v > 0.62) ch = 0x7e;                                 // ~
        else if (v > 0.48) ch = 0x2d;                                 // -
        else if (v > 0.38) ch = r === 0 ? 0x2d : 0x2e;                // .
        if (glint) { ch = v > 0.6 ? 0x3d : 0x2d; k = 2; }             // = -
        if (ch) bufs[k][i] = ch;
      }
    }
    flush(water);
  }
  let stars = [];
  function seedStars() {
    if (!sky) return;
    const { cols, rows } = sky;
    stars = [];
    const r0 = mulberry32(0x1931 + cols * 7 + rows);
    const n = Math.round(cols * rows * 0.011);
    for (let j = 0; j < n; j++) {
      const r = Math.floor(Math.pow(r0(), 1.6) * rows);            // denser high up
      stars.push({ c: Math.floor(r0() * cols), r, ph: r0() * 6.283, w: 0.6 + r0() * 1.6, b: r0() });
    }
  }
  function drawSky(t) {
    if (!sky || !sky.rows) return;
    const { cols, bufs } = sky;
    for (const b of bufs) b.fill(32);
    for (const s of stars) {
      const tw = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(t * 0.001 * s.w + s.ph);
      const lvl = s.b * 0.6 + tw * 0.4;
      const ch = lvl > 0.78 ? 0x2a : lvl > 0.5 ? 0x2b : 0x2e;      // * + .
      bufs[lvl > 0.78 ? 1 : 0][s.r * cols + s.c] = ch;
    }
    flush(sky);
  }

  let destroyed = false, timer = 0, frame = 0, onscreen = true, t0 = win.performance.now(), tPaused = 0, pausedAt = 0;
  function layout() {
    if (sky) measure(sky);
    measure(water); seedStars();
    sun = sunX();
    const t = now();
    drawSky(t); drawWater(t);
  }
  const now = () => (reduced ? 0 : (pausedAt || win.performance.now()) - t0 - tPaused);
  const running = () => !destroyed && !reduced && !doc.hidden && onscreen;
  function loop() {
    timer = 0;
    if (!running()) return;
    const t = now();
    drawWater(t);
    if (frame++ % 5 === 0) drawSky(t);
    timer = win.setTimeout(loop, 1000 / fps);
  }
  function update() {
    if (running()) {
      if (pausedAt) { tPaused += win.performance.now() - pausedAt; pausedAt = 0; }
      if (!timer) timer = win.setTimeout(loop, 1000 / fps);
    } else {
      if (!pausedAt) pausedAt = win.performance.now();
      if (timer) { win.clearTimeout(timer); timer = 0; }
    }
  }

  layout();
  const onVis = () => update();
  doc.addEventListener('visibilitychange', onVis);
  const onMotion = (e) => { reduced = e.matches; layout(); update(); };
  if (mq) (mq.addEventListener ? mq.addEventListener('change', onMotion) : mq.addListener(onMotion));
  let io = null;
  if ('IntersectionObserver' in win) {
    io = new win.IntersectionObserver((entries) => { for (const e of entries) onscreen = e.isIntersecting; update(); }, { threshold: 0 });
    io.observe(el);
  }
  let ro = null, resizeT = 0;
  const onResize = () => { win.clearTimeout(resizeT); resizeT = win.setTimeout(() => { if (!destroyed) layout(); }, 150); };
  if ('ResizeObserver' in win) { ro = new win.ResizeObserver(onResize); ro.observe(el); }
  else win.addEventListener('resize', onResize);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(() => { if (!destroyed) layout(); }).catch(() => {});
  update();

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (timer) win.clearTimeout(timer);
      timer = 0;
      win.clearTimeout(resizeT);
      doc.removeEventListener('visibilitychange', onVis);
      if (mq) (mq.removeEventListener ? mq.removeEventListener('change', onMotion) : mq.removeListener(onMotion));
      if (io) io.disconnect();
      if (ro) ro.disconnect(); else win.removeEventListener('resize', onResize);
    },
  };
}

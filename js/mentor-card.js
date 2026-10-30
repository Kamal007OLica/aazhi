// ஆழி: the shareable mentor ID image. Draws a 1200×1200 PNG on a canvas with the
// page's own webfonts (no external images, so the canvas never taints).
// Used by js/mentors.js after a successful sign-up.

const C = {
  sea: '#0f3d44', seaDeep: '#0a2c31', paper: '#ece7dc', paper2: '#e0d9ca', ink: '#161311',
  ink3: '#6b625a', chilli: '#e5470e', lavender: '#b8b0ee', salmon: '#f2875f', stamp: '#c42a1f',
};
const F = {
  display: '"Anton", Impact, "Arial Narrow", sans-serif',
  tamil: '"Catamaran", "Noto Sans Tamil", "Tamil Sangam MN", sans-serif',
  body: '"Archivo", "Helvetica Neue", Arial, sans-serif',
  narrow: '"Archivo Narrow", "Arial Narrow", sans-serif',
  mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
  hand: '"Caveat", "Comic Sans MS", cursive',
};
export const TAGLINE = 'Creating the next big tech minds from Tamil rural roots';
const SIZE = 1200;

async function fontsReady() {
  if (!document.fonts?.load) return;
  await Promise.allSettled([
    document.fonts.load(`400 80px ${F.display}`),
    document.fonts.load(`900 64px ${F.tamil}`, 'ஆழி ஊருக்கு'),
    document.fonts.load(`700 30px ${F.tamil}`, 'தூத்துக்குடி'),
    document.fonts.load(`500 26px ${F.body}`),
    document.fonts.load(`700 20px ${F.narrow}`),
    document.fonts.load(`700 22px ${F.mono}`, 'ஆழி-M-0000'),
    document.fonts.load(`700 34px ${F.hand}`),
  ]);
}

// deterministic PRNG so the grain and barcode are the same for the same card
function rng(seedStr) {
  let h = 2166136261;
  for (const ch of seedStr) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function track(ctx, em) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${em}px`;
}

// wrap text into lines that fit maxW; returns the lines
function wrap(ctx, text, maxW) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

// shrink the font until the text fits in maxLines
function fit(ctx, text, { weight, family, size, min, maxW, maxLines }) {
  let s = size;
  let lines;
  do {
    ctx.font = `${weight} ${s}px ${family}`;
    lines = wrap(ctx, text, maxW);
    if (lines.length <= maxLines) break;
    s -= 2;
  } while (s > min);
  return { size: s, lines: lines.slice(0, maxLines) };
}

function grain(ctx, rand, w, h, alpha) {
  const g = document.createElement('canvas');
  g.width = g.height = 160;
  const gx = g.getContext('2d');
  const img = gx.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = rand() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = rand() * 255 * alpha;
  }
  gx.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = ctx.createPattern(g, 'repeat');
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function drawCard(ctx, d, rand) {
  const W = 470, H = 660;
  // lanyard
  ctx.save();
  ctx.fillStyle = C.chilli;
  ctx.fillRect(W / 2 - 18, -360, 36, 368);
  ctx.fillStyle = 'rgba(22,19,17,.55)';
  ctx.font = `700 15px ${F.mono}`;
  track(ctx, 3);
  ctx.translate(W / 2 + 6, -40);
  ctx.rotate(-Math.PI / 2);
  for (let i = 0; i < 4; i++) ctx.fillText('aazhi · ஆழி ·', i * 150 - 40, 0);
  ctx.restore();
  // clip
  ctx.fillStyle = '#b9b4ab';
  rrect(ctx, W / 2 - 16, -6, 32, 34, 6);
  ctx.fill();

  // card body
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.45)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 26;
  ctx.fillStyle = C.paper;
  rrect(ctx, 0, 20, W, H, 16);
  ctx.fill();
  ctx.restore();
  ctx.save();
  rrect(ctx, 0, 20, W, H, 16);
  ctx.clip();
  // paper fibres
  for (let i = 0; i < 260; i++) {
    ctx.strokeStyle = `rgba(90,70,40,${0.05 + rand() * 0.06})`;
    ctx.lineWidth = 1;
    const y = 20 + rand() * H;
    ctx.beginPath();
    ctx.moveTo(rand() * W, y);
    ctx.lineTo(rand() * W, y + (rand() - 0.5) * 3);
    ctx.stroke();
  }
  // header band
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 56, W, 72);
  ctx.fillStyle = C.chilli;
  ctx.fillRect(0, 128, W, 8);
  ctx.restore();

  ctx.fillStyle = C.paper;
  ctx.font = `900 44px ${F.tamil}`;
  track(ctx, 0);
  ctx.textBaseline = 'middle';
  ctx.fillText('ஆழி', 28, 96);
  ctx.fillStyle = C.chilli;
  ctx.font = `700 17px ${F.narrow}`;
  track(ctx, 4);
  ctx.textAlign = 'right';
  ctx.fillText('MENTOR ID', W - 28, 96);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // photo block with initials
  ctx.fillStyle = C.lavender;
  ctx.fillRect(28, 166, 132, 150);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 166, 132, 150);
  ctx.fillStyle = 'rgba(22,19,17,.18)';
  for (let y = 176; y < 312; y += 9) for (let x = 38; x < 156; x += 9) ctx.fillRect(x, y, 2, 2);
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${/[஀-௿]/.test(d.initials) ? `900 58px ${F.tamil}` : `400 64px ${F.display}`}`;
  track(ctx, 0);
  ctx.fillText(d.initials, 94, 244);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // name, from → city, role
  const nameFit = fit(ctx, d.name.toUpperCase(), { weight: 400, family: F.display, size: 44, min: 26, maxW: 272, maxLines: 2 });
  ctx.fillStyle = C.ink;
  let y = 200;
  nameFit.lines.forEach((l) => { ctx.fillText(l, 180, y); y += nameFit.size * 1.02; });
  y += 6;
  ctx.font = `700 26px ${F.tamil}`;
  const from = `${d.fromTa} → ${d.city}`;
  wrap(ctx, from, 272).slice(0, 2).forEach((l) => { ctx.fillText(l, 180, y); y += 32; });
  if (d.role) {
    ctx.fillStyle = C.ink3;
    ctx.font = `500 19px ${F.body}`;
    wrap(ctx, d.role, 272).slice(0, 2).forEach((l) => { ctx.fillText(l, 180, y); y += 24; });
  }

  // expertise chips
  let cx = 28, cy = Math.max(y + 18, 350);
  ctx.font = `700 17px ${F.mono}`;
  track(ctx, 0);
  for (const x of d.expertise.slice(0, 6)) {
    const w = ctx.measureText(x).width + 28;
    if (cx + w > W - 28) { cx = 28; cy += 44; }
    if (cy > 470) break;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    rrect(ctx, cx, cy, w, 34, 17);
    ctx.stroke();
    ctx.fillStyle = C.ink;
    ctx.fillText(x, cx + 14, cy + 23);
    cx += w + 10;
  }

  // helps as / no.
  let by = cy + 72;
  ctx.fillStyle = C.ink3;
  ctx.font = `700 14px ${F.narrow}`;
  track(ctx, 3);
  ctx.fillText('HELPS AS', 28, by);
  ctx.fillStyle = C.ink;
  ctx.font = `700 19px ${F.body}`;
  track(ctx, 0);
  const roleLines = wrap(ctx, d.roles.join(' · '), W - 128 - 28).slice(0, 2);
  roleLines.forEach((l, i) => ctx.fillText(l, 128, by + i * 25));
  by += 38 + (roleLines.length - 1) * 25;
  ctx.fillStyle = C.ink3;
  ctx.font = `700 14px ${F.narrow}`;
  track(ctx, 3);
  ctx.fillText('NO.', 28, by);
  ctx.fillStyle = C.ink;
  ctx.font = `700 24px ${F.mono}`;
  track(ctx, 0);
  ctx.fillText(d.no, 80, by + 1);

  // barcode
  const br = rng(d.no);
  let bx = 28;
  const bTop = H - 70;
  while (bx < W - 28) {
    const bw = 1 + Math.floor(br() * 4);
    if (br() > 0.35) { ctx.fillStyle = C.ink; ctx.fillRect(bx, bTop, bw, 58); }
    bx += bw + 1 + Math.floor(br() * 3);
  }

  // rubber stamp
  ctx.save();
  ctx.translate(W - 150, H - 70);
  ctx.rotate(-0.16);
  ctx.globalAlpha = 0.88;
  ctx.strokeStyle = C.stamp;
  ctx.lineWidth = 4;
  ctx.strokeRect(-130, -46, 260, 92);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-122, -38, 244, 76);
  ctx.fillStyle = C.stamp;
  ctx.textAlign = 'center';
  ctx.font = `400 34px ${F.display}`;
  track(ctx, 2);
  ctx.fillText('WELCOME HOME', 0, 6);
  ctx.font = `700 18px ${F.tamil}`;
  track(ctx, 0);
  ctx.fillText('ஊருக்கு நன்றி', 0, 30);
  // knock out specks so it reads as ink, not vector
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 140; i++) ctx.fillRect(-130 + rand() * 260, -46 + rand() * 92, 1 + rand() * 3, 1 + rand() * 2);
  ctx.restore();
}

export async function renderMentorCard(d) {
  await fontsReady();
  const cv = document.createElement('canvas');
  cv.width = cv.height = SIZE;
  const ctx = cv.getContext('2d');
  const rand = rng(`${d.no}|${d.name}`);

  // sea ground with a soft swell of light
  const bg = ctx.createRadialGradient(880, 300, 60, 760, 520, 900);
  bg.addColorStop(0, '#16525b');
  bg.addColorStop(1, C.seaDeep);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  // wave lines, the ஆழி idea (not a grid)
  ctx.strokeStyle = 'rgba(236,231,220,.07)';
  ctx.lineWidth = 2;
  for (let k = 0; k < 9; k++) {
    ctx.beginPath();
    for (let x = 0; x <= SIZE; x += 20) {
      const yy = 640 + k * 40 + Math.sin(x / 90 + k * 0.7) * 12;
      x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
    }
    ctx.stroke();
  }

  // left: message
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.salmon;
  ctx.font = `700 18px ${F.narrow}`;
  track(ctx, 5);
  ctx.fillText('FOR SENIORS WITH TAMIL NADU ROOTS', 72, 120);

  track(ctx, 0);
  ctx.fillStyle = C.paper;
  ctx.font = `900 64px ${F.tamil}`;
  ctx.fillText('ஊருக்குத்', 72, 214);
  ctx.fillText('திருப்பிக்', 72, 300);
  ctx.fillText('கொடு.', 72, 386);

  ctx.fillStyle = C.lavender;
  ctx.font = `400 74px ${F.display}`;
  ctx.fillText('OORU-KU', 72, 488);
  ctx.fillText('THIRUMBI KUDU.', 72, 566);

  ctx.fillStyle = C.paper;
  ctx.font = `500 25px ${F.body}`;
  const pitch = `I'm now mentor ${d.no} at ஆழி, guiding students from Tamil Nadu's small towns into tech.`;
  let py = 632;
  wrap(ctx, pitch, 500).forEach((l) => { ctx.fillText(l, 72, py); py += 36; });

  ctx.fillStyle = C.salmon;
  ctx.font = `700 34px ${F.hand}`;
  ctx.fillText(`${d.district}-la irundhu, ooru-kaaga →`, 72, py + 34);

  // right: the card, hung and tilted
  ctx.save();
  ctx.translate(650, 170);
  ctx.rotate(0.045);
  drawCard(ctx, d, rand);
  ctx.restore();

  // bottom band: tagline + mark
  ctx.fillStyle = C.chilli;
  ctx.fillRect(0, SIZE - 132, SIZE, 132);
  ctx.fillStyle = C.ink;
  ctx.font = `900 58px ${F.tamil}`;
  track(ctx, 0);
  ctx.fillText('ஆழி', 72, SIZE - 46);
  const markW = ctx.measureText('ஆழி').width;
  ctx.font = `700 22px ${F.mono}`;
  ctx.fillText('aazhi.', 72 + markW + 14, SIZE - 50);
  ctx.textAlign = 'right';
  ctx.font = `700 21px ${F.narrow}`;
  track(ctx, 3);
  ctx.fillText(TAGLINE.toUpperCase(), SIZE - 72, SIZE - 52);
  ctx.textAlign = 'left';
  track(ctx, 0);

  grain(ctx, rand, SIZE, SIZE, 0.35);
  return cv;
}

export function cardBlob(canvas) {
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'));
}

// Post text: carries the mentor number, never name or email.
export function shareText(no) {
  return `I just signed up to mentor students from Tamil Nadu's small towns with ஆழி (Aazhi), mentor ${no}.\n\n${TAGLINE}. If you have Tamil Nadu roots and an hour a month, join us: ooru-ku thirumbi kudu.\n\n#Aazhi #OoruKuThirumbiKudu #TamilTech #Mentorship`;
}

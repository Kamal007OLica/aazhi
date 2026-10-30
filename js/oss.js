// ஆழி: "நம்ம ஊரு code" — open-source projects built in, or for, Tamil Nadu.
// Self-contained module: renders filter chips + a Sivakasi matchbox counter into #oss.
// Every project is a matchbox with a vintage label; one sits open on the counter with its
// tray slid out (sticks = stack + licence, a paper slip = what it is), the rest wait in a row.
// Data verified 30 Oct 2026; sources in research/oss-tn.md. No stars or counts on purpose.
//
// DOM contract (index.html, section#oss):
//   #oss-filters  <div>  chips are rendered here (toggle buttons, aria-pressed)
//   #oss-count    <p aria-live="polite">  "Showing N of M projects"
//   #oss-stage    <div>  the open box on the counter
//   #oss-street   <div role="region">  scroll-snap rail on phones (tabindex set only when it scrolls)
//   #oss-list     <ul>  the closed boxes (buttons) are rendered here

export const OSS_CATEGORIES = [
  { id: 'hardware', label: 'Hardware', ta: 'வன்பொருள்' },
  { id: 'ai', label: 'AI/ML', ta: 'AI' },
  { id: 'tamil', label: 'Tamil computing', ta: 'தமிழ்க் கணினி' },
  { id: 'apps', label: 'Apps & tools', ta: 'செயலி' },
  { id: 'fonts', label: 'Design/Fonts', ta: 'எழுத்துரு' },
  { id: 'community', label: 'Community', ta: 'சமூகம்' },
];

// level: 'first-pr' = has a contributing guide / ways-to-contribute list / open problems.
//        'deep'     = real and open, but better after Karai.
//        'archive'  = code is dormant; worth a look, not a first PR.
export const OSS_PROJECTS = [
  {
    id: 'shakti',
    name: 'SHAKTI',
    ta: 'சென்னையில் பிறந்த சிப்.',
    desc: 'Open-source RISC-V processor cores, SoCs and the software to boot them.',
    prop: 'RISE group, IIT Madras · Chennai',
    category: 'hardware',
    stack: 'Bluespec SystemVerilog',
    licence: 'BSD-3-Clause',
    url: 'https://gitlab.com/shaktiproject',
    host: 'GitLab',
    level: 'deep',
  },
  {
    id: 'open-tamil',
    name: 'Open-Tamil',
    ta: 'தமிழ் உரைக்கான பைதான் கருவிகள்.',
    desc: 'A Python library that splits Tamil words into letters, writes numbers as Tamil words, stems and transliterates.',
    prop: 'Ezhil Language Foundation · for Tamil computing',
    category: 'tamil',
    stack: 'Python',
    licence: 'MIT',
    url: 'https://github.com/Ezhil-Language-Foundation/open-tamil',
    host: 'GitHub',
    level: 'first-pr',
  },
  {
    id: 'indictrans2',
    name: 'IndicTrans2',
    ta: '22 இந்திய மொழிகளுக்கு மொழிபெயர்ப்பு.',
    desc: 'Translation models for all 22 scheduled Indian languages, Tamil included.',
    prop: 'AI4Bharat, IIT Madras · Chennai',
    category: 'ai',
    stack: 'Python',
    licence: 'MIT',
    url: 'https://github.com/AI4Bharat/IndicTrans2',
    host: 'GitHub',
    level: 'deep',
  },
  {
    id: 'namma-wallet',
    name: 'Namma Wallet',
    ta: 'பஸ் டிக்கெட் எல்லாம் ஒரே இடத்தில்.',
    desc: 'A Flutter app that keeps TNSTC, SETC and IRCTC tickets in one place, read from SMS, PDF or QR.',
    prop: 'Namma Flutter community · Chennai',
    category: 'apps',
    stack: 'Dart · Flutter',
    licence: 'MIT',
    url: 'https://github.com/Namma-Flutter/namma_wallet',
    host: 'GitHub',
    level: 'first-pr',
  },
  {
    id: 'ilugc',
    name: 'ILUGC',
    ta: '1998 முதல் சென்னை லினக்ஸ் கூட்டம்.',
    desc: 'Chennai’s Linux users group: monthly meets, and a website that needs writers and article restorers.',
    prop: 'Indian Linux Users’ Group · Chennai',
    category: 'community',
    stack: 'Hugo · Markdown',
    licence: '',
    url: 'https://github.com/ilugc/ilugc.in',
    host: 'GitHub',
    level: 'first-pr',
  },
  {
    id: 'catamaran',
    name: 'Catamaran',
    ta: 'கட்டுமரம்: இந்தப் பக்கத்தின் தமிழ் எழுத்து.',
    desc: 'A Tamil and Latin type family in nine weights. The Tamil you are reading on this page.',
    prop: 'Pria Ravichandran · type designer',
    category: 'fonts',
    stack: 'Font sources',
    licence: 'OFL-1.1',
    url: 'https://github.com/VanillaandCream/Catamaran-Tamil',
    host: 'GitHub',
    level: 'deep',
  },
  {
    id: 'freetamilebooks',
    name: 'FreeTamilEbooks',
    ta: 'இலவச தமிழ் மின்னூல்கள்.',
    desc: 'Free Tamil ebooks under Creative Commons, plus the scripts that turn them into PDF and EPUB.',
    prop: 'Kaniyam Foundation · Chennai',
    category: 'tamil',
    stack: 'Python · LibreOffice',
    licence: 'Creative Commons',
    url: 'https://freetamilebooks.com/',
    host: 'site',
    level: 'first-pr',
  },
  {
    id: 'indic-tts',
    name: 'Indic-TTS',
    ta: 'எழுத்தைக் குரலாக்கும்.',
    desc: 'Text-to-speech models for 13 Indian languages. Type Tamil, hear Tamil.',
    prop: 'AI4Bharat, IIT Madras · Chennai',
    category: 'ai',
    stack: 'Python · Jupyter',
    licence: 'MIT',
    url: 'https://github.com/AI4Bharat/Indic-TTS',
    host: 'GitHub',
    level: 'deep',
  },
  {
    id: 'tosshack',
    name: 'TOSSHack problems',
    ta: 'தீர்க்கக் காத்திருக்கும் பிரச்சனைகள்.',
    desc: 'Open problem statements from TOSSConf: Tamil OCR, a Tamil99 typing tutor, Kubernetes docs in Tamil and more.',
    prop: 'TOSSConf · Kaniyam + Tamil FOSS community',
    category: 'community',
    stack: 'Pick your stack',
    licence: 'Varies',
    url: 'https://github.com/tossconf/TossHack26-ProblemStatements',
    host: 'GitHub',
    level: 'first-pr',
  },
  {
    id: 'ezhil',
    name: 'Ezhil',
    ta: 'தமிழிலேயே நிரல் எழுது.',
    desc: 'A programming language with Tamil keywords, made for first-time coders in school.',
    prop: 'Ezhil Language Foundation · for Tamil learners',
    category: 'apps',
    stack: 'Python',
    licence: 'GPL-3.0',
    url: 'https://github.com/Ezhil-Language-Foundation/Ezhil-Lang',
    host: 'GitHub',
    level: 'first-pr',
  },
  {
    id: 'ekalappai',
    name: 'eKalappai',
    ta: 'தமிழில் தட்டச்சு செய்ய.',
    desc: 'An open-source keyboard manager for typing Tamil in Tamil99, Inscript and typewriter layouts.',
    prop: 'ThamiZha team · Tamil typing',
    category: 'tamil',
    stack: 'C++',
    licence: 'GPL-3.0',
    url: 'https://github.com/thamizha/ekalappai',
    host: 'GitHub',
    level: 'archive',
  },
  {
    id: 'fsftn',
    name: 'FSFTN',
    ta: 'ஊர் ஊருக்கு GLUG.',
    desc: 'Free Software Foundation Tamil Nadu: college GLUGs, workshops and camps across the state.',
    prop: 'FSFTN · across Tamil Nadu',
    category: 'community',
    stack: 'Meetups · Workshops',
    licence: '',
    url: 'https://fsftn.org/',
    host: 'site',
    level: 'first-pr',
  },
];


/* ------------------------------------------------------------ the labels */

// Each trade gets a Sivakasi matchbox "brand" and an emblem (inline SVG so the page's
// fonts and colours reach it). Emblems are ink on a paper disc; `.cut` paints in the disc
// colour, `.cut-line` / `.ink-line` are strokes.
const BRANDS = {
  hardware: {
    brand: 'Chip Brand',
    emblem: `<g fill="currentColor"><rect x="28" y="28" width="44" height="44" rx="5"/><path d="M33 15h5v13h-5zM47.5 15h5v13h-5zM62 15h5v13h-5zM33 72h5v13h-5zM47.5 72h5v13h-5zM62 72h5v13h-5zM15 33h13v5H15zM15 47.5h13v5H15zM15 62h13v5H15zM72 33h13v5H72zM72 47.5h13v5H72zM72 62h13v5H72z"/></g><rect class="cut" x="38" y="38" width="24" height="24" rx="2"/><circle class="cut" cx="33.5" cy="33.5" r="2"/>`,
  },
  ai: {
    brand: 'Kili Brand',
    emblem: `<g fill="currentColor"><circle cx="47" cy="29" r="12"/><path d="M51 33C65 37 71 51 67 65C64 75 53 80 47 73C41 65 41 45 51 33Z"/><path d="M61 69L83 91L75 94L57 75Z"/><path d="M36 25C27 25 24 35 30 42C30 36 33 33 38 33Z"/><rect x="36" y="82" width="38" height="4" rx="2"/></g><circle class="cut" cx="45" cy="26.5" r="2.4"/><path class="cut-line" d="M53 44C61 50 63 60 59 70"/><g transform="rotate(-14 22 53)"><rect x="13" y="42" width="17" height="23" rx="1.5" fill="currentColor"/><rect class="cut" x="15.5" y="44.5" width="12" height="18"/><path class="ink-line thin" d="M18.5 49h6M18.5 53h6M18.5 57h4"/></g>`,
  },
  tamil: {
    brand: 'Olai Brand',
    emblem: `<g transform="rotate(-8 50 52)"><rect x="10" y="29" width="80" height="19" rx="9.5" fill="currentColor"/><rect x="15" y="53" width="76" height="19" rx="9.5" fill="currentColor"/><path class="cut-line thin" d="M25 36h20M51 36h28M25 41.5h44M31 60h16M53 60h28M31 65.5h38"/><circle class="cut" cx="18" cy="38.5" r="2.6"/><circle class="cut" cx="23" cy="62.5" r="2.6"/><path class="ink-line" d="M18 38.5C7 50 9 70 22 79C29 84 33 88 29 94"/></g>`,
  },
  apps: {
    brand: 'Bus Brand',
    emblem: `<g fill="currentColor"><path d="M11 35Q11 26 20 26H81Q90 26 90 35V68H11Z"/><circle cx="29" cy="70" r="8.5"/><circle cx="72" cy="70" r="8.5"/></g><g class="cut"><rect x="17" y="32" width="12" height="12" rx="1.5"/><rect x="33" y="32" width="12" height="12" rx="1.5"/><rect x="49" y="32" width="12" height="12" rx="1.5"/><rect x="65" y="32" width="12" height="12" rx="1.5"/><rect x="81" y="32" width="5" height="20" rx="1.5"/><rect x="11" y="52" width="68" height="3"/><circle cx="29" cy="70" r="3"/><circle cx="72" cy="70" r="3"/></g><path class="ink-line" d="M6 84h88" stroke-dasharray="7 5"/>`,
  },
  fonts: {
    brand: 'அ Brand',
    emblem: `<text x="50" y="71" text-anchor="middle" font-family="Catamaran, 'Noto Sans Tamil', 'Tamil Sangam MN', sans-serif" font-weight="900" font-size="66" fill="currentColor">அ</text>`,
  },
  community: {
    brand: 'Aalamaram Brand',
    emblem: `<g fill="currentColor"><circle cx="50" cy="35" r="20"/><circle cx="31" cy="43" r="15"/><circle cx="69" cy="43" r="15"/><circle cx="39" cy="26" r="12"/><circle cx="61" cy="27" r="12"/><path d="M46 49h8l2.5 33h-13Z"/><rect x="9" y="82" width="82" height="3.5" rx="1.75"/><circle cx="23" cy="70" r="4"/><path d="M18 82q0-8.5 5-8.5t5 8.5Z"/><circle cx="77" cy="70" r="4"/><path d="M72 82q0-8.5 5-8.5t5 8.5Z"/></g><path class="ink-line" d="M30 56v19M36 57v14M64 57v14M70 56v19"/>`,
  },
};

const STICKER = { 'first-pr': '1st PR ok', deep: 'Slow burn', archive: 'Vintage stock' };
const NOTE = {
  deep: 'deep end. Karai mudichittu vaa.',
  archive: 'archive: code last touched 2015. layouts live on in Keyman.',
};

/* ------------------------------------------------------------ helpers */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const isHttp = (u) => /^https:\/\//.test(String(u));
const catOf = (p) => OSS_CATEGORIES.find((c) => c.id === p.category) || { id: p.category, label: p.category, ta: '' };
// a small hand-placed tilt per box on the counter, deterministic
const TILTS = [-2.4, 1.6, -0.8, 2.6, -1.8, 1.1, -2.9, 2, -1.2, 2.4, -1.6, 0.7];
const reduced = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// the label art, all spans so it can sit inside a <button>; decorative (aria-hidden)
function labelHTML(p) {
  const b = BRANDS[p.category] || BRANDS.community;
  const lic = p.licence ? `Contents: ${p.licence}` : 'Contents: open';
  return `<span class="mlabel mlabel--${esc(p.category)}" aria-hidden="true">
  <span class="mlabel__frame">
    <span class="mlabel__brand">${esc(b.brand)}</span>
    <span class="mlabel__disc"><svg viewBox="0 0 100 100" focusable="false">${b.emblem}</svg></span>
    <span class="mlabel__name"${p.name.length >= 12 ? ' data-long' : ''}>${esc(p.name)}</span>
    <span class="mlabel__ta" lang="ta">${esc(p.ta)}</span>
    <span class="mlabel__fine"><span>Mfd. by ${esc(p.prop)}</span><span>Open source · Made in Tamil Nadu · ${esc(lic)}</span></span>
  </span>
  <span class="mlabel__sticker mlabel__sticker--${esc(p.level)}">${esc(STICKER[p.level] || '')}</span>
</span>`;
}

function shelfHTML(p, i) {
  const cat = catOf(p);
  return `<li class="oss-pick oss-pick--${esc(p.category)}" data-cat="${esc(p.category)}" data-id="${esc(p.id)}" style="--r:${TILTS[i % TILTS.length]}deg">
  <button type="button" class="oss-pick__btn" aria-pressed="false" aria-controls="oss-stage" aria-label="${esc(p.name)}, ${esc(cat.label)}. Open the box">
    <span class="oss-pick__box">${labelHTML(p)}<span class="mbox__strike" aria-hidden="true"></span></span>
  </button>
</li>`;
}

function stageHTML(p) {
  const cat = catOf(p);
  const where = p.host === 'site' ? 'website' : `on ${p.host}`;
  const href = isHttp(p.url) ? p.url : '#oss';
  const sticks = [...String(p.stack || '').split(' · '), p.licence].filter(Boolean).slice(0, 3);
  return `<article class="mbox mbox--${esc(p.category)}" data-level="${esc(p.level)}" aria-labelledby="mbox-name">
  <div class="mbox__body">
    <div class="mbox__tray">
      <div class="mbox__tray-in">
        <h3 class="vh" id="mbox-name">${esc(p.name)}: <span lang="ta">${esc(p.ta)}</span> (${esc(cat.label)})</h3>
        <ul class="mbox__sticks" aria-label="Stack and licence">${sticks.map((s) => `<li class="stick"><span>${esc(s)}</span></li>`).join('')}</ul>
        <p class="mbox__desc">${esc(p.desc)}</p>
        <p class="vh">Made by ${esc(p.prop)}.</p>
        ${NOTE[p.level] ? `<p class="mbox__note hand">${esc(NOTE[p.level])}</p>` : p.level === 'first-pr' ? '<p class="vh">Good for a first pull request.</p>' : ''}
        <a class="mbox__link" href="${esc(href)}" target="_blank" rel="noopener">Ulla po<span class="vh">: ${esc(p.name)} ${esc(where)}</span> <span aria-hidden="true">→</span><span class="vh"> (opens in new tab)</span></a>
      </div>
    </div>
    <div class="mbox__sleeve">${labelHTML(p)}</div>
    <span class="mbox__strike" aria-hidden="true"><span>Strike your first PR</span></span>
  </div>
</article>`;
}

function chipHTML(c, n) {
  return `<button type="button" class="oss-chip" data-cat="${esc(c.id)}" aria-pressed="false">${esc(c.label)} <span class="oss-chip__n" aria-hidden="true">${n}</span><span class="vh">, ${n} project${n === 1 ? '' : 's'}</span></button>`;
}

/* ------------------------------------------------------------ mount */

export function mountOss(root = document.getElementById('oss')) {
  if (!root) return null;
  const list = root.querySelector('#oss-list');
  const stage = root.querySelector('#oss-stage');
  const filters = root.querySelector('#oss-filters');
  const count = root.querySelector('#oss-count');
  const street = root.querySelector('#oss-street');
  const live = root.querySelector('#oss-live');
  if (!list || !stage) return null;

  list.innerHTML = OSS_PROJECTS.map(shelfHTML).join('');

  const active = new Set();
  const total = OSS_PROJECTS.length;
  let current = null;
  let seen = false;          // the first open waits until the counter scrolls into view

  if (filters) {
    const counts = Object.fromEntries(OSS_CATEGORIES.map((c) => [c.id, OSS_PROJECTS.filter((p) => p.category === c.id).length]));
    filters.innerHTML =
      `<button type="button" class="oss-chip oss-chip--all" data-cat="all" aria-pressed="true">All <span class="oss-chip__n" aria-hidden="true">${total}</span></button>` +
      OSS_CATEGORIES.filter((c) => counts[c.id] > 0).map((c) => chipHTML(c, counts[c.id])).join('');
    filters.hidden = false;
    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('.oss-chip');
      if (!btn) return;
      const cat = btn.dataset.cat;
      if (cat === 'all') active.clear();
      else if (active.has(cat)) active.delete(cat);
      else active.add(cat);
      apply();
    });
  }

  list.addEventListener('click', (e) => {
    const li = e.target.closest('.oss-pick');
    if (!li || li.dataset.id === current) return;
    select(li.dataset.id, { animate: true });
    const p = OSS_PROJECTS.find((x) => x.id === li.dataset.id);
    if (live && p) live.textContent = `${p.name} is open on the counter.`;
  });

  const pickOf = (id) => list.querySelector(`.oss-pick[data-id="${CSS.escape(id)}"]`);

  // put a box on the counter and slide its tray out
  function select(id, { animate = false } = {}) {
    const p = OSS_PROJECTS.find((x) => x.id === id);
    if (!p) return;
    const prev = current;
    const update = () => {
      stage.innerHTML = stageHTML(p);
      current = id;
      for (const li of list.children) {
        const on = li.dataset.id === id;
        li.classList.toggle('is-out', on);
        li.querySelector('.oss-pick__btn')?.setAttribute('aria-pressed', String(on));
      }
    };
    const open = () => {
      const box = stage.querySelector('.mbox');
      if (!box || !seen) return;
      if (reduced()) { box.classList.add('is-open'); return; }
      requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('is-open')));
    };

    // the picked box flies from its slot to the counter while the old one flies home
    const vt = animate && !reduced() && document.startViewTransition;
    if (!vt) { update(); open(); return; }
    const name = (el, n) => { if (el) el.style.viewTransitionName = n; };
    name(pickOf(id)?.querySelector('.oss-pick__box'), 'mbox-pick');
    name(stage.querySelector('.mbox__sleeve'), 'mbox-home');
    const t = document.startViewTransition(() => {
      name(pickOf(id)?.querySelector('.oss-pick__box'), '');
      update();
      name(stage.querySelector('.mbox__sleeve'), 'mbox-pick');
      if (prev) name(pickOf(prev)?.querySelector('.oss-pick__box'), 'mbox-home');
    });
    t.ready.catch(() => {});   // a quick second pick skips this flight; that's fine
    t.finished.finally(() => {
      name(stage.querySelector('.mbox__sleeve'), '');
      if (prev) name(pickOf(prev)?.querySelector('.oss-pick__box'), '');
      open();
    });
  }

  function apply() {
    let shown = 0;
    let first = null;
    for (const li of list.children) {
      const on = active.size === 0 || active.has(li.dataset.cat);
      li.hidden = !on;
      if (on) { shown++; first ??= li.dataset.id; }
    }
    filters?.querySelectorAll('.oss-chip').forEach((b) => {
      const cat = b.dataset.cat;
      b.setAttribute('aria-pressed', String(cat === 'all' ? active.size === 0 : active.has(cat)));
    });
    if (count) count.textContent = `Showing ${shown} of ${total} projects`;
    // keep the counter in step with the filter
    const cur = current && pickOf(current);
    if (first && (!cur || cur.hidden)) select(first, { animate: !!current });
    if (street) street.scrollLeft = 0;
    syncStreetFocus();
  }

  // the rail is only a tab stop when it actually scrolls (phones)
  function syncStreetFocus() {
    if (!street) return;
    const scrolls = street.scrollWidth > street.clientWidth + 4;
    if (scrolls) street.setAttribute('tabindex', '0');
    else street.removeAttribute('tabindex');
  }
  if (street && 'ResizeObserver' in window) new ResizeObserver(syncStreetFocus).observe(street);

  apply();

  // the first tray slides out when the counter comes into view
  const firstOpen = () => {
    seen = true;
    const box = stage.querySelector('.mbox');
    if (!box) return;
    if (reduced()) box.classList.add('is-open');
    else setTimeout(() => box.classList.add('is-open'), 250);
  };
  if (reduced() || !('IntersectionObserver' in window)) firstOpen();
  else {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); firstOpen(); }
    }, { threshold: 0.35 });
    io.observe(stage);
  }
  return { apply, select };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => mountOss(), { once: true });
} else {
  mountOss();
}

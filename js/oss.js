// ஆழி: "நம்ம ஊரு code" — open-source projects built in, or for, Tamil Nadu.
// Self-contained module: renders filter chips + painted shop boards into #oss.
// Data verified 30 Oct 2026; sources in research/oss-tn.md. No stars or counts on purpose.
//
// DOM contract (index.html, section#oss):
//   #oss-filters  <div>  chips are rendered here (toggle buttons, aria-pressed)
//   #oss-count    <p aria-live="polite">  "Showing N of M projects"
//   #oss-street   <div role="region">  scroll-snap rail on phones (tabindex set only when it scrolls)
//   #oss-list     <ul>  boards are rendered here

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

/* ------------------------------------------------------------ helpers */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const isHttp = (u) => /^https:\/\//.test(String(u));
// small hand-hung tilt per board, deterministic
const TILTS = [-1.8, 1.2, -0.6, 2, -1.4, 0.8, -2.2, 1.6, -0.9, 1.9, -1.2, 0.5];

const LEVEL_NOTE = {
  'first-pr': '<span class="oss-board__stamp">1st PR ok</span>',
  deep: '<span class="oss-board__note hand">deep end. Karai mudichittu vaa.</span>',
  archive: '<span class="oss-board__note hand">archive: code last touched 2015. layouts live on in Keyman.</span>',
};

function boardHTML(p, i) {
  const cat = OSS_CATEGORIES.find((c) => c.id === p.category) || { label: p.category, ta: '' };
  const where = p.host === 'site' ? 'website' : `on ${p.host}`;
  const href = isHttp(p.url) ? p.url : '#oss';
  return `
<li class="oss-board oss-board--${esc(p.category)}" data-cat="${esc(p.category)}" data-level="${esc(p.level)}"${p.name.length >= 12 ? ' data-long' : ''} style="--r:${TILTS[i % TILTS.length]}deg; --d:${(i % 4) * 0.07}s">
  <span class="oss-board__hang" aria-hidden="true"></span>
  <div class="oss-board__plate">
    <p class="oss-board__trade"><span lang="ta">${esc(cat.ta)}</span> · ${esc(cat.label)}</p>
    <h3 class="oss-board__name">${esc(p.name)}</h3>
    <p class="oss-board__ta" lang="ta">${esc(p.ta)}</p>
    <p class="oss-board__desc">${esc(p.desc)}</p>
    <p class="oss-board__prop"><span class="oss-board__prop-k">Prop.</span> ${esc(p.prop)}</p>
    <p class="oss-board__meta"><span>${esc(p.stack)}</span>${p.licence ? ` <span class="oss-board__lic"><span class="vh">Licence: </span>${esc(p.licence)}</span>` : ''}</p>
    <a class="oss-board__link" href="${esc(href)}" target="_blank" rel="noopener">Ulla po<span class="vh">: ${esc(p.name)} ${esc(where)}</span> <span aria-hidden="true">→</span><span class="vh"> (opens in new tab)</span></a>
    ${LEVEL_NOTE[p.level] || ''}
  </div>
</li>`;
}

function chipHTML(c, n) {
  return `<button type="button" class="oss-chip" data-cat="${esc(c.id)}" aria-pressed="false">${esc(c.label)} <span class="oss-chip__n" aria-hidden="true">${n}</span><span class="vh">, ${n} project${n === 1 ? '' : 's'}</span></button>`;
}

/* ------------------------------------------------------------ mount */

export function mountOss(root = document.getElementById('oss')) {
  if (!root) return null;
  const list = root.querySelector('#oss-list');
  const filters = root.querySelector('#oss-filters');
  const count = root.querySelector('#oss-count');
  const street = root.querySelector('#oss-street');
  if (!list) return null;

  list.innerHTML = OSS_PROJECTS.map(boardHTML).join('');

  const active = new Set();
  const total = OSS_PROJECTS.length;

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

  function apply() {
    let shown = 0;
    for (const li of list.children) {
      const on = active.size === 0 || active.has(li.dataset.cat);
      li.hidden = !on;
      if (on) shown++;
    }
    filters?.querySelectorAll('.oss-chip').forEach((b) => {
      const cat = b.dataset.cat;
      b.setAttribute('aria-pressed', String(cat === 'all' ? active.size === 0 : active.has(cat)));
    });
    if (count) count.textContent = `Showing ${shown} of ${total} projects`;
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
  revealBoards(root, list);
  return { apply };
}

/* ------------------------------------------------------------ reveal (motion only) */

function revealBoards(root, list) {
  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (still || !('IntersectionObserver' in window)) return;
  root.classList.add('oss--ready');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  for (const li of list.children) io.observe(li);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => mountOss(), { once: true });
} else {
  mountOss();
}

// ஆழி landing page wiring.
// Sibling modules are imported dynamically so the page still renders (static copy,
// fallback ASCII face, fallback thumbs) when any one of them is missing or throws.
//
// DOM ids used: ascii-hero, ascii-caption, karai-list, muthukuli-list, ticker, ticker-toggle.
// Reveal targets: any [data-reveal] element (the tide line, plus rendered sheets and tickets).

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
const safeId = (v) => String(v ?? '').replace(/[^a-z0-9_-]/gi, '');

async function load(path) {
  try {
    return await import(path);
  } catch (err) {
    console.warn(`[aazhi] ${path} not available, using fallback.`, err);
    return null;
  }
}

/* ------------------------------------------------------------ thumbs */

function thumbFor(renderThumb, course) {
  if (typeof renderThumb === 'function') {
    try {
      const svg = renderThumb(course);
      if (typeof svg === 'string' && svg.trim()) return svg;
    } catch (err) {
      console.warn(`[aazhi] renderThumb failed for ${course?.id}`, err);
    }
  }
  if (course?.kind === 'paid') {
    const t = [course.gate, course.row, course.seat].filter(Boolean).join(' · ');
    return `<div class="ticket-fallback" role="img" aria-label="${esc(course.title)} ticket">${esc(t || 'Muthukuli')}</div>`;
  }
  return `<div class="thumb-fallback"><span>${esc(course?.thumb?.word || course?.title || '')}</span></div>`;
}

/* ------------------------------------------------------------ free: Karai sheets */

export function renderFreeItem(c, i = 0, renderThumb) {
  const id = safeId(c.id);
  return `
<li class="sheet-item" data-reveal style="--d:${(i * 0.08).toFixed(2)}s">
  <article class="sheet" aria-labelledby="k-${id}">
    <div class="sheet__thumb" aria-hidden="true">${thumbFor(renderThumb, c)}</div>
    <div class="sheet__body">
      <p class="sheet__no">No. ${esc(c.no)} · free</p>
      <h3 class="sheet__title" id="k-${id}">${esc(c.title)}</h3>
      ${c.titleTa ? `<p class="sheet__ta" lang="ta">${esc(c.titleTa)}</p>` : ''}
      ${c.hook ? `<p class="sheet__hook">${esc(c.hook)}</p>` : ''}
      <div class="sheet__meta">
        <p class="sheet__dur">${esc(c.duration || 'Self-paced')}</p>
        <a class="sheet__go" href="flows.html#f1">Start free<span class="vh">: ${esc(c.title)}</span> <span aria-hidden="true">→</span></a>
      </div>
    </div>
  </article>
</li>`;
}

/* ------------------------------------------------------------ paid: Muthukuli tickets */

export function renderPaidItem(c, i = 0, renderThumb) {
  const id = safeId(c.id);
  const seats = Number(c.seats) || 0;
  const left = Math.max(0, Math.min(seats, Number(c.seatsLeft) || 0));
  const taken = seats ? (seats - left) / seats : 0;
  const filling = seats && left / seats <= 0.25;
  const stamp = left === 0 && seats ? 'Sold out' : filling ? 'Seats filling' : 'Batch open';

  const facts = [
    ['Duration', c.duration],
    ['Format', c.format],
    ['Next batch', c.nextBatch],
    ['Who', c.level],
  ].filter(([, v]) => v);

  const price = c.price
    ? `
      <div class="price">
        <p class="price__full">${inr(c.price.full)}<small>full</small></p>
        ${c.price.emi ? `<p class="price__emi">or ${inr(c.price.emi)}/mo<small>EMI</small></p>` : ''}
        <p class="price__pay">UPI · EMI · scholarship for first-gen grads. One full class free to try.</p>
      </div>`
    : '';

  const seatsBlock = seats
    ? `
      <div class="seats">
        <p class="seats__label"><b>${left} of ${seats}</b> seats left in this batch</p>
        <div class="seats__bar" aria-hidden="true"><span class="seats__fill" style="--fill:${taken.toFixed(3)}"></span></div>
      </div>`
    : '';

  const includes = Array.isArray(c.includes) && c.includes.length
    ? `<ul class="cohort__includes" aria-label="Included">${c.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
    : '';

  return `
<li class="cohort" data-reveal>
  <div class="cohort__ticket">${thumbFor(renderThumb, c)}</div>
  <article class="cohort__sheet" aria-labelledby="m-${id}">
    <span class="stamp" aria-hidden="true">${stamp}</span>
    <p class="cohort__no">Live cohort ${esc(c.no)} · ${esc(c.lang || 'Tamil class · English notes')}</p>
    <h3 class="cohort__title" id="m-${id}">${esc(c.title)}</h3>
    ${c.titleTa ? `<p class="cohort__ta" lang="ta">${esc(c.titleTa)}</p>` : ''}
    ${c.hook ? `<p class="cohort__hook">${esc(c.hook)}</p>` : ''}
    ${facts.length ? `<dl class="cohort__facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
    ${price}
    ${seatsBlock}
    ${includes}
    <div class="cohort__cta">
      <a class="btn btn--line" href="flows.html#f3">Try one class free<span class="vh">: ${esc(c.title)}</span></a>
      <a class="btn btn--stamp" href="flows.html#f4">Reserve seat<span class="vh">: ${esc(c.title)}</span></a>
    </div>
  </article>
</li>`;
}

const LIST_ERROR = '<li class="collage__msg">Course list load aagala. Page-a refresh pannu, illa konja neram kazhichu try pannu.</li>';

/* ------------------------------------------------------------ reveals */

let io = null;
function reveal(el) {
  el.classList.add('is-in');
  // after the entrance, hover should respond without the stagger delay
  if (el.style.getPropertyValue('--d')) setTimeout(() => el.style.setProperty('--d', '0s'), 1400);
}
function observeReveals(root = document) {
  const els = root.querySelectorAll('[data-reveal]:not(.is-in)');
  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (still || !('IntersectionObserver' in window)) {
    els.forEach(reveal);
    return;
  }
  io ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          reveal(e.target);
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  );
  els.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------ ticker */

function wireTicker() {
  const ticker = document.getElementById('ticker');
  const btn = document.getElementById('ticker-toggle');
  if (!ticker || !btn) return;
  btn.addEventListener('click', () => {
    const paused = ticker.classList.toggle('is-paused');
    btn.setAttribute('aria-pressed', String(paused));
    btn.textContent = paused ? 'Play' : 'Pause';
  });
}

/* ------------------------------------------------------------ boot */

async function boot() {
  // hidden-until-revealed states only apply once this script is actually running
  document.documentElement.classList.add('reveal-ready');
  wireTicker();
  observeReveals();

  const heroP = load('./ascii-hero.js');
  const coursesP = load('./courses.js');
  const thumbsP = load('./thumbs.js');

  // hero: independent of the catalogue
  heroP.then((mod) => {
    const pre = document.getElementById('ascii-hero');
    if (!mod?.mountAsciiHero || !pre) return;
    try {
      // the Kalam tribute: scrambles in once, then shimmers; the dawn sea behind it cycles every 10s
      // dark hero colourways (js/hero-bg.js) draw the sketch as a positive in light characters
      const darkBg = () => ['oxblood', 'sea', 'ink'].includes(document.documentElement.dataset.heroBg);
      const hero = mod.mountAsciiHero(pre, {
        portrait: 'kalam',
        caption: document.getElementById('ascii-caption'),
        backdrop: document.getElementById('hero-sea'),
        interval: 10000,
        tone: darkBg() ? { invert: true } : undefined,
      });
      document.addEventListener('aazhi:herobg', () => hero.retone?.({ invert: darkBg() }));
    } catch (err) {
      console.warn('[aazhi] ASCII hero failed to mount; static face stays.', err);
    }
  });

  const [courses, thumbs] = await Promise.all([coursesP, thumbsP]);
  const renderThumb = thumbs?.renderThumb;
  const free = Array.isArray(courses?.FREE_COURSES) ? courses.FREE_COURSES : null;
  const paid = Array.isArray(courses?.PAID_COURSES) ? courses.PAID_COURSES : null;

  const karai = document.getElementById('karai-list');
  if (karai) karai.innerHTML = free ? free.map((c, i) => renderFreeItem(c, i, renderThumb)).join('') : LIST_ERROR;

  const muthu = document.getElementById('muthukuli-list');
  if (muthu) muthu.innerHTML = paid ? paid.map((c, i) => renderPaidItem(c, i, renderThumb)).join('') : LIST_ERROR;

  observeReveals();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}

export const MENTOR_ENDPOINT = '';
// ஆழி: mentor sign-up ("Ooru-ku thiruppi kudu"), the #mentors section of index.html.
//
// MENTOR_ENDPOINT: when set, sign-ups are POSTed there as JSON (never in the URL).
// When empty (no backend yet), they are kept in this browser's localStorage under
// `aazhi.mentors` so the flow can be demoed end to end.
//
// URL hook: index.html?mentors=open opens the form on load and scrolls to it.

import { renderMentorCard, cardBlob, shareText } from './mentor-card.js';

const STORE_KEY = 'aazhi.mentors';
const TIMEOUT_MS = 12000;

// PLACEHOLDER COUNTER SEED: believable numbers until the backend returns the real count.
// Shown as "N mentors from M districts": N = count + local sign-ups,
// M = these districts plus any new district from local sign-ups.
export const MENTOR_BASE = {
  count: 142,
  districts: [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Thoothukudi',
    'Erode', 'Tiruppur', 'Vellore', 'Thanjavur', 'Dindigul', 'Karur', 'Namakkal', 'Kanniyakumari',
    'Virudhunagar', 'Theni', 'Pudukkottai', 'Sivaganga', 'Ramanathapuram', 'Viluppuram', 'Cuddalore',
    'Kancheepuram', 'Krishnagiri', 'Tenkasi', 'Tiruvarur', 'Nagapattinam',
  ],
};

// Friendly Tanglish errors, one per field.
const MSG = {
  name: 'Unga peyar sollunga. Card-la podanum.',
  emailEmpty: 'Email venum. Reply adhula dhaan varum.',
  email: 'Email konjam check pannunga. Ex: peyar@gmail.com',
  district: 'Sondha ooru endha district-nu select pannunga.',
  city: 'Ippo endha ooru-la irukkeenga?',
  link: 'Link sariyaa illa. linkedin.com/in/unga-peyar maadhiri kudunga.',
  expertise: 'Oru expertise-aavadhu tick pannunga.',
  roles: 'Eppadi help pannuveenga? Oru option-aavadhu pick pannunga.',
  hours: 'Maasam-ku evlo neram-nu select pannunga.',
  tamil: 'Tamil comfort select pannunga. Edhuvum thappu illa.',
  consent: 'Indha box tick pannaa dhaan students ungala reach panna mudiyum.',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ------------------------------------------------------------ storage */

function readStore() {
  try {
    const list = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    return Array.isArray(list) ? list.filter((m) => m && typeof m === 'object') : [];
  } catch {
    return [];
  }
}

function writeStore(entry) {
  try {
    const list = readStore();
    list.push(entry);
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
    return list.length;
  } catch (err) {
    console.warn('[aazhi] mentor sign-up could not be saved locally.', err);
    return null;
  }
}

/* ------------------------------------------------------------ helpers */

const pad4 = (n) => String(Math.max(0, n)).padStart(4, '0');
const mentorNo = (n) => `ஆழி-M-${pad4(n)}`;

function firstGrapheme(word) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const it = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(word)[Symbol.iterator]();
    return it.next().value?.segment ?? '';
  }
  return Array.from(word)[0] ?? '';
}

function initials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((w) => firstGrapheme(w).toLocaleUpperCase()).join('') || 'நீ';
}

function normaliseLink(raw) {
  const v = raw.trim();
  if (!v) return '';
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withScheme);
    return u.hostname.includes('.') ? u.href : null;
  } catch {
    return null;
  }
}

function countText(extra) {
  const districts = new Set(MENTOR_BASE.districts);
  extra.forEach((m) => m.district && districts.add(m.district));
  const n = MENTOR_BASE.count + extra.length;
  return { n, m: districts.size };
}

function renderCount(el, list = readStore()) {
  if (!el) return;
  const { n, m } = countText(list);
  el.innerHTML = '';
  const bn = document.createElement('b');
  bn.textContent = String(n);
  const bm = document.createElement('b');
  bm.textContent = String(m);
  el.append(bn, ` mentor${n === 1 ? '' : 's'} from `, bm, ` district${m === 1 ? '' : 's'}`);
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------ form */

function wireForm(root) {
  const form = root.querySelector('#mentors-form');
  const panel = root.querySelector('#mentors-panel');
  const sheet = root.querySelector('#mentors-sheet');
  const status = root.querySelector('#mentors-status');
  const submit = form?.querySelector('.mform__submit');
  const countEl = root.querySelector('#mentors-count');
  const tpl = root.querySelector('#mentors-success-tpl');
  if (!form || !sheet || !submit) return;

  const el = (id) => form.querySelector(`#${id}`);
  let triedSubmit = false;
  let busy = false;

  // fieldset errors: make every control in the group describe itself with the group's error
  form.querySelectorAll('fieldset.group').forEach((fs) => {
    const errId = `${fs.id}-err`;
    fs.querySelectorAll('input').forEach((i) => i.setAttribute('aria-describedby', errId));
  });

  const checked = (name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((i) => i.value);

  // each check returns '' when fine, or the message to show
  const checks = {
    'm-name': () => (el('m-name').value.trim().length >= 2 ? '' : MSG.name),
    'm-email': () => {
      const v = el('m-email').value.trim();
      if (!v) return MSG.emailEmpty;
      return EMAIL_RE.test(v) ? '' : MSG.email;
    },
    'm-district': () => (el('m-district').value ? '' : MSG.district),
    'm-city': () => (el('m-city').value.trim().length >= 2 ? '' : MSG.city),
    'm-link': () => (normaliseLink(el('m-link').value) === null ? MSG.link : ''),
    'm-expertise': () => (checked('expertise').length ? '' : MSG.expertise),
    'm-roles': () => (checked('roles').length ? '' : MSG.roles),
    'm-hours': () => (checked('hours').length ? '' : MSG.hours),
    'm-tamil': () => (checked('tamil').length ? '' : MSG.tamil),
    'm-consent': () => (el('m-consent').checked ? '' : MSG.consent),
  };

  function show(id, msg) {
    const target = el(id);
    const err = form.querySelector(`#${id}-err`);
    if (!target || !err) return;
    err.textContent = msg;
    err.hidden = !msg;
    if (target.tagName === 'FIELDSET') {
      target.toggleAttribute('data-invalid', !!msg);
      target.querySelectorAll('input').forEach((i) => (msg ? i.setAttribute('aria-invalid', 'true') : i.removeAttribute('aria-invalid')));
    } else if (msg) {
      target.setAttribute('aria-invalid', 'true');
    } else {
      target.removeAttribute('aria-invalid');
    }
  }

  const run = (id) => {
    const msg = checks[id]();
    show(id, msg);
    return msg;
  };

  // text fields: check on leaving; once flagged, re-check while typing so the error clears live
  ['m-name', 'm-email', 'm-district', 'm-city', 'm-link'].forEach((id) => {
    const f = el(id);
    f.addEventListener('blur', () => {
      if (f.value.trim() || triedSubmit) run(id);
    });
    f.addEventListener(f.tagName === 'SELECT' ? 'change' : 'input', () => {
      if (f.getAttribute('aria-invalid') === 'true') run(id);
    });
  });
  // groups + consent: re-check on change after the first submit attempt
  ['m-expertise', 'm-roles', 'm-hours', 'm-tamil', 'm-consent'].forEach((id) => {
    el(id).addEventListener('change', () => {
      if (triedSubmit) run(id);
    });
  });

  function setStatus(text, isError = false) {
    if (!status) return;
    status.textContent = text;
    status.classList.toggle('is-error', isError);
  }

  function setBusy(on) {
    busy = on;
    submit.setAttribute('aria-disabled', String(on));
    submit.firstChild.textContent = on ? 'Card print aagudhu… ' : 'En card-a kudunga ';
  }

  function collect() {
    const sel = el('m-district');
    const opt = sel.options[sel.selectedIndex];
    return {
      name: el('m-name').value.trim().replace(/\s+/g, ' '),
      email: el('m-email').value.trim(),
      district: sel.value,
      districtTa: opt?.dataset.ta || '',
      city: el('m-city').value.trim(),
      role: el('m-role').value.trim(),
      expertise: checked('expertise'),
      roles: checked('roles'),
      hours: checked('hours')[0] || '',
      link: normaliseLink(el('m-link').value) || '',
      tamil: checked('tamil')[0] || '',
      consent: el('m-consent').checked,
      createdAt: new Date().toISOString(),
      source: 'landing#mentors',
    };
  }

  async function post(data) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(MENTOR_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
        signal: ctrl.signal,
        credentials: 'omit',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json().catch(() => ({}));
      return body && typeof body === 'object' ? body : {};
    } finally {
      clearTimeout(timer);
    }
  }

  function showSuccess(data, no) {
    if (!tpl) return;
    const node = tpl.content.firstElementChild.cloneNode(true);
    const fill = (key, value) => node.querySelectorAll(`[data-f="${key}"]`).forEach((n) => (n.textContent = value));
    fill('name', data.name);
    fill('first', data.name.split(' ')[0]);
    fill('initials', initials(data.name));
    fill('from-ta', data.districtTa || data.district);
    fill('city', data.city);
    fill('role', data.role);
    fill('roles', data.roles.join(' · '));
    fill('no', no);
    fill('district', data.district);
    const chips = node.querySelector('[data-f="expertise"]');
    data.expertise.forEach((x) => {
      const li = document.createElement('li');
      li.textContent = x;
      chips.append(li);
    });
    const title = node.querySelector('.mdone__title');
    title.id = 'mentors-done-title';
    node.setAttribute('aria-labelledby', 'mentors-done-title');
    sheet.replaceChildren(node);
    const note = root.querySelector('#mentors-sample-cap');
    if (note) {
      note.lastChild.textContent = 'unga card ready, keezha paarunga';
      note.classList.add('is-done');
    }
    panel.setAttribute('aria-labelledby', 'mentors-done-title');
    wireShare(node, {
      name: data.name, initials: initials(data.name), fromTa: data.districtTa || data.district,
      district: data.district, city: data.city, role: data.role,
      expertise: data.expertise, roles: data.roles, no,
    });
    node.focus({ preventScroll: true });
    node.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    triedSubmit = true;

    const failed = Object.keys(checks).filter((id) => run(id));
    if (failed.length) {
      setStatus(failed.length === 1 ? 'Oru field konjam check pannunga.' : `${failed.length} fields konjam check pannunga.`, true);
      const first = el(failed[0]);
      const focusTarget = first.tagName === 'FIELDSET' ? first.querySelector('input') : first;
      focusTarget?.focus();
      return;
    }

    // honeypot: bots fill the hidden field; quietly pretend it worked
    if (el('m-website').value) {
      showSuccess(collect(), mentorNo(MENTOR_BASE.count + 1));
      return;
    }

    const data = collect();
    setBusy(true);
    setStatus('Card print aagudhu…');
    try {
      let no;
      if (MENTOR_ENDPOINT) {
        const body = await post(data);
        no = typeof body.no === 'string' ? body.no : mentorNo(MENTOR_BASE.count + readStore().length + 1);
      } else {
        const stored = writeStore(data);
        no = mentorNo(MENTOR_BASE.count + (stored ?? readStore().length + 1));
        renderCount(countEl);
      }
      showSuccess(data, no);
    } catch (err) {
      console.warn('[aazhi] mentor sign-up failed.', err);
      const timedOut = err?.name === 'AbortError';
      setStatus(
        timedOut
          ? 'Server late-a irukku. Unga details form-la safe-a irukku; konja neram kazhichu marubadi try pannunga.'
          : 'Anuppa mudiyala. Unga details form-la safe-a irukku; marubadi try pannunga.',
        true,
      );
      setBusy(false);
    }
  });
}

/* ------------------------------------------------------------ share the ID card */

// Renders the card image once (eagerly, so clicks stay inside the browser's
// user-activation window) and wires download / copy / LinkedIn / native share.
function wireShare(node, card) {
  const box = node.querySelector('.mshare');
  if (!box) return;
  const status = box.querySelector('.mshare__status');
  const say = (t) => { status.textContent = t; };
  const fileName = `aazhi-mentor-${card.no.replace(/[^\w-]+/g, '').replace(/^-+/, '')}.png`;
  const text = shareText(card.no);

  const blobP = renderMentorCard(card).then(cardBlob);
  blobP.catch((err) => {
    console.warn('[aazhi] mentor card image failed.', err);
    say('Card image ready aagala. Page-a refresh pannitu try pannunga.');
  });

  const canCopy = !!(navigator.clipboard?.write && window.ClipboardItem && window.isSecureContext);
  if (!canCopy) box.querySelector('[data-share="copy"]').hidden = true;

  // native share sheet with the image (phones: LinkedIn, WhatsApp, Instagram all show up here)
  const nativeBtn = box.querySelector('[data-share="native"]');
  let file = null;
  blobP.then((b) => {
    file = new File([b], fileName, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) nativeBtn.hidden = false;
  }, () => {});

  const download = async () => {
    const url = URL.createObjectURL(await blobP);
    const a = Object.assign(document.createElement('a'), { href: url, download: fileName });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  // ClipboardItem takes the promise directly so Safari keeps the click's user activation
  const copy = () => navigator.clipboard.write([new ClipboardItem({ 'image/png': blobP })]);

  const nativeShare = () => navigator.share({ files: [file], title: 'My Aazhi mentor card', text });

  box.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-share]');
    if (!btn) return;
    const kind = btn.dataset.share;
    try {
      if (kind === 'download') {
        await download();
        say(`Saved as ${fileName}. LinkedIn, WhatsApp status, engayum podunga.`);
      } else if (kind === 'copy') {
        await copy();
        say('Card copied. Post-la paste pannunga (Ctrl/Cmd + V).');
      } else if (kind === 'native') {
        await nativeShare();
      } else if (kind === 'linkedin') {
        // On phones the share sheet can hand LinkedIn the image itself.
        if (file && navigator.canShare?.({ files: [file] }) && matchMedia('(pointer: coarse)').matches) {
          await nativeShare();
          return;
        }
        // Desktop: LinkedIn's composer can't take an image by URL, so put the
        // card on the clipboard (or in Downloads) and open a prefilled post.
        let how;
        if (canCopy) {
          try { await copy(); how = 'copied'; } catch { /* fall through to download */ }
        }
        if (!how) { await download(); how = 'downloaded'; }
        const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
        const w = window.open(url, '_blank');
        if (w) w.opener = null;
        say(how === 'copied'
          ? 'LinkedIn open aagudhu, post text ready. Card copied: post-la paste pannunga (Ctrl/Cmd + V).'
          : `LinkedIn open aagudhu, post text ready. Card ${fileName}-a Downloads-la irundhu attach pannunga.`);
        if (w === null) say('Pop-up block aayiduchu. LinkedIn-a open panna browser-la allow pannunga, illa marubadi click pannunga.');
      }
    } catch (err) {
      if (err?.name === 'AbortError') return; // user closed the share sheet
      console.warn('[aazhi] share failed.', err);
      say(kind === 'copy'
        ? 'Copy aagala. "Download card" try pannunga.'
        : 'Share aagala. "Download card" panni manually podunga.');
    }
  });
}

/* ------------------------------------------------------------ disclosure */

function wireDisclosure(root) {
  const btn = root.querySelector('#mentors-toggle');
  const panel = root.querySelector('#mentors-panel');
  if (!btn || !panel) return;

  const set = (open, { scroll = false } = {}) => {
    btn.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    root.classList.toggle('is-open', open);
    if (!open) return;
    panel.classList.add('is-opening');
    setTimeout(() => panel.classList.remove('is-opening'), 600);
    if (scroll) {
      const top = panel.getBoundingClientRect().top;
      if (top > window.innerHeight * 0.6) {
        panel.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
      }
    }
  };

  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true', { scroll: true }));

  let wantOpen = false;
  try {
    wantOpen = new URLSearchParams(location.search).get('mentors') === 'open';
  } catch { /* ignore */ }
  set(wantOpen);

  if (wantOpen) {
    // the course lists above render late and push the page down; scroll once things settle
    const go = () => root.scrollIntoView({ block: 'start' });
    if (document.readyState === 'complete') requestAnimationFrame(go);
    else window.addEventListener('load', () => requestAnimationFrame(go), { once: true });
  }
}

/* ------------------------------------------------------------ boot */

function boot() {
  const root = document.getElementById('mentors');
  if (!root) return;
  const countEl = root.querySelector('#mentors-count');
  renderCount(countEl);
  countEl?.setAttribute('aria-live', 'polite');
  wireDisclosure(root);
  wireForm(root);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}

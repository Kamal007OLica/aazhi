// ஆழி — hero background colourway.
// The chosen colourway is HERO_BG below; ship it by changing that one value.
// On localhost only, a small picker lets you flip between colourways live
// (?bg=sea also works) and remembers your last pick in this browser.

export const HERO_BG = 'oxblood';   // keep in sync with data-hero-bg on <html> in index.html

const WAYS = [
  { key: 'fog', name: 'Fog', sw: '#c3c2bf' },
  { key: 'paper', name: 'Paper', sw: '#ece7dc' },
  { key: 'chilli', name: 'Chilli', sw: '#e5470e' },
  { key: 'manjal', name: 'Manjal', sw: '#e3a21a' },
  { key: 'oxblood', name: 'Oxblood', sw: '#2b0908' },
  { key: 'sea', name: 'Deep sea', sw: '#0f3d44' },
  { key: 'ink', name: 'Ink', sw: '#0d0b0a' },
];
const KEY = 'aazhi.heroBg';
const root = document.documentElement;

function apply(key) {
  if (!key || key === 'fog') root.removeAttribute('data-hero-bg');
  else root.setAttribute('data-hero-bg', key);
  document.dispatchEvent(new CustomEvent('aazhi:herobg', { detail: { key } }));
}

const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);

let start = HERO_BG;
if (isLocal) {
  try { start = localStorage.getItem(KEY) || start; } catch { /* storage blocked */ }
  const q = new URLSearchParams(location.search).get('bg');
  if (q && WAYS.some((w) => w.key === q)) start = q;
}
apply(start);

if (isLocal) {
  const mount = () => {
    const bar = document.createElement('div');
    bar.className = 'bgpick';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Hero background (localhost preview only)');
    const label = Object.assign(document.createElement('span'), { className: 'bgpick__label', textContent: 'Hero bg' });
    const name = Object.assign(document.createElement('span'), { className: 'bgpick__name' });
    name.setAttribute('aria-live', 'polite');
    bar.append(label);
    const buttons = WAYS.map((w) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'bgpick__sw';
      b.style.setProperty('--sw', w.sw);
      b.title = w.name;
      b.setAttribute('aria-label', w.name);
      b.addEventListener('click', () => select(w.key));
      bar.append(b);
      return b;
    });
    bar.append(name);
    function select(key) {
      apply(key);
      try { localStorage.setItem(KEY, key); } catch { /* ignore */ }
      WAYS.forEach((w, i) => buttons[i].setAttribute('aria-pressed', String(w.key === key)));
      name.textContent = WAYS.find((w) => w.key === key).name;
    }
    select(start);
    document.body.append(bar);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
}

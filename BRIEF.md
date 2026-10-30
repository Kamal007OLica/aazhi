# ஆழி (Aazhi) — shared build brief

Every agent reads this whole file before writing anything. It is the single source of truth for brand, voice, course line-up, file ownership and module contracts.

## 1. What we are building

A landing page (plus a flows page and a brand page) for **ஆழி / Aazhi**, a tech-education brand that turns students from Tamil Nadu's tier-2 and tier-3 towns into serious engineers. "ஆழி" means the deep sea. It is a rethink of https://parottasalna.com (Syed Jafer K's Tamil tech school: backend, cloud, AI, taught in Tamil, notes in English, 1000+ students).

Static site, no build step: plain HTML + CSS + ES modules, opened via a local static server. Production quality: semantic HTML, accessible (WCAG AA contrast, keyboard, `prefers-reduced-motion`), responsive down to 360px, no console errors, no external JS libraries.

## 2. Visual style (from the three references the user gave)

- **Ref 1, ASCII portrait homepage (starpause.com):** a big portrait made only of monospace characters (`dK9*+!:.` style) on a flat light-grey ground. Bilingual intro columns (english! / 日本語!) and plain underlined link lists. → Our hero. A **random person drawn in code characters** that regenerates **every 10 seconds**. Bilingual columns: `english!` / `தமிழ்!`.
- **Ref 2, orange editorial collage:** a chilli-orange field with stacked paper sheets, a paperclip and a binder clip, heavy condensed headline type ("I ask these Five questions first."), highlighter blocks in lavender and salmon with little selection-handle dots, a hand-drawn ellipse around a small note, a torn tape label, a violet bookmark. → Manifesto and free-course sections.
- **Ref 3, "SOLD OUT" ticket poster:** oxblood-to-cream grainy gradient, a giant condensed headline, wide-tracked small caps (`N A I R A  M A Y`), two paper tickets with photo, QR, barcode, seat info ("GRADA · FILA 3 · ASIENTO 11"), red rubber "SOLD OUT" stamps. → Paid cohorts are **tickets**.

### Hard rules
- **No box-grid / graph-paper / square-grid background patterns anywhere.** The user said they look outdated and AI-generated. Use film grain (`var(--grain)`), paper fibers (`var(--fibers)`), halftone dots, paper stacks, tape and torn edges instead.
- No generic SaaS look: no rounded-card grids with drop shadows in neat rows, no purple-blue gradients, no emoji icons, no stock "feature icon + 3 lines" blocks.
- Layouts feel **physically collaged**: slight rotations (-3°..3°), overlaps, sheets peeking from behind, clips, stamps, hand annotations in `--f-hand` and `--biro` blue.
- Use the tokens in `css/tokens.css` (colours, fonts, scale). Do not invent new colours outside small tints of these.

### Type
- Display: `--f-display` (Anton), uppercase or tight sentence case, line-height ~0.88, letter-spacing -0.01em.
- Tamil: `--f-tamil` (Catamaran 700/900). Tamil script appears in every major section, never as decoration only: it must make sense.
- Body: `--f-body` (Archivo). Labels: `--f-narrow` uppercase with `--track-wide`.
- Code / ASCII: `--f-mono`.
- Hand notes: `--f-hand` in `--biro` or `--stamp`.

## 3. Tonality (voice)

**Who we talk to:** 18–23-year-olds in Madurai, Tirunelveli, Thoothukudi, Kovilpatti, Salem, Erode, Namakkal, Dindigul, Karur, Thanjavur, Kumbakonam, Pudukkottai, Villupuram, Nagercoil, Theni, Sivakasi, and so on. Often first-generation engineers. Some are from Tamil-medium schools and nervous about English. Some share a phone or a laptop with a sibling. They watch Tamil tech YouTube, live on Instagram reels, and have family pressure about "settle aagu".

**Voice:** a sharp senior from your own town who made it to a product company and came back to pull you up. Confident, warm, funny, a little cheeky, never preachy, never corporate.

- Write in **Tanglish** (Tamil words in Latin script mixed with English), with real **Tamil script** for the big emotional lines. Example register: "Ooru chinnadhu. Kanavu periyadhu." / "English theriyaadhu-nu bayama? Code-ku grammar podhum, accent illa." / "Laptop illaya? Phone-la start pannu. Seriously."
- Short sentences. Punchy. Gen Z rhythm but not cringe: no "fam", no "slay", no "no cap", no forced memes.
- Tamil-rooted metaphors: tea kadai, bus stand, semester arrears, Amma's "saapdiya?", the 6:40 town bus, the cycle to college, the ocean, **pearl diving (முத்துக்குளி, Thoothukudi's pearl divers)**, kolam, temple festival lights.
- Honesty sells: say what is free, what costs money, and how long it really takes.
- Gender-neutral: "nanba / nanbi" together, or "machi" sparingly. Avoid only "da" or only "di".
- Anchor lines (use them, adapt them, but keep the spirit):
  - Hero: **"ஊர் சின்னது. கனவு பெருசு."** / "Small town. Deep code."
  - "From the 6:40 town bus to a pull request merged in Bengaluru."
  - "Free-a kaththukko. Plan-oda velai vaangu." (Learn for free. Land the job with a plan.)
  - "கரை first. Then ஆழம்." (Shore first, then the deep.)
  - "Tamil-la puriyum. English-la interview crack pannu." (Understand it in Tamil. Crack the interview in English.)

## 4. Course line-up (decided; do not change ids)

The ocean is the metaphor. **Free courses = கரை / Karai (the shore)**: get your feet wet. **Paid cohorts = முத்துக்குளி / Muthukuli (pearl diving)**: guided deep dives, live, with a mentor, where the pearl is the job.

### Free: கரை / Karai (6 self-paced courses, free forever)
| id | Working title | Bundles these parottasalna courses |
|---|---|---|
| `f-python` | Python: print() to your first game, plus clean-code patterns | Python Fundamentals + Design Patterns in Python |
| `f-git` | Git & GitHub: save-point for your life | Git & Version Control + Git & GitHub Basics to Intermediate |
| `f-dsa` | DSA Patterns: 23 patterns, zero mugging | DSA Patterns for Coding Interviews |
| `f-sql` | Databases with PostgreSQL | Database Engineering with PostgreSQL |
| `f-docker` | Docker + load testing: "works on my machine" no more | Docker Mastery + Load Testing with Locust |
| `f-prompt` | Prompt Engineering: talk to AI like a pro | Prompt Engineering |

Also free (a tool, not a course): **Resume Review** (ATS score, 3 per day).

### Paid: முத்துக்குளி / Muthukuli cohorts (3 live programs)
| id | Working title | Bundles | Format |
|---|---|---|---|
| `p-backend` | **Muthu 01: Backend → Offer Letter** | Backend Engineering + Backend for College Students + System Design Cohort + Interview Prep Cohort | ~9 months, live Tamil classes, English notes, capstone, 2 scored mocks, 10 system-design case studies. Built for final-years and freshers. |
| `p-cloud` | **Muthu 02: Cloud & DevOps** | AWS Architecture Masterclass (SAA-C03) + Azure Solutions Architect (AZ-305) + Docker & Kubernetes Systems Engineering | ~6 months, weekends + 2 weeknights, 6 mock exams, ends deploying a real app on K8s |
| `p-ai` | **Muthu 03: AI Agents & Data** | AI Agent Engineering + End-to-End Data Engineering (Databricks) | ~4 months, Mon/Wed/Fri nights, RAG, multi-agent, MCP, evals, Airflow, PySpark, Kafka |

**Prices are placeholders** (parottasalna does not publish them). Use: p-backend ₹14,999 or ₹1,999/mo; p-cloud ₹11,999 or ₹1,799/mo; p-ai ₹12,999 or ₹1,899/mo. Always show "UPI · EMI · scholarship for first-gen grads" and "one full class free to try".

## 5. File ownership (write ONLY your own files)

| Agent | Owns |
|---|---|
| ASCII hero engine | `js/ascii-hero.js`, `hero-lab.html` (an isolated test page) |
| Course catalog + copy | `js/courses.js` |
| Course thumbnails | `js/thumbs.js`, `thumbs-lab.html` (preview page of all 9) |
| Landing page build | `index.html`, `css/site.css`, `js/main.js` |
| Flows page | `flows.html`, `css/flows.css` |
| Brand + voice guide | `brand.html`, `css/brand.css` |

`css/tokens.css` and this file belong to the lead. Do not edit them. Never create a `package.json` or install anything.

## 6. Module contracts

### `js/ascii-hero.js`
```js
export function mountAsciiHero(pre, { caption, interval = 10000, seed } = {})
// pre: a <pre> element. Fill it with the ASCII portrait; size the font so the art fits the element's width.
// caption: optional element; set its textContent to the current person's tag, e.g.
//   "நண்பி #0427 · Kovilpatti → Bengaluru · backend"
// Returns { next(), destroy() }. Regenerates a NEW random person every `interval` ms, with a
// character-scramble transition (~1.2s). Respect prefers-reduced-motion (instant swap, no scramble).
// Pauses when the tab is hidden or the hero is off-screen (IntersectionObserver).
```
The page uses `<pre id="ascii-hero" aria-hidden="true"></pre>` and `<p id="ascii-caption"></p>`.

### `js/courses.js`
```js
export const FREE_COURSES = [ Course, ... ]  // 6 items, ids from section 4, in that order
export const PAID_COURSES = [ Course, ... ]  // 3 items, ids from section 4, in that order
// Course = {
//   id, kind: 'free'|'paid', no: '01',
//   title, titleTa,            // English working title + short Tamil-script title
//   hook,                      // one Tanglish line, <= 90 chars
//   outcome,                   // what you can DO after, one sentence
//   topics: [string],          // 4–8 short items
//   duration, format, level,   // short strings
//   lang: 'Tamil class · English notes',
//   bundles: [string],         // parottasalna course names it merges
//   thumb: { word, accent, motif },  // word: 1–2 words for the thumbnail; accent: 'chilli'|'lavender'|'salmon'|'violet'|'sea'|'stamp'; motif: see thumbs
//   // paid only:
//   price: { full: 14999, emi: 1999 }, nextBatch: '16 Nov 2026', seats: 60, seatsLeft: 17,
//   gate: 'GATE 01', row: 'ROW 3', seat: 'SEAT 11',  // ticket stub details
//   includes: [string],        // 4–6 items
// }
```

### `js/thumbs.js`
```js
export function renderThumb(course) // returns an SVG markup string, viewBox "0 0 400 300" for free, "0 0 640 280" for paid
```
- Free: a paper-sheet collage thumbnail (ref 2): sheet stock with fibers, the big `thumb.word` in condensed type, a highlighter block in `thumb.accent`, and a motif drawn from the course (`python`: snake coiled into a kolam; `git`: branching railway lines / bus route map; `dsa`: stacked tiffin boxes as a stack; `sql`: ration-shop ledger table; `docker`: shipping containers at Thoothukudi port; `prompt`: speech bubbles with a cursor). Paperclip or tape on some.
- Paid: a ticket (ref 3): perforated stub, ASCII/halftone emblem, wide-tracked caps, QR-ish block pattern, barcode, gate/row/seat, a rotated red rubber stamp ("LIVE BATCH", "SEATS FILLING", "BATCH OPEN").
- Must work on its own given a Course object; if a field is missing, fall back gracefully. Unique SVG ids per call (thumbs appear many times on a page).

## 7. Page structure (index.html), top to bottom

1. **Nav:** ஆழி wordmark (Tamil script, black) + `aazhi.` small; links: Karai (free), Muthukuli (cohorts), Flows, Brand; CTA "Start free →".
2. **Hero (ref 1):** fog-grey ground, giant ASCII portrait centred, caption under it in tracked mono. Under the portrait, two text columns `english!` and `தமிழ்!` plus a link-list column (`kaththukko` / `paaru` / `join`), like ref 1 but sharper. Big headline "ஊர் சின்னது. கனவு பெருசு." somewhere bold. Primary CTAs: "Start free, no login" and "See cohorts".
3. **Town ticker:** a marquee of towns → cities ("Kovilpatti → Bengaluru", "Karur → Chennai", ...).
4. **Manifesto (ref 2):** chilli field, stacked sheets, clip, highlighter, "Before you open VS Code, 5 bayangal we kill first" (English bayam, laptop, money, connections, time).
5. **Karai (free):** 6 free courses as scattered paper sheets with thumbnails, plus the Resume Review tool as a torn note.
6. **The route:** how free leads to paid (shore → wave → pearl), a horizontal tide line, not boxes.
7. **Muthukuli (paid):** oxblood grainy section, giant "3 SEATS" / "MUTHUKULI" headline, the 3 courses as tickets with stamps, price, EMI, next batch, seats left.
8. **Proof:** stories as postcards from towns.
9. **FAQ:** Tanglish Q&A (details/summary).
10. **Footer:** a mega ஆழி wordmark, links, "Built in Tamil Nadu".

## 8. Progress reporting

Right after reading this brief, call `mcp__savvy-progress__step` with `total` (your plan, 3–8 steps) and `done: 0`; call it again with the new `done` count as each step finishes (load it first with ToolSearch `select:mcp__savvy-progress__step` if it is deferred). Finish by replying with a short report: files written, any contract deviation, anything the lead must wire up.

## 9. Round 2 (30 Oct 2026)

- **Tagline (final, updated 30 Oct by the founder):** "Creating the next big tech minds from Tamil rural roots". It is the hero's English line, the page title, and appears in the footer.
- **Brand mark:** a geometric, faceted, 3D-reading mark built from a Tamil letter (style ref: sharp light-grey paper-plane shards on black). Files under `assets/mark/`; exploration page `mark.html`.
- **Hero must read as Tamil roots**, not generic ASCII: colour, ground, props and caption all carry it. Owner files: `js/ascii-hero.js`, `css/hero.css`.
- **Mentor sign-up** (section `#mentors` at the end of index.html): Tamil Nadu-rooted professionals opt in to mentor, review, refer. Owner files: the `#mentors` section in index.html only, `css/mentors.css`, `js/mentors.js`.

## 10. Round 3 (30 Oct 2026): classic split hero

- **English tagline:** "Creating the next big tech minds from Tamil rural roots." **Tamil tagline:** "மண்ணில் வேர். விண்ணில் கனவு." (Roots in the soil; was: Roots in the village. Dreams in the sky.)
- **Hero = classic SaaS/sales split.** Left: eyebrow, H1 (the English tagline), the Tamil line, a one-line sub, two CTAs, a trust row. Right: an ASCII tribute portrait of **Dr. A. P. J. Abdul Kalam** (Rameswaram → ISRO → Rashtrapati Bhavan), the Tamil icon of tech. Fits one screen on desktop.
- It is a **tribute**, never an endorsement: no wording that implies Kalam or his foundation backs Aazhi.
- **Every section should land compactly in one viewport** where possible, the closing "takeoff" section especially.

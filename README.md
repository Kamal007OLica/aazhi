# ஆழி · Aazhi

**Creating the next big tech minds from Tamil rural roots.**
மண்ணில் வேர். விண்ணில் கனவு.

Landing page, user flows and brand system for Aazhi, a Tamil-first tech school for students from Tamil Nadu's tier-2 and tier-3 towns. Classes in Tamil, notes in English. Six courses free forever (கரை · Karai), three live cohorts (முத்துக்குளி · Muthukuli).

## Pages

| Page | What it is |
|---|---|
| `index.html` | The landing page: split hero with the ASCII Kalam tribute, manifesto, free courses, the route, Tamil Nadu open source, cohorts, stories, FAQ, mentor sign-up, closing section |
| `flows.html` | Sitemap and five user flows (first lesson → sign-in → free to paid → checkout → returning learner) |
| `brand.html` | Brand book: idea, three visual worlds, colour, type, props, voice and tone, logo |
| `mark.html` | The ழ brand mark: construction, lockups, sizes, grounds, usage |
| `hero-lab.html`, `thumbs-lab.html` | Tuning pages for the ASCII portrait engine and course thumbnails |

## Run locally

Plain HTML, CSS and ES modules. No build step, no dependencies. Serve the folder (ES modules don't load from `file://`):

```bash
python3 -m http.server 4321
```

Then open http://localhost:4321.

## Before launch

- Prices, student postcards and the mentor counter are placeholders.
- Mentor sign-ups save to the visitor's browser until `MENTOR_ENDPOINT` in `js/mentors.js` points at a real backend.
- The Kalam portrait is a tribute: confirm the illustration licence and permission from the APJ Abdul Kalam International Foundation.

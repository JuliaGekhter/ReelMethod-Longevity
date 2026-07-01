# Shape The Wave Longevity™ — Ecosystem Site

> Optimize health. Align habits. Live longer, better.

A single-page marketing + product site for **Shape The Wave Longevity™** — powered by
the **REEL™ Align Method** and **ReelVerse AI™**. It presents the brand story end to
end and lets visitors browse and compare membership plans.

See [`BRAND.md`](./BRAND.md) for the canonical brand reference.

## Sections
1. **Hero** — brand, tagline, core message, and a call to action.
2. **The REEL™ Align Method** — the five-step framework: *Reflect · Envision · Execute · Learn · Align*.
3. **The Locked Hierarchy** — the four locked tiers, top to bottom:
   Shape The Wave Longevity™ → REEL™ Align Method™ → ReelVerse AI™ → ReelVerse OS™.
4. **The ReelVerse Ecosystem** — Coach, Mirror, Compass, Momentum, Academy, plus the
   **Certified REEL Method Practitioner™** credential.
5. **Membership Plans** — searchable/filterable/sortable browser of all 21 plans,
   with a **Compare** tool (select 2–3 plans → side-by-side comparison) and a
   "Most popular" highlight.
6. **What Members Say** — testimonials.
7. **FAQ** — expandable common questions.
8. **Get Started** — a contact form with client-side validation.

## Features
- **Light / dark theme toggle** in the nav (remembers your choice via `localStorage`,
  defaults to your system preference).
- **Plan compare** — pick plans, open a side-by-side table of price, billing,
  annualized cost, discount, and benefits.
- **Scroll-reveal animations** (respects `prefers-reduced-motion`).
- **Contact form** — validates input, then opens the visitor's email client with a
  pre-filled inquiry. There is no backend, so nothing is stored or transmitted by the
  site itself. Update the destination address by editing `CONTACT_EMAIL` near the
  contact section in `app.js` (currently a `hello@shapethewavelongevity.com` placeholder).

## Tech
Plain static site — **HTML + CSS + vanilla JavaScript**. No build step, no
dependencies, no backend.

## Run it

**Option A — just open it.** Open `index.html` in a browser. Membership data is inlined
as a fallback, so the page works straight from the file system.

**Option B — serve it locally** (recommended; loads data from `data/memberships.json`):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
index.html            Full single-page site (nav, hero, method, hierarchy, ecosystem, memberships)
styles.css            Brand theming + responsive layouts
app.js                Membership data loading + search/filter/sort/price logic
data/memberships.json The 21 membership plans (source of truth)
BRAND.md              Canonical Final Brand Summary
```

## Updating the data

Edit `data/memberships.json` — each plan looks like:

```json
{
  "source": "Original",
  "name": "Essential Wellness",
  "price": 114,
  "recurrence": "Monthly",
  "discount": null,
  "annualizedPrice": 1368,
  "benefits": "1 Lipo or B12 shot, Tanita scan, lifestyle consult (with basic lab)"
}
```

When served over HTTP the app reads this file directly. If you also want the
direct-open (`file://`) path to reflect changes, mirror them into the
`FALLBACK_PLANS` array at the top of `app.js`.

## Deployment (GitHub Pages)

The site deploys automatically to **GitHub Pages** via
[`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml). The
workflow uploads the repository root as-is (no build step) and publishes it on every
push to `main` (and can be run manually via *Actions → Run workflow*).

First-time setup: in **Settings → Pages → Build and deployment**, set **Source** to
**GitHub Actions** if it isn't enabled automatically. The published URL appears in the
Pages settings and in each successful workflow run.

## Notes
- Pricing is for reference only; benefits are subject to consultation and availability.
- 21 plans total: 13 original + 8 added 6/19.

# Shape The Wave Longevity™ — Membership Browser

> Optimize health. Align habits. Live longer, better.

A lightweight, single-page web app for browsing and comparing
**Shape The Wave Longevity™** membership plans. Visitors can search by name or
benefit, filter by billing cadence and collection, sort by price or name, and cap
results by a max-price slider.

Part of the broader ecosystem — **REEL™ Align Method** · **ReelVerse AI™** —
*Reflect · Envision · Execute · Learn · Align.*

## Tech
Plain static site — **HTML + CSS + vanilla JavaScript**. No build step, no
dependencies, no backend.

## Run it

**Option A — just open it.** Double-click `index.html` (or open it in a browser).
The plan data is inlined as a fallback, so it works straight from the file system.

**Option B — serve it locally** (recommended; loads data from `data/memberships.json`):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
index.html            Page structure + controls
styles.css            Brand theming + responsive card grid
app.js                Data loading, search/filter/sort/price logic
data/memberships.json The 21 membership plans (source of truth)
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

## Notes
- Pricing is for reference only; benefits are subject to consultation and availability.
- 21 plans total: 13 original + 8 added 6/19. *Mental Health Membership* intentionally
  shows placeholder benefits / cadence pending finalization.

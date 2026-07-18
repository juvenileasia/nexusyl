# AAZ Travels — Landing Page + Flight Search Integration

This folder contains a self-contained landing page for **AAZ Travels**, with the
GOL IBE flight-search widget (from `AAZ_html-package.zip`) integrated directly
into the hero section.

## What's in here

```
aaz-travels/
├── index.html                 ← the landing page (open this)
├── config.en.js                ← GOL IBE widget config (already points at aaztrip.golibe.com)
├── HTMLPackageControl.js       ← GOL IBE widget controller (unmodified, vendor file)
├── __ENV.js                    ← GOL IBE widget env flag (unmodified, vendor file)
├── hotels/HTMLPackageHotels.js ← GOL IBE hotels module (unmodified, vendor file)
├── static/                     ← GOL IBE widget assets (icons, styles, fonts)
│   ├── styles.css              ← ⚠️ SCOPED — see "CSS scoping" below
│   ├── font.css                ← ⚠️ SCOPED — see "CSS scoping" below
│   └── images/…, css-element-queries-1.2.1/…
├── assets/logo/                ← official AAZ Travels logo exports (from the
│                                   provided Google Drive brand folder), resized
│                                   and optimised for web use
└── SEARCH-MODULE-README.md     ← original vendor integration guide (verbatim)
```

## Search → results redirect (already wired up)

`config.en.js` ships with:

```js
GOL_Global.config.feUrl = "https://aaztrip.golibe.com"
GOL_Global.config.requestorClientId = "aaztrip.golibe.com"
```

`HTMLPackageControl.js` builds the redirect as
`` `${config.feUrl}/results?${query}` `` on submit, so **every search performed
on this page redirects the visitor to `https://aaztrip.golibe.com/results`**
with the selected origin/destination/dates/passengers as query parameters —
exactly as requested. No code changes were needed for this; it was already
configured correctly in the package for the `aaztrip.golibe.com` booking
engine. This was verified by reading the vendor's minified controller source
directly (see the `redirectUrl` construction in `HTMLPackageControl.js`).

## CSS scoping (important if you regenerate the package)

The vendor's `static/styles.css` is a **full booking-engine stylesheet**
(12,000+ lines) that includes some very generic, page-global class names,
e.g.:

```css
.hidden { display: none !important; }
.flex   { display: flex; }
.container { max-width: 1010px; margin: 0 5px; }
```

Loaded unmodified on a normal marketing page, these collide with common
utility class names (Tailwind's `.hidden`, `.flex`, `.container`, etc.) and
silently break layout **everywhere on the page**, not just inside the widget.

To fix this, `static/styles.css` and `static/font.css` here have been
**scoped**: every selector was mechanically prefixed with `#aaz-flight-search`
(the id of the wrapper div around the widget in `index.html`) using PostCSS +
`postcss-prefix-selector`. The widget's own markup/JS is unaffected (all of it
lives inside that wrapper), but the rules can no longer leak onto the rest of
the page.

**If you ever regenerate `static/styles.css` / `static/font.css` from the GOL
admin console**, re-run the same scoping step before deploying, e.g.:

```bash
npm install postcss postcss-prefix-selector
node -e '
  const fs = require("fs");
  const postcss = require("postcss");
  const prefix = require("postcss-prefix-selector");
  const css = fs.readFileSync("static/styles.css", "utf8");
  const out = postcss([prefix({ prefix: "#aaz-flight-search" })]).process(css).css;
  fs.writeFileSync("static/styles.css", out);
'
```

Do **not** scope `HTMLPackageControl.js`, `config.en.js`, `__ENV.js`, or
`hotels/HTMLPackageHotels.js` — those are JS and are left as shipped by the
vendor/admin console.

## Deploying to flytrust.flyjuvenile.com / aaztravels.com (WordPress)

1. Upload the contents of this folder to the web root of the target site (or
   a subdirectory, as long as the relative paths — `static/`, `hotels/`,
   `HTMLPackageControl.js`, `config.en.js` — stay next to `index.html`).
2. If embedding into an existing WordPress page/theme rather than replacing
   the whole page:
   - Add the `<link>`/`<script>` tags currently at the end of `index.html`
     (the "GOL IBE FLIGHT-SEARCH WIDGET — SCRIPTS" block) to the page's
     `<head>`/footer.
   - Copy the `<div id="aaz-flight-search" class="search-widget-card">…</div>`
     block into the template/page where the search form should appear.
   - Make sure `static/`, `hotels/`, `HTMLPackageControl.js`, `config.en.js`
     and `__ENV.js` are reachable at the same relative paths from that page
     (e.g. via the theme root or a mu-plugin that registers them).
3. No further configuration is required for the redirect target — it's
   already `https://aaztrip.golibe.com/results` (see above).

## Brand assets

`assets/logo/` contains the official logo exports from the AAZ Travels brand
folder (Google Drive), resized for web:

- `aaz-travel-logo-red.png` / `aaz-travel-logo-white.png` — full logo (icon + wordmark)
- `aaz-travel-wordmark-red.png` / `aaz-travel-wordmark-white.png` — wordmark only
- `aaz-travel-icon-red.png` / `aaz-travel-icon-white.png` — icon/mark only
- `aaz-travel-favicon-32.png`, `aaz-travel-favicon-512.png`, `aaz-travel-apple-touch-icon.png`

Original high-resolution PNG/JPG/EPS masters are in the shared Drive folder;
only the web-optimised sizes needed for this page are included here.

## Notes / open items

- The GitHub repository referenced for this task
  (`github.com/juvenileasia/fly-juvenile-with-adaptor`, branch `AAZ`) was not
  reachable with the credentials available in this environment (returns
  404 — likely private or the name/owner differs). This landing page and
  integration were built directly from the provided `AAZ_html-package.zip`,
  the live `aaztravels.com` site content (for the FAQ/copy), and the AAZ
  Travels brand assets in the shared Drive folder. If that repository is the
  intended home for this code, it can be copied in directly — the folder is
  self-contained and has no build step.
- The contact form on this page is front-end only (`index.html` JS shows a
  success state on submit). Wire `#contact-form`'s submit handler to a real
  endpoint (WordPress admin-ajax action, Contact Form 7, HubSpot form, etc.)
  before going live.
- `config.en.js` has `defaultCountry = "CZ"` and a demo default airport
  (`Praha / Vídeň`) baked in from the GOL admin console template — adjust
  these in the GOL IBE admin console if you want different defaults for AAZ
  Travels' audience.

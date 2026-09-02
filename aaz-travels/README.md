# Aaz Travel — Multi-Page Website + Flight Search Integration

This folder contains a self-contained, multi-page static website for
**Aaz Travel**, with the GOL IBE flight-search widget (from
`AAZ_html-package.zip`) integrated directly into the homepage hero.

## Site map

Navbar: **Flights | Holidays | Umrah | Travel Services ▾ | About Us** — menu
links stay highlighted. On the right: a **Call 020 8154 9513** button and a
**Request a Quote** WhatsApp button.

| Nav label | Page | File |
| --- | --- | --- |
| Flights | Home (flight search, trending deals, why choose us, testimonials, FAQs, general contact form) | `index.html` |
| Holidays | Holiday Packages (+ dedicated enquiry form) | `holiday-packages.html` |
| Umrah | Umrah &amp; Hajj Packages (+ dedicated, grouped enquiry form) | `umrah-packages.html` |
| Travel Services | Hub page linking to the 5 services below | `travel-services.html` |
| ↳ | Travel Money (+ dedicated enquiry form) | `travel-money.html` |
| ↳ | Money Transfer (+ dedicated enquiry form) | `money-transfer.html` |
| ↳ | Travel Insurance (+ dedicated enquiry form) | `travel-insurance.html` |
| ↳ | Visa Assistance (+ dedicated enquiry form) | `visa-assistance.html` |
| ↳ | Airport Transfer (+ dedicated enquiry form) | `airport-transfer.html` |
| About Us | About Us | `about-us.html` |
| *(footer only)* | FAQs | `faqs.html` |
| *(footer only)* | Travel Guide | `travel-guide.html` |
| *(footer only)* | Terms &amp; Conditions | `terms-conditions.html` |
| *(footer only)* | Privacy Policy | `privacy-policy.html` |
| *(footer only)* | Cookie Policy | `cookie-policy.html` |

Every page shares the same navbar/footer, a floating WhatsApp button, and —
on every page **except** the homepage, which has the full search widget — a
mobile-only sticky "Call / WhatsApp" bar at the bottom of the screen.

### Enquiry forms

Each of the 7 service pages above (Holidays, Umrah, Travel Money, Money
Transfer, Travel Insurance, Visa Assistance, Airport Transfer) has its own
dedicated enquiry form with fields specific to that service (e.g. the Umrah
form is grouped into "Your Details" / "Journey Details" / "Package
Preferences"; the Travel Money form has a Sell/Buy dropdown and a currency
selector; etc.). The homepage keeps one general contact form for anything
else. Every form:

- The homepage contact form shows extra fields based on the selected
  service (same fields as that service's dedicated page).
- Shares the same submit handler in `assets/js/main.js` (any `<form
  class="enquiry-form">` with a `.form-success` element inside its
  `.form-card` wrapper works automatically — no per-page JS needed).
- Submits to **info@aaztravel.com** via FormSubmit (AJAX, no backend). The
  first submission after go-live triggers a one-time FormSubmit
  confirmation email — someone needs to click "Confirm" before submissions
  start arriving.

## What's in here

```
aaz-travels/
├── index.html                 ← the homepage — flight search widget lives here
├── umrah-packages.html, holiday-packages.html, money-transfer.html,
│   travel-money.html, travel-services.html, about-us.html,
│   faqs.html, travel-guide.html, terms-conditions.html,
│   privacy-policy.html, cookie-policy.html
│                               ← the rest of the site (see "Site map" above)
├── assets/css/main.css         ← shared site CSS, used by every page
├── assets/js/main.js           ← shared site JS, used by every page (see below)
├── config.en.js                ← GOL IBE widget config (already points at aaztrip.golibe.com)
├── HTMLPackageControl.js       ← GOL IBE widget controller (unmodified, vendor file)
├── __ENV.js                    ← GOL IBE widget env flag (unmodified, vendor file)
├── hotels/HTMLPackageHotels.js ← GOL IBE hotels module (unmodified, vendor file)
├── static/                     ← GOL IBE widget assets (icons, styles, fonts) — only
│                                   loaded on index.html, the one page with the widget
│   ├── styles.css              ← ⚠️ PARTIALLY SCOPED — see "CSS scoping" below
│   ├── font.css                ← ⚠️ PARTIALLY SCOPED — see "CSS scoping" below
│   └── images/…, css-element-queries-1.2.1/…
├── assets/logo/                ← official Aaz Travel logo exports (from the
│                                   provided Google Drive brand folder), cropped
│                                   and optimised for web use
├── assets/badges/iata-logo.png ← IATA logo (public-domain mark, via Wikimedia
│                                   Commons) used next to the "IATA Accredited Agent" badge
└── SEARCH-MODULE-README.md     ← original vendor integration guide (verbatim)
```

## Shared CSS/JS (`assets/css/main.css` / `assets/js/main.js`)

Every page links the same two files instead of repeating a large inline
`<style>`/`<script>` block:

- **`assets/css/main.css`** — all of the site's own design (nav, hero, cards,
  footer, animations, etc). The GOL IBE widget's own `static/styles.css` is
  separate and only ever linked from `index.html` (see "CSS scoping" below).
- **`assets/js/main.js`** — nav/mobile-menu toggling, the "Travel Services"
  dropdown (desktop) and accordion (mobile), scroll-reveal animations,
  back-to-top, the FAQ accordion, the contact form submission, and the
  conditional Umrah &amp; Hajj questionnaire fields. Every piece of this file
  checks that its target element(s) exist before wiring up listeners, since
  most pages only have a subset of these (e.g. only `index.html` has the
  contact form and FAQ accordion — every other page still safely loads the
  same script with no errors).

**If you add a new page**, copy the `<nav>`...`</nav>` and `<footer>`...
`</footer>` blocks verbatim from any existing secondary page (e.g.
`about-us.html`) — they're identical on every page by design — and link the
same `assets/css/main.css` / `assets/js/main.js` files.

## Search → results redirect (already wired up)

`config.en.js` ships with:

```js
GOL_Global.config.feUrl = "https://aaztrip.golibe.com"
GOL_Global.config.requestorClientId = "aaztrip.golibe.com"
```

`HTMLPackageControl.js` builds the redirect as
`` `${config.feUrl}/results?${query}` `` on submit, so **every search performed
on this page redirects the visitor to `https://aaztrip.golibe.com/results`**
with the selected origin/destination/dates/passengers as query parameters.
No code changes were needed for this part.

## CSS scoping (important if you regenerate the package)

The vendor's `static/styles.css` is a **full booking-engine stylesheet**
(12,000+ lines). Two things about it matter for embedding it on this page:

1. It defines a handful of very generic, page-global selectors (`.hidden`,
   `.flex`, `.container`, `.link`, `.pointer`, `html`, `body`, etc.) that
   collide with common utility class names (e.g. Tailwind's `.hidden`/`.flex`)
   and silently break layout on the rest of the page (nav, sections) if left
   unscoped.
2. The widget's own JS (`HTMLPackageControl.js`) appends its date-picker
   calendar, and a couple of dropdowns, **directly to `<body>`** — outside
   any wrapper `<div>` — via `document.getElementsByTagName("body")[0]`. If
   you scope the *entire* stylesheet under the widget's wrapper `#aaz-flight-search`,
   those body-appended elements lose all their styling (this is exactly what
   caused the broken/unstyled calendar popup seen during development).

The fix used here is a **targeted scope**: only the exact, confirmed-risky
selectors below are prefixed with `#aaz-flight-search`; everything else in
`static/styles.css` (all the `.header-search-form-*`, `.DayPicker-*`,
`.date-picker-wrapper`, dropdown, etc. rules) is left global/unscoped on
purpose, so it still applies correctly wherever the widget's JS appends
elements — including directly on `<body>`.

Scoped selectors (confirmed via a script that cross-referenced every class
used elsewhere on this page against the vendor stylesheet):

```
html, body,
.bold, .button, .clearfix, .container, .flex, .flex-wrap, .header,
.hidden, .icon, .items-center, .link, .noselect, .only-desktop,
.only-desktop-span, .only-mobile, .pointer, .relative, .text-right, .tooltip
```

**If you ever regenerate `static/styles.css` / `static/font.css` from the GOL
admin console**, re-run the same targeted scoping step before deploying:

```bash
npm install postcss
node -e '
  const fs = require("fs");
  const postcss = require("postcss");
  const PREFIX = "#aaz-flight-search";
  const RISKY = new Set(["html","body",".bold",".button",".clearfix",
    ".container",".flex",".flex-wrap",".header",".hidden",".icon",
    ".items-center",".link",".noselect",".only-desktop",
    ".only-desktop-span",".only-mobile",".pointer",".relative",
    ".text-right",".tooltip"]);
  for (const file of ["static/styles.css", "static/font.css"]) {
    const css = fs.readFileSync(file, "utf8");
    const root = postcss.parse(css);
    root.walkRules(rule => {
      rule.selector = rule.selector.split(",").map(s => {
        s = s.trim();
        return RISKY.has(s) ? `${PREFIX} ${s}` : s;
      }).join(", ");
    });
    fs.writeFileSync(file, root.toString());
  }
'
```

Then re-check for *new* collisions if you add more custom classes to
`index.html` outside the widget — cross-reference your new class names
against `static/styles.css` the same way (grep for `^\.yourclass\s*{` /
`^\.yourclass,`) and add any hits to the `RISKY` set above.

Do **not** scope `HTMLPackageControl.js`, `config.en.js`, `__ENV.js`, or
`hotels/HTMLPackageHotels.js` — those are JS and are left as shipped by the
vendor/admin console.

## Contact form → email

The contact form (`#contact-form`) submits via [FormSubmit](https://formsubmit.co)
directly to **info@aaztravel.com** — no backend/server needed:

- Form `action="https://formsubmit.co/ajax/info@aaztravel.com"`, submitted
  with `fetch()` so the page shows the existing "Message Sent!" success state
  instead of redirecting to FormSubmit's own confirmation page.
- **One-time setup**: the *first* submission after this goes live will make
  FormSubmit send a confirmation email to `info@aaztravel.com` — someone with
  access to that inbox needs to click **"Confirm"** in that email once. Until
  that's done, submissions won't be delivered.
- If Aaz Travel would rather use a different provider (a WordPress form
  plugin, HubSpot, etc.), just change the `action` attribute on `#contact-form`
  and the `fetch()` call in the JS at the bottom of `index.html` — the rest of
  the form (fields, validation, success state) doesn't need to change.

## Umrah & Hajj questionnaire

Selecting **"Umrah & Hajj Package"** in the contact form's Enquiry Type
dropdown reveals an extra "Umrah & Hajj Details" section with fields
mirroring the real
[Umrah & Hajj Booking Questionnaire](https://aaztravels.com/umrah-hajj-booking-questionnaire-aaz-travels-uk/)
(No. of Adults/Infants, From/To Date, Makkah/Madinah Nights, Accommodation,
Visa requirement, Passport Nationality, Additional Countries to Visit,
Airline Preference, No. of Rooms Required, Bed Type Preference). Selecting
any other enquiry type hides the section again. These extra fields are
`disabled` while hidden, so the browser automatically excludes them from the
form submission (and from the FormSubmit email) whenever they're not
relevant — no JS filtering needed on submit.

## Search-widget animations

A layer of purely decorative micro-interactions sits on top of the vendor
widget (all scoped under `#aaz-flight-search`, none of it touches the
widget's own JS/functionality):

- An ambient, slowly pulsing red glow behind the search card, plus a
  scale-in entrance when the page loads.
- The card lifts slightly with a deeper shadow on hover.
- The One way / Return / Multi-city tabs lift on hover (with their icon
  nudging sideways) and "pop" briefly when a tab becomes active.
- Input fields tint faintly on hover and get a soft focus ring.
- The passenger/tolerance +/- counters scale up on hover and shrink on
  press for tactile feedback.
- The "Search Flights" button has a light sweep/shine on hover, plus a
  lift + subtle scale.

Only `transform`, `box-shadow`, `filter`, `background-color` and `opacity`
are ever animated — never layout-affecting properties (`width`, `height`,
`margin`, `padding`, `display`) — so none of it can throw off the widget's
own layout calculations (e.g. the calendar popup's positioning math).

## Footer text colour

All footer text/links (copyright, legal links, the "Design and developed by
Juvenile Asia" credit, the office address, social icons, etc.) share one
consistent colour (`#c7bab6`, brightening to white on hover), driven by the
`.footer-link` / `.footer-text` / `.footer-social-btn` classes defined near
the top of `index.html`. Previously some of these used Tailwind's default
`text-gray-500`/`text-gray-400` utilities directly, which are visibly dimmer
than the custom `.footer-link` colour used elsewhere in the same footer —
that inconsistency (some lines reading brighter, some noticeably dimmer) is
what got reported as a "visibility issue". The colour on these classes is
also marked `!important`, which defensively beats the vendor GOL IBE
stylesheet's global `a:visited { color: inherit }` rule — without it, a
visited footer link could have a *lower*-specificity class color overridden
by that rule and fall back to an inherited near-black body-text colour,
i.e. become invisible against the dark footer background.

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
4. Remember to confirm the FormSubmit email (see "Contact form → email" above)
   once the page is live at its real URL.

## Brand assets

`assets/logo/` contains the official logo exports from the Aaz Travel brand
folder (Google Drive), **cropped to remove the excess transparent padding
baked into the original exports** (the originals were ~23% content height on
a much taller canvas, which made the logo render illegibly small when
constrained to a fixed height in CSS — this was the "logo" issue reported and
fixed) and resized for web:

- `aaz-travel-logo-red.png` / `aaz-travel-logo-white.png` — full logo (icon + wordmark)
- `aaz-travel-wordmark-red.png` / `aaz-travel-wordmark-white.png` — wordmark only
- `aaz-travel-icon-red.png` / `aaz-travel-icon-white.png` — icon/mark only
- `aaz-travel-favicon-32.png`, `aaz-travel-favicon-512.png`, `aaz-travel-apple-touch-icon.png`

Original high-resolution PNG/JPG/EPS masters are in the shared Drive folder;
only the web-optimised, cropped sizes needed for this page are included here.

`assets/badges/iata-logo.png` is the public-domain IATA logo (via Wikimedia
Commons — "consists only of simple geometric shapes or text, does not meet
the threshold of originality needed for copyright protection"), shown next to
**IATA Code: 9120590** in the "Why Book with Aaz Travel" section and the
footer.

## Contact details used on this page

- Phone: **020 8154 9513** (`tel:02081549513`)
- WhatsApp: **020 8154 9513** (`https://wa.me/442081549513`) — shown in the
  contact section, the footer, and as a floating WhatsApp button
  (bottom-left, next to the "back to top" button).
- Email: **info@aaztravel.com**
- Facebook: https://www.facebook.com/people/Aaz-Travel/61581291682116/
- Instagram: https://www.instagram.com/aaz.travels/

## Notes / open items

- The GitHub repository referenced for this task
  (`github.com/juvenileasia/fly-juvenile-with-adaptor`, branch `AAZ`) was not
  reachable with the credentials available in this environment (returns
  404 — likely private or the name/owner differs). This landing page and
  integration were built directly from the provided `AAZ_html-package.zip`,
  the (then-current) `aaztravels.com` site content (for the FAQ/copy), and
  the Aaz Travel brand assets in the shared Drive folder. If that repository
  is the intended home for this code, it can be copied in directly — the
  folder is self-contained and has no build step.
- `config.en.js` has `defaultCountry = "CZ"` and a demo default airport
  (`Praha / Vídeň`) baked in from the GOL admin console template — adjust
  these in the GOL IBE admin console if you want different defaults for Aaz
  Travel's audience.
- The brand name is rendered as **"Aaz Travel"** (singular) everywhere on the
  page, matching the logo artwork and the explicit naming request.
- The canonical site URL used across the page (canonical link, Open Graph,
  schema.org, footer/contact links) is **`https://www.aaztravel.com`**. The
  old `aaztravels.com` (with the "s") domain — the site this page's original
  FAQ copy was sourced from — is no longer referenced anywhere; if Aaz Travel
  is migrating domains, make sure `www.aaztravel.com` actually resolves
  before this page goes live, or update these references again if the final
  domain differs.
- Office address: **241a, 1st Floor, Whitechapel Road, London, E1 1BD**
  (shown in the contact section, the footer, and the `schema.org` structured
  data, with a Google Maps link).
- **This round's site-wide restructuring**:
  - Navbar rebuilt to Home / Umrah Packages / Holiday Packages / Money
    Transfer / Travel Money / Travel Services (dropdown) / About Us, with a
    "Request a Quote" button and click-to-call/WhatsApp icons on the right
    (desktop), and a persistent "Book Online or Call Us" bar plus a
    "Travel Services" accordion in the mobile menu.
  - The old on-page "Flights" and "Umrah & Hajj" sections were removed from
    the homepage — that content now lives on their own dedicated pages
    (`umrah-packages.html`, and flights are covered by the search widget +
    trending deals on the homepage itself).
  - The hero's trust pills now read "IATA Accredited Agent" (no code
    number), "24 Hour WhatsApp Support", "UK Based Travel Agency", "Book
    With Confidence" — the same four also appear (without the IATA logo
    duplicated) on the homepage's "Why Choose Aaz Travel?" section and the
    About Us page.
  - Every "Top Flight Deals" card now has its own **Call** and **WhatsApp**
    quick-action buttons (pre-filled with a message naming that specific
    route) in addition to the price.
  - Added a "What Our Customers Say" testimonials section (3 illustrative
    reviews — replace with real customer testimonials when available).
  - **Content on the new secondary pages (package prices, currencies,
    package tiers, FAQs, legal text, etc.) is a solid first draft written to
    be genuinely useful and on-brand, not placeholder/lorem-ipsum — but it
    was not supplied verbatim by Aaz Travel, so review and adjust the
    specifics (prices, currency list, exact legal wording, etc.) before
    treating anything on those pages as final/binding.**
- **Latest round — nav simplified further, dedicated enquiry forms added**:
  - Navbar cut down to Flights / Holidays / Umrah / Travel Services
    (dropdown) / About Us, with just a phone icon + WhatsApp icon on the
    right (the separate "Request a Quote" button was removed — the
    WhatsApp icon itself now opens a chat with a "request a quote" message
    pre-filled).
  - "Group &amp; Corporate Travel" was removed entirely (no page, no menu
    entry) per instruction.
  - Travel Money and Money Transfer moved from being their own top-level nav
    items into the Travel Services dropdown, alongside three **newly
    created pages**: `travel-insurance.html`, `visa-assistance.html`,
    `airport-transfer.html` (previously these were just anchors on
    `travel-services.html`; that page is now a simple hub linking out to
    all 5 dedicated service pages).
  - The homepage's old conditional "Umrah &amp; Hajj questionnaire" (which
    dynamically revealed extra fields in the general contact form) was
    removed — that functionality is superseded by the dedicated,
    always-visible form on `umrah-packages.html`.

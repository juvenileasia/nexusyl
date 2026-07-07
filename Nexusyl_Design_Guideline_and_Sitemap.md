# Nexusyl Limited — Design Guideline & Sitemap

**Version:** 2.0  
**Date:** July 2026  
**Live site:** https://nexusyl.juvenileasia.com/  
**Repository:** `juvenileasia/nexusyl`  
**Related:** `docs/NEXUSYL-PRD.md`

This document covers the **public marketing website** and the **authenticated multi-tenant portal** (CRM + LMS). Colour tokens and fonts below are taken from the live codebase (`index.html`, `portal/src/index.css`, `portal/src/styles/dashboard.css`).

---

## 1. Brand Overview

Nexusyl Limited is a London-based, multi-sector company (a Juvenile Asia subsidiary) operating across four distinct but connected divisions: **Recruitment, Food Tech (Street Food), Education, and Property**. The platform serves two audiences:

| Audience | Experience |
|----------|------------|
| **Public visitors** | Static marketing site — sector landing pages, contact form, SEO |
| **Authenticated users** | React portal — CRM, LMS, compliance, document uploads (4 roles) |

**Brand personality:** trusted, multi-sector, tech-enabled, regulated/compliant, London-rooted.

**User roles (portal):**

| Role | Portal label | Primary colour |
|------|--------------|----------------|
| Admin | Administrator | `#E8211A` (brand red) |
| Employee | Employee | `#3B82F6` (blue) |
| Student | Student | `#22C55E` (green) |
| Supplier | Supplier / Partner | `#EAB308` (gold) |

---

## 2. Logo System

Nexusyl uses a **three-asset lockup**, built for maximum flexibility across light and dark surfaces:

| Asset | File | Use case |
|-------|------|----------|
| Icon / favicon mark | `Nexusyl_Fab.png` | Tab icon, social avatar, nav badge, portal brand mark |
| White wordmark lockup | (in marketing HTML) | Dark backgrounds — hero, dark nav state, footer |
| Black wordmark lockup | (in marketing HTML) | Light backgrounds — white section backgrounds, printed collateral |

**Guideline:** always pair the correct wordmark colour with its background — never place the white lockup on a light section or vice versa. Maintain clear space around the mark equal to the height of the icon symbol.

---

## 3. Colour System

### 3.1 Core tokens (marketing + portal)

Shared CSS custom properties used across both surfaces:

| Token | Hex | Use |
|-------|-----|-----|
| `--red` | `#E8211A` | Primary CTA, brand accent, active nav, scrollbar, stat highlights |
| `--black` | `#0A0A0A` | Page background (dark mode default) |
| `--dark` | `#111111` | Secondary dark surfaces |
| `--card` | `#161616` | Card / panel backgrounds |
| `--border` | `#2A2A2A` | Borders, dividers |
| `--muted` | `#888888` | Secondary text (marketing) |
| `--white` | `#F5F5F5` | Primary text on dark backgrounds |

**Visual rhythm (marketing):** light-neutral body sections alternate with **dark bookends** (hero + footer) where the white logo lockup is used.

### 3.2 Role accent colours (portal only)

Applied to login tabs, role badges, and sidebar pills (`pill-r`, `pill-b`, `pill-g`, `pill-y` in `dashboard.css`):

| Role | Colour | Pill class |
|------|--------|------------|
| Admin | `#E8211A` | `pill-r` |
| Employee | `#60A5FA` / `#3B82F6` | `pill-b` |
| Student | `#22C55E` | `pill-g` |
| Supplier | `#EAB308` | `pill-y` |

### 3.3 Marketing light theme

The marketing site supports a **dark/light toggle** (`nx-theme` in `localStorage`). Light mode adds a `body.light` class — section backgrounds flip to off-white while brand red stays the action colour.

### 3.4 Sector accent recommendation

For future sector differentiation, assign each division a **muted tint** of the core palette at equal saturation — Recruitment (deeper blue), Food Tech (warm accent), Education (teal-leaning), Property (neutral green) — so sector pages feel distinct but remain one company.

---

## 4. Typography

**Fonts** (loaded via Google Fonts in both marketing HTML and `portal/index.html`):

| Role | Family | Weights | Use |
|------|--------|---------|-----|
| Display / headlines | **Syne** | 400, 600, 700, 800 | Hero statements, section titles, button labels, CRM headings |
| Body | **Manrope** | 300, 400, 500, 600 | Paragraphs, form labels, card copy, dashboard body text |

**Icons:** Font Awesome 6.5.1 (CDN) — used in marketing nav, portal sidebar, and LMS player.

**Hierarchy (marketing):** eyebrow label → headline → body. Eyebrows like "Sector 01," "Get In Touch," "Why Nexusyl" use consistent size, weight, and letter-spacing.

**Hierarchy (portal):** sidebar section title → nav item → page heading → stat label → body. Keep the three-level pattern on every dashboard page.

---

## 5. Layout & Grid Patterns (Marketing)

Recurring structural patterns on `index.html` and sector pages:

1. **Alternating image/text sector blocks** — each of the four sectors swaps image side (left/right).
2. **Stat callout overlays** — bold number + label anchored to sector image corners.
3. **Bulleted feature lists** (5 items) + 3 badge phrases + **two-button CTA pair** (primary + "Learn More").
4. **Top trust bar** — 4-stat strip directly under the hero.
5. **4-card trust grid** ("Why Nexusyl") — icon + heading + one-line description.
6. **Dark contact section** before footer, mirroring the hero.

---

## 6. Components

### 6.1 Marketing

- **Buttons:** primary (solid red) and secondary (outline/ghost) — shown as pairs on sector sections.
- **Cards:** consistent padding, subtle border/shadow, rounded corners.
- **Form fields:** bordered inputs, single-column layout, "Enquiry Type" dropdown for lead segmentation.
- **Icon badges:** circular/rounded-square containers for trust cards.

### 6.2 Portal (React)

Shared shell: `portal/src/layouts/DashboardLayout.tsx` + `portal/src/styles/dashboard.css`

| Component | Description |
|-----------|-------------|
| **Sidebar** | Collapsible on mobile; section groups with optional count badges |
| **Stat cards** | KPI tiles on overview pages (people counts, course progress, DBS queue) |
| **Data tables** | People lists, pipeline tables, DBS queue, progress reports |
| **Modals** | `PersonModal`, `CourseModal`, `DbsModal`, `CertificateModal` |
| **Module builder** | Admin LMS — video / text / PDF / quiz module types |
| **Course player** | `CoursePlayerPage` — video embed, HTML text, PDF viewer, quiz scoring |
| **Upload zone** | `DocumentUploadZone` — Supabase Storage, 10 MB limit |
| **Login card** | Role tabs + coloured role bar; grid background + radial red glow |

**Portal background treatment:** fixed grid overlay (`grid-bg`) + subtle red radial glow (`radial-glow`) on login; dashboard uses solid dark surfaces.

---

## 7. Imagery Style

Real, professional photography — office/professional settings (Recruitment), vibrant food/market imagery (Street Food), campus/university shots (Education), modern London residential interiors (Property). Images should feel **London-specific and current** with a consistent warm/naturalistic colour grade across sectors.

Portal course cards use a **course colour** field (`courses.colour` in Supabase) as the card accent — set per course in admin.

---

## 8. Voice & Microcopy Patterns

### Marketing
- Section eyebrows: short and punchy — "Sector 01," "Get In Touch," "Why Nexusyl."
- Headlines: short declarative sentences, often two beats — "One Company. / Endless Possibilities."
- CTAs: action + outcome per sector — "Find Talent or Work," "Book Our Cart," "Apply Now."
- Trust language: "Fully Compliant / Regulated" repeated across regulated sectors.

### Portal
- Role-specific login subtitles — "Full CRM Control Panel," "Document Upload & Visa Tracker," etc.
- Compliance-first labels — "DBS Pipeline," "Visa Documents," "Progress Reports."
- Empty states: direct instructions ("No courses enrolled yet — contact your administrator").
- British English spelling in UI copy — "Enrolment," "Organisation."

---

## 9. Platform Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  VPS (nginx) — nexusyl.juvenileasia.com                         │
│  ├── /                    → Static marketing HTML               │
│  ├── /recruitment, etc.   → Static sector pages                 │
│  ├── /login               → React portal (SPA)                  │
│  └── /dashboard-*         → React portal (role-based routes)    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Supabase             │
                    │  • Auth (email/pw)    │
                    │  • PostgreSQL + RLS   │
                    │  • Storage (documents)│
                    └───────────────────────┘
```

| Layer | Technology | Location |
|-------|------------|----------|
| Marketing | Static HTML, Tailwind CDN | Repo root (`index.html`, `recruitment.html`, …) |
| Portal | React 19, TypeScript, Vite, React Router | `portal/` |
| Database | Supabase PostgreSQL | `supabase/migrations/` |
| Auth | Supabase Auth + RLS | `portal/src/contexts/AuthContext.tsx` |
| Files | Supabase Storage (`documents` bucket) | `portal/src/lib/documents.ts` |
| Local dev | Marketing `:8080`, Portal `:5173` | `scripts/dev-server.py`, `portal/npm run dev` |
| Deploy | nginx + `scripts/deploy.sh` | `deploy/nginx.conf.example` |

---

## 10. Sitemap

### 10.1 Public marketing site

```
Nexusyl Limited (nexusyl.juvenileasia.com)
│
├── Home (/)
│     ├── Hero
│     ├── The Nexusyl Ecology (platform overview)
│     ├── Sector 01 – Recruitment (summary + link out)
│     ├── Sector 02 – Street Food (summary + link out)
│     ├── Sector 03 – Education (summary + link out)
│     ├── Sector 04 – Property (summary + link out)
│     ├── Why Nexusyl (trust section)
│     ├── #about-section (anchor)
│     └── #contact (anchor — contact form)
│
├── Services
│     ├── Recruitment (/recruitment)
│     ├── Food Tech (/food-tech  →  foodtech.html)
│     ├── Education (/education)
│     └── Property (/property)
│
├── Login (/login)  →  React portal SPA
│
└── Footer
      ├── Privacy Policy (/privacy)
      ├── Terms of Service (/terms)
      ├── Cookies (modal/anchor)
      └── Parent company link → juvenileasia.com
```

**Marketing files (static HTML, repo root):**

| File | URL |
|------|-----|
| `index.html` | `/` |
| `recruitment.html` | `/recruitment` |
| `foodtech.html` | `/food-tech` |
| `education.html` | `/education` |
| `property.html` | `/property` |
| `privacy.html` | `/privacy` |
| `terms.html` | `/terms` |

**Primary nav:** Home · Services (dropdown) · About · Contact · Login · "Get in Touch" (CTA). About and Contact are same-page anchors on Home.

---

### 10.2 Authenticated portal (React SPA)

Single login at `/login` with role tabs. After auth, users land on their role dashboard.

```
/login                          Unified login (4 role tabs)
│
├── /dashboard-admin            Admin CRM  [role: admin]
│     ├── /                     Overview (live stats)
│     ├── /students             Student management (CRUD)
│     ├── /employees            Employee management (CRUD + DBS)
│     ├── /suppliers            Supplier management (CRUD)
│     ├── /courses              Course manager
│     ├── /enrolment            Per-person + bulk enrolment
│     ├── /content              Quick module upload
│     ├── /dbs                  DBS compliance pipeline
│     └── /reports              Progress & quiz analytics
│
├── /dashboard-employee         Employee portal  [role: employee]
│     ├── /                     Overview (courses, DBS, progress)
│     ├── /courses              My courses list
│     ├── /courses/:courseId    LMS course player
│     ├── /dbs                  DBS status tracker
│     └── /compliance           Compliance resources
│
├── /dashboard-student          Student portal  [role: student]
│     ├── /                     Journey dashboard
│     ├── /tracker              Application stage tracker
│     ├── /upload               Document upload (offer letter)
│     ├── /visa                 Visa documents (passport, CAS)
│     ├── /courses              Academy course list
│     └── /courses/:courseId    LMS course player + certificates
│
└── /dashboard-supplier         Partner portal  [role: supplier]
      ├── /                     Partner overview
      ├── /students             Student pipeline table
      ├── /employees            Employee training (read-only)
      ├── /contracts            Contracts (placeholder)
      └── /reports              Partner reports
```

**React source map:**

| Route prefix | App component | Key pages |
|--------------|---------------|-----------|
| `/login` | `LoginPage.tsx` | Role-tab login |
| `/dashboard-admin/*` | `AdminApp.tsx` | CRM + LMS admin |
| `/dashboard-employee/*` | `EmployeeApp.tsx` | Training + DBS |
| `/dashboard-student/*` | `StudentApp.tsx` | Application lifecycle + LMS |
| `/dashboard-supplier/*` | `SupplierApp.tsx` | B2B pipeline |
| `*/courses/:courseId` | `CoursePlayerPage.tsx` | Shared LMS player |

---

### 10.3 Retired pages (removed Phase 6)

These legacy HTML prototypes are **deleted** — functionality lives in the React portal:

| Retired file | Replaced by |
|--------------|-------------|
| `login.html` | `portal/src/pages/LoginPage.tsx` |
| `lms-login.html` | `LoginPage.tsx` (merged) |
| `dashboard-admin.html` | `portal/src/pages/admin/*` |
| `dashboard-employee.html` | `portal/src/pages/employee/*` |
| `dashboard-student.html` | `portal/src/pages/student/*` |
| `dashboard-supplier.html` | `portal/src/pages/supplier/*` |
| `lms-admin.html` | Admin courses/enrolment sections |
| `lms-student.html` | `CoursePlayerPage.tsx` |
| `academy-dashboard.html` | Design reference only (merged) |
| `auth-bridge.js` | Supabase session (no bridge needed) |

---

## 11. Repository Structure

```
nexusyl/
├── index.html, recruitment.html, …   # Marketing (static)
├── deploy/nginx.conf.example         # Production nginx config
├── scripts/
│   ├── dev-server.py                 # Local marketing server (:8080)
│   └── deploy.sh                     # Build + rsync helper
├── portal/                           # React SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── admin/                # CRM + LMS admin
│   │   │   ├── employee/
│   │   │   ├── student/
│   │   │   ├── supplier/
│   │   │   └── lms/CoursePlayerPage.tsx
│   │   ├── layouts/DashboardLayout.tsx
│   │   ├── components/               # Modals, LMS, upload zones
│   │   ├── hooks/                    # Supabase data hooks
│   │   ├── contexts/AuthContext.tsx
│   │   ├── lib/                      # supabase, documents, youtube
│   │   └── styles/dashboard.css
│   └── .env.local                    # Supabase keys (not committed)
├── supabase/migrations/              # Schema + RLS
└── docs/NEXUSYL-PRD.md               # Product requirements
```

---

## 12. Local Development

```bash
# Terminal 1 — marketing site
npm run dev:site          # http://localhost:8080

# Terminal 2 — React portal
npm run dev:portal        # http://localhost:5173

# Or both
npm run dev
```

Portal routes (`/login`, `/dashboard-*`) on `:8080` redirect to the React dev server. Set `portal/.env.local` from `portal/.env.example` with Supabase credentials.

**Demo accounts** (see `supabase/seed_demo_users.sql`):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nexusyl.co.uk | nexusyl2026 |
| Employee | sarah.thompson@nexusyl.co.uk | employee2026 |
| Student | jordan.singh@student.ac.uk | student2026 |
| Supplier | contact@globaltalent.co.uk | supplier2026 |

---

## 13. Deployment Notes

1. Set `VITE_MARKETING_URL=https://nexusyl.juvenileasia.com` in `portal/.env.local` before production build.
2. `npm run build:portal` → output in `portal/dist/`.
3. Copy marketing HTML to `/var/www/nexusyl/` and `portal/dist/` to `/var/www/nexusyl/portal/dist/`.
4. Apply `deploy/nginx.conf.example`; enable SSL via Certbot.

---

*Maintained in `Nexusyl_Design_Guideline_and_Sitemap.md`. Update when marketing pages or portal routes change.*

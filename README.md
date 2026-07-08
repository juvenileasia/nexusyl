# Nexusyl Platform

Multi-sector business platform for [Nexusyl Limited](https://nexusyl.juvenileasia.com/) — a London-based company operating across **Recruitment**, **Food Tech**, **Education**, and **Property**.

This repository contains:

- **Marketing site** — static HTML pages (SEO-friendly, no build step)
- **Authenticated portal** — React SPA with CRM, LMS, compliance, and document uploads
- **Supabase backend** — PostgreSQL, Auth, Row Level Security, and file storage

**Live:** https://nexusyl.juvenileasia.com/

---

## Run locally

**First time?** Follow [Quick start](#quick-start) below (clone, env, Supabase migrations, seeds).

**Already set up?** Start both servers from the repo root:

```bash
npm run dev
```

| What | URL |
|------|-----|
| Marketing site | http://localhost:8080 |
| Portal login | http://localhost:5173/login |
| Login via marketing | http://localhost:8080/login → redirects to portal |

**Or run in two terminals:**

```bash
# Terminal 1 — marketing (Python)
npm run dev:site

# Terminal 2 — React portal (Vite)
npm run dev:portal
```

**Windows (PowerShell):**

```powershell
cd d:\Projects\nexusyl
npm install --prefix portal
Copy-Item portal\.env.example portal\.env.local
# Edit portal\.env.local with your Supabase keys, then:
npm run dev:site    # Terminal 1
npm run dev:portal  # Terminal 2
```

If `npm run dev:portal` fails from the root on Windows, build/run from the portal folder:

```powershell
cd portal
npm run dev
```

Log in with a [demo account](#demo-accounts) after seeding Supabase.

---

## Architecture

```
Marketing (static HTML)          React Portal (Vite SPA)
localhost:8080 / VPS root   →    localhost:5173 / portal/dist
         │                                    │
         └──────────── /login ────────────────┘
                              │
                    Supabase (Auth + DB + Storage)
```

| Layer | Tech | Location |
|-------|------|----------|
| Marketing | HTML, Tailwind CDN | Repo root (`index.html`, sector pages) |
| Portal | React 19, TypeScript, Vite, React Router | `portal/` |
| Database | Supabase PostgreSQL + RLS | `supabase/migrations/` |
| Auth | Supabase email/password | `portal/src/contexts/AuthContext.tsx` |
| Files | Supabase Storage (`documents` bucket) | `portal/src/lib/documents.ts` |

---

## Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.9+ (local marketing dev server)
- **Supabase** project ([supabase.com](https://supabase.com)) — free tier works for development

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/juvenileasia/nexusyl.git
cd nexusyl
npm install --prefix portal
```

### 2. Configure Supabase

```bash
cp portal/.env.example portal/.env.local
```

Edit `portal/.env.local` with your project keys from **Supabase → Project Settings → API**:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_MARKETING_URL=http://localhost:8080
```

> Never commit `portal/.env.local`. Only the **anon** key belongs in the browser — never use the service role key in frontend code.

### 3. Run database migrations

In the Supabase SQL Editor, run migrations **in order**:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_lms_schema.sql`
3. `supabase/migrations/003_admin_user_functions.sql`
4. `supabase/migrations/004_storage_bucket.sql`
5. `supabase/migrations/005_portal_role_policies.sql`

Then seed demo data:

1. `supabase/seed_demo_users.sql` — creates auth users + profiles
2. `supabase/seed.sql` — supplementary seed data
3. `supabase/seed_lms.sql` — sample courses and modules

### 4. Start development servers

See **[Run locally](#run-locally)** at the top of this README for the short version.

**Option A — both servers (recommended):**

```bash
npm run dev
```

**Option B — separate terminals:**

```bash
# Terminal 1 — marketing site
npm run dev:site          # http://localhost:8080

# Terminal 2 — React portal
npm run dev:portal        # http://localhost:5173
```

| URL | What |
|-----|------|
| http://localhost:8080 | Marketing homepage |
| http://localhost:8080/login | Redirects to React login |
| http://localhost:5173/login | Portal login (4 role tabs) |

---

## Demo accounts

After running `seed_demo_users.sql`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@nexusyl.co.uk` | `nexusyl2026` |
| Employee | `sarah.thompson@nexusyl.co.uk` | `employee2026` |
| Student | `jordan.singh@student.ac.uk` | `student2026` |
| Supplier | `contact@globaltalent.co.uk` | `supplier2026` |

---

## User roles & routes

| Role | Dashboard | Capabilities |
|------|-----------|--------------|
| **Admin** | `/dashboard-admin` | CRM (people), courses, enrolment, DBS pipeline, reports |
| **Employee** | `/dashboard-employee` | My courses, DBS status, compliance resources |
| **Student** | `/dashboard-student` | Application tracker, document upload, visa docs, academy courses |
| **Supplier** | `/dashboard-supplier` | Student pipeline, employee training overview, reports |

LMS course player is shared at `/dashboard-*/courses/:courseId` (video, text, PDF, quiz, certificates).

---

## Project structure

```
nexusyl/
├── index.html                  # Marketing homepage
├── recruitment.html            # Sector landing pages
├── foodtech.html
├── education.html
├── property.html
├── privacy.html, terms.html
│
├── portal/                     # React portal (CRM + LMS)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── admin/          # Admin CRM + LMS admin
│   │   │   ├── employee/
│   │   │   ├── student/
│   │   │   ├── supplier/
│   │   │   └── lms/            # Course player
│   │   ├── components/         # Modals, upload zones, quiz player
│   │   ├── hooks/              # Supabase data hooks
│   │   ├── contexts/           # Auth provider
│   │   ├── layouts/            # Dashboard shell
│   │   └── lib/                # Supabase client, document helpers
│   └── .env.example
│
├── supabase/
│   ├── migrations/             # Schema + RLS policies
│   └── seed*.sql               # Demo data
│
├── scripts/
│   ├── dev-server.py           # Local marketing server (:8080)
│   └── deploy.sh               # Production build helper
│
├── deploy/
│   └── nginx.conf.example      # VPS nginx config
│
└── docs/
    └── NEXUSYL-PRD.md          # Product requirements
```

---

## NPM scripts

Run from the **repository root**:

| Script | Description |
|--------|-------------|
| `npm run dev` | Marketing (`:8080`) + portal (`:5173`) together |
| `npm run dev:site` | Marketing site only |
| `npm run dev:portal` | React portal only |
| `npm run build:portal` | Production build → `portal/dist/` |
| `npm run preview:portal` | Preview production build locally |
| `npm run deploy:build` | Alias for `build:portal` |

Portal-only scripts (from `portal/`):

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run lint` | Oxlint |
| `npm run preview` | Preview built app |

---

## Production deployment (ScalaHosting SPanel)

**Full step-by-step guide:** [`deploy/SCALAHOSTING.md`](deploy/SCALAHOSTING.md)

| Item | Value |
|------|--------|
| Panel | **SPanel** (not cPanel) |
| Domain | `nexusyl.juvenileasia.com` |
| Document root | `/home/juvenileasia/nexusyl.juvenileasia.com` |

### Build (on your PC)

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_MARKETING_URL=https://nexusyl.juvenileasia.com
```

```bash
cd portal
npm run build
# → portal/dist/
```

### Upload layout

```
/home/juvenileasia/nexusyl.juvenileasia.com/
├── index.html, …           # marketing pages
├── .htaccess               # routes /login + /dashboard-* → portal
└── portal/dist/            # React build (index.html + assets/)
```

### SPanel steps (short)

1. SPanel → Subdomains → confirm document root  
2. Upload marketing HTML + `.htaccess` via File Manager or SFTP  
3. Upload `portal/dist/` → `…/portal/dist/`  
4. Issue SSL for the subdomain in SPanel  
5. Test `/`, `/login`, `/dashboard-admin`
---

## Documentation

| Document | Purpose |
|----------|---------|
| [`docs/NEXUSYL-PRD.md`](docs/NEXUSYL-PRD.md) | Product requirements, feature status, migration phases |
| [`Nexusyl_Design_Guideline_and_Sitemap.md`](Nexusyl_Design_Guideline_and_Sitemap.md) | Brand tokens, components, full sitemap |
| [`deploy/SCALAHOSTING.md`](deploy/SCALAHOSTING.md) | ScalaHosting SPanel deploy (document root + SSL) |
| [`deploy/nginx.conf.example`](deploy/nginx.conf.example) | nginx site config (unmanaged VPS) |

---

## Security notes

- All business data lives in **Supabase** with **Row Level Security** — not in browser `localStorage`
- Admin user creation uses RPC functions (`admin_create_portal_user`, etc.) — only admins can provision accounts
- File uploads go to a private Supabase Storage bucket (`documents`) with per-user RLS policies
- Do not commit `.env.local`, service role keys, or `portal/dist/` build artifacts

---

## Troubleshooting

**Portal shows "Supabase is not configured"**  
Copy `portal/.env.example` → `portal/.env.local` and restart the Vite dev server.

**Login works but dashboard is empty / errors**  
Confirm migrations ran in order and seed scripts completed. Check the browser console and Supabase logs.

**`/login` on `:8080` does not open the portal**  
Ensure the portal dev server is running on `:5173`. `scripts/dev-server.py` redirects portal routes to it.

**`npm run build:portal` fails on Windows**  
Run the build from the portal directory instead:

```bash
cd portal
npm run build
```

**Port already in use**  
Stop existing processes on `8080` or `5173`, or change the port in `scripts/dev-server.py` / `portal/vite.config.ts`.

---

## License

Proprietary — Nexusyl Limited / Juvenile Asia. All rights reserved.

# Nexusyl Platform — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** July 2026  
**Owner:** Nexusyl Limited / Juvenile Asia  
**Live site:** https://nexusyl.juvenileasia.com/  
**Repository:** `juvenileasia/nexusyl`

---

## 1. Executive Summary

Nexusyl Limited is a London-based multi-sector company operating across **Recruitment**, **Food Tech**, **Education**, and **Property**. The current codebase is a **static marketing website** plus a **multi-tenant portal** (CRM + LMS) prototype that stores data in browser `localStorage`.

The product goal is to evolve into a **production platform** with:

- **Supabase** — PostgreSQL database, authentication, row-level security, file storage
- **React (Vite)** — authenticated portal and dashboards
- **VPS** — hosts marketing HTML + React portal build
- **Local development** — marketing on `:8080`, portal on `:5173`

This PRD defines scope, users, features, migration plan, and which HTML pages must become React.

---

## 2. Problem Statement

| Issue | Impact |
|-------|--------|
| Portal auth uses hardcoded passwords in `localStorage` | No real security; not multi-user |
| CRM/LMS data in `localStorage` | Data lost per browser; no sync across devices |
| Duplicate LMS admin (`lms-admin.html` ≈ `dashboard-admin.html`) | Maintenance burden, inconsistent UX |
| No backend API | Cannot support document uploads, email, audit logs |
| Mixed login flows (`login.html`, `lms-login.html`) | User confusion |

---

## 3. Goals & Success Metrics

### Goals
1. Secure login for 4 roles: **Admin**, **Employee**, **Student**, **Supplier**
2. Centralised data in Supabase with role-based access (RLS)
3. Admin CRM to manage people, courses, enrolments, compliance
4. Student lifecycle: application tracker, document upload, visa status
5. LMS: course modules (video, text, PDF, quiz), progress, certificates
6. Keep marketing site fast and SEO-friendly as static HTML

### Success Metrics (MVP)
- [ ] Admin can CRUD students, employees, suppliers via React + Supabase
- [ ] Admin can create courses with modules and enrol users
- [ ] Students can log in, view tracker, upload documents to Supabase Storage
- [ ] Employees can view assigned courses and DBS status
- [ ] Suppliers can view assigned student pipeline
- [ ] Zero reliance on `localStorage` for business data
- [ ] Deployed on VPS with single domain (marketing + portal)

---

## 4. User Roles & Personas

| Role | Persona | Primary needs |
|------|---------|---------------|
| **Admin** | Nexusyl operations manager | Full CRM: people, courses, enrolment, DBS, reports |
| **Employee** | Coordinator / vetting staff | Own training, DBS status, student support tools |
| **Student** | International newcomer | Application tracker, document upload, visa docs, academy courses |
| **Supplier** | Recruitment / education partner | Pipeline of referred students, contracts, reports |
| **Public visitor** | Prospective client | Marketing info, contact form (no login) |

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  VPS (nginx)                                                    │
│  ├── /                    → Static marketing HTML               │
│  ├── /recruitment, etc.   → Static sector pages                 │
│  ├── /login               → React portal (SPA)                  │
│  └── /dashboard-*         → React portal (role-based routes)    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Supabase           │
                    │  • Auth (email/pw)  │
                    │  • PostgreSQL + RLS │
                    │  • Storage (docs)   │
                    │  • (optional) Edge  │
                    └─────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Marketing | Static HTML, Tailwind CDN, Apache `.htaccess` clean URLs |
| Portal | React 19, TypeScript, Vite, React Router, `@supabase/supabase-js` |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email/password) |
| Files | Supabase Storage (`documents` bucket) |
| Hosting | VPS + nginx (see `deploy/nginx.conf.example`) |
| Local dev | `scripts/dev-server.py` + `portal/npm run dev` |

---

## 6. Data Model (Supabase)

### Implemented (Phases 1–2)

| Table | Purpose |
|-------|---------|
| `profiles` | User identity + role (extends `auth.users`) |
| `profile_details` | Phone, job title, org, DBS status, students supplied |
| `courses` | LMS courses (title, category, colour, pass_mark, published) |
| `course_modules` | Video / text / PDF / quiz content per course |
| `enrollments` | User ↔ course assignment + progress % |
| `module_progress` | Per-module completion + quiz scores |
| `applications` | CRM records (visa, recruitment, property enquiries) |
| `documents` | Upload metadata (links to Storage) |
| `dbs_checks` | DBS compliance queue |

### RPC Functions (admin-only)

- `admin_create_portal_user`
- `admin_update_portal_user`
- `admin_update_user_password`
- `admin_delete_portal_user`

### Planned (Phases 5–7)

- Email notifications (Supabase Edge Functions or external)
- Audit log table (`audit_events`)

---

## 7. Feature Requirements by Module

### 7.1 Authentication & Login

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| AUTH-1 | Single login page with role tabs (admin/employee/student/supplier) | P0 | ✅ React `LoginPage` |
| AUTH-2 | Supabase email/password authentication | P0 | ✅ Done |
| AUTH-3 | Redirect to role-appropriate dashboard after login | P0 | ✅ All roles → React |
| AUTH-4 | Session persistence across refresh | P0 | ✅ Supabase session |
| AUTH-5 | Sign out clears session | P0 | ✅ Done |
| AUTH-6 | Admin creates users with initial password | P0 | ✅ Phase 2 RPC |
| AUTH-7 | Password reset / must-change-on-first-login | P1 | ⏳ Flag in `profile_details`; enforce in UI later |

### 7.2 Admin CRM (`dashboard-admin`)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| ADM-1 | Overview dashboard with live stats | P0 | ✅ Phase 1 |
| ADM-2 | Student management (CRUD) | P0 | ✅ Phase 2 |
| ADM-3 | Employee management (CRUD + DBS) | P0 | ✅ Phase 2 |
| ADM-4 | Supplier management (CRUD) | P0 | ✅ Phase 2 |
| ADM-5 | Course manager (create/edit/delete courses) | P0 | ✅ Phase 3 |
| ADM-6 | Module builder (video, text, PDF, quiz) | P0 | ✅ Phase 3 |
| ADM-7 | Enrolment (per-person + bulk) | P0 | ✅ Phase 3 |
| ADM-8 | Quick content upload to existing course | P1 | ✅ Phase 3 |
| ADM-9 | DBS pipeline queue | P1 | ✅ Phase 4 |
| ADM-10 | Progress reports / analytics | P1 | ✅ Phase 4 |

### 7.3 Employee Portal (`dashboard-employee`)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| EMP-1 | Home overview (courses, DBS, progress stats) | P0 | ✅ Phase 5 |
| EMP-2 | My courses list + launch course player | P0 | ✅ Phase 5 |
| EMP-3 | DBS status tracker | P1 | ✅ Phase 5 |
| EMP-4 | Compliance resources | P2 | ✅ Phase 5 |
| EMP-5 | Moodle integration link (external) | P3 | Keep as external link |

### 7.4 Student Portal (`dashboard-student`)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| STU-1 | Journey dashboard (application stage, visa, academy %) | P0 | ✅ Phase 5 |
| STU-2 | Step-by-step application tracker | P0 | ✅ Phase 5 |
| STU-3 | Document upload (offer letter) → Supabase Storage | P0 | ✅ Phase 5 |
| STU-4 | Visa docs upload (passport, CAS) | P0 | ✅ Phase 5 |
| STU-5 | Academy course access (see LMS student) | P0 | ✅ Phase 5 |

### 7.5 Supplier Portal (`dashboard-supplier`)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| SUP-1 | Partner overview dashboard | P1 | ✅ Phase 5 |
| SUP-2 | Student pipeline table | P1 | ✅ Phase 5 |
| SUP-3 | Employee training overview (read-only) | P2 | ✅ Phase 5 |
| SUP-4 | Contracts section | P3 | ⏳ Placeholder |
| SUP-5 | Reports | P2 | ✅ Phase 5 |

### 7.6 LMS Student Player (`lms-student`)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| LMS-1 | Course list for enrolled student | P0 | ✅ Phase 5 |
| LMS-2 | Module player (video embed, text HTML, PDF) | P0 | ✅ Phase 5 |
| LMS-3 | Quiz with scoring + pass mark | P0 | ✅ Phase 5 |
| LMS-4 | Mark module complete + progress sync | P0 | ✅ Phase 5 |
| LMS-5 | Certificates on course completion | P1 | ✅ Phase 5 |
| LMS-6 | Student self-registration | P2 | Optional |

### 7.7 Marketing Website

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| MKT-1 | Home, sector pages, SEO meta, schema.org | P0 | ✅ Static HTML |
| MKT-2 | Dark/light theme toggle | P1 | ✅ `localStorage` theme only |
| MKT-3 | Contact form submission to database/email | P1 | ⏳ Future (Edge Function or Formspree) |
| MKT-4 | Login button → React portal | P0 | ✅ Dev redirect |

---

## 8. HTML Page Inventory & React Migration Decision

### Legend

| Verdict | Meaning |
|---------|---------|
| **Keep static** | Stay as HTML on VPS; no React needed |
| **Convert to React** | Migrate to `portal/` with Supabase |
| **Retire / merge** | Remove after another page absorbs its features |
| **Done** | Already in React |

---

### 8.1 Marketing & Legal (7 pages) — **Keep static**

| File | ~Size | Purpose | React? | Rationale |
|------|-------|---------|--------|-----------|
| `index.html` | 87 KB | Main homepage, SEO, contact form UI | **Keep static** | SEO-critical; no auth; rarely changes logic |
| `recruitment.html` | 88 KB | Sector landing page | **Keep static** | Content/marketing only |
| `foodtech.html` | 67 KB | Sector landing page | **Keep static** | Same |
| `education.html` | 73 KB | Sector landing page | **Keep static** | Same |
| `property.html` | 71 KB | Sector landing page | **Keep static** | Same |
| `privacy.html` | 51 KB | Privacy policy | **Keep static** | Legal text; no interactivity |
| `terms.html` | 51 KB | Terms of service | **Keep static** | Legal text |

**Optional later:** extract shared nav/footer into a static build tool (11ty, Astro) — not required for MVP.

| File | Verdict |
|------|---------|
| `index nexusyl.html` | **Retire** — duplicate/old variant of `index.html` |

---

### 8.2 Authentication (2 pages)

| File | ~Size | Purpose | React? | Rationale |
|------|-------|---------|--------|-----------|
| `login.html` | 27 KB | Multi-role portal login | **Done → React** | `portal/src/pages/LoginPage.tsx` replaces this |
| `lms-login.html` | 18 KB | Separate academy admin/student login | **Retire / merge** | Duplicate; all auth via single React login |

---

### 8.3 Admin & CRM (1 page)

| File | ~Size | Sections | React? | Status |
|------|-------|----------|--------|--------|
| `dashboard-admin.html` | 95 KB | Overview, Students, Employees, Suppliers, Courses, Enrolment, Content, DBS, Reports | **Done → React** | `portal/src/pages/admin/*` |

**Target:** fully replace with `portal/src/pages/admin/*` then delete HTML file.

---

### 8.4 Role Dashboards (3 pages)

| File | ~Size | Sections | React? | Rationale |
|------|-------|----------|--------|-----------|
| `dashboard-employee.html` | 50 KB | Home, My Courses, Moodle, DBS, Compliance | **Done → React** | Phase 5 |
| `dashboard-student.html` | 49 KB | Home, Tracker, Upload, Visa docs | **Done → React** | Phase 5 |
| `dashboard-supplier.html` | 27 KB | Home, Student pipeline, Employees, Contracts, Reports | **Done → React** | Phase 5 |

---

### 8.5 LMS (2 pages)

| File | ~Size | Purpose | React? | Rationale |
|------|-------|---------|--------|-----------|
| `lms-admin.html` | 84 KB | Duplicate course/student/enrol admin | **Retire / merge** | 90% overlap with `dashboard-admin` courses section; do not migrate separately |
| `lms-student.html` | 56 KB | Full course player, quizzes, certificates | **Done → React** | `CoursePlayerPage` shared with employee/student |

---

### 8.6 Academy Demo (1 page)

| File | ~Size | Purpose | React? | Rationale |
|------|-------|---------|--------|-----------|
| `academy-dashboard.html` | 81 KB | Static mockup of course player UI | **Retire / merge** | Design reference only; merge patterns into React LMS player; not a separate app |

---

### 8.7 Summary Matrix

| Category | Files | Keep Static | Convert React | Retire/Merge | Done |
|----------|-------|-------------|---------------|--------------|------|
| Marketing & legal | 8 | 7 | 0 | 1 | 0 |
| Auth | 2 | 0 | 0 | 1 | 1 |
| Admin CRM | 1 | 0 | 1 | 0 | partial |
| Role dashboards | 3 | 0 | 3 | 0 | 3 |
| LMS | 2 | 0 | 1 | 1 | 0 |
| Academy demo | 1 | 0 | 0 | 1 | 0 |
| **Total** | **17** | **7** | **5** | **4** | **4** |

*Excludes `portal/index.html`, `nexusyl-website.zip`, build artifacts.*

---

## 9. Migration Roadmap

| Phase | Scope | Deliverables | Est. effort |
|-------|--------|--------------|-------------|
| **1** ✅ | Foundation | Supabase schema, React login, admin layout, overview | Done |
| **2** ✅ | People CRM | Students, employees, suppliers CRUD + admin RPCs | Done |
| **3** ✅ | LMS Admin | Courses, module builder, enrolment, content upload | Done |
| **4** ✅ | Compliance | DBS pipeline, progress reports, documents bucket | Done |
| **5** ✅ | Role portals | Employee, student, supplier dashboards + LMS player | Done |
| **6** ✅ | Production | VPS deploy, retire legacy HTML, remove auth bridge | Done |
| **7** | Enhancements | Contact form backend, email, audit logs | Ongoing |

### Phase 3 Detail (Complete)

1. ✅ `CoursesPage` — course cards, create/edit modal (title, desc, category, colour, pass mark)
2. ✅ `ModuleBuilder` — add video/text/pdf/quiz modules to `course_modules`
3. ✅ `EnrolmentPage` — assign courses to profiles; bulk enrol
4. ✅ `ContentPage` — quick add module to existing course
5. ✅ Wire all CRUD to Supabase; remove course data from `localStorage` (admin React path)

### Phase 4 Detail (Complete)

1. ✅ `DbsPipelinePage` — live queue, stats, add/edit/delete checks, certificate upload to Storage
2. ✅ `ReportsPage` — per-person course progress + quiz scores from `enrollments` / `module_progress`
3. ✅ `004_storage_bucket.sql` — private `documents` bucket (10 MB, PDF/images/docs) + RLS policies
4. ✅ `lib/documents.ts` — upload, signed URL, delete helpers (used by DBS certs; student uploads in Phase 5)

### Phase 5 Detail (Complete)

1. ✅ `EmployeeApp` — overview, courses, DBS tracker, compliance resources
2. ✅ `StudentApp` — journey dashboard, application tracker, document/visa upload, courses
3. ✅ `SupplierApp` — partner dashboard, student pipeline, employee training, reports
4. ✅ `CoursePlayerPage` — video/text/PDF/quiz modules, progress sync, certificates
5. ✅ `005_portal_role_policies.sql` — enrollment progress updates + supplier read policies
6. ✅ All roles use React dashboards (legacy HTML bridge removed from login flow)

### Phase 6 Detail (Complete)

1. ✅ Deleted legacy portal HTML (`login.html`, `dashboard-*.html`, `lms-*.html`, `academy-dashboard.html`, `auth-bridge.js`)
2. ✅ All portal routes redirect to React in local dev (`scripts/dev-server.py`)
3. ✅ Removed auth bridge and `legacyDashboard.ts`; login uses React Router navigation
4. ✅ Updated `deploy/nginx.conf.example` for SPA routing + asset caching
5. ✅ Added `scripts/deploy.sh` build + rsync helper
6. ✅ `.htaccess` portal rewrites removed (nginx serves React in production)

### Files Deleted After Migration Complete

```
login.html                    ✅ deleted
lms-login.html                ✅ deleted
dashboard-admin.html          ✅ deleted
dashboard-employee.html       ✅ deleted
dashboard-student.html        ✅ deleted
dashboard-supplier.html       ✅ deleted
lms-admin.html                ✅ deleted
lms-student.html              ✅ deleted
academy-dashboard.html        ✅ deleted
auth-bridge.js                ✅ deleted
index nexusyl.html            ✅ deleted
```

---

## 10. Non-Functional Requirements

| Area | Requirement |
|------|-------------|
| **Security** | RLS on all tables; anon key only in browser; never expose service role key |
| **Auth** | Supabase Auth; admin-only user creation via RPC |
| **Performance** | Marketing pages < 3s LCP; portal code-split by role route |
| **Accessibility** | Form labels, keyboard nav in modals (target WCAG 2.1 AA) |
| **Browser support** | Latest Chrome, Firefox, Safari, Edge |
| **Mobile** | Responsive dashboards (sidebar collapses on mobile) |
| **Data residency** | Supabase region: EU (London) recommended for UK users |
| **Backups** | Supabase automated backups enabled on paid plan |

---

## 11. Deployment (VPS)

1. Build portal: `npm run build:portal`
2. Copy marketing HTML to `/var/www/nexusyl`
3. Copy `portal/dist/` to `/var/www/nexusyl/portal/dist`
4. Configure nginx (`deploy/nginx.conf.example`)
5. Environment: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` baked into build
6. SSL via Let's Encrypt (Certbot)

---

## 12. Local Development

```bash
# Terminal 1 — marketing site (:8080)
npm run dev:site

# Terminal 2 — React portal (:5173)
npm run dev:portal

# Or both (if concurrently works on your OS)
npm run dev
```

**Env:** `portal/.env.local` with Supabase keys.

**Supabase setup order:**
1. `001_initial_schema.sql`
2. `002_lms_schema.sql`
3. `003_admin_user_functions.sql`
4. `004_storage_bucket.sql`
5. `005_portal_role_policies.sql`
6. `seed_demo_users.sql` → `seed.sql` → `seed_lms.sql`

---

## 13. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Large HTML → React rewrite scope creep | Phased migration; retire duplicates (`lms-admin`, `academy-dashboard`) |
| Supabase RLS misconfiguration | Test each role with separate demo accounts |
| File upload size limits | Supabase Storage limits + client validation (10 MB) |
| Legacy `localStorage` data during transition | Bridge period only; no new features on legacy pages |
| VPS + Supabase env mismatch | Separate `.env` per environment; build-time Vite vars |

---

## 14. Open Questions

1. **Contact form** — store in Supabase `applications` or send email only?
2. **Moodle** — remain external link or deep integration?
3. **Custom domain for academy** — `academy.nexusyl.com` separate from main site?
4. **Supplier contracts** — file storage or PDF generation?
5. **Payment / billing** — in scope for v1? (Assumed **no** for MVP)

---

## 15. Appendix: Current React Portal Structure

```
portal/src/
├── layouts/DashboardLayout.tsx      # Shared CRM shell
├── pages/
│   ├── LoginPage.tsx                # ✅ Unified login
│   ├── admin/
│   │   ├── AdminApp.tsx             # ✅ Admin router
│   │   ├── AdminOverviewPage.tsx    # ✅ Phase 1
│   │   ├── PeopleManagementPage.tsx # ✅ Phase 2
│   │   ├── PeoplePages.tsx          # ✅ Students/Employees/Suppliers
│   │   ├── CoursesPage.tsx          # ✅ Phase 3
│   │   ├── EnrolmentPage.tsx        # ✅ Phase 3
│   │   ├── ContentPage.tsx          # ✅ Phase 3
│   │   ├── DbsPipelinePage.tsx      # ✅ Phase 4
│   │   └── ReportsPage.tsx          # ✅ Phase 4
│   ├── employee/EmployeeApp.tsx     # ✅ Phase 5
│   ├── student/StudentApp.tsx       # ✅ Phase 5
│   ├── supplier/SupplierApp.tsx     # ✅ Phase 5
│   └── lms/CoursePlayerPage.tsx     # ✅ Phase 5
├── hooks/
│   ├── useAdminStats.ts
│   ├── useProfiles.ts
│   ├── useCourses.ts
│   ├── useEnrollments.ts
│   ├── useDbsChecks.ts
│   └── useProgressReports.ts
├── components/admin/
│   ├── PersonModal.tsx
│   ├── CourseModal.tsx
│   ├── CourseViewModal.tsx
│   ├── ModuleBuilder.tsx
│   └── DbsModal.tsx
├── contexts/AuthContext.tsx
├── lib/
│   ├── supabase.ts
│   └── documents.ts
```

---

*Document maintained in `docs/NEXUSYL-PRD.md`. Update version when phases complete.*

# Deploy Nexusyl to ScalaHosting (SPanel)

**Domain:** https://nexusyl.juvenileasia.com/  
**Control panel:** **SPanel** (ScalaHosting managed VPS — not cPanel)  
**Account:** `juvenileasia`  
**Document root:** `/home/juvenileasia/nexusyl.juvenileasia.com`  
**Stack:** Marketing HTML + React portal (`portal/dist`) + Supabase (cloud)

SPanel is ScalaHosting’s panel (similar role to cPanel). Use **Subdomains**, **File Manager**, and **SSL**. Apache/LiteSpeed serves the site and honours `.htaccess`.

---

## Your Nexusyl account (confirmed)

| Item | Value |
|------|--------|
| Panel | SPanel (`…/spanel/…`) |
| Linux user | `juvenileasia` |
| Subdomain | `nexusyl.juvenileasia.com` |
| Document root (**DOCROOT**) | `/home/juvenileasia/nexusyl.juvenileasia.com` |

SPanel → **Subdomains** lists this under Existing Subdomains with the document root above.

Upload layout inside that folder:

```
/home/juvenileasia/nexusyl.juvenileasia.com/
├── index.html              # marketing home
├── recruitment.html
├── foodtech.html
├── education.html
├── property.html
├── privacy.html
├── terms.html
├── Nexusyl_Fab.png         # + other static assets
├── .htaccess               # SPA + clean URL rewrites
└── portal/
    └── dist/
        ├── index.html      # React SPA shell
        └── assets/         # hashed JS/CSS from Vite
```

Do **not** upload `portal/node_modules`, `portal/src`, or `portal/.env.local`.

---

## What you need before starting

1. SPanel login (same account that shows Subdomains)
2. Optional **SSH** for the `juvenileasia` user (faster uploads via rsync/SFTP)
3. Subdomain already created: `nexusyl.juvenileasia.com` → DOCROOT above
4. **Supabase** migrations + seeds applied (see root `README.md`)
5. Local **Node.js 20+** to build the portal

---

## 1. Build the portal for production (on your PC)

Vite bakes env vars into the JS at **build time**. Set production values before building.

```powershell
cd d:\Projects\nexusyl\portal
```

Edit `portal\.env.local` (do not commit):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_MARKETING_URL=https://nexusyl.juvenileasia.com
```

Build:

```powershell
npm run build
```

Output: `portal\dist\` (`index.html` + `assets\`).

---

## 2. SPanel — confirm subdomain & SSL

### 2.1 Subdomain

1. SPanel → **Subdomains** → Existing Subdomains  
2. Confirm **`nexusyl.juvenileasia.com`** with document root  
   `/home/juvenileasia/nexusyl.juvenileasia.com`  
3. If missing: **+ Add a New Subdomain** → `nexusyl` on `juvenileasia.com` (SPanel will create the DOCROOT folder)

### 2.2 SSL certificate

1. SPanel → **SSL** / Let’s Encrypt / AutoSSL (label varies by SPanel version)  
2. Issue or renew for **`nexusyl.juvenileasia.com`**  
3. Prefer HTTPS-only after the cert is active

If the main site already has SSL for `*.juvenileasia.com`, the subdomain may already be covered — still verify the padlock on https://nexusyl.juvenileasia.com/

---

## 3. Upload files

### Option A — SPanel File Manager (no SSH)

1. SPanel → **File Manager**  
2. Open `/home/juvenileasia/nexusyl.juvenileasia.com`  
3. Upload marketing files from the repo root:
   - `index.html`, `recruitment.html`, `foodtech.html`, `education.html`, `property.html`
   - `privacy.html`, `terms.html`
   - images / `Nexusyl_Fab.png` / other static assets used by the HTML
   - **`.htaccess`** (must be in DOCROOT root — enable “show hidden files” if needed)
4. Create folder `portal`, then `portal/dist`
5. Upload **contents** of local `portal/dist/` into `…/portal/dist/`
   - You should see `portal/dist/index.html` and `portal/dist/assets/`

Skip uploading: `node_modules`, `portal/src`, `.git`, `.env.local`, `supabase/`, etc.

### Option B — SFTP (WinSCP / FileZilla)

| Setting | Value |
|---------|--------|
| Protocol | SFTP |
| Host | Your VPS hostname / IP (from ScalaHosting) |
| User | `juvenileasia` |
| Remote path | `/home/juvenileasia/nexusyl.juvenileasia.com` |

Upload the same layout as Option A.

### Option C — rsync over SSH (Git Bash / WSL)

```bash
export USER=juvenileasia
export HOST=YOUR_VPS_HOSTNAME_OR_IP
export DOCROOT=/home/juvenileasia/nexusyl.juvenileasia.com

# From repo root (d:\Projects\nexusyl or WSL path)
rsync -avz --delete \
  --exclude node_modules --exclude portal --exclude .git \
  --exclude 'portal/.env*' \
  --exclude supabase --exclude docs --exclude scripts \
  ./ ${USER}@${HOST}:${DOCROOT}/

# Then portal build
rsync -avz --delete \
  portal/dist/ ${USER}@${HOST}:${DOCROOT}/portal/dist/
```

Also ensure `.htaccess` landed in DOCROOT (rsync includes it if you sync from repo root without excluding it). Prefer uploading marketing HTML + `.htaccess` explicitly if you use a selective exclude list.

Recommended minimal marketing sync:

```bash
rsync -avz \
  index.html recruitment.html foodtech.html education.html property.html \
  privacy.html terms.html .htaccess Nexusyl_Fab.png \
  ${USER}@${HOST}:${DOCROOT}/

# Plus any other root-level assets the HTML references (check Network tab if images 404)
rsync -avz --delete portal/dist/ ${USER}@${HOST}:${DOCROOT}/portal/dist/
```

---

## 4. Apache / LiteSpeed rewrites (`.htaccess`)

Root `.htaccess` in this repo:

- Maps `/assets/*` → `portal/dist/assets/*`
- Serves `/login` and `/dashboard-*` from `portal/dist/index.html`
- Clean URLs for marketing (`/recruitment`, `/food-tech`, …)

After upload:

```bash
# SSH as juvenileasia
cd /home/juvenileasia/nexusyl.juvenileasia.com
ls -la .htaccess portal/dist/index.html portal/dist/assets
```

You should see `.htaccess`, `portal/dist/index.html`, and files under `portal/dist/assets/`.

---

## 5. Permissions (if 403)

```bash
DOCROOT=/home/juvenileasia/nexusyl.juvenileasia.com
find "$DOCROOT" -type d -exec chmod 755 {} \;
find "$DOCROOT" -type f -exec chmod 644 {} \;
```

---

## 6. Smoke test

| URL | Expected |
|-----|----------|
| https://nexusyl.juvenileasia.com/ | Marketing homepage |
| https://nexusyl.juvenileasia.com/recruitment | Sector page |
| https://nexusyl.juvenileasia.com/login | React login |
| https://nexusyl.juvenileasia.com/dashboard-admin | Admin CRM (after login) |

If `/login` is blank: DevTools → Network → `/assets/*.js` must be **200**. If **404**, `.htaccess` is missing or `/assets/` rewrite failed.

---

## 7. DNS

At the DNS host for `juvenileasia.com` (often ScalaHosting):

| Type | Name / host | Value |
|------|-------------|--------|
| **A** | `nexusyl` | VPS public IP |

Confirm: [whatsmydns.net](https://www.whatsmydns.net/#A/nexusyl.juvenileasia.com)

---

## 8. Supabase production checklist

- [ ] Migrations `001` → `005` applied
- [ ] Seeds only if you want demo logins; change passwords for real use
- [ ] Auth → URL config:
  - Site URL: `https://nexusyl.juvenileasia.com`
  - Redirect URLs: `https://nexusyl.juvenileasia.com/**`
- [ ] Portal built with production `VITE_SUPABASE_*` (anon key only)

---

## 9. Redeploy (later updates)

**React changes:**

1. Update `portal/.env.local` if needed  
2. `cd portal && npm run build`  
3. Re-upload only `portal/dist/` → `/home/juvenileasia/nexusyl.juvenileasia.com/portal/dist/`  
4. Hard-refresh (Ctrl+Shift+R)

**Marketing HTML:** upload changed `.html` / images into DOCROOT (keep `.htaccess`).

---

## 10. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `/login` 404 | Confirm `.htaccess` + `portal/dist/index.html` in DOCROOT |
| Login blank; `/assets/*.js` 404 | Upload `portal/dist/assets/`; check `.htaccess` asset rewrite |
| “Supabase is not configured” | Rebuild with production `.env.local`, re-upload `dist/` |
| Login OK, empty data | Wrong Supabase project / migrations / RLS |
| Broken images on marketing | Linux paths are case-sensitive — match filenames |
| SSL warning | SPanel SSL for `nexusyl.juvenileasia.com`; wait for DNS |
| Upload permission denied | Use SPanel user `juvenileasia` and DOCROOT path above |
| Hidden `.htaccess` missing | File Manager → show hidden/dotfiles, then re-upload |

---

## 11. Security

- Never put `portal/.env.local` or the **service role** key in the web root  
- Do not upload `node_modules` or `portal/src`  
- Prefer HTTPS after SPanel SSL is active  
- Change demo passwords before real users

---

## Optional: unmanaged nginx

Only if you run a **separate** nginx box (not this SPanel site). See `deploy/nginx.conf.example`.

This managed VPS site for Nexusyl should use **SPanel + DOCROOT + `.htaccess`** as documented above.

---

## Quick reference

```text
Panel:     SPanel
User:      juvenileasia
Domain:    nexusyl.juvenileasia.com
DOCROOT:   /home/juvenileasia/nexusyl.juvenileasia.com
Portal:    /home/juvenileasia/nexusyl.juvenileasia.com/portal/dist
```

# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This repository contains a single self-contained static HTML file (`index nexusyl.html`) for the Nexusyl Limited marketing website. There is no build system, package manager, or backend.

### Running the dev server

Serve the site with Python's built-in HTTP server:

```bash
cd /workspace && python3 -m http.server 8080
```

Then open `http://localhost:8080/index%20nexusyl.html` in Chrome. Note the `%20` URL-encoding required because the filename contains a space.

### Key caveats

- **Filename has a space**: The file is named `index nexusyl.html` (with a space). Always URL-encode the space as `%20` when referencing it in URLs.
- **CDN dependencies**: Tailwind CSS, Google Fonts (Syne + Manrope), and Font Awesome are all loaded from CDNs at runtime. Internet access is required for the page to render with full styling.
- **No build/lint/test**: There is no package.json, no build step, no linter config, and no automated test suite. The site is pure HTML with inline CSS and JS.
- **Local images missing**: The HTML references `Nexusyl.png` and `Nexusyl_Fab.png` which are not committed to the repo. These have `onerror` handlers that hide the image elements gracefully.
- **Contact form is simulated**: The contact form submission uses a `setTimeout` to fake a success response; there is no backend endpoint.

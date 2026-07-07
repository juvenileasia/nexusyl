#!/usr/bin/env python3
"""Local static server for Nexusyl marketing HTML pages."""

from __future__ import annotations

import http.server
import os
import socketserver
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

REWRITES = {
    "food-tech": "foodtech.html",
}

PORTAL_DEV_URL = os.environ.get("PORTAL_DEV_URL", "http://localhost:5173")

# All portal routes are served by the React SPA (Phase 6).
PORTAL_ROUTES = frozenset(
    {
        "login",
        "dashboard-admin",
        "dashboard-employee",
        "dashboard-student",
        "dashboard-supplier",
    }
)


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urllib.parse.unquote(self.path.split("?")[0].split("#")[0])

        if path in ("", "/"):
            self.path = "/index.html"
        else:
            clean = path.strip("/")
            if clean in PORTAL_ROUTES:
                self.send_response(302)
                self.send_header("Location", f"{PORTAL_DEV_URL}/{clean}")
                self.end_headers()
                return
            if clean in REWRITES:
                self.path = "/" + REWRITES[clean]
            elif "." not in os.path.basename(clean) and os.path.isfile(
                os.path.join(ROOT, clean + ".html")
            ):
                self.path = "/" + clean + ".html"

        return super().do_GET()

    def log_message(self, fmt: str, *args) -> None:
        print(f"[site] {fmt % args}")


if __name__ == "__main__":
    with socketserver.TCPServer(("", 8080), Handler) as httpd:
        print("Marketing site: http://localhost:8080/")
        print(f"Portal routes redirect to React dev server: {PORTAL_DEV_URL}")
        print("Press Ctrl+C to stop")
        httpd.serve_forever()

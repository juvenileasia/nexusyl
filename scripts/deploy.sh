#!/usr/bin/env bash
# Build the React portal for VPS deployment.
#
# Usage:
#   ./scripts/deploy.sh              # build only
#   ./scripts/deploy.sh --sync user@host   # build + rsync to VPS
#
# Prerequisites on VPS:
#   - nginx configured per deploy/nginx.conf.example
#   - /var/www/nexusyl for marketing HTML
#   - portal/.env.local with production Supabase keys before build

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Building React portal"
if [[ ! -f portal/.env.local ]]; then
  echo "WARNING: portal/.env.local not found — copy portal/.env.example and set Supabase keys."
fi

npm run build:portal

echo ""
echo "Build complete: portal/dist/"
echo ""
echo "Manual deploy steps:"
echo "  1. rsync marketing HTML to /var/www/nexusyl/"
echo "  2. rsync portal/dist/ to /var/www/nexusyl/portal/dist/"
echo "  3. sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "Example rsync:"
echo "  rsync -avz --delete \\"
echo "    --exclude node_modules --exclude portal --exclude .git \\"
echo "    ./ user@your-vps:/var/www/nexusyl/"
echo "  rsync -avz --delete portal/dist/ user@your-vps:/var/www/nexusyl/portal/dist/"

if [[ "${1:-}" == "--sync" && -n "${2:-}" ]]; then
  HOST="$2"
  echo ""
  echo "==> Syncing to $HOST"
  rsync -avz --delete \
    --exclude node_modules --exclude portal/node_modules --exclude portal/dist --exclude .git \
    "$ROOT/" "$HOST:/var/www/nexusyl/"
  rsync -avz --delete "$ROOT/portal/dist/" "$HOST:/var/www/nexusyl/portal/dist/"
  echo "==> Done. Reload nginx on the server if needed."
fi

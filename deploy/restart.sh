#!/usr/bin/env bash
# Rebuild and restart FoodDraft after pulling new code.
# Usage:  bash deploy/restart.sh
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO"
SERVICE="fooddraft"

echo "▶ Pulling latest (if a git repo)…"
git -C "$REPO" pull --ff-only 2>/dev/null || echo "  (not a git checkout / nothing to pull — skipping)"

echo "▶ Installing deps + rebuilding frontend…"
npm --prefix "$REPO/server" install --omit=dev
npm --prefix "$REPO/web" install
npm --prefix "$REPO/web" run build

echo "▶ Restarting service…"
sudo systemctl restart "$SERVICE"
sleep 1
sudo systemctl status "$SERVICE" --no-pager -l | head -n 10 || true
echo "✅ Restarted. Logs: journalctl -u $SERVICE -f"

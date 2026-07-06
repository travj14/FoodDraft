#!/usr/bin/env bash
# First-time setup + start FoodDraft as a systemd service.
# Usage:  sudo bash deploy/start.sh     (or: PORT=4100 bash deploy/start.sh)
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO"
PORT="${PORT:-4100}"
SERVICE="fooddraft"
ENV_FILE="$REPO/deploy/fooddraft.env"
RUN_USER="${SUDO_USER:-$(whoami)}"

echo "▶ Repo:    $REPO"
echo "▶ Port:    $PORT"
echo "▶ User:    $RUN_USER"

# ── Preflight: fail early with a clear message if something's missing ──────────
missing=""
for cmd in node npm openssl systemctl sudo; do
  command -v "$cmd" >/dev/null 2>&1 || missing="$missing $cmd"
done
if [ -n "$missing" ]; then
  echo "✗ Missing required command(s):$missing"
  echo "  On Ubuntu (Contabo), install Node 20 + tools with:"
  echo "    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
  echo "    sudo apt-get install -y nodejs openssl"
  exit 1
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "✗ Node $NODE_MAJOR is too old — need Node 18+ (20 LTS recommended)."
  exit 1
fi
echo "▶ Node:    $(node -v)"

echo "▶ Installing dependencies…"
npm --prefix "$REPO/server" install --omit=dev
npm --prefix "$REPO/web" install

echo "▶ Building frontend…"
npm --prefix "$REPO/web" run build

# Create env file with a random JWT secret on first run.
if [ ! -f "$ENV_FILE" ]; then
  echo "▶ Creating $ENV_FILE (random JWT secret)…"
  {
    echo "PORT=$PORT"
    echo "JWT_SECRET=$(openssl rand -hex 32)"
    echo "NODE_ENV=production"
  } > "$ENV_FILE"
fi

# Write the systemd unit with correct absolute paths.
UNIT="/etc/systemd/system/$SERVICE.service"
echo "▶ Writing $UNIT…"
sudo tee "$UNIT" >/dev/null <<EOF
[Unit]
Description=FoodDraft server
After=network.target

[Service]
Type=simple
User=$RUN_USER
WorkingDirectory=$REPO
EnvironmentFile=$ENV_FILE
ExecStart=$(command -v node) $REPO/server/src/index.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

echo "▶ Enabling + starting service…"
sudo systemctl daemon-reload
sudo systemctl enable --now "$SERVICE"
sleep 1
sudo systemctl status "$SERVICE" --no-pager -l | head -n 12 || true
echo
echo "✅ FoodDraft running on 127.0.0.1:$PORT"
echo "   Next: configure nginx (see deploy/nginx.conf) and point DNS."
echo "   Logs: journalctl -u $SERVICE -f"

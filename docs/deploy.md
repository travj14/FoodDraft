# Deploying to your Contabo server

FoodDraft runs as **one Node process** (port `4100`) that serves the built frontend +
API + WebSocket. nginx proxies **both** URLs to it:

- `https://fooddraft.payrollgm.com` (subdomain, root path)
- `https://payrollgm.com/fooddraft` (subpath on your existing domain)

The frontend uses relative asset paths and auto-detects the `/fooddraft` prefix at
runtime, so the **same build works at both URLs simultaneously.**

## 0. Prerequisites (one-time on a fresh box)

A bare Contabo/Ubuntu server has none of these yet. Install Node 20 LTS + tools:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs openssl nginx git
```

(`start.sh` checks for these and stops with a clear message if any are missing.)

## 1. Get the code onto the server

```bash
# e.g. clone into your home dir (or /opt/fooddraft)
git clone <your-repo-url> ~/fooddraft
cd ~/fooddraft
```

(Or `scp`/`rsync` the folder up — anywhere works; the scripts use their own path.)

## 2. Install, build, and start (one command)

```bash
bash deploy/start.sh
```

This installs deps, builds the frontend, generates `deploy/fooddraft.env` with a random
`JWT_SECRET`, writes a **systemd** service, and starts it. The app is now on
`127.0.0.1:4100` (not public yet — nginx does that next).

Change the port if 4100 is taken: `PORT=4200 bash deploy/start.sh`.

## 3. Point your web server at it

### Using Caddy (see [`deploy/Caddyfile`](../deploy/Caddyfile))

Caddy auto-handles HTTPS + WebSockets. Add to your Caddyfile (usually
`/etc/caddy/Caddyfile`):

```caddy
# subdomain — needs DNS A record fooddraft.payrollgm.com -> server IP
fooddraft.payrollgm.com {
    reverse_proxy 127.0.0.1:4100
}
```

For the subpath, add inside your existing `payrollgm.com { … }` block:

```caddy
    redir /fooddraft /fooddraft/
    handle_path /fooddraft/* {
        reverse_proxy 127.0.0.1:4100
    }
```

Then `sudo systemctl reload caddy` (or `caddy reload`). Done — no cert step needed.

### Using nginx

Open [`deploy/nginx.conf`](../deploy/nginx.conf) — it has both pieces:

- **Subdomain:** drop the `server { server_name fooddraft.payrollgm.com; … }` block
  into `/etc/nginx/sites-available/fooddraft.conf` and symlink it into `sites-enabled`.
- **Subpath:** paste the two `location` blocks into your **existing** `payrollgm.com`
  server block.
- The `map $http_upgrade …` line goes once in the `http{}` context (skip if you already
  have one — it's needed for WebSockets).

Then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 4. DNS + HTTPS

- **Subdomain:** add a DNS **A record** `fooddraft` → your Contabo server's IP. Then:
  ```bash
  sudo certbot --nginx -d fooddraft.payrollgm.com
  ```
- **Subpath:** no DNS change; it's already under your `payrollgm.com` certificate.

## 5. Updating later

```bash
bash deploy/restart.sh     # git pull + rebuild + restart
```

## Handy commands

```bash
sudo systemctl status fooddraft      # is it running?
journalctl -u fooddraft -f           # live logs
sudo systemctl restart fooddraft     # restart without rebuilding
```

## Notes

- **Data** (users + leagues) is stored in `server/data.json`. Back it up if you care
  about accounts surviving. Live drafts are in memory and reset if the process restarts.
- Both URLs hit the **same backend**, so a draft created on one is joinable from the
  other (same league codes).
- `deploy/fooddraft.env` holds your `JWT_SECRET` — it's git-ignored; don't commit it.

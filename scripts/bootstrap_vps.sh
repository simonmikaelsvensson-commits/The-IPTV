#!/usr/bin/env bash
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "Run this script as root or with sudo: sudo $0"
  exit 1
fi

REPO_URL=${REPO_URL:-}
BRANCH=${BRANCH:-main}
TARGET_DIR=${TARGET_DIR:-/opt/theiptv}
DOMAIN=${DOMAIN:-}
EMAIL=${EMAIL:-}

if [ -z "$REPO_URL" ]; then
  echo "Please set REPO_URL environment variable to your Git repository (e.g. REPO_URL=git@github.com:you/theiptv.git)"
  exit 1
fi

# Install prerequisites and Docker
apt-get update
apt-get install -y ca-certificates curl gnupg lsb-release git

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

# Clone repo
if [ ! -d "$TARGET_DIR" ]; then
  git clone --branch "$BRANCH" "$REPO_URL" "$TARGET_DIR"
else
  cd "$TARGET_DIR" && git fetch origin && git checkout "$BRANCH" && git pull
fi

cd "$TARGET_DIR"

# Prepare backend .env
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  # If DOMAIN provided, set SERVER_URL
  if [ -n "$DOMAIN" ]; then
    sed -i "s|SERVER_URL=.*|SERVER_URL=https://$DOMAIN|" backend/.env || true
  fi
  # Ensure JWT_SECRET exists
  if ! grep -q '^JWT_SECRET=' backend/.env 2>/dev/null; then
    echo "JWT_SECRET=$(openssl rand -hex 32)" >> backend/.env
  else
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" backend/.env || true
  fi
  echo "Created backend/.env from .env.example — edit it if needed (SMTP credentials, JWT_SECRET, etc)"
fi

# Start services
docker compose up -d --build

# Run migrations once
docker compose run --rm migrate || true

# If DOMAIN and EMAIL provided, attempt to install nginx/certbot and obtain certificate
if [ -n "$DOMAIN" ] && [ -n "$EMAIL" ]; then
  apt-get install -y nginx certbot python3-certbot-nginx
  # install site config
  cp deploy/nginx/theiptv.conf /etc/nginx/sites-available/theiptv
  sed -i "s/your.domain.com/$DOMAIN/g" /etc/nginx/sites-available/theiptv
  ln -sf /etc/nginx/sites-available/theiptv /etc/nginx/sites-enabled/theiptv
  nginx -t && systemctl reload nginx
  certbot --nginx -d "$DOMAIN" -m "$EMAIL" --agree-tos --non-interactive || echo "certbot failed — see logs"
fi

echo "Deployment complete. Backend reachable at http://localhost:3000 (or https://$DOMAIN if cert obtained)"

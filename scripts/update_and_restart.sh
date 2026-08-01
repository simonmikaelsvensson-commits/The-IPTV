#!/usr/bin/env bash
set -euo pipefail

# Update script for TheIPTV - pulls latest code and restarts the Docker Compose stack.
# Intended to be called by systemd service.

TARGET_DIR=${TARGET_DIR:-/opt/theiptv}
BRANCH=${BRANCH:-main}

if [ ! -d "$TARGET_DIR" ]; then
  echo "Target dir $TARGET_DIR does not exist"
  exit 1
fi

cd "$TARGET_DIR"

# Use a dedicated deploy user if available
# Ensure environment has permission to run docker commands (root or docker group)

echo "Pulling latest from origin/$BRANCH"
# fetch and fast-forward
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "Building and restarting Docker Compose stack"
docker compose pull || true
docker compose up -d --build

# Run migrations once after update
docker compose run --rm migrate || true

echo "Update complete"

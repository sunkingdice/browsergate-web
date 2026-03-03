#!/usr/bin/env bash
set -euo pipefail

SERVER="bg-web"
REMOTE_PATH="~/browsergate/site"

echo "→ Installing dependencies on server..."
ssh "$SERVER" bash -s <<'REMOTE'
set -euo pipefail

echo "  Updating packages..."
sudo apt-get update -qq

echo "  Installing Go..."
sudo apt-get install -y -qq golang-go

echo "  Installing Node.js + npm..."
sudo apt-get install -y -qq nodejs npm

echo "  Installing PostCSS..."
cd ~/browsergate/site
npm install postcss postcss-cli autoprefixer

echo "  Verifying..."
echo "  go:      $(go version)"
echo "  node:    $(node --version)"
echo "  npm:     $(npm --version)"
echo "  hugo:    $(hugo version)"
echo "  postcss: $(npx postcss --version)"

echo "  Rebuilding site..."
hugo --minify

echo "✓ Server setup complete"
REMOTE

echo "✓ Done"

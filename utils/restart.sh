#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Killing existing Hugo servers..."
lsof -ti :1313 | xargs kill 2>/dev/null || true
sleep 1

echo "→ Building Svelte islands..."
cd svelte-islands
npx vite build --emptyOutDir
cd "$ROOT"

echo "→ Starting Hugo server in background..."
nohup hugo server --minify --disableFastRender > /tmp/hugo-server.log 2>&1 &
disown
echo "✓ Hugo server running at http://localhost:1313/ (PID: $!)"
echo "  Logs: /tmp/hugo-server.log"

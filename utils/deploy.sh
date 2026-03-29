#!/usr/bin/env bash
set -euo pipefail

MSG="${1:?Usage: deploy.sh \"commit message\"}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER="bg-web"
REMOTE_PATH="~/browsergate/site"

cd "$ROOT"

# Build Svelte islands
echo "→ Building Svelte islands..."
cd svelte-islands
npm install
npx vite build --emptyOutDir
cd "$ROOT"

# Commit and push
echo "→ Staging changes..."
git add -A
if git diff --cached --quiet; then
    echo "  No changes to commit, pushing any unpushed commits..."
else
    git commit -m "$MSG"
fi
echo "→ Pushing to GitHub..."
git push

# Deploy on server
echo "→ Deploying on server..."
ssh "$SERVER" "cd $REMOTE_PATH && git checkout -- . && git pull && hugo --minify && cd app && npm install && npm run build && (sudo systemctl restart browsergate-app 2>/dev/null || echo '  ⚠ No systemd service found — restart the app manually')"

echo "✓ Deployed to browsergate.eu"

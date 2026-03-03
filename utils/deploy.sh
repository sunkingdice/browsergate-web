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
npx vite build
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
ssh "$SERVER" "cd $REMOTE_PATH && git pull && hugo --minify"

echo "✓ Deployed to browsergate.eu"

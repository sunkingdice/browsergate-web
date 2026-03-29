#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');

// Load .env from project root
const envPath = path.join(ROOT, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

const OPTIN_SECRET = process.env.OPTIN_SECRET;
const LISTMONK_USER = process.env.LISTMONK_ADMIN_USER;
const LISTMONK_PASS = process.env.LISTMONK_ADMIN_PASS;
const LISTMONK_URL = 'https://list.browsergate.eu';
const BASE_URL = 'https://browsergate.eu';
const FAIRLINKED_LIST_ID = 4;

if (!OPTIN_SECRET) {
  console.error('✗ OPTIN_SECRET not found in app/.env');
  process.exit(1);
}
if (!LISTMONK_USER || !LISTMONK_PASS) {
  console.error('✗ LISTMONK_ADMIN_USER / LISTMONK_ADMIN_PASS not found');
  process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(`${LISTMONK_USER}:${LISTMONK_PASS}`).toString('base64');

function sign(email) {
  return crypto.createHmac('sha256', OPTIN_SECRET).update(email.toLowerCase().trim()).digest('hex');
}

function makeOptinUrl(email) {
  const sig = sign(email);
  return `${BASE_URL}/api/optin?email=${encodeURIComponent(email.toLowerCase().trim())}&sig=${sig}`;
}

async function fetchAllSubscribersOnList(listId) {
  const perPage = 100;
  let page = 1;
  const all = [];

  while (true) {
    const url = `${LISTMONK_URL}/api/subscribers?list_id=${listId}&per_page=${perPage}&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: authHeader } });
    if (!res.ok) {
      console.error(`✗ API error: ${res.status} ${await res.text()}`);
      process.exit(1);
    }
    const data = await res.json();
    const results = data?.data?.results || [];
    all.push(...results);
    if (results.length < perPage) break;
    page++;
  }

  return all;
}

async function pushOptinUrl(sub, optinUrl) {
  const listIds = (sub.lists || []).map(l => l.id);
  const res = await fetch(`${LISTMONK_URL}/api/subscribers/${sub.id}`, {
    method: 'PUT',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: sub.email,
      name: sub.name,
      status: sub.status,
      lists: listIds,
      attribs: { ...sub.attribs, optin_url: optinUrl }
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`  ✗ Failed to update subscriber ${sub.id}: ${res.status} ${text}`);
    return false;
  }
  return true;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const csvOnly = process.argv.includes('--csv-only');
  const testN = process.argv.indexOf('--test');
  const testLimit = testN !== -1 ? parseInt(process.argv[testN + 1], 10) : 0;

  console.log(`→ Fetching subscribers on Developers-All list (ID 3)...`);
  const subscribers = await fetchAllSubscribersOnList(3);
  console.log(`  Found ${subscribers.length} subscribers`);

  const subset = testLimit > 0 ? subscribers.slice(0, testLimit) : subscribers;

  // Generate CSV
  const csvLines = ['email,optin_url'];
  for (const sub of subset) {
    const url = makeOptinUrl(sub.email);
    csvLines.push(`${sub.email},${url}`);
  }

  const csvPath = path.join(ROOT, 'exports', 'optin-links.csv');
  fs.writeFileSync(csvPath, csvLines.join('\n') + '\n');
  console.log(`✓ Wrote ${subset.length} links to ${csvPath}`);

  if (csvOnly) {
    console.log('  (--csv-only: skipping attribute push)');
    return;
  }

  // Push optin_url as subscriber attribute
  console.log(`→ Pushing optin_url to ${subset.length} subscribers${dryRun ? ' (DRY RUN)' : ''}...`);
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < subset.length; i++) {
    const sub = subset[i];
    const url = makeOptinUrl(sub.email);

    if (dryRun) {
      console.log(`  [dry] ${sub.email} → ${url.slice(0, 80)}...`);
      updated++;
      continue;
    }

    const ok = await pushOptinUrl(sub, url);
    if (ok) {
      updated++;
    } else {
      failed++;
    }

    if ((i + 1) % 50 === 0) {
      console.log(`  Progress: ${i + 1}/${subset.length}`);
    }
  }

  console.log(`✓ Done. Updated: ${updated}, Failed: ${failed}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

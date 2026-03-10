#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'static', 'data', 'extensions.json');
const EXPORTS_DIR = path.join(ROOT, 'exports');
const PROGRESS_PATH = path.join(EXPORTS_DIR, 'extensions-profiles.progress.json');
const CSV_PATH = path.join(EXPORTS_DIR, 'extensions-profiles.csv');

const REQUEST_DELAY_MS = 1500;
const MAX_RETRIES = 3;
const SAVE_INTERVAL = 50;
// const LISTMONK_URL = 'https://list.browsergate.eu';
// const LISTMONK_PUSH_DELAY_MS = 100;

const CATEGORY_MAP = {
  'productivity/workflow': 'Workflow & Planning',
  'productivity/tools': 'Tools',
  'productivity/developer': 'Developer Tools',
  'productivity/education': 'Education',
  'lifestyle/social': 'Social Networking',
  'lifestyle/entertainment': 'Entertainment',
  'lifestyle/art': 'Art & Design',
  'lifestyle/games': 'Games',
  'lifestyle/news': 'News & Weather',
  'lifestyle/travel': 'Travel',
  'lifestyle/shopping': 'Shopping',
  'lifestyle/well_being': 'Well-being',
  'lifestyle/household': 'Household',
  'lifestyle/fun': 'Just for Fun',
  'make_chrome_yours/privacy': 'Privacy & Security',
  'make_chrome_yours/accessibility': 'Accessibility',
  'make_chrome_yours/functionality': 'Functionality & UI',
};

function resolveCategory(slug) {
  if (!slug) return '';
  const mapped = CATEGORY_MAP[slug];
  if (mapped) return mapped;
  const parts = slug.split('/');
  const last = parts[parts.length - 1];
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/_/g, ' ');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      });
      if (res.status === 404) return { status: 404, html: '' };
      if (res.status === 429 || res.status >= 500) {
        const wait = REQUEST_DELAY_MS * Math.pow(2, attempt);
        console.log(`    ⚠ ${res.status} — retrying in ${wait}ms (attempt ${attempt}/${retries})`);
        await sleep(wait);
        continue;
      }
      return { status: res.status, html: await res.text() };
    } catch (err) {
      if (attempt === retries) return { status: 0, html: '', error: err.message };
      const wait = REQUEST_DELAY_MS * Math.pow(2, attempt);
      console.log(`    ⚠ Network error — retrying in ${wait}ms (attempt ${attempt}/${retries})`);
      await sleep(wait);
    }
  }
  return { status: 0, html: '' };
}

function parseStorePage(html, extensionId) {
  const entry = {
    extensionId,
    name: '',
    category: '',
    shortDescription: '',
    users: 0,
    rating: 0,
    ratingCount: 0,
    version: '',
    lastUpdate: '',
    size: '',
    languages: '',
    developerName: '',
    developerCompany: '',
    developerEmail: '',
    developerAddress: '',
    websiteDomain: '',
    storeUrl: `https://chromewebstore.google.com/detail/_/${extensionId}`,
    status: 'active',
  };

  const dataMatch = html.match(
    /AF_initDataCallback\(\{key:\s*'ds:0',\s*hash:\s*'[^']*',\s*data:(\[[\s\S]*?\]),\s*sideChannel:\s*\{/
  );

  if (!dataMatch) {
    const titleMatch = html.match(/<title>([^<]+)/);
    if (titleMatch) {
      const parsed = titleMatch[1].replace(/ - Chrome Web Store$/, '').trim();
      if (parsed && parsed.toLowerCase() !== 'chrome web store') {
        entry.name = parsed;
      }
    }
    if (!entry.name) {
      entry.name = extensionId;
      entry.shortDescription = 'Removed from Chrome Web Store';
      entry.status = 'removed';
    }
    return entry;
  }

  try {
    const data = JSON.parse(dataMatch[1]);
    const info = data[0];

    if (!Array.isArray(info) || typeof info[0] !== 'string') {
      entry.name = extensionId;
      entry.shortDescription = 'Removed from Chrome Web Store';
      entry.status = 'removed';
      return entry;
    }

    entry.name = info[2] || '';
    entry.shortDescription = (info[6] || '').substring(0, 500);
    entry.websiteDomain = info[7] || '';
    entry.rating = typeof info[3] === 'number' ? Math.round(info[3] * 100) / 100 : 0;
    entry.ratingCount = typeof info[4] === 'number' ? info[4] : 0;
    entry.users = typeof info[14] === 'number' ? info[14] : 0;

    if (info[11]?.[0]) {
      entry.category = resolveCategory(info[11][0]);
    }

    if (Array.isArray(data[10])) {
      entry.developerEmail = data[10][0] || '';
      entry.developerAddress = (data[10][1] || '').replace(/\n/g, ', ');
      entry.developerName = data[10][6] || '';
      entry.developerCompany = data[10][7] || '';
    }

    entry.version = data[13] || '';

    if (Array.isArray(data[14]) && data[14][0]) {
      const date = new Date(data[14][0] * 1000);
      entry.lastUpdate = date.toISOString().split('T')[0];
    }

    entry.size = data[15] || '';

    if (Array.isArray(data[16])) {
      entry.languages = data[16].join('; ');
    }
  } catch (e) {
    const titleMatch = html.match(/<title>([^<]+)/);
    if (titleMatch) {
      entry.name = titleMatch[1].replace(/ - Chrome Web Store$/, '').trim() || extensionId;
    } else {
      entry.name = extensionId;
    }
    entry.status = 'error';
    entry.shortDescription = `Parse error: ${e.message}`;
  }

  if (!entry.name || entry.name.toLowerCase() === 'chrome web store') {
    entry.name = extensionId;
    entry.shortDescription = 'Removed from Chrome Web Store';
    entry.status = 'removed';
  }

  return entry;
}

function loadProgress() {
  if (!fs.existsSync(PROGRESS_PATH)) return {};
  return JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf8'));
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress));
}

const CSV_FIELDS = [
  'extensionId', 'name', 'category', 'shortDescription', 'users', 'rating',
  'ratingCount', 'version', 'lastUpdate', 'size', 'languages', 'developerName',
  'developerCompany', 'developerEmail', 'developerAddress', 'websiteDomain',
  'storeUrl', 'status',
];

function csvEscape(val) {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function writeCsv(entries) {
  const header = CSV_FIELDS.join(',');
  const rows = entries.map(e => CSV_FIELDS.map(f => csvEscape(e[f])).join(','));
  fs.writeFileSync(CSV_PATH, [header, ...rows].join('\n'));
}

async function scrapeAll(ids) {
  const progress = loadProgress();
  const doneCount = Object.keys(progress).length;

  if (doneCount > 0) {
    console.log(`→ Resuming: ${doneCount} already scraped, ${ids.length - doneCount} remaining`);
  }

  const remaining = ids.filter(id => !progress[id]);
  console.log(`→ Scraping ${remaining.length} extension profiles from Chrome Web Store...`);
  console.log(`  Estimated time: ~${Math.ceil(remaining.length * REQUEST_DELAY_MS / 60000)} minutes\n`);

  let active = 0, removed = 0, errors = 0;

  for (let i = 0; i < remaining.length; i++) {
    const id = remaining[i];
    const total = doneCount + i + 1;
    const progress_str = `[${total}/${ids.length}]`;

    const url = `https://chromewebstore.google.com/detail/_/${id}?hl=en`;
    const { status, html, error } = await fetchWithRetry(url);

    let entry;
    if (status === 404) {
      entry = {
        extensionId: id, name: id, category: '', shortDescription: 'Removed from Chrome Web Store',
        users: 0, rating: 0, ratingCount: 0, version: '', lastUpdate: '', size: '',
        languages: '', developerName: '', developerCompany: '', developerEmail: '',
        developerAddress: '', websiteDomain: '',
        storeUrl: `https://chromewebstore.google.com/detail/_/${id}`, status: 'removed',
      };
      removed++;
      console.log(`  ${progress_str} ${id} — removed (404)`);
    } else if ((status === 200 || status === 301 || status === 302) && html) {
      entry = parseStorePage(html, id);
      if (entry.status === 'removed') {
        removed++;
        console.log(`  ${progress_str} ${id} — removed`);
      } else if (entry.status === 'error') {
        errors++;
        console.log(`  ${progress_str} ${id} — parse error`);
      } else {
        active++;
        const email = entry.developerEmail ? ` <${entry.developerEmail}>` : '';
        console.log(`  ${progress_str} ${(entry.name || id).substring(0, 50)}${email}`);
      }
    } else {
      entry = {
        extensionId: id, name: id, category: '', shortDescription: error || `HTTP ${status}`,
        users: 0, rating: 0, ratingCount: 0, version: '', lastUpdate: '', size: '',
        languages: '', developerName: '', developerCompany: '', developerEmail: '',
        developerAddress: '', websiteDomain: '',
        storeUrl: `https://chromewebstore.google.com/detail/_/${id}`, status: 'error',
      };
      errors++;
      console.log(`  ${progress_str} ${id} — error (${error || status})`);
    }

    progress[id] = entry;

    if ((i + 1) % SAVE_INTERVAL === 0) {
      saveProgress(progress);
      console.log(`  💾 Progress saved (${total}/${ids.length})\n`);
    }

    if (i < remaining.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  saveProgress(progress);

  console.log(`\n→ Scrape complete: ${active} active, ${removed} removed, ${errors} errors`);
  console.log(`  Total in progress file: ${Object.keys(progress).length}`);

  return progress;
}

function progressToEntries(progress, ids) {
  return ids.map(id => progress[id]).filter(Boolean);
}

// --- Listmonk push (commented out for now, will be handled separately) ---
// async function pushToListmonk(entries, listId) {
//   const user = process.env.LISTMONK_USER;
//   const pass = process.env.LISTMONK_PASS;
//   if (!user || !pass) {
//     console.error('✗ LISTMONK_USER and LISTMONK_PASS env vars required for push');
//     process.exit(1);
//   }
//   const authHeader = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');
//   let numericListId = listId;
//   if (listId.includes('-')) {
//     console.log(`→ Looking up list by UUID: ${listId}`);
//     const listsRes = await fetch(`${LISTMONK_URL}/api/lists`, {
//       headers: { 'Authorization': authHeader },
//     });
//     if (!listsRes.ok) { console.error(`✗ Failed to fetch lists: ${listsRes.status}`); process.exit(1); }
//     const listsData = await listsRes.json();
//     const found = listsData.data?.results?.find(l => l.uuid === listId);
//     if (!found) { console.error(`✗ List with UUID ${listId} not found`); process.exit(1); }
//     numericListId = found.id;
//     console.log(`  Found list: "${found.name}" (id: ${numericListId})`);
//   }
//   const byEmail = new Map();
//   for (const e of entries) {
//     if (!e.developerEmail || e.status !== 'active') continue;
//     const email = e.developerEmail.toLowerCase().trim();
//     if (!byEmail.has(email)) byEmail.set(email, { extensions: [], primary: e });
//     const group = byEmail.get(email);
//     group.extensions.push(e);
//     if (e.users > group.primary.users) group.primary = e;
//   }
//   console.log(`\n→ Pushing ${byEmail.size} unique developer emails to Listmonk...`);
//   let created = 0, updated = 0, errors = 0;
//   for (const [email, group] of byEmail) {
//     const p = group.primary;
//     const payload = {
//       email, name: p.developerCompany || p.developerName || p.name,
//       status: 'enabled', lists: [parseInt(numericListId, 10)],
//       preconfirm_subscriptions: true,
//       attribs: { source: 'detected', extensionId: p.extensionId, extensionName: p.name,
//         category: p.category, users: p.users, developerCompany: p.developerCompany,
//         totalExtensions: group.extensions.length },
//     };
//     try {
//       const res = await fetch(`${LISTMONK_URL}/api/subscribers`, {
//         method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
//         body: JSON.stringify(payload),
//       });
//       if (res.ok) { created++; }
//       else if (res.status === 409) {
//         const searchRes = await fetch(
//           `${LISTMONK_URL}/api/subscribers?query=${encodeURIComponent(`subscribers.email = '${email}'`)}&per_page=1`,
//           { headers: { 'Authorization': authHeader } });
//         const searchData = searchRes.ok ? await searchRes.json() : null;
//         const subId = searchData?.data?.results?.[0]?.id;
//         if (subId) {
//           await fetch(`${LISTMONK_URL}/api/subscribers/lists`, {
//             method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
//             body: JSON.stringify({ ids: [subId], action: 'add', target_list_ids: [parseInt(numericListId, 10)], status: 'confirmed' }),
//           });
//           updated++;
//         } else { errors++; }
//       } else {
//         errors++;
//         if (errors <= 5) { const text = await res.text(); console.log(`    ⚠ ${email}: ${res.status} ${text.substring(0, 100)}`); }
//       }
//     } catch (err) { errors++; if (errors <= 5) console.log(`    ⚠ ${email}: ${err.message}`); }
//     if ((created + updated + errors) % 100 === 0) console.log(`  Progress: ${created} created, ${updated} updated, ${errors} errors`);
//     await sleep(LISTMONK_PUSH_DELAY_MS);
//   }
//   console.log(`\n→ Listmonk push complete: ${created} created, ${updated} updated, ${errors} errors`);
// }

async function main() {
  const args = process.argv.slice(2);
  const testCount = args.find((a, i) => args[i - 1] === '--test');

  if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });

  console.log('→ Loading extension database...');
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  const ids = db.map(e => e.extensionId);
  console.log(`  ${ids.length} extensions\n`);

  const idsToProcess = testCount ? ids.slice(0, parseInt(testCount, 10)) : ids;

  const progress = await scrapeAll(idsToProcess);

  const entries = progressToEntries(progress, idsToProcess);
  writeCsv(entries);
  console.log(`\n→ CSV written to ${CSV_PATH} (${entries.length} rows)`);

  console.log('\n✓ Done.');
}

// Graceful shutdown
let shuttingDown = false;
process.on('SIGINT', () => {
  if (shuttingDown) process.exit(1);
  shuttingDown = true;
  console.log('\n\n⚠ Interrupted — saving progress...');
  console.log('  (press Ctrl+C again to force quit)');
});

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

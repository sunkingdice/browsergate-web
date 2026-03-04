#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', 'static', 'data', 'extensions.json');
const DEFAULT_JS = path.resolve(__dirname, '..', 'sources', '5fdhwcppjcvqvxsawd8pg1n51.js');
const SAVE_INTERVAL = 50;
const REQUEST_DELAY_MS = 1500;
const MAX_RETRIES = 3;

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

function extractIdsFromBundle(jsPath) {
  const content = fs.readFileSync(jsPath, 'utf8');
  const pattern = /\{id:"([a-z]{32})",file:"([^"]+)"\}/g;
  const ids = new Set();
  let match;
  while ((match = pattern.exec(content)) !== null) {
    ids.add(match[1]);
  }
  return [...ids];
}

function loadDatabase() {
  if (!fs.existsSync(DB_PATH)) return [];
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function saveDatabase(db) {
  db.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

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

const STORE_PAGE_NAMES = ['chrome web store', ''];

function isStorePage(name) {
  return STORE_PAGE_NAMES.includes((name || '').trim().toLowerCase());
}

function parseStorePage(html, extensionId) {
  const entry = {
    name: '',
    category: '',
    description: '',
    country: '',
    lastUpdate: '',
    storeUrl: `https://chromewebstore.google.com/detail/${extensionId}`,
    website: '',
    extensionId,
  };

  const dataMatch = html.match(
    /AF_initDataCallback\(\{key:\s*'ds:0',\s*hash:\s*'[^']*',\s*data:(\[[\s\S]*?\]),\s*sideChannel:\s*\{/
  );

  if (!dataMatch) {
    const titleMatch = html.match(/<title>([^<]+)/);
    if (titleMatch) {
      const parsed = titleMatch[1].replace(/ - Chrome Web Store$/, '').trim();
      entry.name = isStorePage(parsed) ? extensionId : parsed;
      if (isStorePage(parsed)) entry.description = 'Removed from Chrome Web Store';
    } else {
      entry.name = extensionId;
      entry.description = 'Removed from Chrome Web Store';
    }
    const descMatch = html.match(/<meta name="description" content="([^"]+)/);
    if (descMatch && entry.description !== 'Removed from Chrome Web Store') entry.description = descMatch[1];
    return entry;
  }

  try {
    const data = JSON.parse(dataMatch[1]);
    const info = data[0];

    if (!Array.isArray(info) || typeof info[0] !== 'string') {
      entry.name = extensionId;
      entry.description = 'Removed from Chrome Web Store';
      return entry;
    }

    if (Array.isArray(info)) {
      entry.name = info[2] || '';
      entry.description = (info[6] || '').substring(0, 500);
      entry.website = info[7] || '';

      if (info[11]?.[0]) {
        entry.category = resolveCategory(info[11][0]);
      }
    }

    if (Array.isArray(data[10])) {
      const address = data[10][1] || '';
      const countryMatch = address.match(/\n(\w{2})\s*$/);
      if (countryMatch) entry.country = countryMatch[1];
    }

    if (Array.isArray(data[14])) {
      const date = new Date(data[14][0] * 1000);
      entry.lastUpdate = date.toISOString().split('T')[0];
    }
  } catch (e) {
    const titleMatch = html.match(/<title>([^<]+)/);
    if (titleMatch) {
      const parsed = titleMatch[1].replace(/ - Chrome Web Store$/, '').trim();
      entry.name = isStorePage(parsed) ? extensionId : parsed;
      if (isStorePage(parsed)) entry.description = 'Removed from Chrome Web Store';
    }
  }

  if (isStorePage(entry.name)) {
    entry.name = extensionId;
    entry.category = '';
    entry.description = 'Removed from Chrome Web Store';
    entry.website = '';
  }

  return entry;
}

const BROKEN_NAMES = ['Chrome Web Store', '(Unlisted)', '(Error)', ''];

async function scrapeIds(db, ids, label) {
  console.log(`→ Scraping Chrome Web Store for ${ids.length} ${label}...`);
  console.log(`  Estimated time: ~${Math.ceil(ids.length * REQUEST_DELAY_MS / 60000)} minutes\n`);

  let added = 0;
  let unlisted = 0;
  let errors = 0;
  const existingMap = new Map(db.map((e, i) => [e.extensionId, i]));

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const progress = `[${i + 1}/${ids.length}]`;
    const idx = existingMap.get(id);

    const url = `https://chromewebstore.google.com/detail/${id}?hl=en`;
    const { status, html, error } = await fetchWithRetry(url);

    let entry;
    if (status === 404) {
      entry = {
        name: id, category: '', description: 'Removed from Chrome Web Store',
        country: '', lastUpdate: '', storeUrl: url, website: '', extensionId: id,
      };
      unlisted++;
      console.log(`  ${progress} ${id} — unlisted (404)`);
    } else if ((status === 200 || status === 302) && html) {
      entry = parseStorePage(html, id);
      if (entry.description === 'Removed from Chrome Web Store') {
        unlisted++;
        console.log(`  ${progress} ${id} — unlisted`);
      } else {
        added++;
        console.log(`  ${progress} ${(entry.name || id).substring(0, 60)}`);
      }
    } else {
      entry = {
        name: '(Error)', category: '', description: error || `HTTP ${status}`,
        country: '', lastUpdate: '', storeUrl: url, website: '', extensionId: id,
      };
      errors++;
      console.log(`  ${progress} ${id} — error (${error || status})`);
    }

    if (idx !== undefined) {
      db[idx] = entry;
    } else {
      db.push(entry);
    }

    if ((i + 1) % SAVE_INTERVAL === 0) {
      saveDatabase(db);
      console.log(`  💾 Progress saved (${i + 1}/${ids.length})\n`);
    }

    if (i < ids.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  return { added, unlisted, errors };
}

async function main() {
  const args = process.argv.slice(2);
  const fixMode = args.includes('--fix');
  const jsPath = args.find(a => !a.startsWith('--')) || DEFAULT_JS;

  console.log(`→ Loading existing database...`);
  const db = loadDatabase();
  console.log(`  Database has ${db.length} entries`);

  if (fixMode) {
    const broken = db.filter(e => BROKEN_NAMES.includes(e.name));
    console.log(`  Found ${broken.length} entries with broken names to re-scrape`);

    if (broken.length === 0) {
      console.log(`✓ No broken entries. Nothing to fix.`);
      return;
    }

    const brokenIds = broken.map(e => e.extensionId);
    const { added, unlisted, errors } = await scrapeIds(db, brokenIds, 'broken entries');
    saveDatabase(db);
    console.log(`\n✓ Fix complete.`);
    console.log(`  Resolved: ${added}`);
    console.log(`  Unlisted: ${unlisted}`);
    console.log(`  Still broken: ${errors}`);
    console.log(`  Total in database: ${db.length}`);
    return;
  }

  if (!fs.existsSync(jsPath)) {
    console.error(`File not found: ${jsPath}`);
    process.exit(1);
  }

  console.log(`→ Extracting extension IDs from ${path.basename(jsPath)}...`);
  const bundleIds = extractIdsFromBundle(jsPath);
  console.log(`  Found ${bundleIds.length} extension IDs in JS bundle`);

  const existingIds = new Set(db.map(e => e.extensionId));
  const newIds = bundleIds.filter(id => !existingIds.has(id));
  const removedFromBundle = db.filter(e => !bundleIds.includes(e.extensionId));

  console.log(`  Delta: ${newIds.length} new, ${removedFromBundle.length} no longer in bundle`);

  if (newIds.length === 0) {
    console.log(`✓ Database is up to date. Nothing to scrape.`);
    return;
  }

  const { added, unlisted, errors } = await scrapeIds(db, newIds, 'new extensions');
  saveDatabase(db);
  console.log(`\n✓ Done.`);
  console.log(`  Added: ${added}`);
  console.log(`  Unlisted: ${unlisted}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total in database: ${db.length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

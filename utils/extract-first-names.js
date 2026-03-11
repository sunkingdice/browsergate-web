#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXPORTS_DIR = path.join(ROOT, 'exports');

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
const CSV_PATH = path.join(EXPORTS_DIR, 'extensions-profiles.csv');
const OUTPUT_PATH = path.join(EXPORTS_DIR, 'extensions-profiles-named.csv');
const PROGRESS_PATH = path.join(EXPORTS_DIR, 'first-names.progress.json');

const MODEL = 'claude-haiku-4-5-20251001';
const BATCH_SIZE = 30;
const API_DELAY_MS = 100;
const API_URL = 'https://api.anthropic.com/v1/messages';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Proper CSV parser handling quoted fields with commas and newlines
function parseCsvRow(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

function parseCsv(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const headers = parseCsvRow(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvRow(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = fields[j] || '';
    }
    rows.push(row);
  }
  return { headers, rows };
}

function csvEscape(val) {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function loadProgress() {
  if (!fs.existsSync(PROGRESS_PATH)) return {};
  return JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf8'));
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress));
}

async function callHaiku(batch, apiKey) {
  const numbered = batch.map((item, i) =>
    `${i + 1}. name: "${item.developerName}", email: "${item.developerEmail}"`
  ).join('\n');

  const prompt = `Given these developer profiles, extract the first name (given name) for each.
Rules:
- If the name is clearly a company or organization, return ""
- If only an email is available, try to infer the first name from the email local part
- Handle cultural name ordering (e.g. Vietnamese, Chinese, Korean family names come first)
- Capitalize properly
- Return ONLY a valid JSON array of strings, one per entry, in the same order. No explanation.

${numbered}`;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text.substring(0, 200)}`);
  }

  const data = await res.json();
  const content = data.content[0].text.trim();

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error(`No JSON array in response: ${content.substring(0, 100)}`);
  }

  return JSON.parse(jsonMatch[0]);
}

async function main() {
  const apiKey = process.env.ANTHROPIC_SIMPLE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('✗ Set ANTHROPIC_SIMPLE_API_KEY in .env (project root) or as env var');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const testCount = args.find((a, i) => args[i - 1] === '--test');

  console.log('→ Reading CSV...');
  const text = fs.readFileSync(CSV_PATH, 'utf8');
  const { headers, rows } = parseCsv(text);
  console.log(`  ${rows.length} rows, ${headers.length} columns`);

  const progress = loadProgress();
  const doneCount = Object.keys(progress).length;
  if (doneCount > 0) {
    console.log(`  Resuming: ${doneCount} names already extracted`);
  }

  // Filter to rows with emails that need processing
  const needsProcessing = rows.filter(r =>
    r.developerEmail && !progress[r.extensionId]
  );

  const toProcess = testCount
    ? needsProcessing.slice(0, parseInt(testCount, 10))
    : needsProcessing;

  console.log(`→ ${toProcess.length} rows to process with Claude Haiku`);
  console.log(`  ${Math.ceil(toProcess.length / BATCH_SIZE)} API calls @ ${BATCH_SIZE}/batch\n`);

  let processed = 0;
  let errors = 0;

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(toProcess.length / BATCH_SIZE);

    try {
      const names = await callHaiku(batch, apiKey);

      if (names.length !== batch.length) {
        console.log(`  ⚠ Batch ${batchNum}: got ${names.length} names for ${batch.length} rows, padding`);
      }

      for (let j = 0; j < batch.length; j++) {
        const firstName = (names[j] || '').trim();
        progress[batch[j].extensionId] = firstName;
        processed++;
      }

      const sample = names.slice(0, 3).map((n, j) =>
        `${batch[j].developerEmail.substring(0, 25)}→${n || '(empty)'}`
      ).join(', ');
      console.log(`  [${batchNum}/${totalBatches}] ${sample}`);
    } catch (err) {
      console.log(`  [${batchNum}/${totalBatches}] ✗ ${err.message}`);
      for (const item of batch) {
        progress[item.extensionId] = '';
        errors++;
      }
    }

    if (batchNum % 10 === 0) {
      saveProgress(progress);
      console.log(`  💾 Progress saved (${doneCount + processed}/${doneCount + toProcess.length})\n`);
    }

    if (i + BATCH_SIZE < toProcess.length) {
      await sleep(API_DELAY_MS);
    }
  }

  saveProgress(progress);
  console.log(`\n→ Extraction complete: ${processed} processed, ${errors} errors`);

  // Write output CSV
  console.log('→ Writing output CSV...');
  const outHeaders = [...headers, 'firstName'];
  const outRows = rows.map(r => {
    const firstName = progress[r.extensionId] || '';
    return [...headers.map(h => csvEscape(r[h])), csvEscape(firstName)].join(',');
  });
  fs.writeFileSync(OUTPUT_PATH, [outHeaders.join(','), ...outRows].join('\n'));
  console.log(`  Written to ${OUTPUT_PATH} (${rows.length} rows)`);

  console.log('\n✓ Done.');
}

let shuttingDown = false;
process.on('SIGINT', () => {
  if (shuttingDown) process.exit(1);
  shuttingDown = true;
  console.log('\n\n⚠ Interrupted — saving progress...');
  saveProgress(loadProgress());
  process.exit(0);
});

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

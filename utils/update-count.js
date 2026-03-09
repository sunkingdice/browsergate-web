#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'static', 'data', 'extensions.json');
const CONTENT_DIR = path.join(ROOT, 'content');

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const count = db.length;
const formatted = count.toLocaleString('en-US');

console.log(`→ Extension count: ${formatted}`);

const ANCHOR_WORDS = [
  'extensions?',
  'software products?',
  'software companies',
  'software vendors?',
  'companies',
  'customer lists?',
  'stolen customer lists?',
  'probe targets?',
  'extension probes?',
  'extension IDs?',
  'fetch\\(\\) requests?',
  '`fetch\\(\\)` requests?',
  'fetch requests?',
  'entries',
  'scanned extensions?',
];

// Lines matching these are historical references — never touch them.
const SKIP_LINE = [
  /\|\s*\w+\s+\d{4}\s*\|/,           // table rows like |December 2025|5,459|
  /as of \w+ \d{4}/i,                  // "As of December 2025"
  /by \w+ \d{4},?\s/i,                 // "By December 2025, ..."
  /had grown to/i,                      // "had grown to **6,167**"
  /the number was [\d,]+/i,            // "the number was 5,459"
  /from [\d,]+ .{0,30} to [\d,]+/i,   // "from 461 extensions to 5,459"
  /in \d{4},? the .* contained/i,      // "In 2024, the scan list contained"
  /\.\.\.\s*[\d,]+\s*more/,           // "... 5,456 more entries ..."
  /the array contained/i,              // "the array contained **5,459 entries**"
  /grew from .* to .* in/i,            // historical growth comparisons
  /went from .* to .* in/i,            // "went from scanning 38 ... to 5,459 in 2025"
  /expanded .* from .* to/i,           // "expanded the scanning program from 461 ... to 5,459"
  /\d{4}.*\|.*[\d,]+\s*\|/,           // any table row with a year
];

function walkDir(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkDir(full));
    else if (entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}

// Build regex: number, then 0-3 optional words, then an anchor word.
// Handles bold (**num**), optional adjectives, and backtick-wrapped words.
const anchorPattern = ANCHOR_WORDS.join('|');
const regex = new RegExp(
  `(\\b)(\\*{0,2}[\\d,]+\\*{0,2})((?:\\s+[\\w\`().*]+){0,3}\\s+(?:${anchorPattern})\\b)`,
  'gi'
);

let updated = 0;
let totalReplacements = 0;

for (const file of walkDir(CONTENT_DIR)) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  const relPath = path.relative(ROOT, file);

  const lines = content.split('\n');
  const newLines = lines.map((line, i) => {
    const isHistorical = SKIP_LINE.some(p => p.test(line));
    if (isHistorical) return line;

    return line.replace(regex, (match, pre, num, post) => {
      const raw = parseInt(num.replace(/[,*]/g, ''), 10);
      if (raw >= 3000 && raw <= 20000 && raw !== count) {
        const bold = num.startsWith('**') ? '**' : '';
        const replacement = `${pre}${bold}${formatted}${bold}${post}`;
        console.log(`  ${relPath}:${i + 1}: "${match.trim()}" → "${replacement.trim()}"`);
        changed = true;
        totalReplacements++;
        return replacement;
      }
      return match;
    });
  });

  if (changed) {
    fs.writeFileSync(file, newLines.join('\n'));
    updated++;
  }
}

if (updated === 0) {
  console.log(`✓ All .md files already show ${formatted}. Nothing to update.`);
} else {
  console.log(`✓ Updated ${totalReplacements} occurrence(s) across ${updated} file(s).`);
}

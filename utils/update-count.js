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

function walkDir(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkDir(full));
    else if (entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}

let updated = 0;

for (const file of walkDir(CONTENT_DIR)) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const replaced = content.replace(
    /(\b)([\d,]+)(\s+extensions?\b)/gi,
    (match, pre, num, post) => {
      const raw = parseInt(num.replace(/,/g, ''), 10);
      if (raw >= 3000 && raw !== count) {
        console.log(`  ${path.relative(ROOT, file)}: "${num}" → "${formatted}"`);
        changed = true;
        return `${pre}${formatted}${post}`;
      }
      return match;
    }
  );

  if (changed) {
    fs.writeFileSync(file, replaced);
    updated++;
  }
}

if (updated === 0) {
  console.log(`✓ All .md files already show ${formatted}. Nothing to update.`);
} else {
  console.log(`✓ Updated ${updated} file(s).`);
}

#!/usr/bin/env node
// Replace Naver Blog SVG with a version showing "Blog" text cut out from the bubble.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILES = [
  'index.html', 'about.html', 'story.html', 'process.html', 'reviews.html',
  'project/index.html', 'project/1.html', 'project/2.html', 'project/3.html',
  'project/4.html', 'project/5.html', 'project/6.html',
];

// New SVG: speech bubble with "Blog" text cut out via mask
const NEW_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><defs><mask id="naverBlogMask"><rect width="24" height="24" fill="white"/><text x="12" y="13.2" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="7" text-anchor="middle" letter-spacing="-0.3" fill="black">Blog</text></mask></defs><path d="M3 3h18a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-6l-2.3 3a1 1 0 0 1-1.6 0L8.8 18H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" mask="url(#naverBlogMask)"/></svg>`;

// Matches either the old "bubble + small b" SVG OR the original "NH letters" SVG
const PATTERNS = [
  /<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4h14a2 2 0 0 1 2 2v9[^"]+"\/><\/svg>/,
  /<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4a2[^"]+"\/><\/svg>/,
];

for (const f of FILES) {
  const p = path.join(ROOT, f);
  let s = await fs.readFile(p, 'utf8');
  let replaced = false;
  for (const re of PATTERNS) {
    if (re.test(s)) {
      s = s.replace(re, NEW_SVG);
      replaced = true;
      break;
    }
  }
  if (replaced) {
    await fs.writeFile(p, s);
    console.log(`✓ ${f}`);
  } else {
    console.log(`· ${f}: no match`);
  }
}

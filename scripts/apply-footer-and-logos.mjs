#!/usr/bin/env node
// One-off transformation across all HTML files:
// 1. Header logo: <span>Enliven Space</span> → <img>
// 2. Footer logo: <span>ENLIVEN<br/>SPACE</span> → <img>
// 3. Footer SNS: remove YouTube, swap Naver Blog SVG to clean bubble
// 4. Consult button: href="#" + data-action="consult" → Tally URL
//    Floating consult button + footer consult link + CTA buttons

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TALLY = 'https://tally.so/r/J9eROr';

const FILES = [
  'index.html', 'about.html', 'story.html', 'process.html', 'reviews.html',
  'project/index.html', 'project/1.html', 'project/2.html', 'project/3.html',
  'project/4.html', 'project/5.html', 'project/6.html',
];

const HEADER_LOGO_IMG = `<img src="/images/logo/logo-dark.png" srcset="/images/logo/logo-dark@1x.png 1x, /images/logo/logo-dark.png 2x" alt="Enliven Space">`;
const FOOTER_LOGO_IMG = `<img src="/images/logo/logo-light.png" srcset="/images/logo/logo-light@1x.png 1x, /images/logo/logo-light.png 2x" alt="Enliven Space">`;

// Clean speech bubble (Naver Blog stand-in)
const BLOG_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-5.5l-1.7 2.6a1 1 0 0 1-1.6 0L8.5 17H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3.7 4.2h1.6c1.1 0 1.9.5 1.9 1.4 0 .6-.3 1-.8 1.2.7.2 1.1.6 1.1 1.3 0 1-.8 1.6-2 1.6H8.7V8.2zm1.4 2.3h.5c.4 0 .7-.2.7-.5s-.3-.5-.7-.5h-.5v1zm0 2.1h.6c.5 0 .8-.2.8-.6s-.3-.6-.8-.6h-.6v1.2z"/></svg>`;

const YOUTUBE_BLOCK_RE = /\s*<a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube">\s*<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21\.58 7\.19[^"]+"\/><\/svg>\s*<\/a>/m;
const OLD_BLOG_SVG_RE = /<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4a2[^"]+"\/><\/svg>/;

async function transform(file) {
  const p = path.join(ROOT, file);
  let s = await fs.readFile(p, 'utf8');
  const before = s;

  // 1. Header logo (any comment between open tag and span allowed)
  s = s.replace(/(<a href="\/" class="site-logo" aria-label="[^"]+">)[\s\S]*?<span>Enliven Space<\/span>\s*(<\/a>)/,
    (_m, open, close) => `${open}\n        ${HEADER_LOGO_IMG}\n      ${close}`);

  // 2. Footer logo
  s = s.replace(/(<a href="\/" class="footer-logo" aria-label="[^"]+">)[\s\S]*?<span>ENLIVEN<br\/>SPACE<\/span>\s*(<\/a>)/,
    (_m, open, close) => `${open}\n            ${FOOTER_LOGO_IMG}\n          ${close}`);

  // 3a. Remove YouTube
  s = s.replace(YOUTUBE_BLOCK_RE, '');
  // 3b. Replace Naver Blog SVG with clean bubble
  s = s.replace(OLD_BLOG_SVG_RE, BLOG_SVG);

  // 4. Tally consult link — every `href="#" data-action="consult"` (and variants)
  // Match: href="#" possibly followed by data-url="#" and data-action="consult"
  // Floating button: href="#" data-url="#" data-action="consult"
  // Footer menu link: href="#" data-action="consult"
  // CTA: href="#" data-action="consult" data-url="#"
  s = s.replace(/href="#"(\s+data-url="#")?(\s+data-action="consult")/g,
    `href="${TALLY}" data-action="consult"`);
  s = s.replace(/(data-action="consult"\s+)data-url="#"(\s+href="#")?/g,
    (_m, pre) => pre);
  // Also reverse-order: data-action first, then href
  s = s.replace(/data-action="consult"([^>]*?)\s+href="#"/g,
    `data-action="consult"$1 href="${TALLY}"`);
  // Cleanup: where href and data-action are on separate quotes/order
  s = s.replace(/href="#"([^>]*?)data-action="consult"/g,
    `href="${TALLY}"$1data-action="consult"`);

  if (s === before) {
    console.log(`  · ${file}: no changes`);
    return;
  }
  await fs.writeFile(p, s);
  const diffs = [];
  if (s.includes(HEADER_LOGO_IMG)) diffs.push('header-logo');
  if (s.includes(FOOTER_LOGO_IMG)) diffs.push('footer-logo');
  if (!s.includes('aria-label="YouTube"')) diffs.push('-youtube');
  if (s.includes('href="' + TALLY + '"')) diffs.push('tally');
  console.log(`  ✓ ${file}: ${diffs.join(', ')}`);
}

for (const f of FILES) {
  await transform(f);
}
console.log('done');

#!/usr/bin/env node
// Site sanity tests — run before merging any homepage change.
//
//   1. starts an HTTP server (python3 -m http.server) on a random port
//   2. fetches every HTML page + a sample of static assets
//   3. parses each HTML and asserts a list of invariants
//   4. exits non-zero on any failure with a clear summary
//
// Usage:  node scripts/test-site.mjs

import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---- Helpers ---------------------------------------------------------------
function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function waitFor(url, timeoutMs = 5000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {}
    await wait(100);
  }
  throw new Error(`server did not respond at ${url} within ${timeoutMs}ms`);
}

class Reporter {
  passed = 0;
  failures = [];

  pass(name) {
    this.passed++;
    console.log(`  [32m✓[0m ${name}`);
  }
  fail(name, detail) {
    this.failures.push({ name, detail });
    console.log(`  [31m✗[0m ${name}\n     ${detail}`);
  }
  ok(cond, name, detail = '') {
    cond ? this.pass(name) : this.fail(name, detail);
  }
  section(name) {
    console.log(`\n[1m▶ ${name}[0m`);
  }
  summary() {
    console.log(`\n[1m=== ${this.passed} passed, ${this.failures.length} failed ===[0m`);
    return this.failures.length === 0;
  }
}

// ---- Page list -------------------------------------------------------------
const PAGES = [
  '/',
  '/about.html',
  '/story.html',
  '/process.html',
  '/reviews.html',
  '/project/',
  '/project/1.html',
  '/project/2.html',
  '/project/3.html',
  '/project/4.html',
  '/project/5.html',
  '/project/6.html',
];

const TALLY = 'https://tally.so/r/J9eROr';

// ---- Test suites -----------------------------------------------------------

// Per-page invariants enforced via raw HTML inspection
function checkPageHtml(report, page, html) {
  const tag = `[${page}]`;

  // Tailwind config name must be correct (otherwise bg-ink etc. are silently dropped)
  report.ok(
    /tailwind\.config\s*=/.test(html) && !/tailwindcss\.config\s*=/.test(html),
    `${tag} tailwind.config name correct`,
    'must use `tailwind.config = {...}` not `tailwindcss.config`',
  );

  // Header logo must be image (not legacy <span>Enliven Space</span>)
  report.ok(
    /class="site-logo"[\s\S]*?<img\b[\s\S]*?src="\/images\/logo\/logo-dark/.test(html),
    `${tag} header logo uses logo-dark image`,
    'header <a.site-logo> should contain <img src="/images/logo/logo-dark...">',
  );

  // Footer logo must be image (not legacy <span>ENLIVEN<br/>SPACE</span>)
  report.ok(
    /class="footer-logo"[\s\S]*?<img\b[\s\S]*?src="\/images\/logo\/logo-light/.test(html),
    `${tag} footer logo uses logo-light image`,
    'footer <a.footer-logo> should contain <img src="/images/logo/logo-light...">',
  );

  // Footer SNS exactly 3 icons (kakao / instagram / naver blog) — YouTube removed
  const youtube = /aria-label="YouTube"/.test(html);
  report.ok(!youtube, `${tag} no YouTube icon in footer`, 'YouTube icon should be removed');

  // Look only within the .footer-sns block to avoid catching e.g. share popup
  const snsBlock = html.match(/<div class="footer-sns"[\s\S]*?<\/div>/);
  const labels = snsBlock
    ? [...snsBlock[0].matchAll(/aria-label="(카카오톡 채널|Instagram|네이버 블로그)"/g)].map((m) => m[1])
    : [];
  report.ok(
    labels.length === 3 && new Set(labels).size === 3,
    `${tag} footer has 3 SNS icons (kakao, instagram, naver blog)`,
    `got: ${JSON.stringify(labels)}`,
  );

  // Naver Blog SVG must contain literal "Blog" text element (so the cut-out shows)
  const blogBlock = html.match(/aria-label="네이버 블로그"[\s\S]*?<\/a>/);
  report.ok(
    !!blogBlock && /<text\b[^>]*>Blog<\/text>/.test(blogBlock[0]),
    `${tag} naver blog SVG contains "Blog" text`,
    'expected <text>Blog</text> inside the blog icon SVG',
  );

  // Consult buttons must point to Tally URL (no leftover href="#" + data-action="consult")
  const placeholderConsult = /href="#"[^>]*data-action="consult"|data-action="consult"[^>]*href="#"/m.test(html);
  report.ok(!placeholderConsult, `${tag} no placeholder href="#" on consult buttons`,
    'consult buttons should link to https://tally.so/r/J9eROr');

  const consultLinks = [...html.matchAll(/<a [^>]*data-action="consult"[^>]*>/g)];
  for (const m of consultLinks) {
    const tag2 = `${tag} consult <a ${m[0].slice(3, 60)}…>`;
    report.ok(m[0].includes(TALLY), `${tag2} → Tally URL`, `got: ${m[0]}`);
  }

  // Hero text overlay must have z-10 so gradient doesn't dim the title
  // (does not apply to homepage — its hero markup is different)
  if (page !== '/') {
    const heroOverlay = /<div class="absolute inset-0[^"]*flex items-end[^"]*pointer-events-none">/m;
    const withZ10    = /<div class="absolute inset-0 z-10 flex items-end pointer-events-none">/m;
    // Only assert if the page has a hero overlay at all
    if (heroOverlay.test(html)) {
      report.ok(withZ10.test(html), `${tag} hero text overlay has z-10`,
        'add `z-10` to keep text above the gradient');
    }
  }

  // Eyebrow + hero subtitle must use solid white (no /80, /90 opacity variant)
  // Only enforced on pages that have a hero with eyebrow text
  const dimmedHero = /text-white\/(80|90)/.test(html);
  report.ok(!dimmedHero, `${tag} no dimmed text-white/80,90 in hero`,
    'use pure `text-white` for hero overlay text');

  // Floating consult/kakao buttons must NOT use the stale `data-url="#"` attribute
  // (the JS handler used to gate on this — now it gates on href, so the attr is dead weight)
  const floatConsult = html.match(/class="float-btn float-btn--consult"[^>]*>/);
  if (floatConsult) {
    report.ok(
      floatConsult[0].includes(TALLY),
      `${tag} floating 상담신청 button → Tally URL`,
      `got: ${floatConsult[0]}`,
    );
  }

  // Favicon + web app icons — all pages must declare this set so browsers,
  // iOS Home Screen, and Android PWA all pick a high-quality icon.
  // (No SVG favicon — the logo source is raster, so PNG is the canonical form.)
  const faviconChecks = [
    [/<link[^>]+rel="icon"[^>]+type="image\/png"[^>]+sizes="32x32"[^>]+href="\/images\/favicon\.png"/, 'PNG 32 favicon'],
    [/<link[^>]+rel="apple-touch-icon"[^>]+sizes="180x180"[^>]+href="\/images\/favicon-180\.png"/, 'apple-touch-icon 180'],
    [/<link[^>]+rel="manifest"[^>]+href="\/images\/site\.webmanifest"/, 'web manifest link'],
    [/<meta[^>]+name="theme-color"[^>]+content="#ffffff"/, 'theme-color meta'],
  ];
  // Conversely, must NOT reference the removed SVG favicon
  report.ok(!/favicon\.svg/.test(html), `${tag} no stale favicon.svg reference`,
    'remove leftover <link rel="icon" type="image/svg+xml"> — source is raster only');
  for (const [re, label] of faviconChecks) {
    report.ok(re.test(html), `${tag} head includes ${label}`,
      `missing or malformed <link>/<meta> for ${label}`);
  }
}

// Asset existence
async function checkAsset(report, base, urlPath, name = urlPath) {
  const r = await fetch(base + urlPath);
  report.ok(r.ok, `asset ${name} reachable (HTTP ${r.status})`, urlPath);
}

// ---- Main ------------------------------------------------------------------
async function main() {
  const report = new Reporter();

  const port = await freePort();
  console.log(`\nStarting static server on http://127.0.0.1:${port} …`);
  const srv = spawn('python3', ['-m', 'http.server', String(port)], {
    cwd: ROOT,
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  const base = `http://127.0.0.1:${port}`;
  try {
    await waitFor(base + '/', 5000);

    // ---- Fetch + parse every page ----
    for (const page of PAGES) {
      report.section(`HTML invariants — ${page}`);
      const url = base + page;
      const r = await fetch(url);
      if (!r.ok) {
        report.fail(`${page} reachable`, `HTTP ${r.status}`);
        continue;
      }
      const html = await r.text();
      checkPageHtml(report, page, html);
    }

    // ---- Required assets ----
    report.section('Required static assets');
    const assets = [
      '/images/logo/logo-dark.png',
      '/images/logo/logo-dark@1x.png',
      '/images/logo/logo-light.png',
      '/images/logo/logo-light@1x.png',
      '/css/style.css',
      '/js/main.js',
      '/images/projects/proj-01/proj-01-hero-after.webp',
      '/images/projects/proj-02/proj-02-hero-after.webp',
      '/images/projects/proj-06/proj-06-hero-after.webp',
      '/images/favicon.png',
      '/images/favicon-180.png',
      '/images/favicon-192.png',
      '/images/favicon-512.png',
      '/images/site.webmanifest',
    ];
    for (const a of assets) await checkAsset(report, base, a);

    // ---- site.webmanifest sanity ----
    report.section('site.webmanifest validity');
    const mfRes = await fetch(base + '/images/site.webmanifest');
    let manifest;
    try {
      manifest = await mfRes.json();
      report.pass('site.webmanifest parses as JSON');
    } catch (e) {
      report.fail('site.webmanifest parses as JSON', String(e));
    }
    if (manifest) {
      report.ok(manifest.name === 'Enliven Space', 'manifest.name = "Enliven Space"', `got: ${manifest.name}`);
      const sizes = (manifest.icons || []).map((i) => i.sizes);
      report.ok(sizes.includes('192x192') && sizes.includes('512x512'),
        'manifest declares 192x192 and 512x512 PNG icons', `got: ${JSON.stringify(sizes)}`);
    }

    // ---- JS sanity: must check href not data-url for consult buttons ----
    report.section('JS handler sanity');
    const mainJs = await (await fetch(base + '/js/main.js')).text();
    report.ok(
      mainJs.includes('isPlaceholderHref') || /getAttribute\(['"]href['"]\)/.test(mainJs),
      'js/main.js consult/kakao handler gates on href (not data-url)',
      'should fall back to alert only when href is "#"',
    );
    report.ok(
      mainJs.includes("getElementById('portfolio-strip-track')") ||
        mainJs.includes('portfolio-strip-track'),
      'js/main.js has portfolio-strip prev/next arrow logic',
    );
  } finally {
    srv.kill();
  }

  const ok = report.summary();
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error('\nTest harness crashed:', e);
  process.exit(2);
});

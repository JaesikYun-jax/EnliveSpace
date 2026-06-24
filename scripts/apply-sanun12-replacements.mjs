#!/usr/bin/env node
// One-off (2026-06): replace a few 01-sanun12 gallery images that were delivered
// as PNGs (3 dropped into the output folders + 1 kitchen hero-after in _staging),
// converting each to standard-named WebP (1920/1200/600) and updating the
// manifest variant metadata in place. Also removes the kitchen-03 entry
// (intentionally deleted). Surgical — does NOT re-encode the rest of the project.
//
// NOTE: this writes straight into images/projects/01-sanun12/. A future full
// `npm run optimize 01` reads from _staging and would revert these unless the
// new sources are placed in _staging/originals with standard names first.
//
// Kept for record alongside the other apply-*/migrate-* one-offs.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { projDirById } from './projects-data.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJ = '01';
const DIR = projDirById(PROJ); // 01-sanun12
const PROJ_OUT = path.join(ROOT, 'images/projects', DIR);
const MANIFEST = path.join(PROJ_OUT, 'manifest.json');

// Same variant config as optimize-images.mjs.
const VARIANTS = [
  { suffix: '', width: 1920, quality: 80 },
  { suffix: '-1200', width: 1200, quality: 78 },
  { suffix: '-600', width: 600, quality: 76 },
];

// Locate the kitchen hero-after replacement in _staging (name contains "교체").
async function findStagingHero() {
  const stagingRoot = path.join(ROOT, '_staging');
  const projs = await fs.readdir(stagingRoot);
  const proj = projs.find((n) => n.normalize('NFC').includes('산운12'));
  if (!proj) return null;
  const baDir = path.join(stagingRoot, proj, '주방'.normalize('NFC'), '비포에프터'.normalize('NFC'));
  let entries;
  try {
    entries = await fs.readdir(baDir);
  } catch {
    // macOS may store the Korean dir names in NFD — fall back to a scan.
    const kitchen = (await fs.readdir(path.join(stagingRoot, proj))).find((n) => n.normalize('NFC') === '주방');
    const sub = (await fs.readdir(path.join(stagingRoot, proj, kitchen))).find((n) => n.normalize('NFC') === '비포에프터');
    const dir = path.join(stagingRoot, proj, kitchen, sub);
    const hit = (await fs.readdir(dir)).find((n) => n.normalize('NFC').includes('교체'));
    return hit ? path.join(dir, hit) : null;
  }
  const hit = entries.find((n) => n.normalize('NFC').includes('교체'));
  return hit ? path.join(baDir, hit) : null;
}

async function convert(srcPath, relDir, base) {
  const buf = await fs.readFile(srcPath);
  const meta = await sharp(buf).metadata();
  const vertical = meta.height > meta.width;
  const absDir = path.join(PROJ_OUT, relDir);
  await fs.mkdir(absDir, { recursive: true });
  const variants = [];
  for (const v of VARIANTS) {
    const outName = `${base}${v.suffix}.webp`;
    const targetW = Math.min(v.width, meta.width);
    await sharp(buf)
      .rotate()
      .resize({ width: targetW, withoutEnlargement: true })
      .webp({ quality: v.quality, effort: 4 })
      .toFile(path.join(absDir, outName));
    const stat = await fs.stat(path.join(absDir, outName));
    variants.push({ name: `${relDir}/${outName}`, size: stat.size, w: targetW, vertical });
  }
  return variants;
}

async function main() {
  const heroSrc = await findStagingHero();
  if (!heroSrc) throw new Error('kitchen hero-after replacement (_staging …교체…) not found');

  const replacements = [
    { src: path.join(PROJ_OUT, 'bath-a/01-sanun12-bath-a-02.png'), relDir: 'bath-a', base: '01-sanun12-bath-a-02', kind: 'regular', source: '01-sanun12-bath-a-02.jpg', cleanup: true },
    { src: path.join(PROJ_OUT, 'kitchen/01-sanun12-kitchen-01.png'), relDir: 'kitchen', base: '01-sanun12-kitchen-01', kind: 'regular', source: '01-sanun12-kitchen-01.jpg', cleanup: true },
    { src: path.join(PROJ_OUT, 'kitchen/01-sanun12-kitchen-02-change.png'), relDir: 'kitchen', base: '01-sanun12-kitchen-02', kind: 'regular', source: '01-sanun12-kitchen-02.jpg', cleanup: true },
    { src: path.join(PROJ_OUT, 'kitchen/01-sanun12-kitchen-05.png'), relDir: 'kitchen', base: '01-sanun12-kitchen-05', kind: 'regular', source: '01-sanun12-kitchen-05.jpg', cleanup: true },
    { src: heroSrc, relDir: 'kitchen/before-after', base: '01-sanun12-kitchen-hero-after', kind: 'hero', source: '01-sanun12-kitchen-hero-after.jpg', cleanup: false },
  ];

  const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'));

  for (const r of replacements) {
    try {
      await fs.access(r.src);
    } catch {
      console.log(`  ⏭ source missing, skip: ${path.relative(ROOT, r.src)}`);
      continue;
    }
    const variants = await convert(r.src, r.relDir, r.base);
    const section = r.relDir.split('/')[0];
    const arr = (manifest.sections[section] ||= []);
    const targetName = `${r.relDir}/${r.base}.webp`;
    const entry = arr.find((e) => e.variants.some((v) => v.name === targetName));
    if (entry) {
      entry.kind = r.kind;
      entry.source = r.source;
      entry.variants = variants;
      console.log(`  ✓ replaced ${targetName} (${variants[0].w}px, vertical=${variants[0].vertical})`);
    } else {
      arr.push({ kind: r.kind, source: r.source, variants });
      console.log(`  ✓ added ${targetName}`);
    }
    if (r.cleanup) {
      await fs.rm(r.src);
      console.log(`    🗑 removed source PNG ${path.relative(ROOT, r.src)}`);
    }
  }

  // Remove the intentionally-deleted kitchen-03 entry.
  const before = manifest.sections.kitchen.length;
  manifest.sections.kitchen = manifest.sections.kitchen.filter(
    (e) => !e.variants.some((v) => /\/01-sanun12-kitchen-03(\.|-)/.test(v.name)),
  );
  if (manifest.sections.kitchen.length < before) console.log('  ✓ removed kitchen-03 entry from manifest');

  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log('\n=== 01-sanun12 replacements applied ===');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

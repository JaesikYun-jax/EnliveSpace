#!/usr/bin/env node
// Generates square favicons by letterboxing the existing horizontal logo.
//
// Source:  images/logo/logo-light.png  (491×280, white on transparent)
// Outputs: images/favicon{,-180,-192,-512}.png  (square, black bg)
//          images/site.webmanifest

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'images/logo/logo-light.png');
const OUT_DIR = path.join(ROOT, 'images');
const BG = '#000000';

// Safe-zone padding around the logo on the long edge — keeps the wordmark
// from kissing the box edges at small sizes and matches typical app-icon insets.
const SAFE_ZONE = 0.10;

const meta = await sharp(SRC).metadata();
if (meta.width < meta.height) {
  throw new Error(`expected horizontal logo, got ${meta.width}×${meta.height}`);
}
const longest = Math.max(meta.width, meta.height);
const inset = Math.round(longest * SAFE_ZONE);
const canvas = longest + 2 * inset;
const padLeft = Math.floor((canvas - meta.width) / 2);
const padRight = canvas - meta.width - padLeft;
const padTop = Math.floor((canvas - meta.height) / 2);
const padBottom = canvas - meta.height - padTop;

// Build the square master once; downscale from it per target.
const master = await sharp(SRC)
  .extend({ top: padTop, bottom: padBottom, left: padLeft, right: padRight, background: BG })
  .flatten({ background: BG })
  .png({ compressionLevel: 9 })
  .toBuffer();

const TARGETS = [
  { name: 'favicon.png', size: 32 },
  { name: 'favicon-180.png', size: 180 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'favicon-512.png', size: 512 },
];

for (const { name, size } of TARGETS) {
  const out = path.join(OUT_DIR, name);
  await sharp(master)
    .resize(size, size, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`✓ ${name} (${size}×${size})`);
}

const manifest = {
  name: 'Enliven Space',
  short_name: 'Enliven',
  start_url: '/',
  display: 'standalone',
  background_color: BG,
  theme_color: '#ffffff',
  icons: [
    { src: '/images/favicon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/images/favicon-512.png', sizes: '512x512', type: 'image/png' },
  ],
};
await fs.writeFile(
  path.join(OUT_DIR, 'site.webmanifest'),
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log('✓ site.webmanifest');

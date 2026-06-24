#!/usr/bin/env node
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const W = 1200;
const H = 630;
const LOGO_WIDTH = 600;
const OVERLAY_ALPHA = 0.5;
const BG_SRC = path.join(ROOT, 'images/projects/02-seongbok/02-seongbok-hero-after.webp');
const LOGO_SRC = path.join(ROOT, 'images/logo/logo-light.png');
const OUT = path.join(ROOT, 'images/og-image.jpg');

const bg = await sharp(BG_SRC)
  .resize({ width: W, height: H, fit: 'cover', position: 'center' })
  .toBuffer();

const overlay = await sharp({
  create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: OVERLAY_ALPHA } },
})
  .png()
  .toBuffer();

const logo = await sharp(LOGO_SRC)
  .resize({ width: LOGO_WIDTH })
  .toBuffer({ resolveWithObject: true });

const logoLeft = Math.round((W - logo.info.width) / 2);
const logoTop = Math.round((H - logo.info.height) / 2);

await sharp(bg)
  .composite([
    { input: overlay },
    { input: logo.data, left: logoLeft, top: logoTop },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(OUT);

console.log(`✓ ${path.relative(ROOT, OUT)}  ${W}x${H}, bg ${path.basename(BG_SRC)}, overlay α${OVERLAY_ALPHA}, logo ${logo.info.width}x${logo.info.height}`);

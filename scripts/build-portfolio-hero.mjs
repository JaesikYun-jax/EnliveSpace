#!/usr/bin/env node
// 포트폴리오 목록 페이지(/project/) 상단 hero 배너 1장을 생성한다.
//
// 원본: 홈페이지제작(인라이븐스페이스)/4. 포트폴리오/포트폴리오 상단이미지.jpg
//       (판교원9단지 한림풀에버 — 미니멀 와이드 컷, 6720x2476 ≈ 2.71:1)
// 출력: images/portfolio-hero.webp (1920w, q80 — optimize-images.mjs 의 full 변형과 동일 설정)
//
// build-pages.mjs 의 buildPortfolioIndex() 가 이 고정 경로(/images/portfolio-hero.webp)를
// 참조한다. 예전엔 첫 프로젝트(06-pangyo)의 거실 after-hero 를 재사용했으나 전용 배너로 분리.
//
// 원본 폴더는 .gitignore 대상(2GB+)이라 Cloudflare 빌드에는 없다 → 커밋되는 산출물은
// images/portfolio-hero.webp 한 장. 원본이 없으면 경고만 남기고 정상 종료(기존 산출물 유지).

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'images', 'portfolio-hero.webp');

// macOS 한글 폴더/파일명은 NFD 로 저장되므로 NFC 정규화 후 부분일치로 찾는다.
async function findChild(parent, test) {
  let entries;
  try {
    entries = await fs.readdir(parent);
  } catch {
    return null;
  }
  for (const name of entries) {
    if (test(name.normalize('NFC'))) return path.join(parent, name);
  }
  return null;
}

async function resolveSource() {
  const origRoot = await findChild(ROOT, (n) => n.includes('홈페이지제작'));
  if (!origRoot) return null;
  const portfolioDir = await findChild(origRoot, (n) => n.includes('포트폴리오'));
  if (!portfolioDir) return null;
  return findChild(portfolioDir, (n) => /^포트폴리오[ _]?상단이미지\.jpe?g$/i.test(n));
}

async function main() {
  const src = await resolveSource();
  if (!src) {
    console.warn(
      '⚠ 포트폴리오 상단이미지 원본을 찾지 못했습니다 (원본 폴더는 .gitignore 대상).\n' +
        `  기존 ${path.relative(ROOT, OUT)} 를 그대로 둡니다.`,
    );
    return;
  }

  const buf = await fs.readFile(src);
  const meta = await sharp(buf).metadata();
  const targetW = Math.min(1920, meta.width);
  await sharp(buf)
    .rotate() // EXIF orientation 반영
    .resize({ width: targetW, withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toFile(OUT);

  const { size } = await fs.stat(OUT);
  const out = await sharp(await fs.readFile(OUT)).metadata();
  console.log(`✓ ${path.relative(ROOT, src)}`);
  console.log(
    `  → ${path.relative(ROOT, OUT)}  ${out.width}x${out.height}  ${(size / 1024).toFixed(0)} KB`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

#!/usr/bin/env node
// 포트폴리오 외 페이지(about, story, process, reviews)의 hero/section 이미지를
// 카메라 원본(JPG/PNG)에서 WebP 3 사이즈로 변환한다.
//
// 소스: 홈페이지제작(인라이븐스페이스)/{1.인라이븐..,2.공간이야기,3.진행방식,5.후기}/
// 출력: images/<name>{,-1200,-600}.webp
//
// 매핑이 작고 정적이라 폴더 자동 매칭 대신 명시적으로 둔다 — 파일명에 한글
// 띄어쓰기/언더스코어 변형이 섞여 있어 자동화하면 오히려 추측이 늘어남.

import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC_ROOT = path.join(ROOT, '홈페이지제작(인라이븐스페이스)');
const OUT_ROOT = path.join(ROOT, 'images');

const MAPPINGS = [
  // about (1. 인라이븐스페이스)
  { src: '1. 인라이븐스페이스/인라이븐스페이스_상단이미지.jpg', name: 'about-hero' },

  // story (2. 공간이야기)
  { src: '2. 공간이야기/공간이야기_상단이미지.jpg', name: 'story-hero' },
  { src: '2. 공간이야기/공간이야기_CEO 이미지.png', name: 'story-ceo' },

  // process (3. 진행방식)
  { src: '3. 진행방식/진행방식_상단이미지.jpg', name: 'process-hero' },
  { src: '3. 진행방식/진행방식_이미지1.png', name: 'process-1to1' },
  { src: '3. 진행방식/진행방식_이미지2.png', name: 'process-integrated' },
  { src: '3. 진행방식/진행방식_전체 리모델링.jpg', name: 'service-01-full' },
  { src: '3. 진행방식/진행방식_토탈 스타일링.jpg', name: 'service-02-total' },
  { src: '3. 진행방식/진행방식_홈스타일링.jpg', name: 'service-03-home' },

  // reviews (5. 후기)
  { src: '5.후기/후기_상단이미지.jpg', name: 'reviews-hero' },     // reviews.html 페이지 hero (거실)
  { src: '5.후기/후기 이미지 삽입.jpg', name: 'reviews-banner' }, // index.html 후기 섹션 상단 배너 (침실)
];

const VARIANTS = [
  { w: 1920, q: 80, suffix: '' },
  { w: 1200, q: 78, suffix: '-1200' },
  { w: 600,  q: 76, suffix: '-600' },
];

async function main() {
  console.log(`Source : ${SRC_ROOT}`);
  console.log(`Output : ${OUT_ROOT}\n`);

  let count = 0;
  let totalBytes = 0;
  for (const m of MAPPINGS) {
    const srcPath = path.join(SRC_ROOT, m.src);
    try {
      await fs.access(srcPath);
    } catch {
      console.log(`  ⏭ missing source: ${m.src}`);
      continue;
    }
    for (const v of VARIANTS) {
      const outPath = path.join(OUT_ROOT, `${m.name}${v.suffix}.webp`);
      await sharp(srcPath)
        .rotate()
        .resize({ width: v.w, withoutEnlargement: true })
        .webp({ quality: v.q, effort: 4 })
        .toFile(outPath);
      const s = await fs.stat(outPath);
      totalBytes += s.size;
      count++;
      console.log(`  ✓ ${m.name}${v.suffix}.webp (${(s.size / 1024).toFixed(0)} KB)`);
    }
  }
  console.log(`\n=== ${count} files, ${(totalBytes / 1024 / 1024).toFixed(1)} MB ===`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

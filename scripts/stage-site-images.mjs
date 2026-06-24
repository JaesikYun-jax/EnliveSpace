#!/usr/bin/env node
// 사이트 각 페이지가 '실제로 참조하는' 이미지를 페이지별 폴더로 _staging/ 아래에 모은다.
// (포트폴리오 목록/상세는 stage-images.mjs 가 원본 폴더에서 따로 스테이징하므로 여기선 제외)
//
// 동작: 각 HTML 을 파싱 → <img src>/srcset · style url() 의 /images/... 참조 수집 →
//       소스 경로 기준으로 페이지·카테고리 폴더에 복사한다. (실제 <img> 로 쓰인 것만)
// 출력:
//   _staging/_사이트페이지/
//     1.메인페이지/{hero, 포트폴리오-썸네일, 후기배너}/
//     2.인라이븐스페이스/ · 3.공간이야기/ · 4.진행방식/{hero,상세컷,서비스소개}/ · 5.후기/
//   _staging/_공통(로고)/        ← 모든 페이지 공통 로고(헤더/푸터)
//
// 커밋 대상 아님(_staging 은 .gitignore) — 언제든 `npm run stage-site` 로 재생성.
// 페이지가 같은 이미지를 쓰면 각 페이지 폴더에 중복 복사된다(의도된 동작 — "실제 쓰인 것" 기준).

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_staging', '_사이트페이지');
const COMMON = path.join(ROOT, '_staging', '_공통(로고)');

// 네비 순서대로. dir = _사이트페이지/ 아래 페이지 폴더명.
const PAGES = [
  { file: 'index.html', dir: '1.메인페이지' },
  { file: 'about.html', dir: '2.인라이븐스페이스' },
  { file: 'story.html', dir: '3.공간이야기' },
  { file: 'process.html', dir: '4.진행방식' },
  { file: 'reviews.html', dir: '5.후기' },
];

// 소스 경로 → 페이지 내부 하위 카테고리 폴더. 첫 매칭 사용, 매칭 없으면 페이지 폴더 직속.
const CATEGORY_RULES = [
  [/^\/images\/main\/hero\//, 'hero'],
  [/^\/images\/main\/portfolio-thumbnail\//, '포트폴리오-썸네일'],
  [/^\/images\/main\/reviews-banner\//, '후기배너'],
  [/^\/images\/pages\/process\/services\//, '서비스소개'],
  [/^\/images\/pages\/process\/detail-/, '상세컷'],
  [/^\/images\/pages\/process\/hero/, 'hero'],
];

const isCommonLogo = (u) => /\/logo\//.test(u);
const isIcon = (u) => /favicon|site\.webmanifest/.test(u); // 파비콘/매니페스트는 콘텐츠 이미지 아님 → 제외

function extractRefs(html) {
  const set = new Set();
  for (const m of html.matchAll(/(?:src|srcset)\s*=\s*"([^"]+)"/g)) {
    for (const part of m[1].split(',')) {
      const u = part.trim().split(/\s+/)[0];
      if (u && u.startsWith('/images/')) set.add(u);
    }
  }
  for (const m of html.matchAll(/url\(([^)]+)\)/g)) {
    const u = m[1].replace(/['"]/g, '').trim();
    if (u.startsWith('/images/')) set.add(u);
  }
  return [...set].sort();
}

function categoryFor(u) {
  for (const [re, cat] of CATEGORY_RULES) if (re.test(u)) return cat;
  return '';
}

async function copyInto(srcUrl, destDir) {
  const src = path.join(ROOT, srcUrl.replace(/^\//, ''));
  await fs.mkdir(destDir, { recursive: true });
  await fs.copyFile(src, path.join(destDir, path.basename(srcUrl)));
}

async function main() {
  // 기존 산출물 제거 후 재생성 (이 스크립트가 관리하는 두 폴더만)
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.rm(COMMON, { recursive: true, force: true });

  const commonSeen = new Set();
  let grandContent = 0;

  for (const { file, dir } of PAGES) {
    const html = await fs.readFile(path.join(ROOT, file), 'utf8');
    const refs = extractRefs(html);
    const perCat = {};
    for (const u of refs) {
      if (isIcon(u)) continue;
      if (isCommonLogo(u)) {
        if (!commonSeen.has(u)) {
          commonSeen.add(u);
          await copyInto(u, COMMON);
        }
        continue;
      }
      const cat = categoryFor(u);
      await copyInto(u, cat ? path.join(OUT, dir, cat) : path.join(OUT, dir));
      perCat[cat || '(직속)'] = (perCat[cat || '(직속)'] || 0) + 1;
      grandContent++;
    }
    const summary = Object.entries(perCat).map(([c, n]) => `${c}:${n}`).join(', ') || '(없음)';
    console.log(`  ✓ ${dir.padEnd(18)} ${summary}`);
  }

  console.log(`  ✓ ${'_공통(로고)'.padEnd(18)} ${commonSeen.size}개`);
  console.log(
    `\n=== content ${grandContent}장 + 공통 로고 ${commonSeen.size}장 → ${path.relative(ROOT, OUT)} ===`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

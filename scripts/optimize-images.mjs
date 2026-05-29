#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Reads from `_staging/` populated by `scripts/stage-images.mjs`, which copies
// camera-original JPGs from `홈페이지제작(인라이븐스페이스)/4. 포트폴리오/`
// and renames them to the proj-XX-section-NN.jpg pattern this script expects.
const SRC = path.resolve(process.cwd(), '_staging');
const OUT = path.resolve(process.cwd(), 'images/projects');

// Per-project source overrides. Empty by default since stage-images.mjs places
// every project under SRC. Add an entry only if a specific project's source
// lives somewhere else (e.g., a one-off delivered later).
const SRC_OVERRIDES = {};

const SECTION_MAP = {
  '거실': 'living',
  '주방': 'kitchen',
  '현관': 'entrance',
  '안방': 'bedroom',
  '욕실-A': 'bath-a',
  '욕실-B': 'bath-b',
  '침실-A': 'bed-a',
  '침실-B': 'bed-b',
  '침실-C': 'bed-c',
  'Room-A': 'room-a',
  'Room-B': 'room-b',
  'Room-C': 'room-c',
  // 메인 인덱스 hero 슬라이더 전용 — projects-data 의 sectionLabels 에 없어
  // 프로젝트 상세 페이지 갤러리에는 노출되지 않고, index.html 에서만 사용.
  '메인페이지': 'index-hero',
  // 포트폴리오 카드 cover override — projectCard / portfolioCovers 에서 자동 사용.
  '썸네일': 'card-cover',
};

const PROJECT_MAP = {
  '산운12단지 판교센트럴포레와이시티': '01',
  '성복역 롯데캐슬골드타운아파트': '02',
  '신당동 남산타운아파트': '03',
  '은어송마을코오롱하늘채2단지아파트': '04',
  '이태원 단독주택 에어비엔비': '05',
  '판교원9단지 한림풀에버': '06',
};

async function listJpg(dir) {
  const ent = await fs.readdir(dir, { withFileTypes: true });
  return ent
    .filter((e) => e.isFile() && /\.jpe?g$/i.test(e.name))
    .map((e) => path.join(dir, e.name))
    .sort();
}

async function dirExists(p) {
  try {
    const s = await fs.stat(p);
    return s.isDirectory();
  } catch {
    return false;
  }
}

// Two outputs per source: -1920.webp (full) + -1200.webp (grid).
// Keep one extra small (-600.webp) for thumb cards on homepage.
const VARIANTS = [
  { suffix: '', width: 1920, quality: 80 }, // primary: proj-02-living-01.webp
  { suffix: '-1200', width: 1200, quality: 78 },
  { suffix: '-600', width: 600, quality: 76 },
];

async function convertOne(srcPath, outDir, baseName) {
  const buf = await fs.readFile(srcPath);
  const meta = await sharp(buf).metadata();
  const isVertical = meta.height > meta.width;
  const results = [];
  for (const v of VARIANTS) {
    const outName = `${baseName}${v.suffix}.webp`;
    const outPath = path.join(outDir, outName);
    const targetW = Math.min(v.width, meta.width);
    await sharp(buf)
      .rotate() // honor EXIF orientation
      .resize({ width: targetW, withoutEnlargement: true })
      .webp({ quality: v.quality, effort: 4 })
      .toFile(outPath);
    const stat = await fs.stat(outPath);
    results.push({ name: outName, size: stat.size, w: targetW, vertical: isVertical });
  }
  return results;
}

async function processProject(korFolder, projNum) {
  const projSrc = SRC_OVERRIDES[projNum] ?? path.join(SRC, korFolder);
  const projOut = path.join(OUT, `proj-${projNum}`);
  await fs.mkdir(projOut, { recursive: true });

  const entries = await fs.readdir(projSrc, { withFileTypes: true });
  const manifest = { project: `proj-${projNum}`, folder: korFolder, sections: {} };
  let total = { in: 0, outBytes: 0, files: 0 };

  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const nameNfc = ent.name.normalize('NFC');
    const section = SECTION_MAP[nameNfc];
    if (!section) {
      console.log(`  ⚠ skipped unknown section folder: ${ent.name}`);
      continue;
    }
    const sectionDir = path.join(projSrc, ent.name);
    // macOS NFD-form for "비포에프터"
    const heroDir = path.join(sectionDir, '비포에프터'.normalize('NFD'));
    const hasHero = await dirExists(heroDir);

    const sectionFiles = [];

    // Hero before/after (if exists)
    if (hasHero) {
      const heroFiles = await listJpg(heroDir);
      for (const f of heroFiles) {
        const fname = path.basename(f, path.extname(f));
        // 헤로 파일은 이미 renamed: e.g. proj-02-living-hero-before / -after
        // 거실 섹션의 hero는 proj-XX-hero-before/after (메인 hero)
        let baseName;
        if (/proj-\d+-(hero|.*-hero)-(before|after)/.test(fname)) {
          baseName = fname;
        } else {
          // 매칭 실패 케이스(스킵)
          console.log(`    ⏭ hero unmatched: ${path.basename(f)}`);
          continue;
        }
        const res = await convertOne(f, projOut, baseName);
        sectionFiles.push({ kind: 'hero', source: path.basename(f), variants: res });
        total.in++;
        res.forEach((r) => (total.outBytes += r.size));
        total.files += res.length;
      }
    }

    // Regular files in section folder (also catches hero files placed directly here)
    const files = await listJpg(sectionDir);
    for (const f of files) {
      const fname = path.basename(f, path.extname(f));
      if (!/^proj-\d+-/.test(fname)) {
        console.log(`    ⏭ skipped non-renamed: ${path.basename(f)}`);
        continue;
      }
      // Hero before/after files placed directly in section folder (no 비포에프터 sub)
      const isHero = /proj-\d+-(hero|.*-hero)-(before|after)$/.test(fname);
      const res = await convertOne(f, projOut, fname);
      sectionFiles.push({
        kind: isHero ? 'hero' : 'regular',
        source: path.basename(f),
        variants: res,
      });
      total.in++;
      res.forEach((r) => (total.outBytes += r.size));
      total.files += res.length;
    }

    manifest.sections[section] = sectionFiles;
  }

  await fs.writeFile(
    path.join(projOut, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );
  return total;
}

async function main() {
  console.log(`Source : ${SRC}`);
  console.log(`Output : ${OUT}\n`);
  await fs.mkdir(OUT, { recursive: true });

  let grand = { in: 0, outBytes: 0, files: 0 };
  for (const [kor, num] of Object.entries(PROJECT_MAP)) {
    console.log(`\n▶ proj-${num} — ${kor}`);
    const t = await processProject(kor, num);
    console.log(
      `  ✓ ${t.in} sources → ${t.files} webp files (${(t.outBytes / 1024 / 1024).toFixed(1)} MB)`,
    );
    grand.in += t.in;
    grand.outBytes += t.outBytes;
    grand.files += t.files;
  }
  console.log(
    `\n=== Total: ${grand.in} sources → ${grand.files} files, ${(grand.outBytes / 1024 / 1024).toFixed(1)} MB ===`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

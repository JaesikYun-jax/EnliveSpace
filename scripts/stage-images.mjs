#!/usr/bin/env node
// Stages camera-original JPGs from `홈페이지제작(인라이븐스페이스)/4. 포트폴리오/`
// into `_staging/` with the proj-XX-section-NN.jpg naming that optimize-images.mjs
// expects. Source folder is read-only — only copies, never modifies originals.
//
// Output layout (matches what optimize-images.mjs reads):
//   _staging/
//     판교원9단지 한림풀에버/
//       거실/
//         proj-06-living-01.jpg
//         proj-06-living-02.jpg
//         비포에프터/
//           proj-06-hero-before.jpg    ← 거실 hero = 메인 hero, no section prefix
//           proj-06-hero-after.jpg
//       욕실-A/
//         proj-06-bath-a-01.jpg
//         비포에프터/
//           proj-06-bath-a-hero-before.jpg
//           proj-06-bath-a-hero-after.jpg
//
// Usage:
//   node scripts/stage-images.mjs --dry-run    # report only, no copies
//   node scripts/stage-images.mjs              # actually copy

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC_ROOT = path.join(ROOT, '홈페이지제작(인라이븐스페이스)', '4. 포트폴리오');
const OUT_ROOT = path.join(ROOT, '_staging');

// Source-folder-name → proj-NN (folder names stripped of leading "N)" and trailing "_")
const PROJECT_MAP = {
  '산운12단지 판교센트럴포레와이시티': '01',
  '성복역 롯데캐슬골드타운아파트': '02',
  '신당동 남산타운아파트': '03',
  '은어송마을코오롱하늘채2단지아파트': '04',
  '이태원 단독주택 에어비엔비': '05',
  '판교원9단지 한림풀에버': '06',
};

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
  // 메인 인덱스 페이지의 hero 슬라이더 전용 (갤러리에는 노출 안 됨 — projects-data.mjs
  // sectionLabels 에 index-hero 키가 없으므로 build-pages 가 무시).
  '메인페이지': 'index-hero',
  // 포트폴리오 카드 cover 전용 — manifest 에만 들어가고, build-pages 의
  // projectCard / portfolioCovers 에서 자동으로 우선 사용 (sectionLabels 무관).
  '썸네일': 'card-cover',
};

// Manual overrides for files in 비포에프터/ whose names don't match the
// before/after pattern. Keyed by exact basename.
const FILE_KIND_OVERRIDES = {
  '20250816_105044.jpg': 'before', // 1)판교원/침실-B — pairs with 애프터.jpg
  '판교원마을_사진추가2.jpg': 'after', // 1)판교원/거실 — pairs with 판교원마을_거실_비포.jpg
  '3T2A0630.jpg': 'after', // 3)은어송/침실-C — pairs with 비포.jpg
};

const HERO_DIR = '비포에프터';
const DRY_RUN = process.argv.includes('--dry-run');

function stripProjectPrefix(name) {
  return name.replace(/^\d+\)\s*/, '').replace(/_$/, '').normalize('NFC');
}

function classifyHero(filename) {
  const nfc = filename.normalize('NFC');
  if (FILE_KIND_OVERRIDES[nfc]) return FILE_KIND_OVERRIDES[nfc];
  const lower = nfc.toLowerCase();
  if (/비포|before/.test(lower)) return 'before';
  if (/에프터|애프터|after/.test(lower)) return 'after';
  return null;
}

async function listJpg(dir) {
  const ent = await fs.readdir(dir, { withFileTypes: true });
  return ent
    .filter((e) => e.isFile() && /\.jpe?g$/i.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => a.normalize('NFC').localeCompare(b.normalize('NFC')));
}

async function dirExists(p) {
  try {
    const s = await fs.stat(p);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function copyFile(src, dst) {
  if (DRY_RUN) return;
  await fs.mkdir(path.dirname(dst), { recursive: true });
  await fs.copyFile(src, dst);
}

async function processProject(srcProjFolder) {
  const stripped = stripProjectPrefix(srcProjFolder);
  const projNum = PROJECT_MAP[stripped];
  if (!projNum) {
    console.log(`  ⚠ unknown project folder: ${srcProjFolder} (stripped: "${stripped}")`);
    return null;
  }
  const projSrcDir = path.join(SRC_ROOT, srcProjFolder);
  const projOutDir = path.join(OUT_ROOT, stripped);

  const entries = await fs.readdir(projSrcDir, { withFileTypes: true });
  const stats = { sections: 0, regularCopied: 0, heroCopied: 0, skipped: [], errors: [] };

  for (const ent of entries) {
    if (!ent.isDirectory()) {
      // root-level non-dir → skip (PPTX, ~$lock, JPG comps, thumbnails, .DS_Store)
      if (ent.name !== '.DS_Store') stats.skipped.push(`(root) ${ent.name}`);
      continue;
    }
    const sectionName = ent.name.normalize('NFC');
    const sectionKey = SECTION_MAP[sectionName];
    if (!sectionKey) {
      stats.skipped.push(`(unknown section) ${sectionName}`);
      continue;
    }
    stats.sections++;
    const sectionSrcDir = path.join(projSrcDir, ent.name);
    const sectionOutDir = path.join(projOutDir, sectionName);

    // (a) regular files in section folder (sorted, sequential numbering)
    const files = await listJpg(sectionSrcDir);
    for (let i = 0; i < files.length; i++) {
      const src = path.join(sectionSrcDir, files[i]);
      const dst = path.join(
        sectionOutDir,
        `proj-${projNum}-${sectionKey}-${String(i + 1).padStart(2, '0')}.jpg`,
      );
      await copyFile(src, dst);
      stats.regularCopied++;
    }

    // (b) hero files in 비포에프터 subfolder
    const heroSrcDir = path.join(sectionSrcDir, HERO_DIR.normalize('NFD'));
    if (await dirExists(heroSrcDir)) {
      const heroFiles = await listJpg(heroSrcDir);
      for (const fname of heroFiles) {
        const kind = classifyHero(fname);
        if (!kind) {
          stats.errors.push(
            `${srcProjFolder}/${sectionName}/${HERO_DIR}/${fname} — cannot classify (no 비포/before/에프터/애프터/after marker)`,
          );
          continue;
        }
        // Living section's hero is the project's MAIN hero (no section prefix).
        const targetBase =
          sectionKey === 'living'
            ? `proj-${projNum}-hero-${kind}.jpg`
            : `proj-${projNum}-${sectionKey}-hero-${kind}.jpg`;
        const src = path.join(heroSrcDir, fname);
        const dst = path.join(sectionOutDir, HERO_DIR, targetBase);
        await copyFile(src, dst);
        stats.heroCopied++;
      }
    }
  }

  return { projNum, stripped, stats };
}

async function main() {
  console.log(`Source : ${SRC_ROOT}`);
  console.log(`Output : ${OUT_ROOT}`);
  console.log(`Mode   : ${DRY_RUN ? 'DRY RUN (no files copied)' : 'COPY'}\n`);

  if (!DRY_RUN) {
    // Wipe staging fresh
    await fs.rm(OUT_ROOT, { recursive: true, force: true });
    await fs.mkdir(OUT_ROOT, { recursive: true });
  }

  const projectEntries = await fs.readdir(SRC_ROOT, { withFileTypes: true });
  const projectFolders = projectEntries
    .filter((e) => e.isDirectory() && /^\d+\)/.test(e.name))
    .map((e) => e.name)
    .sort();

  let grandRegular = 0;
  let grandHero = 0;
  const allErrors = [];
  const allSkipped = [];

  for (const folder of projectFolders) {
    console.log(`▶ ${folder}`);
    const r = await processProject(folder);
    if (!r) continue;
    console.log(
      `  → proj-${r.projNum} (${r.stripped})  sections=${r.stats.sections}  regular=${r.stats.regularCopied}  hero=${r.stats.heroCopied}`,
    );
    if (r.stats.skipped.length) {
      r.stats.skipped.forEach((s) => allSkipped.push(`  [${folder}] ${s}`));
    }
    if (r.stats.errors.length) {
      r.stats.errors.forEach((e) => allErrors.push(e));
    }
    grandRegular += r.stats.regularCopied;
    grandHero += r.stats.heroCopied;
  }

  console.log(`\n=== Totals: regular=${grandRegular}  hero=${grandHero}  combined=${grandRegular + grandHero} ===`);

  if (allSkipped.length) {
    console.log(`\nSkipped (informational):`);
    allSkipped.forEach((s) => console.log(s));
  }

  if (allErrors.length) {
    console.log(`\n❌ ERRORS (${allErrors.length}):`);
    allErrors.forEach((e) => console.log(`  - ${e}`));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

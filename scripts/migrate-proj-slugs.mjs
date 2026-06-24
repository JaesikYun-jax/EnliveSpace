#!/usr/bin/env node
// One-off migration (2026-06): rename portfolio asset folders/files from the old
// `proj-NN` scheme to `NN-slug` (id + folderSlug from projects-data.mjs), e.g.
//   images/projects/proj-06/proj-06-living-01.webp
//     → images/projects/06-pangyo/06-pangyo-living-01.webp
//
// Rename only — no re-encode — so webp bytes are preserved (git sees renames).
// Also rewrites each manifest.json and _assets.json contents (proj-NN → NN-slug).
// Idempotent: skips folders already migrated, so it is safe to re-run.
//
// Kept for record alongside the other apply-*/update-* one-offs. The permanent
// pipeline (stage/optimize/build) already emits the new naming, so this script
// is not part of `npm run all` and should not need to run again.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FOLDER_SLUG_BY_ID, projDirById } from './projects-data.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS_DIR = path.join(ROOT, 'images/projects');

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const ids = Object.keys(FOLDER_SLUG_BY_ID).sort();
  for (const id of ids) {
    const oldDir = path.join(PROJECTS_DIR, `proj-${id}`);
    const newName = projDirById(id); // NN-slug
    const newDir = path.join(PROJECTS_DIR, newName);

    if (!(await exists(oldDir))) {
      console.log(`  ⏭ proj-${id} not found (already migrated?) — skip`);
      continue;
    }

    // 1) rename files inside the folder: proj-NN-* → NN-slug-*
    const entries = await fs.readdir(oldDir);
    let renamed = 0;
    for (const f of entries) {
      if (f.startsWith(`proj-${id}-`)) {
        const next = f.replace(`proj-${id}-`, `${newName}-`);
        await fs.rename(path.join(oldDir, f), path.join(oldDir, next));
        renamed++;
      }
    }

    // 2) rewrite manifest.json contents (project field, source + variant names)
    const manifestPath = path.join(oldDir, 'manifest.json');
    if (await exists(manifestPath)) {
      const raw = await fs.readFile(manifestPath, 'utf8');
      await fs.writeFile(manifestPath, raw.replaceAll(`proj-${id}`, newName));
    }

    // 3) rename the folder itself
    await fs.rename(oldDir, newDir);
    console.log(`  ✓ proj-${id} → ${newName}  (${renamed} files renamed)`);
  }

  // 4) rewrite _assets.json (homepage hero slides + portfolio covers)
  const assetsPath = path.join(PROJECTS_DIR, '_assets.json');
  if (await exists(assetsPath)) {
    let raw = await fs.readFile(assetsPath, 'utf8');
    for (const id of ids) {
      raw = raw.replaceAll(`proj-${id}`, projDirById(id));
    }
    await fs.writeFile(assetsPath, raw);
    console.log('  ✓ rewrote images/projects/_assets.json');
  }

  console.log('\n=== migration done ===');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

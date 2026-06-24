#!/usr/bin/env node
// One-off migration (2026-06): nest each project's flat webp files into
// per-section folders, with a `before-after/` subfolder for hero pairs.
//
//   images/projects/06-pangyo/06-pangyo-living-01.webp
//     → images/projects/06-pangyo/living/06-pangyo-living-01.webp
//   images/projects/06-pangyo/06-pangyo-bath-a-hero-after.webp
//     → images/projects/06-pangyo/bath-a/before-after/06-pangyo-bath-a-hero-after.webp
//
// Manifest-driven: section + kind come from manifest.json (no filename parsing).
// Move only — no re-encode — so webp bytes are preserved (git sees renames).
// Each variant `name` is rewritten to the project-relative path (forward slash)
// so build-pages' projectAssetUrl yields the nested URL with no logic change.
// Idempotent: a variant whose name already contains '/' is treated as migrated.
//
// Kept for record alongside migrate-proj-slugs.mjs. The permanent pipeline
// (optimize-images.mjs) already emits this nested layout, so this should not
// need to run again.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS_DIR = path.join(ROOT, 'images/projects');

async function main() {
  const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
  const projDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();

  for (const proj of projDirs) {
    const projDir = path.join(PROJECTS_DIR, proj);
    const manifestPath = path.join(projDir, 'manifest.json');
    let manifest;
    try {
      manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    } catch {
      console.log(`  ⏭ ${proj}: no manifest — skip`);
      continue;
    }

    let moved = 0;
    let already = 0;
    for (const [section, files] of Object.entries(manifest.sections)) {
      for (const entry of files) {
        const subdir = entry.kind === 'hero' ? `${section}/before-after` : section;
        for (const v of entry.variants) {
          if (v.name.includes('/')) {
            already++;
            continue; // already migrated
          }
          const src = path.join(projDir, v.name);
          const destRel = `${subdir}/${v.name}`;
          const dest = path.join(projDir, destRel);
          await fs.mkdir(path.dirname(dest), { recursive: true });
          await fs.rename(src, dest);
          v.name = destRel; // forward slash → URL/relative path
          moved++;
        }
      }
    }

    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`  ✓ ${proj}: ${moved} moved${already ? `, ${already} already nested` : ''}`);
  }

  // Warn about any webp left flat at a project root (= not listed in a manifest).
  const stray = [];
  for (const proj of projDirs) {
    const files = await fs.readdir(path.join(PROJECTS_DIR, proj));
    for (const f of files) {
      if (f.endsWith('.webp')) stray.push(`${proj}/${f}`);
    }
  }
  if (stray.length) {
    console.log(`\n⚠ ${stray.length} stray webp still flat at project root (not in manifest):`);
    stray.forEach((s) => console.log(`    ${s}`));
  }

  console.log('\n=== section-subfolder migration done ===');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

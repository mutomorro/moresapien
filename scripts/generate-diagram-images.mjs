#!/usr/bin/env node

// ============================================
// Moresapien — Concept-diagram PNG generator
// ============================================
// Inline SVGs are great for users (sharp, responsive, accessible) but Google
// Image Search indexes raster images. So for every entry that has a hand-
// crafted concept diagram, render its SVG to a PNG at 1200px wide and write
// it to public/diagrams/{slug}.png. The entry page references this PNG via a
// hidden <img> tag and the sitemap (so Google can discover it).
//
// Runs in postbuild AFTER `astro build`, because we extract the SVG from the
// built HTML — that way the PNG is guaranteed to match what users see on the
// page, and we don't need to run Astro components in a separate context.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { diagrams } from '../src/data/diagramRegistry.js';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const DIST_DIR = path.join(ROOT, 'dist');
const OUTPUT_DIR = path.join(ROOT, 'public/diagrams');
const DIST_OUTPUT_DIR = path.join(ROOT, 'dist/diagrams');

const PNG_WIDTH = 1200;

// Resvg can't reach the global stylesheet from inside an extracted <svg>, so
// we inline the diagram class styles here. Keep these in sync with the
// `svg .th` / `svg .ts` rules in src/styles/global.css.
const INLINE_STYLE = `<style>
  .th { font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 500; fill: #15140F; }
  .ts { font-family: Helvetica, Arial, sans-serif; font-size: 11px; fill: #6B6655; }
</style>`;

function extractDiagramSvg(html) {
  // The diagram container is `<div class="entry-visual entry-visual--diagram">…</div>`
  // around the SVG. The class on that div may include Astro scope hashes
  // appended (e.g. `entry-visual--diagram astro-ABC123`). Match leniently.
  const containerRe = /<div\s+class="[^"]*entry-visual--diagram[^"]*"[^>]*>([\s\S]*?)<\/div>/;
  const match = html.match(containerRe);
  if (!match) return null;
  const inner = match[1];
  const svgRe = /<svg[\s\S]*?<\/svg>/;
  const svgMatch = inner.match(svgRe);
  return svgMatch ? svgMatch[0] : null;
}

function ensureSvgNamespace(svgString) {
  // Astro's compiled SVG strips the xmlns when the source doesn't declare one
  // explicitly, so resvg refuses to parse it. Add the namespace if missing.
  if (/xmlns\s*=/.test(svgString)) return svgString;
  return svgString.replace(/<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');
}

function injectInlineStyle(svgString) {
  return svgString.replace(/(<svg\b[^>]*>)/, `$1${INLINE_STYLE}`);
}

function normaliseDimensions(svgString) {
  // viewBox stays, but width="100%" confuses resvg's intrinsic-size pass.
  // Drop width/height entirely so the renderer relies on viewBox + fitTo.
  return svgString
    .replace(/(<svg\b[^>]*?)\s+width="[^"]*"/, '$1')
    .replace(/(<svg\b[^>]*?)\s+height="[^"]*"/, '$1');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function renderOne(slug) {
  const htmlPath = path.join(DIST_DIR, slug, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    return { ok: false, reason: `built page missing: dist/${slug}/index.html` };
  }
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const svg = extractDiagramSvg(html);
  if (!svg) {
    return { ok: false, reason: `no .entry-visual--diagram SVG found on /${slug}/` };
  }
  const prepared = injectInlineStyle(normaliseDimensions(ensureSvgNamespace(svg)));

  const resvg = new Resvg(prepared, {
    fitTo: { mode: 'width', value: PNG_WIDTH },
    background: '#F5F1E8',
    font: { loadSystemFonts: true },
  });
  const png = resvg.render().asPng();

  // Write to both public/ (so source-of-truth lives with the repo for next
  // dev run) and dist/ (so the current built site already has it — Netlify
  // ships dist/, not public/).
  fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.png`), png);
  fs.writeFileSync(path.join(DIST_OUTPUT_DIR, `${slug}.png`), png);
  return { ok: true, bytes: png.length };
}

function main() {
  ensureDir(OUTPUT_DIR);
  ensureDir(DIST_OUTPUT_DIR);

  const slugs = Object.keys(diagrams);
  console.log(`\n🎨 Concept-diagram PNG generator`);
  console.log('─'.repeat(50));
  console.log(`   Rendering ${slugs.length} diagram${slugs.length === 1 ? '' : 's'} at ${PNG_WIDTH}px wide`);

  let ok = 0;
  const failures = [];
  for (const slug of slugs) {
    const result = renderOne(slug);
    if (result.ok) {
      ok += 1;
      console.log(`   ✓ ${slug}.png (${(result.bytes / 1024).toFixed(1)} KB)`);
    } else {
      failures.push({ slug, reason: result.reason });
      console.error(`   ✗ ${slug}: ${result.reason}`);
    }
  }

  console.log(`\n   ${ok}/${slugs.length} diagram PNGs written to public/diagrams/`);
  if (failures.length > 0) {
    console.error(`   ${failures.length} failure${failures.length === 1 ? '' : 's'}`);
    process.exit(1);
  }
}

main();

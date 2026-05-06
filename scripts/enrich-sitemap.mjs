#!/usr/bin/env node

// ============================================
// Moresapien — Sitemap enrichment
// ============================================
// Astro's sitemap integration writes a plain urlset. After build, slot in
// <image:image> blocks for every entry URL so Google Image Search has
// something to index. The image namespace is added to <urlset> if missing.
//
// Each entry's URL gets up to two image references:
//   1. The OG card PNG (always, if it exists in public/og/{slug}.png)
//   2. The concept-diagram PNG (only entries with a hand-crafted diagram in
//      diagramRegistry — file in public/diagrams/{slug}.png)
//
// Runs in postbuild AFTER `astro build` and after generate-diagram-images.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const ENTRIES_DIR = path.join(ROOT, 'src/content/entries');
const SITEMAP_PATH = path.join(ROOT, 'dist/sitemap-0.xml');
const SITE = 'https://moresapien.org';
const IMAGE_NS = 'http://www.google.com/schemas/sitemap-image/1.1';

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripMd(s) {
  return (s || '').replace(/\*(.*?)\*/g, '$1').replace(/\s+/g, ' ').trim();
}

function readEntries() {
  return fs
    .readdirSync(ENTRIES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(ENTRIES_DIR, filename), 'utf-8');
      const { data } = matter(raw);
      return { slug, data };
    });
}

function imageBlock({ url, caption, title }) {
  return (
    `<image:image>` +
    `<image:loc>${escapeXml(url)}</image:loc>` +
    `<image:caption>${escapeXml(caption)}</image:caption>` +
    `<image:title>${escapeXml(title)}</image:title>` +
    `</image:image>`
  );
}

function main() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error(`   ⚠ sitemap not found at ${SITEMAP_PATH} - skipping`);
    return;
  }

  let xml = fs.readFileSync(SITEMAP_PATH, 'utf-8');

  if (!xml.includes(`xmlns:image="${IMAGE_NS}"`)) {
    xml = xml.replace('<urlset', `<urlset xmlns:image="${IMAGE_NS}"`);
  }

  const entries = readEntries();
  const bySlug = Object.fromEntries(entries.map((e) => [e.slug, e.data]));
  const ogDir = path.join(ROOT, 'public/og');
  const diagramDir = path.join(ROOT, 'public/diagrams');
  const ogPngs = fs.existsSync(ogDir)
    ? new Set(fs.readdirSync(ogDir).filter((f) => f.endsWith('.png')))
    : new Set();
  const diagramPngs = fs.existsSync(diagramDir)
    ? new Set(fs.readdirSync(diagramDir).filter((f) => f.endsWith('.png')))
    : new Set();

  let enriched = 0;
  let skipped = 0;
  let diagramsAdded = 0;

  for (const slug of Object.keys(bySlug)) {
    const data = bySlug[slug];
    const loc = `${SITE}/${slug}/`;
    const pngFile = `${slug}.png`;
    if (!ogPngs.has(pngFile)) {
      skipped += 1;
      continue;
    }

    const blocks = [];

    // OG card image
    blocks.push(
      imageBlock({
        url: `${SITE}/og/${slug}.png`,
        caption: `${data.title} - ${data.category}. ${stripMd(data.oneLiner)}`,
        title: `${data.title} - Moresapien`,
      }),
    );

    // Concept-diagram PNG (only when one was rendered for this slug)
    if (diagramPngs.has(pngFile)) {
      blocks.push(
        imageBlock({
          url: `${SITE}/diagrams/${slug}.png`,
          caption: `How ${data.title.toLowerCase()} works - a Moresapien concept diagram. ${stripMd(data.oneLiner)}`,
          title: `How ${data.title} works - Moresapien`,
        }),
      );
      diagramsAdded += 1;
    }

    const imageBlocks = blocks.join('');

    const urlBlockRe = new RegExp(
      `(<url>\\s*<loc>${escapeRegex(loc)}</loc>)([^<]*(?:<(?!/url>)[^<]*)*)</url>`,
      'g',
    );

    let injected = false;
    xml = xml.replace(urlBlockRe, (match, head, middle) => {
      injected = true;
      if (middle.includes('<image:image>')) return match;
      return `${head}${middle}${imageBlocks}</url>`;
    });

    if (injected) enriched += 1;
  }

  fs.writeFileSync(SITEMAP_PATH, xml);
  console.log(`\n🗺  Sitemap enrichment`);
  console.log('─'.repeat(50));
  console.log(`   Enriched ${enriched} entry URLs with <image:image> blocks`);
  console.log(`   Of those, ${diagramsAdded} also include a concept-diagram PNG`);
  if (skipped > 0) {
    console.log(`   Skipped ${skipped} entries with no matching PNG in public/og/`);
  }
}

main();

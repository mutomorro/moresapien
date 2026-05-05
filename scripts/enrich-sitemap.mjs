#!/usr/bin/env node

// ============================================
// Moresapien - Sitemap enrichment
// ============================================
// Astro's sitemap integration writes a plain urlset. After build, we slot in
// <image:image> blocks for every entry URL so Google Image Search has
// something to index. The image namespace is added to <urlset> if missing.
//
// Run automatically as `postbuild` after `astro build`.

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

function main() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error(`   ⚠ sitemap not found at ${SITEMAP_PATH} - skipping`);
    return;
  }

  let xml = fs.readFileSync(SITEMAP_PATH, 'utf-8');

  // Ensure the image namespace is declared.
  if (!xml.includes(`xmlns:image="${IMAGE_NS}"`)) {
    xml = xml.replace('<urlset', `<urlset xmlns:image="${IMAGE_NS}"`);
  }

  const entries = readEntries();
  const bySlug = Object.fromEntries(entries.map((e) => [e.slug, e.data]));
  const ogDir = path.join(ROOT, 'public/og');
  const existingPngs = fs.existsSync(ogDir)
    ? new Set(fs.readdirSync(ogDir).filter((f) => f.endsWith('.png')))
    : new Set();

  let enriched = 0;
  let skipped = 0;

  // For each entry slug, find its <url> block in the sitemap and inject an image.
  for (const slug of Object.keys(bySlug)) {
    const data = bySlug[slug];
    const loc = `${SITE}/${slug}/`;
    const pngFile = `${slug}.png`;
    if (!existingPngs.has(pngFile)) {
      skipped += 1;
      continue;
    }

    const imgUrl = `${SITE}/og/${slug}.png`;
    const caption = `${data.title} - ${data.category}. ${stripMd(data.oneLiner)}`;
    const imgTitle = `${data.title} - Moresapien`;

    const imageBlock = `<image:image><image:loc>${escapeXml(imgUrl)}</image:loc><image:caption>${escapeXml(caption)}</image:caption><image:title>${escapeXml(imgTitle)}</image:title></image:image>`;

    // Match the exact <url><loc>...</loc></url> block for this slug and inject
    // the image block before the closing </url>. This is order-independent and
    // tolerates Astro's compact one-line output.
    const urlBlockRe = new RegExp(
      `(<url>\\s*<loc>${escapeRegex(loc)}</loc>)([^<]*(?:<(?!/url>)[^<]*)*)</url>`,
      'g'
    );

    let injected = false;
    xml = xml.replace(urlBlockRe, (match, head, middle) => {
      injected = true;
      // If image block already present somehow, leave it.
      if (middle.includes('<image:image>')) return match;
      return `${head}${middle}${imageBlock}</url>`;
    });

    if (injected) enriched += 1;
  }

  fs.writeFileSync(SITEMAP_PATH, xml);
  console.log(`\n🗺  Sitemap enrichment`);
  console.log('─'.repeat(50));
  console.log(`   Enriched ${enriched} entry URLs with <image:image> blocks`);
  if (skipped > 0) {
    console.log(`   Skipped ${skipped} entries with no matching PNG in public/og/`);
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

main();

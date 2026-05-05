#!/usr/bin/env node

// ============================================
// Moresapien - OG image generator
// ============================================
// Reads every entry under src/content/entries, renders the same knowledge-card
// design that ships inline on each page (see src/components/KnowledgeCard.astro),
// and writes a 1200x630 PNG to public/og/{slug}.png so the existing meta tags
// have something to point at on Bluesky / Twitter / LinkedIn.
//
// Run automatically as `prebuild` before `astro build`.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { categoryColours, brandColours } from '../src/data/categoryColours.js';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const ENTRIES_DIR = path.join(ROOT, 'src/content/entries');
const OUTPUT_DIR = path.join(ROOT, 'public/og');
const FONT_DIR = path.join(ROOT, 'node_modules/@fontsource');

const W = 1200;
const H = 630;

// -------------------------------------------------
// Fonts (woff is supported by satori)
// -------------------------------------------------
function loadFont(family, file, weight, style) {
  const filePath = path.join(FONT_DIR, family.toLowerCase(), 'files', file);
  return {
    name: family,
    data: fs.readFileSync(filePath),
    weight,
    style,
  };
}

const fonts = [
  loadFont('Lora', 'lora-latin-400-normal.woff', 400, 'normal'),
  loadFont('Lora', 'lora-latin-400-italic.woff', 400, 'italic'),
  loadFont('Lora', 'lora-latin-600-normal.woff', 600, 'normal'),
  loadFont('Lora', 'lora-latin-700-normal.woff', 700, 'normal'),
  loadFont('Nunito', 'nunito-latin-400-normal.woff', 400, 'normal'),
  loadFont('Nunito', 'nunito-latin-600-normal.woff', 600, 'normal'),
  loadFont('Nunito', 'nunito-latin-700-normal.woff', 700, 'normal'),
];

// -------------------------------------------------
// Helpers
// -------------------------------------------------
function stripMd(s) {
  return (s || '').replace(/\*(.*?)\*/g, '$1').replace(/\s+/g, ' ').trim();
}

// React.createElement-style helper - satori accepts this shape directly.
// Satori requires every <div> to declare display, so we default to flex.
function el(type, props = {}, ...children) {
  const flat = children.flat().filter((c) => c !== null && c !== undefined && c !== false);
  let nextProps = props;
  if (type === 'div') {
    const style = props.style || {};
    if (!style.display) {
      nextProps = { ...props, style: { display: 'flex', ...style } };
    }
  }
  return { type, props: { ...nextProps, children: flat.length === 1 ? flat[0] : flat } };
}

// -------------------------------------------------
// Knowledge card layout (mirrors KnowledgeCard.astro)
// -------------------------------------------------
function buildCard({ title, oneLiner, category, thoughtToHoldOnto, relatedTitles }) {
  const accent = categoryColours[category] || brandColours.gold;
  const related = relatedTitles.slice(0, 3);

  return el(
    'div',
    {
      style: {
        width: `${W}px`,
        height: `${H}px`,
        display: 'flex',
        flexDirection: 'column',
        background: brandColours.cream,
        fontFamily: 'Nunito',
      },
    },
    // top accent bar
    el('div', { style: { width: '100%', height: '12px', background: accent, flexShrink: 0 } }),
    // body
    el(
      'div',
      {
        style: {
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 64px 36px',
        },
      },
      // category badge
      el(
        'div',
        {
          style: {
            display: 'flex',
            alignSelf: 'flex-start',
            background: accent,
            color: brandColours.cream,
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '1.4px',
            textTransform: 'uppercase',
            padding: '8px 18px',
            borderRadius: '999px',
            marginBottom: '20px',
          },
        },
        category
      ),
      // title
      el(
        'div',
        {
          style: {
            fontFamily: 'Lora',
            fontSize: '60px',
            fontWeight: 600,
            color: brandColours.text,
            lineHeight: 1.1,
            marginBottom: '14px',
            display: 'flex',
          },
        },
        stripMd(title)
      ),
      // one-liner
      el(
        'div',
        {
          style: {
            fontFamily: 'Nunito',
            fontSize: '26px',
            fontStyle: 'italic',
            color: brandColours.textMuted,
            lineHeight: 1.4,
            marginBottom: '24px',
            display: 'flex',
          },
        },
        stripMd(oneLiner)
      ),
      // divider
      el('div', { style: { height: '1px', background: brandColours.border, marginBottom: '20px' } }),
      // thought box
      el(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            background: brandColours.thoughtBg,
            borderRadius: '14px',
            padding: '24px 32px',
            marginBottom: '20px',
            flex: '1 1 auto',
          },
        },
        el(
          'div',
          {
            style: {
              fontFamily: 'Nunito',
              fontSize: '14px',
              fontWeight: 700,
              color: accent,
              letterSpacing: '1.6px',
              marginBottom: '12px',
              display: 'flex',
            },
          },
          'THE THOUGHT TO HOLD ONTO'
        ),
        el(
          'div',
          {
            style: {
              fontFamily: 'Lora',
              fontSize: '28px',
              fontStyle: 'italic',
              color: '#3a342e',
              lineHeight: 1.4,
              display: 'flex',
            },
          },
          '“' + stripMd(thoughtToHoldOnto) + '”'
        )
      ),
      // divider
      el('div', { style: { height: '1px', background: brandColours.border, marginBottom: '16px' } }),
      // related row + footer
      el(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        },
        el(
          'div',
          { style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap' } },
          ...related.flatMap((r, i) => [
            el('div', {
              key: `dot-${i}`,
              style: {
                width: '12px',
                height: '12px',
                borderRadius: '999px',
                background: brandColours.relatedDot,
                marginRight: '10px',
                marginLeft: i === 0 ? 0 : '24px',
              },
            }),
            el(
              'div',
              {
                key: `lbl-${i}`,
                style: {
                  fontFamily: 'Nunito',
                  fontSize: '20px',
                  fontWeight: 500,
                  color: brandColours.textMuted,
                  display: 'flex',
                },
              },
              r
            ),
          ])
        ),
        el(
          'div',
          {
            style: {
              fontFamily: 'Nunito',
              fontSize: '20px',
              fontWeight: 600,
              color: brandColours.textLight,
              display: 'flex',
            },
          },
          'moresapien.org'
        )
      )
    )
  );
}

// -------------------------------------------------
// Main
// -------------------------------------------------
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

async function generateOne(entry, titlesBySlug) {
  const { slug, data } = entry;
  const relatedTitles = (data.relatedConcepts || [])
    .map((r) => titlesBySlug[r.slug])
    .filter(Boolean)
    .slice(0, 3);

  const tree = buildCard({
    title: data.title,
    oneLiner: data.oneLiner,
    category: data.category,
    thoughtToHoldOnto: data.thoughtToHoldOnto,
    relatedTitles,
  });

  const svg = await satori(tree, { width: W, height: H, fonts });
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    background: brandColours.cream,
  })
    .render()
    .asPng();

  const outPath = path.join(OUTPUT_DIR, `${slug}.png`);
  fs.writeFileSync(outPath, png);
  return outPath;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const entries = readEntries();
  const titlesBySlug = Object.fromEntries(entries.map((e) => [e.slug, e.data.title]));

  console.log(`\n🖼  OG image generator`);
  console.log('─'.repeat(50));
  console.log(`   Rendering ${entries.length} cards at ${W}x${H}`);

  let okCount = 0;
  let failures = [];
  for (const entry of entries) {
    try {
      await generateOne(entry, titlesBySlug);
      okCount += 1;
    } catch (err) {
      failures.push({ slug: entry.slug, message: err.message });
      console.error(`   ✗ ${entry.slug}: ${err.message}`);
    }
  }

  console.log(`\n   ✅ ${okCount}/${entries.length} OG images written to public/og/`);
  if (failures.length > 0) {
    console.error(`   ❌ ${failures.length} failures`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

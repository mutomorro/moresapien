#!/usr/bin/env node

// ============================================
// Moresapien — OG image generator
// ============================================
// Reads every entry under src/content/entries and renders a 1200x630 PNG
// social card to public/og/{slug}.png. Also writes the homepage card to
// public/og/home.png. Uses Satori + resvg with woff fonts loaded from
// @fontsource. Keep in sync with src/styles/global.css and the new
// design system (Newsreader display, Inter body, DM Mono labels).

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

// Saffron (Logical Fallacy) needs ink text for WCAG AA contrast.
function onAccentText(category) {
  return category === 'Logical Fallacy' ? brandColours.ink : '#FFFFFF';
}

function loadFont(family, dirName, file, weight, style) {
  const filePath = path.join(FONT_DIR, dirName, 'files', file);
  return {
    name: family,
    data: fs.readFileSync(filePath),
    weight,
    style,
  };
}

const fonts = [
  loadFont('Newsreader',    'newsreader',    'newsreader-latin-400-normal.woff',    400, 'normal'),
  loadFont('Newsreader',    'newsreader',    'newsreader-latin-400-italic.woff',    400, 'italic'),
  loadFont('Newsreader',    'newsreader',    'newsreader-latin-500-normal.woff',    500, 'normal'),
  loadFont('Inter',         'inter',         'inter-latin-400-normal.woff',         400, 'normal'),
  loadFont('Inter',         'inter',         'inter-latin-500-normal.woff',         500, 'normal'),
  loadFont('Space Grotesk', 'space-grotesk', 'space-grotesk-latin-500-normal.woff', 500, 'normal'),
  loadFont('DM Mono',       'dm-mono',       'dm-mono-latin-400-normal.woff',       400, 'normal'),
  loadFont('DM Mono',       'dm-mono',       'dm-mono-latin-500-normal.woff',       500, 'normal'),
];

const FONT_DISPLAY = 'Newsreader';
const FONT_BODY = 'Inter';
const FONT_MONO = 'DM Mono';

function stripMd(s) {
  return (s || '').replace(/\*(.*?)\*/g, '$1').replace(/\s+/g, ' ').trim();
}

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

// ----- Asterisk (SVG inline) -------------------------------------------------
function asterisk({ size = 28, color = brandColours.coral }) {
  const r = size * 0.42;
  const sw = Math.max(2, size / 12);
  const cx = size / 2;
  const cy = size / 2;
  const cos60 = Math.cos(Math.PI / 3);
  const sin60 = Math.sin(Math.PI / 3);

  const lines = [
    [cx - r, cy, cx + r, cy],
    [cx - r * cos60, cy - r * sin60, cx + r * cos60, cy + r * sin60],
    [cx + r * cos60, cy - r * sin60, cx - r * cos60, cy + r * sin60],
  ];

  return el(
    'svg',
    {
      width: size,
      height: size,
      viewBox: `0 0 ${size} ${size}`,
      xmlns: 'http://www.w3.org/2000/svg',
      style: { display: 'block' },
    },
    ...lines.map(([x1, y1, x2, y2]) =>
      el('line', {
        x1, y1, x2, y2,
        stroke: color,
        'stroke-width': sw,
        'stroke-linecap': 'round',
      }),
    ),
  );
}

// ----- Wordmark (more*sapien*) ----------------------------------------------
function wordmark({ size = 24, color = brandColours.ink }) {
  // Lift the asterisk so it sits at footnote/superscript height between the
  // words rather than reading as a bullet on the baseline.
  const asteriskSize = size * 0.7;
  const asteriskLift = size * 0.4;
  return el(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '2px',
        fontFamily: FONT_DISPLAY,
        fontSize: `${size}px`,
        color,
        letterSpacing: '-0.02em',
      },
    },
    el('div', { style: { display: 'flex' } }, 'more'),
    el(
      'div',
      {
        style: {
          display: 'flex',
          transform: `translateY(-${asteriskLift}px)`,
        },
      },
      asterisk({ size: asteriskSize, color: brandColours.coral }),
    ),
    el(
      'div',
      { style: { display: 'flex', fontStyle: 'italic' } },
      'sapien',
    ),
  );
}

// ----- Entry card -----------------------------------------------------------
function buildEntryCard({ title, oneLiner, category }) {
  const accent = categoryColours[category] || brandColours.coral;
  const cleanTitle = stripMd(title);
  const cleanOneLiner = stripMd(oneLiner);

  return el(
    'div',
    {
      style: {
        width: `${W}px`,
        height: `${H}px`,
        display: 'flex',
        flexDirection: 'row',
        background: brandColours.paper,
      },
    },
    // Left accent strip
    el('div', {
      style: {
        width: '12px',
        height: '100%',
        background: accent,
        flexShrink: 0,
      },
    }),
    // Content column
    el(
      'div',
      {
        style: {
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 72px',
          justifyContent: 'space-between',
        },
      },
      // Top section: eyebrow, title, one-liner
      el(
        'div',
        { style: { display: 'flex', flexDirection: 'column' } },
        // Eyebrow
        el(
          'div',
          {
            style: {
              fontFamily: FONT_MONO,
              fontSize: '20px',
              fontWeight: 500,
              color: accent,
              letterSpacing: '2.4px',
              textTransform: 'uppercase',
              marginBottom: '36px',
              display: 'flex',
            },
          },
          category,
        ),
        // Title with asterisk (lifted to read as superscript)
        el(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            },
          },
          el(
            'div',
            {
              style: {
                fontFamily: FONT_DISPLAY,
                fontSize: '88px',
                fontWeight: 400,
                color: brandColours.ink,
                lineHeight: 0.95,
                letterSpacing: '-0.025em',
                display: 'flex',
              },
            },
            cleanTitle,
          ),
          el(
            'div',
            {
              style: {
                display: 'flex',
                transform: 'translateY(-44px)',
              },
            },
            asterisk({ size: 40, color: accent }),
          ),
        ),
        // One-liner
        el(
          'div',
          {
            style: {
              fontFamily: FONT_BODY,
              fontSize: '28px',
              fontWeight: 400,
              color: brandColours.textMuted,
              lineHeight: 1.4,
              maxWidth: '900px',
              display: 'flex',
            },
          },
          cleanOneLiner,
        ),
      ),
      // Footer: wordmark + URL
      el(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '48px',
            borderTop: `1px solid ${brandColours.rule}`,
          },
        },
        wordmark({ size: 32, color: brandColours.ink }),
        el(
          'div',
          {
            style: {
              fontFamily: FONT_MONO,
              fontSize: '16px',
              fontWeight: 500,
              color: brandColours.textMuted,
              letterSpacing: '1.6px',
              textTransform: 'uppercase',
              display: 'flex',
            },
          },
          'moresapien.org',
        ),
      ),
    ),
  );
}

// ----- Home card ------------------------------------------------------------
function buildHomeCard() {
  return el(
    'div',
    {
      style: {
        width: `${W}px`,
        height: `${H}px`,
        display: 'flex',
        flexDirection: 'column',
        background: brandColours.paper,
        padding: '88px 96px',
        justifyContent: 'space-between',
      },
    },
    // Top: eyebrow
    el(
      'div',
      {
        style: {
          fontFamily: FONT_MONO,
          fontSize: '20px',
          fontWeight: 500,
          color: brandColours.coral,
          letterSpacing: '2.4px',
          textTransform: 'uppercase',
          display: 'flex',
        },
      },
      'A field guide to the mind',
    ),
    // Centre: wordmark + tagline
    el(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '32px' } },
      wordmark({ size: 140, color: brandColours.ink }),
      el(
        'div',
        {
          style: {
            fontFamily: FONT_DISPLAY,
            fontSize: '36px',
            fontStyle: 'italic',
            fontWeight: 400,
            color: brandColours.textMuted,
            lineHeight: 1.3,
            maxWidth: '880px',
            letterSpacing: '-0.01em',
            display: 'flex',
          },
        },
        'The mental tricks we play on ourselves — and the ones that get played on us.',
      ),
    ),
    // Bottom: url
    el(
      'div',
      {
        style: {
          fontFamily: FONT_MONO,
          fontSize: '16px',
          fontWeight: 500,
          color: brandColours.textMuted,
          letterSpacing: '1.6px',
          textTransform: 'uppercase',
          display: 'flex',
        },
      },
      'moresapien.org',
    ),
  );
}

// ----- Main ----------------------------------------------------------------
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

async function renderToPng(tree) {
  const svg = await satori(tree, { width: W, height: H, fonts });
  return new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    background: brandColours.paper,
  })
    .render()
    .asPng();
}

async function generateEntry(entry) {
  const png = await renderToPng(
    buildEntryCard({
      title: entry.data.title,
      oneLiner: entry.data.oneLiner,
      category: entry.data.category,
    }),
  );
  fs.writeFileSync(path.join(OUTPUT_DIR, `${entry.slug}.png`), png);
}

async function generateHome() {
  const png = await renderToPng(buildHomeCard());
  fs.writeFileSync(path.join(OUTPUT_DIR, 'home.png'), png);
  // Legacy filename used by index.astro until that meta tag is updated.
  fs.writeFileSync(path.join(OUTPUT_DIR, 'homepage.png'), png);
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const entries = readEntries();

  console.log(`\n🖼  OG image generator`);
  console.log('─'.repeat(50));
  console.log(`   Rendering ${entries.length + 1} cards at ${W}x${H}`);

  let okCount = 0;
  const failures = [];

  try {
    await generateHome();
    okCount += 1;
  } catch (err) {
    failures.push({ slug: 'home', message: err.message });
    console.error(`   ✗ home: ${err.message}`);
  }

  for (const entry of entries) {
    try {
      await generateEntry(entry);
      okCount += 1;
    } catch (err) {
      failures.push({ slug: entry.slug, message: err.message });
      console.error(`   ✗ ${entry.slug}: ${err.message}`);
    }
  }

  console.log(`\n   ✅ ${okCount}/${entries.length + 1} OG images written to public/og/`);
  if (failures.length > 0) {
    console.error(`   ❌ ${failures.length} failures`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

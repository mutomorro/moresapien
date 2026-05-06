#!/usr/bin/env node

// ============================================
// Moresapien - Build-time Graph Engine
// ============================================
// Reads all entry markdown files, constructs the concept graph,
// validates links, outputs graph-data.json, and prints an
// editorial report to the console.
//
// Run: node scripts/build-graph.mjs
// Or automatically via the "prebuild" script in package.json.

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// -------------------------------------------------
// Config
// -------------------------------------------------
const ENTRIES_DIR = path.resolve('src/content/entries');
const COLLECTIONS_DIR = path.resolve('src/content/collections');
const OUTPUT_PATH = path.resolve('public/graph-data.json');

// Category colours - mirror src/utils/categoryColors.ts so the
// visualisation doesn't need to import TypeScript.
const CATEGORY_COLOURS = {
  'Cognitive Bias':           '#3559B0',
  'Logical Fallacy':          '#E8A533',
  'Rhetorical Device':        '#8B5CF6',
  'Mental Model':             '#B54A2A',
  'Systems Thinking':         '#7A8B3A',
  'Political Theory':         '#2A8A8A',
  'Manipulation Tactic':      '#C44A8A',
  'Psychological Phenomenon': '#7A3A5E',
  'Psychological Defence':    '#26467D',
};

// -------------------------------------------------
// Helpers
// -------------------------------------------------
function slugFromFilename(filename) {
  return filename.replace(/\.md$/, '');
}

function readMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const filepath = path.join(dir, filename);
      const raw = fs.readFileSync(filepath, 'utf-8');
      const { data } = matter(raw);
      return { filename, slug: slugFromFilename(filename), data };
    });
}

// -------------------------------------------------
// 1. Read all entries
// -------------------------------------------------
const entryFiles = readMarkdownFiles(ENTRIES_DIR);
const slugSet = new Set(entryFiles.map((e) => e.slug));

console.log(`\n📊 Moresapien Graph Engine`);
console.log(`${'─'.repeat(50)}`);
console.log(`   Found ${entryFiles.length} entries in ${ENTRIES_DIR}\n`);

// -------------------------------------------------
// 2. Build nodes
// -------------------------------------------------
const nodes = entryFiles.map((entry) => ({
  slug: entry.slug,
  title: entry.data.title,
  category: entry.data.category,
  colour: CATEGORY_COLOURS[entry.data.category] || '#999999',
  oneLiner: entry.data.oneLiner,
  tags: entry.data.tags || [],
}));

// -------------------------------------------------
// 3. Build edges (deduplicated)
// -------------------------------------------------
// We store every directional link first, then deduplicate
// into unique pairs. For each pair, we keep notes from
// whichever side(s) provided them.

const directionalLinks = [];
const validation = {
  brokenLinks: [],
  selfLinks: [],
  missingReverseLinks: [],
  orphans: [],
};

for (const entry of entryFiles) {
  const related = entry.data.relatedConcepts || [];

  for (const rel of related) {
    // Self-link check
    if (rel.slug === entry.slug) {
      validation.selfLinks.push({
        entry: entry.slug,
        message: `"${entry.data.title}" links to itself`,
      });
      continue;
    }

    // Broken link check
    if (!slugSet.has(rel.slug)) {
      validation.brokenLinks.push({
        entry: entry.slug,
        target: rel.slug,
        message: `"${entry.data.title}" links to "${rel.slug}" which doesn't exist`,
      });
      continue;
    }

    directionalLinks.push({
      source: entry.slug,
      target: rel.slug,
      note: rel.note || null,
    });
  }
}

// Deduplicate into unique edges
// Key = alphabetically sorted pair, so A-B and B-A become the same edge
const edgeMap = new Map();

for (const link of directionalLinks) {
  const [a, b] = [link.source, link.target].sort();
  const key = `${a}::${b}`;

  if (!edgeMap.has(key)) {
    edgeMap.set(key, {
      source: a,
      target: b,
      notes: {},
    });
  }

  const edge = edgeMap.get(key);
  if (link.note) {
    edge.notes[link.source] = link.note;
  }
}

const edges = Array.from(edgeMap.values()).map((edge) => {
  // Flatten notes into a simpler structure for the JSON
  const notesList = Object.entries(edge.notes).map(([from, text]) => ({
    from,
    text,
  }));
  return {
    source: edge.source,
    target: edge.target,
    notes: notesList.length > 0 ? notesList : undefined,
  };
});

// -------------------------------------------------
// 4. Detect missing reverse links
// -------------------------------------------------
// A links to B, but B doesn't link back to A
const linkPairs = new Set();
for (const link of directionalLinks) {
  linkPairs.add(`${link.source}::${link.target}`);
}

for (const link of directionalLinks) {
  const reverse = `${link.target}::${link.source}`;
  if (!linkPairs.has(reverse)) {
    validation.missingReverseLinks.push({
      source: link.source,
      target: link.target,
      message: `"${link.source}" → "${link.target}" but not the other way`,
    });
  }
}

// -------------------------------------------------
// 5. Detect orphan entries (zero connections)
// -------------------------------------------------
const connectedSlugs = new Set();
for (const link of directionalLinks) {
  connectedSlugs.add(link.source);
  connectedSlugs.add(link.target);
}
for (const entry of entryFiles) {
  if (!connectedSlugs.has(entry.slug)) {
    validation.orphans.push({
      entry: entry.slug,
      message: `"${entry.data.title}" has no connections`,
    });
  }
}

// -------------------------------------------------
// 6. Compute connection counts per node
// -------------------------------------------------
const connectionCounts = {};
for (const entry of entryFiles) {
  connectionCounts[entry.slug] = 0;
}
for (const link of directionalLinks) {
  connectionCounts[link.source] = (connectionCounts[link.source] || 0) + 1;
  // Also count inbound connections (even if not reciprocated)
  connectionCounts[link.target] = (connectionCounts[link.target] || 0) + 1;
}

// Add connection count to nodes
for (const node of nodes) {
  node.connections = connectionCounts[node.slug] || 0;
}

// -------------------------------------------------
// 7. Suggested connections (share 3+ tags, not linked)
// -------------------------------------------------
const suggestions = [];
const nodesBySlug = Object.fromEntries(nodes.map((n) => [n.slug, n]));

for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i];
    const b = nodes[j];
    const key = `${[a.slug, b.slug].sort().join('::')}`;

    // Skip if already connected
    if (edgeMap.has(key)) continue;

    // Count shared tags
    const sharedTags = a.tags.filter((t) => b.tags.includes(t));
    if (sharedTags.length >= 3) {
      suggestions.push({
        a: a.slug,
        b: b.slug,
        sharedTags,
        message: `"${a.title}" and "${b.title}" share ${sharedTags.length} tags (${sharedTags.join(', ')}) but aren't linked`,
      });
    }
  }
}

// Sort suggestions by shared tag count (most first)
suggestions.sort((a, b) => b.sharedTags.length - a.sharedTags.length);

// -------------------------------------------------
// 8. Read collections (for future use)
// -------------------------------------------------
const collectionFiles = readMarkdownFiles(COLLECTIONS_DIR);
const collections = collectionFiles.map((c) => ({
  slug: c.slug,
  title: c.data.title,
  type: c.data.type,
  entries: c.data.collectionEntries || [],
}));

// -------------------------------------------------
// 9. Category distribution
// -------------------------------------------------
const categoryDistribution = {};
for (const node of nodes) {
  categoryDistribution[node.category] = (categoryDistribution[node.category] || 0) + 1;
}

// -------------------------------------------------
// 10. Hub concepts (most connected)
// -------------------------------------------------
const hubs = [...nodes]
  .sort((a, b) => b.connections - a.connections)
  .slice(0, 10);

// -------------------------------------------------
// 11. Output graph-data.json
// -------------------------------------------------
const graphData = {
  nodes,
  edges,
  collections,
  categoryColours: CATEGORY_COLOURS,
  meta: {
    totalEntries: nodes.length,
    totalConnections: edges.length,
    totalCollections: collections.length,
    categoryDistribution,
    buildTimestamp: new Date().toISOString(),
  },
};

// Ensure public/ directory exists
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(graphData, null, 2), 'utf-8');
console.log(`✅ Graph data written to ${OUTPUT_PATH}`);
console.log(`   ${nodes.length} nodes, ${edges.length} edges, ${collections.length} collections\n`);

// -------------------------------------------------
// 12. Editorial report
// -------------------------------------------------
console.log(`📋 Editorial Report`);
console.log(`${'─'.repeat(50)}`);

// Category distribution
console.log(`\n📂 Category distribution:`);
const sortedCategories = Object.entries(categoryDistribution)
  .sort((a, b) => b[1] - a[1]);
for (const [cat, count] of sortedCategories) {
  const bar = '█'.repeat(count);
  console.log(`   ${cat.padEnd(25)} ${String(count).padStart(3)} ${bar}`);
}

// Hub concepts
console.log(`\n🔗 Most connected concepts (top 10):`);
for (const hub of hubs) {
  console.log(`   ${hub.title.padEnd(35)} ${hub.connections} connections`);
}

// Broken links
if (validation.brokenLinks.length > 0) {
  console.log(`\n❌ Broken links (${validation.brokenLinks.length}):`);
  for (const item of validation.brokenLinks) {
    console.log(`   ${item.message}`);
  }
} else {
  console.log(`\n✅ No broken links`);
}

// Self-links
if (validation.selfLinks.length > 0) {
  console.log(`\n🔄 Self-links (${validation.selfLinks.length}):`);
  for (const item of validation.selfLinks) {
    console.log(`   ${item.message}`);
  }
} else {
  console.log(`✅ No self-links`);
}

// Missing reverse links
if (validation.missingReverseLinks.length > 0) {
  console.log(`\n↩️  One-way links (${validation.missingReverseLinks.length}):`);
  for (const item of validation.missingReverseLinks) {
    console.log(`   ${item.message}`);
  }
} else {
  console.log(`✅ All links are bidirectional`);
}

// Orphans
if (validation.orphans.length > 0) {
  console.log(`\n🏝️  Orphan entries (${validation.orphans.length}):`);
  for (const item of validation.orphans) {
    console.log(`   ${item.message}`);
  }
} else {
  console.log(`✅ No orphan entries`);
}

// Suggested connections
if (suggestions.length > 0) {
  console.log(`\n💡 Suggested connections (share 3+ tags but aren't linked):`);
  const showMax = 15;
  for (const sug of suggestions.slice(0, showMax)) {
    console.log(`   ${sug.message}`);
  }
  if (suggestions.length > showMax) {
    console.log(`   ... and ${suggestions.length - showMax} more`);
  }
} else {
  console.log(`\n✅ No obvious missing connections`);
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`Graph build complete.\n`);

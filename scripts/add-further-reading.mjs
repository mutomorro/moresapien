// One-shot: append `furtherReading` to frontmatter of every entry in
// src/content/entries/ that doesn't already have it. Mapping lives in
// scripts/further-reading-mapping.json. Idempotent — re-running is safe.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const entriesDir = path.join(repoRoot, 'src/content/entries');
const mappingPath = path.join(__dirname, 'further-reading-mapping.json');

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

function buildYamlBlock(items) {
  const lines = ['furtherReading:'];
  for (const item of items) {
    // Escape any embedded double-quotes — none expected, but defensive.
    const title = item.title.replace(/"/g, '\\"');
    const url = item.url.replace(/"/g, '\\"');
    lines.push(`  - title: "${title}"`);
    lines.push(`    url: "${url}"`);
  }
  return lines.join('\n');
}

const files = fs.readdirSync(entriesDir).filter((f) => f.endsWith('.md'));
const results = { updated: [], skipped_existing: [], skipped_no_mapping: [], errors: [] };

for (const file of files) {
  const slug = file.replace(/\.md$/, '');
  const items = mapping[slug];
  if (!items) {
    results.skipped_no_mapping.push(slug);
    continue;
  }

  const filePath = path.join(entriesDir, file);
  const raw = fs.readFileSync(filePath, 'utf8');

  // Frontmatter: starts with `---\n`, ends with `\n---\n` (or `\n---` at EOF).
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---(\n|$)/);
  if (!fmMatch) {
    results.errors.push(`${slug}: no frontmatter found`);
    continue;
  }

  const fmBody = fmMatch[1];
  if (/^furtherReading\s*:/m.test(fmBody)) {
    results.skipped_existing.push(slug);
    continue;
  }

  const block = buildYamlBlock(items);
  const newFmBody = fmBody.replace(/\s*$/, '') + '\n' + block;
  const newRaw = raw.replace(fmMatch[0], `---\n${newFmBody}\n---${fmMatch[2]}`);

  fs.writeFileSync(filePath, newRaw, 'utf8');
  results.updated.push(slug);
}

console.log(`updated: ${results.updated.length}`);
console.log(`skipped (already had furtherReading): ${results.skipped_existing.length}`);
if (results.skipped_existing.length) console.log('  ' + results.skipped_existing.join(', '));
console.log(`skipped (no mapping): ${results.skipped_no_mapping.length}`);
if (results.skipped_no_mapping.length) console.log('  ' + results.skipped_no_mapping.join(', '));
if (results.errors.length) {
  console.log(`errors: ${results.errors.length}`);
  for (const e of results.errors) console.log('  ' + e);
  process.exit(1);
}

// Sanity check: mapping keys that didn't match any file.
const fileSlugs = new Set(files.map((f) => f.replace(/\.md$/, '')));
const orphanMappings = Object.keys(mapping).filter((k) => !fileSlugs.has(k));
if (orphanMappings.length) {
  console.log(`\norphan mapping keys (no corresponding entry file): ${orphanMappings.length}`);
  for (const k of orphanMappings) console.log('  ' + k);
}

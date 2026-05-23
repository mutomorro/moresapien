// @ts-check
import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// Tags that appear on only one entry produce thin pages (single card)
// — exclude them from the sitemap. Pages still build and remain reachable;
// they also self-set <meta robots=noindex> via the tag template.
function singletonTagSlugs() {
  const dir = 'src/content/entries';
  const counts = new Map();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const raw = readFileSync(join(dir, file), 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const block = fm[1].match(/^tags:\s*((?:\n\s+-\s.*)+)/m);
    const inline = fm[1].match(/^tags:\s*\[([^\]]*)\]/m);
    const tags = block
      ? [...block[1].matchAll(/-\s*"([^"]+)"/g)].map((m) => m[1])
      : inline
        ? [...inline[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
        : [];
    for (const t of tags) {
      const slug = t.toLowerCase().trim().replace(/\s+/g, '-');
      counts.set(slug, (counts.get(slug) || 0) + 1);
    }
  }
  return new Set([...counts].filter(([, c]) => c <= 1).map(([s]) => s));
}

const singletons = singletonTagSlugs();

// https://astro.build/config
export default defineConfig({
  site: 'https://moresapien.org',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    react(),
    sitemap({
      filter(page) {
        const m = page.match(/\/tag\/([^/]+)\/?$/);
        if (m && singletons.has(m[1])) return false;
        return true;
      },
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});

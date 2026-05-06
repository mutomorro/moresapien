// Moresapien Content Collections Configuration
// Astro 5+ Content Layer API
// ============================================
// This file defines the schema for entries and collections.
// Astro uses these schemas to validate content and generate TypeScript types.
// If you change a schema, restart the dev server or run `npx astro sync`.

import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// -------------------------------------------------
// Categories - the 9-category taxonomy
// -------------------------------------------------
export const CATEGORIES = [
  'Cognitive Bias',
  'Logical Fallacy',
  'Rhetorical Device',
  'Mental Model',
  'Systems Thinking',
  'Political Theory',
  'Manipulation Tactic',
  'Psychological Phenomenon',
  'Psychological Defence',
] as const;

// -------------------------------------------------
// Category colours - mirror src/utils/categoryColors.ts and
// src/styles/global.css. Schools any consumer that imports the
// taxonomy from this config file. Keep in sync.
// -------------------------------------------------
export const CATEGORY_COLOURS: Record<string, string> = {
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
// Entries collection
// -------------------------------------------------
// Each entry is a Markdown file in src/content/entries/
// The filename becomes the slug (e.g. false-dilemma.md -> /false-dilemma)
// The Markdown body contains "What it means" and "In the real world" sections.
// Shorter structured fields live in YAML frontmatter.

const entries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/entries' }),
  schema: z.object({
    title: z.string(),
    oneLiner: z.string(),
    alsoKnownAs: z.array(z.string()).optional(),
    category: z.enum(CATEGORIES),
    tags: z.array(z.string()),
    howToSpotIt: z.string(),
    thoughtToHoldOnto: z.string(),
    whyItMattersNow: z.string().optional(),
    relatedConcepts: z.array(
      z.object({
        slug: z.string(),
        note: z.string().optional(),
      })
    ),
  }),
});

// -------------------------------------------------
// Collections (curated sets of entries)
// -------------------------------------------------
// Each collection is a Markdown file in src/content/collections/
// The Markdown body contains the editorial introduction.
// Structured fields live in YAML frontmatter.

const curatedCollections = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/collections' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['pathway', 'toolkit']),
    audience: z.string(),
    collectionEntries: z.array(z.string()), // slugs referencing entries
    tags: z.array(z.string()),
  }),
});

// -------------------------------------------------
// Export for Astro
// -------------------------------------------------
export const collections = { entries, curatedCollections };
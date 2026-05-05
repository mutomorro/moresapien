// Single source of truth for Moresapien category colours and brand palette.
// Used by [slug].astro, KnowledgeCard.astro, ConnectionMiniMap.astro,
// scripts/generate-og-images.mjs, and scripts/enrich-sitemap.mjs.
// Change a colour here and run `npm run build` - it propagates everywhere.

export const categoryColours = {
  'Cognitive Bias': '#c17f59',
  'Logical Fallacy': '#6a8c69',
  'Rhetorical Device': '#7a8b99',
  'Mental Model': '#8a7a5a',
  'Systems Thinking': '#5a7a8a',
  'Political Theory': '#8a6a7a',
  'Manipulation Tactic': '#b5564e',
  'Psychological Phenomenon': '#7a6699',
  'Psychological Defence': '#4a7a7a',
};

export const brandColours = {
  cream: '#FFFBF5',
  gold: '#C4956A',
  darkGold: '#8B5E3C',
  text: '#2a2520',
  textMuted: '#6a6058',
  textLight: '#8a7f72',
  border: '#e8e0d8',
  thoughtBg: '#f9f5f0',
  connectionLine: '#C4956A',
  relatedDot: '#5DCAA5',
};

// Semantic palette for hand-crafted concept diagrams in
// src/components/diagrams/. Diagrams should never hardcode hex - always
// import from this file so palette changes propagate to every diagram.
export const diagramColours = {
  positive: '#5DCAA5',     // teal - supports, true, passes through, good
  negative: '#F09977',     // coral - contradicts, false, blocked, bad
  positiveDark: '#0F6E56', // dark teal - text on positive fills
  negativeDark: '#993C1D', // dark coral - text on negative fills
  connection: '#C4956A',   // warm gold - lines between things
  highlight: '#8B5E3C',    // dark gold - emphasis, labels
  mutedFill: '#f9f5f0',    // thought box / highlight background
  insightText: '#4a4540',  // closing insight line colour
};

export function getCategoryColour(category) {
  return categoryColours[category] || brandColours.gold;
}

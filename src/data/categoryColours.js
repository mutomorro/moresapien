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

export function getCategoryColour(category) {
  return categoryColours[category] || brandColours.gold;
}

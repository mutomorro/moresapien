// Single source of truth for Moresapien category colours and brand palette.
// Used by KnowledgeCard.astro, ConnectionMiniMap.astro, scripts/generate-og-images.mjs,
// scripts/enrich-sitemap.mjs, and any other build-time consumer that needs raw hex.
//
// Page-level CSS reads tokens from src/styles/global.css instead. That file
// and src/utils/categoryColors.ts are the authoritative source for runtime UI.
// Keep this hex map in sync with both.

export const categoryColours = {
  'Cognitive Bias':           '#3559B0',
  'Logical Fallacy':          '#E8A533',
  'Rhetorical Device':        '#8B5CF6',
  'Mental Model':             '#B54A2A',
  'Systems Thinking':         '#7A8B3A',
  'Political Theory':         '#2F6B3A',
  'Manipulation Tactic':      '#C44A8A',
  'Psychological Phenomenon': '#7A3A5E',
  'Psychological Defence':    '#26467D',
  'Cultural Influence':       '#1A7A7A'
};

export const brandColours = {
  paper:          '#F5F1E8',
  cream:          '#F5F1E8',  // alias retained for legacy callers
  ink:            '#15140F',
  text:           '#15140F',
  textMuted:      '#6B6655',
  textLight:      '#8a8270',
  border:         '#DCD5C2',
  rule:           '#DCD5C2',
  white:          '#FFFFFF',
  coral:          '#FF5D4A',
  mint:           '#6FE8B0',
  thoughtBg:      '#FFFFFF',
  connectionLine: '#6B6655',
  relatedDot:     '#6FE8B0',
  /* Legacy keys retained so existing components don't break before we sweep them */
  gold:           '#FF5D4A',
  darkGold:       '#FF5D4A',
};

// Semantic palette for hand-crafted concept diagrams in src/components/diagrams/.
// Diagrams should always import from this file so palette changes propagate.
export const diagramColours = {
  positive:     '#6FE8B0',
  negative:     '#FF5D4A',
  positiveDark: '#0F6E56',
  negativeDark: '#993C1D',
  connection:   '#6B6655',
  highlight:    '#15140F',
  mutedFill:    '#FFFFFF',
  insightText:  '#15140F',
};

export function getCategoryColour(category) {
  return categoryColours[category] || brandColours.coral;
}

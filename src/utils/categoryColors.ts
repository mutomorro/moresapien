/* Moresapien · Category colour utility
 *
 * Maps the 9-category taxonomy to CSS custom-property references.
 * The values themselves live in src/styles/global.css and may be themed
 * server-side or in print contexts; resolve to hex via getCategoryColorHex().
 *
 * Used everywhere a category needs a colour - cards, eyebrows, page accents,
 * graph nodes, OG images. */

export const categoryColorMap: Record<string, string> = {
  'Cognitive Bias':            'var(--ms-cat-cognitive-bias)',
  'Logical Fallacy':           'var(--ms-cat-logical-fallacy)',
  'Psychological Phenomenon':  'var(--ms-cat-psych-phenomenon)',
  'Psychological Defence':     'var(--ms-cat-psych-defence)',
  'Manipulation Tactic':       'var(--ms-cat-manipulation)',
  'Rhetorical Device':         'var(--ms-cat-rhetorical)',
  'Systems Thinking':          'var(--ms-cat-systems)',
  'Mental Model':              'var(--ms-cat-mental-model)',
  'Political Theory':          'var(--ms-cat-political-theory)',
};

export const categoryColorHexMap: Record<string, string> = {
  'Cognitive Bias':            '#3559B0',
  'Logical Fallacy':           '#E8A533',
  'Psychological Phenomenon':  '#7A3A5E',
  'Psychological Defence':     '#26467D',
  'Manipulation Tactic':       '#C44A8A',
  'Rhetorical Device':         '#8B5CF6',
  'Systems Thinking':          '#7A8B3A',
  'Mental Model':              '#B54A2A',
  'Political Theory':          '#2A8A8A',
};

export function getCategoryColor(category: string): string {
  return categoryColorMap[category] || 'var(--ms-mute)';
}

export function getCategoryColorHex(category: string): string {
  return categoryColorHexMap[category] || '#6B6655';
}

/* The category colour palette is brand-secondary - never use coral (#FF5D4A)
 * or mint (#6FE8B0) as a category. Those are reserved for primary brand uses. */
export const CATEGORIES = [
  'Cognitive Bias',
  'Logical Fallacy',
  'Psychological Phenomenon',
  'Psychological Defence',
  'Manipulation Tactic',
  'Rhetorical Device',
  'Systems Thinking',
  'Mental Model',
  'Political Theory',
] as const;

export type Category = typeof CATEGORIES[number];

/* Saffron (#E8A533) fails WCAG AA against white. Use ink for text on saffron. */
export function getCategoryTextColor(category: string): string {
  if (category === 'Logical Fallacy') return 'var(--ms-ink)';
  return 'var(--ms-white)';
}

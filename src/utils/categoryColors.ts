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
  'Cultural Influence':        'var(--ms-cat-cultural-influence)',
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
  'Political Theory':          '#2F6B3A',
  'Cultural Influence':        '#1A7A7A',
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
  'Cultural Influence',
] as const;

export type Category = typeof CATEGORIES[number];

/* Saffron (#E8A533) fails WCAG AA against white. Use ink for text on saffron. */
export function getCategoryTextColor(category: string): string {
  if (category === 'Logical Fallacy') return 'var(--ms-ink)';
  return 'var(--ms-white)';
}

/* ---- Category slugs (URLs) ----------------------------------------------
 * Explicit map - never derive from the name at request time. Slugs are part
 * of the URL contract; renaming a category should not silently change them. */
export const categorySlugMap: Record<string, string> = {
  'Cognitive Bias':            'cognitive-bias',
  'Logical Fallacy':           'logical-fallacy',
  'Rhetorical Device':         'rhetorical-device',
  'Manipulation Tactic':       'manipulation-tactic',
  'Mental Model':              'mental-model',
  'Psychological Phenomenon':  'psychological-phenomenon',
  'Psychological Defence':     'psychological-defence',
  'Systems Thinking':          'systems-thinking',
  'Political Theory':          'political-theory',
  'Cultural Influence':        'cultural-influence',
};

export function getCategorySlug(category: string): string {
  return categorySlugMap[category] || '';
}

export function getCategoryFromSlug(slug: string): Category | undefined {
  const entry = Object.entries(categorySlugMap).find(([, s]) => s === slug);
  return entry ? (entry[0] as Category) : undefined;
}

/* ---- Category descriptions (intros + meta descriptions) ------------------ */
export const categoryDescriptions: Record<string, string> = {
  'Cognitive Bias':            'Systematic patterns in how we judge, remember and decide - the predictable ways our thinking diverges from logic.',
  'Logical Fallacy':           'Errors in reasoning that make an argument feel sound when it isn\'t - from straw men to slippery slopes.',
  'Rhetorical Device':         'Techniques speakers and writers use to persuade - useful, neutral and sometimes manipulative.',
  'Manipulation Tactic':       'Deliberate strategies for bending someone\'s perception, decisions or behaviour - often without their awareness.',
  'Mental Model':              'Frameworks for understanding how the world works - tools for clearer thinking and better decisions.',
  'Psychological Phenomenon':  'Recurring patterns in how minds behave - observed effects that shape how we feel, act and relate to others.',
  'Psychological Defence':     'Mental strategies the mind uses to protect itself from anxiety, shame or threat - sometimes helpful, often invisible.',
  'Systems Thinking':          'Ways of seeing complex wholes - how parts interact, feed back and produce behaviour no single piece explains.',
  'Political Theory':          'Frameworks for understanding power, authority and how societies organise - the ideas that shape what\'s possible.',
  'Cultural Influence':        'The water we swim in - shared assumptions, norms and patterns that shape thought without announcing themselves.',
};

export function getCategoryDescription(category: string): string {
  return categoryDescriptions[category] || '';
}

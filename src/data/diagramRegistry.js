// Registry of hand-crafted concept diagrams.
// Add an entry here as each diagram component is created in
// src/components/diagrams/. The entry-page template ([slug].astro) reads
// this registry: if a slug has an entry, the diagram replaces the
// auto-generated knowledge card. If not, the knowledge card is shown.
//
// Pattern:
//   'slug': () => import('../components/diagrams/slug.astro')
//
// Use a slug that exactly matches the entry filename (without `.md`).
// The component should accept a `category` prop and import its colours
// from `./categoryColours.js` so palette changes propagate everywhere.

export const diagrams = {
  // Example - uncomment when the component lands:
  // 'confirmation-bias': () => import('../components/diagrams/confirmation-bias.astro'),
};

export function hasDiagram(slug) {
  return Object.prototype.hasOwnProperty.call(diagrams, slug);
}

export async function loadDiagram(slug) {
  if (!hasDiagram(slug)) return null;
  const mod = await diagrams[slug]();
  return mod.default;
}

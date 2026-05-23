import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const entries = await getCollection('entries');

  const index = entries
    .map((entry) => ({
      slug: entry.id,
      title: entry.data.title,
      oneLiner: entry.data.oneLiner,
      category: entry.data.category,
      tags: entry.data.tags ?? [],
      alsoKnownAs: entry.data.alsoKnownAs ?? [],
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
};

import { algorithm } from "@/lib/content/concepts/algorithm";
import { clinical } from "@/lib/content/concepts/clinical";
import { opening } from "@/lib/content/concepts/opening";
import type { Concept } from "@/lib/content/types";

/** Concept pages, in the order they should be read. */
export const concepts: Concept[] = [...opening, ...algorithm, ...clinical];

export function conceptBySlug(slug: string): Concept | undefined {
  return concepts.find((concept) => concept.slug === slug);
}

export function conceptNeighbors(slug: string): { previous?: Concept; next?: Concept } {
  const index = concepts.findIndex((concept) => concept.slug === slug);
  if (index < 0) return {};
  return {
    previous: index > 0 ? concepts[index - 1] : undefined,
    next: index < concepts.length - 1 ? concepts[index + 1] : undefined,
  };
}

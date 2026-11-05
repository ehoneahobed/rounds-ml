"use client";

import Link from "next/link";
import { BlockView } from "@/components/block-view";
import { Button } from "@/components/ui/button";
import { conceptNeighbors, concepts } from "@/lib/content/concepts";
import type { Concept } from "@/lib/content/types";
import { loadProgress, saveProgress, useStudyProgress } from "@/lib/progress";

/** One concept page, with a local "I read this" mark. */
export function ConceptArticle({ concept }: { concept: Concept }) {
  const progress = useStudyProgress();
  const neighbors = conceptNeighbors(concept.slug);
  const read = progress.conceptsRead.includes(concept.slug);

  function markRead() {
    if (read) return;
    const current = loadProgress();
    saveProgress({ ...current, conceptsRead: [...current.conceptsRead, concept.slug] });
  }

  return (
    <article>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Concept {concept.number} of {String(concepts.length).padStart(2, "0")} · {concept.minutes} min
      </p>
      <h1 className="mt-2 max-w-3xl font-serif text-4xl tracking-tight text-ink sm:text-5xl">{concept.title}</h1>
      <p className="mt-3 max-w-3xl text-lg text-muted">{concept.summary}</p>
      <div className="mt-6 max-w-3xl">
        <BlockView blocks={concept.blocks} />
      </div>
      <div className="no-print mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        {neighbors.previous ? (
          <Button variant="outline" asChild>
            <Link href={`/concepts/${neighbors.previous.slug}`}>Previous · {neighbors.previous.title}</Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/">Back to the project</Link>
          </Button>
        )}
        <Button type="button" onClick={markRead} disabled={read} variant={read ? "outline" : "default"}>
          {read ? "Marked as read" : "Mark as read"}
        </Button>
        {neighbors.next ? (
          <Button asChild>
            <Link href={`/concepts/${neighbors.next.slug}`}>Next · {neighbors.next.title}</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/quiz">On to the knowledge check</Link>
          </Button>
        )}
      </div>
    </article>
  );
}

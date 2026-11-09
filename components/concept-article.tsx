"use client";

import Link from "next/link";
import { BlockView } from "@/components/block-view";
import { Button } from "@/components/ui/button";
import type { Concept } from "@/lib/content/types";
import { contentFor } from "@/lib/module-content";
import { useModule } from "@/lib/module-context";
import { moduleHref } from "@/lib/modules";
import { loadProgress, saveProgress, useStudyProgress } from "@/lib/progress";

/** One concept page, with a local "I read this" mark. */
export function ConceptArticle({ concept }: { concept: Concept }) {
  const module = useModule();
  const content = contentFor(module);
  const progress = useStudyProgress();
  const neighbors = content.conceptNeighbors(concept.slug);
  const read = progress.conceptsRead.includes(concept.slug);

  function markRead() {
    if (read) return;
    const current = loadProgress(module.storageKey);
    saveProgress({ ...current, conceptsRead: [...current.conceptsRead, concept.slug] }, module.storageKey);
  }

  return (
    <article>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Concept {concept.number} of {String(content.concepts.length).padStart(2, "0")} · {concept.minutes} min
      </p>
      <h1 className="mt-2 max-w-3xl font-serif text-4xl tracking-tight text-ink sm:text-5xl">{concept.title}</h1>
      <p className="mt-3 max-w-3xl text-lg text-muted">{concept.summary}</p>
      <div className="mt-6 max-w-3xl">
        <BlockView blocks={concept.blocks} />
      </div>
      <div className="no-print mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        {neighbors.previous ? (
          <Button variant="outline" asChild>
            <Link href={moduleHref(module, `/concepts/${neighbors.previous.slug}`)}>Previous · {neighbors.previous.title}</Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href={moduleHref(module, "/")}>Back to the project</Link>
          </Button>
        )}
        <Button type="button" onClick={markRead} disabled={read} variant={read ? "outline" : "default"}>
          {read ? "Marked as read" : "Mark as read"}
        </Button>
        {neighbors.next ? (
          <Button asChild>
            <Link href={moduleHref(module, `/concepts/${neighbors.next.slug}`)}>Next · {neighbors.next.title}</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href={moduleHref(module, "/quiz")}>On to the knowledge check</Link>
          </Button>
        )}
      </div>
    </article>
  );
}

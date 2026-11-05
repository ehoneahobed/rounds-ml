"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { loadProgress, saveProgress, useStudyProgress, wardNoteComplete, type WardNote } from "@/lib/progress";

const EMPTY: WardNote = { refused: "", threshold: "", failure: "", computedByHand: false };

/** The manual half of the review. Stored in this browser, not scored by a model. */
export function WardNoteForm() {
  const progress = useStudyProgress();
  const [draft, setDraft] = useState<WardNote | null>(null);
  const [saved, setSaved] = useState(false);
  const note = draft ?? progress.wardNote ?? EMPTY;

  function update(partial: Partial<WardNote>) {
    setDraft({ ...note, ...partial });
    setSaved(false);
  }

  function save() {
    const current = loadProgress();
    saveProgress({ ...current, wardNote: note });
    setSaved(true);
  }

  const complete = wardNoteComplete(note);

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Manual review · your word</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Ward note</h1>
      <p className="mt-3 text-lg leading-relaxed">
        Write this the way you would open a model review. Three short answers, each at least a sentence, and an honest tick that you computed a split by hand. Nothing here is uploaded.
      </p>
      <form
        className="mt-8 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <Field
          label="Which columns did you refuse, and what decision time made them illegal?"
          value={note.refused}
          onChange={(refused) => update({ refused })}
        />
        <Field
          label="Where did the threshold come from, and what sensitivity were you buying?"
          value={note.threshold}
          onChange={(threshold) => update({ threshold })}
        />
        <Field
          label="Name one way this tree fails on a real ward."
          value={note.failure}
          onChange={(failure) => update({ failure })}
        />
        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <input
            type="checkbox"
            className="mt-1"
            checked={note.computedByHand}
            onChange={(event) => update({ computedByHand: event.target.checked })}
          />
          <span>I computed at least one split by hand, including the weights, before I trusted the editor.</span>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">
            Save the note
          </Button>
          <p className="text-sm text-muted">
            {saved ? (complete ? "Saved. This finishes the manual part of the module." : "Saved. Each answer needs at least 40 characters, and the box needs a tick, before the checklist marks it done.") : "Not saved yet."}
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <textarea
        className="mt-2 min-h-28 w-full border border-line bg-white/50 px-3 py-2 leading-relaxed"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

"use client";

import Link from "next/link";
import { contentFor } from "@/lib/module-content";
import { useModule } from "@/lib/module-context";
import { moduleHref, type ModuleId } from "@/lib/modules";
import { useStudyProgress, wardNoteComplete } from "@/lib/progress";

const LEADS: Record<ModuleId, string> = {
  introduction:
    "A map before the hike: what machine learning is, how the paradigms differ, and why the next modules build in this order. Examples come from several domains on purpose.",
  "linear-regression":
    "Predict a number with a line. Same tool whether the label is price, delay, score, or—in this module’s project—length of stay.",
  "logistic-regression":
    "Keep the linear score, push it through a sigmoid, and get a probability for a yes/no label. The project is a binary risk score.",
  "decision-trees":
    "Answer a classification question with a flowchart of questions instead of weights—then compare that shape to the logistic score.",
  "random-forests":
    "Bag many trees on bootstrap samples, keep them different with random features, and vote. The project is the same early-warning question as the single tree.",
};

/**
 * Module landing page: same calm single-column rhythm as the site home.
 * Work items stack as one list—no side-by-side dashboard.
 */
export function ModuleHome() {
  const active = useModule();
  const content = contentFor(active);
  const progress = useStudyProgress();
  const read = new Set(progress.conceptsRead);
  const passed = new Set(progress.tasksPassed);
  const conceptsRead = content.concepts.filter((concept) => read.has(concept.slug)).length;
  const points = content.tasks.filter((task) => passed.has(task.slug)).reduce((sum, task) => sum + task.points, 0);
  const noteDone = wardNoteComplete(progress.wardNote);

  const progressBits = [
    `${conceptsRead}/${content.concepts.length} concepts`,
    progress.quizBest === null ? "check not taken" : `check ${progress.quizBest}/${content.questions.length}`,
  ];
  if (content.tasks.length > 0) {
    progressBits.push(`${points}/${content.totalPoints} pts`);
  }
  if (active.hasWardNote) {
    progressBits.push(noteDone ? "ward note done" : "ward note open");
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{active.code}</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">{active.title}</h1>
      <p className="mt-3 text-lg leading-relaxed">{LEADS[active.id]}</p>
      <p className="mt-4 text-sm text-muted">{progressBits.join(" · ")}</p>

      <ul className="mt-10 divide-y divide-line border-y border-line">
        {content.concepts.map((concept) => (
          <li key={concept.slug}>
            <Link href={moduleHref(active, `/concepts/${concept.slug}`)} className="block py-6 hover:bg-secondary/40">
              <p className="font-mono text-xs text-muted">
                Concept {concept.number} · {concept.minutes} min · {read.has(concept.slug) ? "read" : "unread"}
              </p>
              <p className="mt-1 font-serif text-3xl tracking-tight">{concept.title}</p>
              <p className="mt-2 text-base leading-relaxed text-muted">{concept.summary}</p>
              <p className="mt-3 text-sm font-semibold text-green">Open →</p>
            </Link>
          </li>
        ))}

        <li>
          <Link href={moduleHref(active, "/quiz")} className="block py-6 hover:bg-secondary/40">
            <p className="font-mono text-xs text-muted">
              Pass mark {content.passMark}
              {progress.quizBest === null ? "" : ` · best ${progress.quizBest}/${content.questions.length}`}
            </p>
            <p className="mt-1 font-serif text-3xl tracking-tight">Knowledge check</p>
            <p className="mt-2 text-base leading-relaxed text-muted">
              {content.questions.length} questions after the concept pages.
            </p>
            <p className="mt-3 text-sm font-semibold text-green">
              {progress.quizPassed ? "Review the check →" : "Open the check →"}
            </p>
          </Link>
        </li>

        {content.tasks.map((task) => (
          <li key={task.slug}>
            <Link href={moduleHref(active, `/tasks/${task.slug}`)} className="block py-6 hover:bg-secondary/40">
              <p className="font-mono text-xs text-muted">
                Task {task.number} · {task.points} pts · {passed.has(task.slug) ? "passed" : "open"}
              </p>
              <p className="mt-1 font-serif text-3xl tracking-tight">{task.title}</p>
              <p className="mt-2 text-base leading-relaxed text-muted">{task.summary}</p>
              <p className="mt-3 text-sm font-semibold text-green">{passed.has(task.slug) ? "Review →" : "Open →"}</p>
            </Link>
          </li>
        ))}

        {active.hasWardNote ? (
          <li>
            <Link href={moduleHref(active, "/note")} className="block py-6 hover:bg-secondary/40">
              <p className="font-mono text-xs text-muted">{noteDone ? "done" : "manual review"}</p>
              <p className="mt-1 font-serif text-3xl tracking-tight">Ward note</p>
              <p className="mt-2 text-base leading-relaxed text-muted">
                What you refused, what you froze, and one honest failure mode. Stays in this browser.
              </p>
              <p className="mt-3 text-sm font-semibold text-green">{noteDone ? "Review the note →" : "Write the note →"}</p>
            </Link>
          </li>
        ) : null}

        {active.lab ? (
          <li>
            <Link href={moduleHref(active, "/lab")} className="block py-6 hover:bg-secondary/40">
              <p className="font-mono text-xs text-muted">Optional</p>
              <p className="mt-1 font-serif text-3xl tracking-tight">
                {active.lab === "line"
                  ? "Line lab"
                  : active.lab === "sigmoid"
                    ? "Sigmoid lab"
                    : active.lab === "forest"
                      ? "Forest lab"
                      : "Tree lab"}
              </p>
              <p className="mt-2 text-base leading-relaxed text-muted">
                {active.lab === "line"
                  ? "Drag slope and intercept on the teaching patients."
                  : active.lab === "sigmoid"
                    ? "Drag a score on the S-curve and move the threshold."
                    : active.lab === "forest"
                      ? "Watch several trees vote, then read the majority and mean probability."
                      : "Open the teaching tree and walk a patient down the branches."}
              </p>
              <p className="mt-3 text-sm font-semibold text-green">Open the lab →</p>
            </Link>
          </li>
        ) : null}
      </ul>

      <p className="mt-8 text-sm text-muted">
        <Link href="/" className="font-semibold text-green hover:underline">
          All modules
        </Link>
      </p>
    </div>
  );
}

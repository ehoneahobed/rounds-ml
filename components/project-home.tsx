"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { concepts } from "@/lib/content/concepts";
import { PASS_MARK, questions } from "@/lib/content/quiz";
import { LEVEL_LABELS, TOTAL_POINTS, tasks } from "@/lib/content/tasks";
import { useStudyProgress, wardNoteComplete } from "@/lib/progress";

/** The project brief: concepts, the check, and the task list, with local progress. */
export function ProjectHome() {
  const progress = useStudyProgress();

  const conceptMinutes = concepts.reduce((sum, concept) => sum + concept.minutes, 0);
  const taskMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  const hours = Math.round((conceptMinutes + 60 + taskMinutes) / 60);
  const read = new Set(progress.conceptsRead);
  const passed = new Set(progress.tasksPassed);
  const points = tasks.filter((task) => passed.has(task.slug)).reduce((sum, task) => sum + task.points, 0);
  const noteDone = wardNoteComplete(progress.wardNote);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)]">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green">0x01 · auto-checked · about {hours} hours · {TOTAL_POINTS} points</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">Decision trees, properly</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink">
          A from-scratch classification tree, then the habits that keep a clinical table honest: what was known at hour 6, which patients belong in the future, and which threshold you would actually alarm on.
        </p>
        <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-line py-4 text-sm">
          <div>
            <dt className="text-muted">Concepts read</dt>
            <dd className="mt-1 font-mono text-lg">
              {concepts.filter((concept) => read.has(concept.slug)).length}/{concepts.length}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Check</dt>
            <dd className="mt-1 font-mono text-lg">{progress.quizBest === null ? "—" : `${progress.quizBest}/${questions.length}`}</dd>
          </div>
          <div>
            <dt className="text-muted">Task points</dt>
            <dd className="mt-1 font-mono text-lg">
              {points}/{TOTAL_POINTS}
            </dd>
          </div>
        </dl>
        <h2 className="mt-8 font-serif text-2xl">How this project is shaped</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[1.02rem] leading-relaxed">
          <li>Ten concept pages. Stop and compute when a page asks. The benches are there so you can change a count and see the formula move.</li>
          <li>
            A knowledge check, {questions.length} questions, {PASS_MARK} to pass. It is not a lock on the tasks. It is how you find out you skipped the weights.
          </li>
          <li>Eleven tasks. Level 0 is impurity. Level 1 is the tree. Level 2 is leakage, time, and the operating point. Level 3 is the hour-6 model.</li>
          <li>A ward note, in your own words, stored only in this browser. That is the manual part of the review.</li>
        </ol>
        <aside className="mt-6 border-l-4 border-green bg-green-soft px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]">Mentor note</p>
          <p className="mt-2 leading-relaxed">
            The failure mode this module is built against is spending weeks near a concept and never finishing a split. Implement the functions. When a check fails, read the detail line before you rewrite the whole file. The reference solution is in the repository so the checks stay honest. Do the task before you open it.
          </p>
        </aside>
        <h2 className="mt-8 font-serif text-2xl">Rules</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
          <li>Numeric features only. No scikit-learn in the checker.</li>
          <li>Checks run in your browser. Drafts stay in local storage.</li>
          <li>Later tasks prepend the code you saved on earlier ones. The file you are editing wins if both define the same name.</li>
          <li>Match the contracts. Ties, empty inputs, and the hour-6 screen are specified because two correct solutions should grow the same tree.</li>
          <li>The admissions are synthetic. Do not paste a real chart into the editor.</li>
        </ul>
        <h2 className="mt-8 font-serif text-2xl">Module checklist</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <Check done={read.size === concepts.length} label="All concept pages marked read" />
          <Check done={progress.quizPassed} label={`Knowledge check at ${PASS_MARK} or better`} />
          <Check done={passed.size === tasks.length} label="Every task cleared" />
          <Check done={noteDone} label="Ward note written, including the hand calculation" />
        </ul>
      </section>
      <section className="space-y-8">
        <div>
          <h2 className="font-serif text-2xl">Concepts</h2>
          <ol className="mt-3 divide-y divide-line border-y border-line">
            {concepts.map((concept) => (
              <li key={concept.slug}>
                <Link href={`/concepts/${concept.slug}`} className="flex items-baseline gap-3 py-3 hover:bg-secondary/50">
                  <span className="w-8 font-mono text-sm text-muted">{concept.number}</span>
                  <span className="flex-1">
                    <span className="font-semibold">{concept.title}</span>
                    <span className="mt-0.5 block text-sm text-muted">{concept.summary}</span>
                  </span>
                  <span className="hidden text-sm text-muted sm:inline">{concept.minutes} min</span>
                  {read.has(concept.slug) ? <Badge variant="pass">Read</Badge> : <Badge variant="outline">Unread</Badge>}
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl">Knowledge check</h2>
            <Link href="/quiz" className="text-sm font-semibold text-green">
              {progress.quizPassed ? "Review the check" : "Open the check"}
            </Link>
          </div>
          <p className="mt-2 text-sm text-muted">
            {questions.length} questions. Pass mark {PASS_MARK}. Best score {progress.quizBest === null ? "not taken" : `${progress.quizBest}/${questions.length}`}.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-2xl">Tasks</h2>
          <ol className="mt-3 divide-y divide-line border-y border-line">
            {tasks.map((task) => (
              <li key={task.slug}>
                <Link href={`/tasks/${task.slug}`} className="flex items-start gap-3 py-3 hover:bg-secondary/50">
                  <span className="w-8 pt-0.5 font-mono text-sm text-muted">{task.number}</span>
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold">{task.title}</span>
                    <span className="mt-0.5 block text-sm text-muted">{task.summary}</span>
                    <span className="mt-1 block text-xs uppercase tracking-[0.12em] text-muted">{LEVEL_LABELS[task.level]}</span>
                  </span>
                  <span className="text-right">
                    <span className="block font-mono text-sm">{task.points} pts</span>
                    {passed.has(task.slug) ? <Badge variant="pass">Passed</Badge> : <Badge variant="outline">Open</Badge>}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

function Check({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden className={done ? "text-green" : "text-muted"}>
        {done ? "●" : "○"}
      </span>
      <span>
        {label}
        <span className="sr-only">{done ? ", done" : ", not yet"}</span>
      </span>
    </li>
  );
}

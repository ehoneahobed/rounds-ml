"use client";

import Link from "next/link";
import { LabCard } from "@/components/lab/lab-card";
import { Badge } from "@/components/ui/badge";
import { contentFor } from "@/lib/module-content";
import { useModule } from "@/lib/module-context";
import { LINEAR_REGRESSION, moduleHref } from "@/lib/modules";
import { useStudyProgress, wardNoteComplete } from "@/lib/progress";

/** Project brief for the linear-regression module. */
export function LinearRegressionHome() {
  const module = useModule();
  const content = contentFor(module);
  const progress = useStudyProgress();

  const conceptMinutes = content.concepts.reduce((sum, concept) => sum + concept.minutes, 0);
  const taskMinutes = content.tasks.reduce((sum, task) => sum + task.minutes, 0);
  const hours = Math.round((conceptMinutes + 60 + taskMinutes) / 60);
  const read = new Set(progress.conceptsRead);
  const passed = new Set(progress.tasksPassed);
  const points = content.tasks.filter((task) => passed.has(task.slug)).reduce((sum, task) => sum + task.points, 0);
  const noteDone = wardNoteComplete(progress.wardNote);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)]">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green">
          {LINEAR_REGRESSION.code} · auto-checked · about {hours} hours · {content.totalPoints} points
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">Linear regression</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink">
          Fit a line from scratch and use it to predict length of stay from the vitals and labs known at hour 6. The label is a number of days. The illegal columns are the ones a nurse would not have had yet.
        </p>
        <LabCard />
        <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-line py-4 text-sm">
          <div>
            <dt className="text-muted">Concepts read</dt>
            <dd className="mt-1 font-mono text-lg">
              {content.concepts.filter((concept) => read.has(concept.slug)).length}/{content.concepts.length}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Check</dt>
            <dd className="mt-1 font-mono text-lg">
              {progress.quizBest === null ? "—" : `${progress.quizBest}/${content.questions.length}`}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Task points</dt>
            <dd className="mt-1 font-mono text-lg">
              {points}/{content.totalPoints}
            </dd>
          </div>
        </dl>
        <h2 className="mt-8 font-serif text-2xl">Work through it in this order</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[1.02rem] leading-relaxed">
          <li>Read the {content.concepts.length} concept pages in order—the line, error and fit, several features, then scaling/ridge/shipping. When a page asks you to compute, finish the arithmetic before you continue.</li>
          <li>
            Knowledge check: {content.questions.length} questions, {content.passMark} to pass.
          </li>
          <li>Eleven tasks. Level 0 is error. Level 1 is the line. Level 2 is leakage and time. Level 3 fits the hour-6 length-of-stay model.</li>
          <li>A ward note: the columns you refused, the errors you reported, and one way the line fails. It stays in this browser.</li>
        </ol>
        <h2 className="mt-8 font-serif text-2xl">Requirements</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
          <li>Numeric features only. Implement the fits yourself. The checker has no scikit-learn and no NumPy.</li>
          <li>Checks run in this browser. Drafts stay in local storage.</li>
          <li>Later tasks prepend the code you saved on earlier tasks.</li>
          <li>Follow the contracts on empty inputs, singular systems, and the hour-6 cutoff.</li>
          <li>Train and test on the synthetic admissions in this project.</li>
          <li>
            Finish a task before you open <span className="font-mono text-sm">curriculum/linear_regression/reference_solution.py</span>.
          </li>
        </ul>
        <h2 className="mt-8 font-serif text-2xl">Module checklist</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <Check done={read.size === content.concepts.length} label="All concept pages marked read" />
          <Check done={progress.quizPassed} label={`Knowledge check at ${content.passMark} or better`} />
          <Check done={passed.size === content.tasks.length} label="Every task cleared" />
          <Check done={noteDone} label="Ward note written, including the hand calculation" />
        </ul>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          <Link href="/" className="font-semibold text-green hover:underline">
            All modules
          </Link>
        </p>
      </section>
      <section className="space-y-8">
        <div>
          <h2 className="font-serif text-2xl">Concepts</h2>
          <ol className="mt-3 divide-y divide-line border-y border-line">
            {content.concepts.map((concept) => (
              <li key={concept.slug}>
                <Link href={moduleHref(module, `/concepts/${concept.slug}`)} className="flex gap-3 py-3 hover:bg-secondary/40">
                  <span className="font-mono text-sm text-muted">{concept.number}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{concept.title}</span>
                    <span className="block text-sm text-muted">{concept.summary}</span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-muted">
                    {concept.minutes} min
                    <br />
                    {read.has(concept.slug) ? "Read" : "Unread"}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="font-serif text-2xl">Knowledge check</h2>
          <p className="mt-2 text-sm leading-relaxed">
            {content.questions.length} questions. Pass mark {content.passMark}. Best score{" "}
            {progress.quizBest === null ? "not taken" : `${progress.quizBest}/${content.questions.length}`}.
          </p>
          <Link href={moduleHref(module, "/quiz")} className="mt-3 inline-block font-semibold text-green hover:underline">
            Open the check
          </Link>
        </div>
        <div>
          <h2 className="font-serif text-2xl">Tasks</h2>
          <ol className="mt-3 divide-y divide-line border-y border-line">
            {content.tasks.map((task) => (
              <li key={task.slug}>
                <Link href={moduleHref(module, `/tasks/${task.slug}`)} className="flex gap-3 py-3 hover:bg-secondary/40">
                  <span className="font-mono text-sm text-muted">{task.number}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{task.title}</span>
                    <span className="block text-sm text-muted">{task.summary}</span>
                    <span className="mt-1 block text-xs text-muted">{content.levelLabels[task.level]}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <Badge variant={passed.has(task.slug) ? "pass" : "outline"}>{task.points} pts</Badge>
                    <span className="mt-1 block text-xs text-muted">{passed.has(task.slug) ? "Passed" : "Open"}</span>
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
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${done ? "bg-green" : "bg-line"}`} />
      <span>
        {label}
        <span className="text-muted">, {done ? "done" : "not yet"}</span>
      </span>
    </li>
  );
}

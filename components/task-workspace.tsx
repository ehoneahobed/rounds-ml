"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BlockView } from "@/components/block-view";
import { CodeEditor } from "@/components/code-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/content/types";
import { contentFor } from "@/lib/module-content";
import { useModule } from "@/lib/module-context";
import { moduleHref } from "@/lib/modules";
import { loadProgress, loadTaskCode, saveProgress, saveTaskCode, useClientReady, useStudyProgress } from "@/lib/progress";
import { PythonChecker, type GradeResult, type RuntimeStatus } from "@/lib/python-checker";

/**
 * Spec on the left, Python on the right.
 * Earlier saved drafts are prepended when checks run, so task 10 can call the tree you wrote.
 */
/** Remounts the editor, the checker, and the last run when the task changes. */
export function TaskWorkspace({ task }: { task: Task }) {
  return <TaskSession key={task.slug} task={task} />;
}

function TaskSession({ task }: { task: Task }) {
  const module = useModule();
  const content = contentFor(module);
  const ready = useClientReady();
  const progress = useStudyProgress();
  const [editorKey, setEditorKey] = useState(0);
  const [runtime, setRuntime] = useState<RuntimeStatus>("loading");
  const [runtimeDetail, setRuntimeDetail] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const codeRef = useRef("");
  const editedRef = useRef(false);
  const checkerRef = useRef<PythonChecker | null>(null);
  const passed = progress.tasksPassed.includes(task.slug);
  const bootCode = ready ? (loadTaskCode(task.slug, module.taskCodePrefix) ?? task.starter) : null;
  const library = ready
    ? content.earlierTasks(task.slug).map((earlier) => ({
        title: earlier.title,
        file: earlier.file,
        saved: Boolean(loadTaskCode(earlier.slug, module.taskCodePrefix)?.trim()),
      }))
    : [];

  useEffect(() => {
    const checker = new PythonChecker((status, detail) => {
      setRuntime(status);
      setRuntimeDetail(detail ?? null);
    });
    checker.start();
    checkerRef.current = checker;
    return () => {
      checker.stop();
      checkerRef.current = null;
    };
  }, [task.slug]);

  function onChange(value: string) {
    editedRef.current = true;
    codeRef.current = value;
    saveTaskCode(task.slug, value, module.taskCodePrefix);
  }

  function currentCode(): string {
    if (editedRef.current) return codeRef.current;
    return loadTaskCode(task.slug, module.taskCodePrefix) ?? task.starter;
  }

  function reset() {
    if (!window.confirm("Replace this draft with the starter? Your current text for this task will be overwritten.")) return;
    editedRef.current = true;
    codeRef.current = task.starter;
    saveTaskCode(task.slug, task.starter, module.taskCodePrefix);
    setEditorKey((value) => value + 1);
  }

  async function run() {
    const checker = checkerRef.current;
    if (!checker || runtime !== "ready" || running) return;
    const studentCode = currentCode();
    if (studentCode.length > 80_000) {
      setRunError("That file is over 80,000 characters.");
      return;
    }
    setRunning(true);
    setRunError(null);
    setResult(null);
    try {
      const response = await fetch(`${module.graderTestsPath}/${task.testFile}`);
      if (!response.ok) throw new Error(`Could not load the checker for ${task.file}.`);
      const testCode = await response.text();
      const files = task.needsCohorts ? await loadCohorts(module.cohortFiles) : [];
      const prelude = content
        .earlierTasks(task.slug)
        .map((earlier) => loadTaskCode(earlier.slug, module.taskCodePrefix))
        .filter((draft): draft is string => Boolean(draft && draft.trim()))
        .join("\n\n");
      const graded = await checker.run(prelude ? `${prelude}\n\n${studentCode}` : studentCode, testCode, files, task.timeoutMs);
      setResult(graded);
      const cleared = graded.status === "ok" && graded.results.length > 0 && graded.results.every((item) => item.passed);
      const progressNow = loadProgress(module.storageKey);
      const already = progressNow.tasksPassed.includes(task.slug);
      if (cleared && !already) {
        saveProgress({ ...progressNow, tasksPassed: [...progressNow.tasksPassed, task.slug] }, module.storageKey);
      } else if (!cleared && already) {
        saveProgress({ ...progressNow, tasksPassed: progressNow.tasksPassed.filter((slug) => slug !== task.slug) }, module.storageKey);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "The checker failed.";
      if (message === "timeout") {
        setRunError(
          `Stopped after ${Math.round(task.timeoutMs / 1000)} seconds. An infinite loop, or a scan that rebuilds label lists on every cut of the early-warning table, will do this. The Python runtime is reloading.`,
        );
        checker.start();
      } else if (message !== "The Python runtime was restarted.") {
        setRunError(message);
      }
    } finally {
      setRunning(false);
    }
  }

  const index = content.tasks.findIndex((item) => item.slug === task.slug);
  const previous = index > 0 ? content.tasks[index - 1] : undefined;
  const next = index >= 0 && index < content.tasks.length - 1 ? content.tasks[index + 1] : undefined;
  const passedCount = result?.results.filter((item) => item.passed).length ?? 0;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Task {task.number} · {content.levelLabels[task.level]} · {task.points} pts · about {task.minutes} min
      </p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-serif text-4xl tracking-tight text-ink">{task.title}</h1>
        {passed ? <Badge variant="pass">Passed</Badge> : <Badge variant="outline">Not passed</Badge>}
      </div>
      <p className="mt-2 font-mono text-sm text-muted">{task.file}</p>
      <div className="mt-8 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="min-w-0">
          <BlockView blocks={task.blocks} />
          {task.needsCohorts ? <CohortPreview moduleId={module.id} /> : null}
          {library.length > 0 ? (
            <details className="mt-6 border border-line p-3 text-sm">
              <summary className="cursor-pointer font-semibold">Drafts prepended from earlier tasks</summary>
              <ul className="mt-3 space-y-1">
                {library.map((item) => (
                  <li key={item.file} className="flex justify-between gap-3 font-mono text-xs">
                    <span>{item.file}</span>
                    <span className={item.saved ? "text-green" : "text-muted"}>{item.saved ? "saved" : "no draft yet"}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-muted">This list is from when you opened the task. Checks read whatever is saved at the moment you run them.</p>
            </details>
          ) : null}
        </section>
        <section className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <div className="min-w-0 max-w-full overflow-hidden border border-navy bg-navy">
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
              <p className="mr-auto font-mono text-xs text-[#c8c1b4]">{runtimeLabel(runtime, runtimeDetail)}</p>
              <Button type="button" size="sm" variant="outline" className="border-white/20 text-[#f3efe6] hover:bg-white/10" onClick={reset}>
                Reset
              </Button>
              <Button type="button" size="sm" onClick={() => void run()} disabled={runtime !== "ready" || running}>
                {running ? "Running…" : "Run checks"}
              </Button>
            </div>
            {bootCode === null ? (
              <p className="p-4 font-mono text-sm text-[#c8c1b4]">Loading your draft…</p>
            ) : (
              <CodeEditor key={`${task.slug}-${editorKey}`} initialCode={bootCode} onChange={onChange} onRun={() => void run()} />
            )}
          </div>
          <p className="mt-2 text-xs text-muted">Cmd or Ctrl + Enter runs the checks. The first Python load is about 10 MB and then stays cached in the browser.</p>
          <ResultPanel result={result} runError={runError} passedCount={passedCount} />
        </section>
      </div>
      <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-6">
        {previous ? (
          <Button variant="outline" asChild>
            <Link href={moduleHref(module, `/tasks/${previous.slug}`)}>Previous task</Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href={moduleHref(module, "/")}>Back to the project</Link>
          </Button>
        )}
        {next ? (
          <Button asChild>
            <Link href={moduleHref(module, `/tasks/${next.slug}`)}>Next task</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href={moduleHref(module, "/note")}>Write the ward note</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function runtimeLabel(status: RuntimeStatus, detail: string | null): string {
  if (status === "ready") return "Python ready";
  if (status === "error") return detail ?? "Python failed to start";
  return "Starting Python…";
}

function ResultPanel({
  result,
  runError,
  passedCount,
}: {
  result: GradeResult | null;
  runError: string | null;
  passedCount: number;
}) {
  if (!result && !runError) return null;
  return (
    <div className="mt-4 border border-line bg-[#241f1a] p-4 text-[#f3efe6]" aria-live="polite">
      {runError ? <p className="font-mono text-sm text-[#f0c2ba]">{runError}</p> : null}
      {result?.stdout ? <pre className="mb-3 overflow-x-auto font-mono text-xs text-[#d9d2c5]">{result.stdout}</pre> : null}
      {result?.error ? <pre className="mb-3 overflow-x-auto whitespace-pre-wrap font-mono text-xs text-[#f0c2ba]">{result.error}</pre> : null}
      {result && result.results.length > 0 ? (
        <>
          <p className="font-mono text-sm">
            {passedCount}/{result.results.length} checks passed
          </p>
          <ul className="mt-2 space-y-2">
            {result.results.map((item) => (
              <li key={item.name} className="font-mono text-xs leading-relaxed">
                <span className={item.passed ? "text-[#9ddec4]" : "text-[#f0c2ba]"}>{item.passed ? "PASS" : "FAIL"}</span> {item.name}
                {item.detail ? <span className="mt-0.5 block text-[#d9d2c5]">{item.detail}</span> : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

async function loadCohorts(files: { url: string; path: string }[]) {
  const loaded = await Promise.all(
    files.map(async (file) => {
      const response = await fetch(file.url);
      if (!response.ok) throw new Error(`Could not load ${file.url}`);
      return { path: file.path, contents: await response.text() };
    }),
  );
  return loaded;
}

function CohortPreview({ moduleId }: { moduleId: string }) {
  const [summary, setSummary] = useState<string>("Loading the cohort…");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const isLinreg = moduleId === "linear-regression";

  useEffect(() => {
    let cancelled = false;
    if (isLinreg) {
      fetch("/data/los_cohort_a.csv")
        .then((response) => {
          if (!response.ok) throw new Error("missing");
          return response.text();
        })
        .then((text) => {
          if (cancelled) return;
          const lines = text.trim().split("\n");
          const cols = lines[0]?.split(",") ?? [];
          const body = lines.slice(1);
          const losIndex = cols.indexOf("los_days");
          const mean =
            losIndex >= 0
              ? body.reduce((sum, line) => sum + Number(line.split(",")[losIndex]), 0) / Math.max(body.length, 1)
              : 0;
          setSummary(`${body.length} admissions in cohort A. Mean length of stay ${mean.toFixed(2)} days. Cohort B is held out and checked with the same rules.`);
          setHeaders(["patient", "site", "age", "lactate", "rr", "sbp", "los"]);
          setRows(
            body.slice(0, 5).map((line) => {
              const cells = line.split(",");
              const get = (name: string) => cells[cols.indexOf(name)] ?? "";
              return [get("patient_id"), get("hospital_id"), get("age"), get("lactate"), get("rr"), get("sbp"), get("los_days")];
            }),
          );
        })
        .catch(() => {
          if (!cancelled) setSummary("The cohort file did not load. The checks still expect it at /data/los_cohort_a.csv.");
        });
    } else {
      fetch("/data/cohort_a.json")
        .then((response) => {
          if (!response.ok) throw new Error("missing");
          return response.json() as Promise<Record<string, string | number>[]>;
        })
        .then((data) => {
          if (cancelled) return;
          const positive = data.filter((row) => row.deteriorated === 1).length;
          setSummary(`${data.length} admissions in cohort A. ${positive} deteriorated (${(positive / data.length).toFixed(3)}). Cohort B is held out and checked with the same rules.`);
          setHeaders(["patient", "site", "age", "lactate", "rr", "sbp", "y"]);
          setRows(
            data.slice(0, 5).map((row) => [
              String(row.patient_id),
              String(row.hospital_id),
              String(row.age),
              String(row.lactate),
              String(row.rr),
              String(row.sbp),
              String(row.deteriorated),
            ]),
          );
        })
        .catch(() => {
          if (!cancelled) setSummary("The cohort file did not load. The checks still expect it at /data/cohort_a.json.");
        });
    }
    return () => {
      cancelled = true;
    };
  }, [isLinreg]);

  return (
    <figure className="mt-6">
      <p className="text-sm text-muted">{summary}</p>
      {rows.length > 0 ? (
        <div className="mt-2 overflow-x-auto border border-line">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-secondary/70">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-2 py-1.5 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]} className="border-t border-line font-mono text-xs">
                  {row.map((cell, cellIndex) => (
                    <td key={`${row[0]}-${cellIndex}`} className="px-2 py-1.5">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <figcaption className="mt-2 text-sm text-muted">
        {isLinreg
          ? "Five rows, not the whole file. Death, discharge disposition, and the hour-30 lactate are in the file and are not features."
          : "Five rows, not the whole file. Death, length of stay, and the hour-30 lactate are in the file and are not in this preview on purpose."}
      </figcaption>
    </figure>
  );
}

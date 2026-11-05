"use client";

import { TOTAL_POINTS, tasks } from "@/lib/content/tasks";
import { useStudyProgress } from "@/lib/progress";

/** Points earned on tasks that cleared every check. */
export function ProgressPill() {
  const progress = useStudyProgress();
  const points = tasks
    .filter((task) => progress.tasksPassed.includes(task.slug))
    .reduce((sum, task) => sum + task.points, 0);

  return (
    <p className="font-mono text-sm text-muted" aria-live="polite">
      <span className="text-ink">{points}</span>
      <span> / {TOTAL_POINTS} pts</span>
    </p>
  );
}

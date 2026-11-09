"use client";

import { contentFor } from "@/lib/module-content";
import { useModule } from "@/lib/module-context";
import { useStudyProgress } from "@/lib/progress";

/** Points earned on tasks that cleared every check. */
export function ProgressPill() {
  const module = useModule();
  const content = contentFor(module);
  const progress = useStudyProgress();
  const points = content.tasks
    .filter((task) => progress.tasksPassed.includes(task.slug))
    .reduce((sum, task) => sum + task.points, 0);

  return (
    <p className="font-mono text-sm text-muted" aria-live="polite">
      <span className="text-ink">{points}</span>
      <span> / {content.totalPoints} pts</span>
    </p>
  );
}

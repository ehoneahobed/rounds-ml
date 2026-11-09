import type { Task, TaskLevel } from "@/lib/content/types";

/** Introduction is a map module: concepts and a check only. */
export const LEVEL_LABELS: Record<TaskLevel, string> = {
  0: "Level 0",
  1: "Level 1",
  2: "Level 2",
  3: "Level 3",
};

export const tasks: Task[] = [];

export const TOTAL_POINTS = 0;

export function taskBySlug(slug: string): Task | undefined {
  void slug;
  return undefined;
}

export function earlierTasks(slug: string): Task[] {
  void slug;
  return [];
}

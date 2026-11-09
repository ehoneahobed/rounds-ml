import { concepts as treeConcepts, conceptBySlug as treeConceptBySlug, conceptNeighbors as treeConceptNeighbors } from "@/lib/content/concepts";
import { PASS_MARK as treePassMark, questions as treeQuestions } from "@/lib/content/quiz";
import {
  earlierTasks as treeEarlierTasks,
  LEVEL_LABELS as treeLevels,
  taskBySlug as treeTaskBySlug,
  tasks as treeTasks,
  TOTAL_POINTS as treePoints,
} from "@/lib/content/tasks";
import {
  conceptBySlug as lineConceptBySlug,
  conceptNeighbors as lineConceptNeighbors,
  concepts as lineConcepts,
} from "@/lib/content/linear-regression/concepts";
import { PASS_MARK as linePassMark, questions as lineQuestions } from "@/lib/content/linear-regression/quiz";
import {
  earlierTasks as lineEarlierTasks,
  LEVEL_LABELS as lineLevels,
  taskBySlug as lineTaskBySlug,
  tasks as lineTasks,
  TOTAL_POINTS as linePoints,
} from "@/lib/content/linear-regression/tasks";
import type { Concept, Task, TaskLevel } from "@/lib/content/types";
import type { Question } from "@/lib/content/quiz";
import type { ModuleId, ModuleMeta } from "@/lib/modules";

export type ModuleContent = {
  concepts: Concept[];
  conceptBySlug: (slug: string) => Concept | undefined;
  conceptNeighbors: (slug: string) => { previous?: Concept; next?: Concept };
  questions: Question[];
  passMark: number;
  tasks: Task[];
  taskBySlug: (slug: string) => Task | undefined;
  earlierTasks: (slug: string) => Task[];
  levelLabels: Record<TaskLevel, string>;
  totalPoints: number;
  wardNote: {
    title: string;
    lead: string;
    refusedLabel: string;
    thresholdLabel: string;
    failureLabel: string;
    handLabel: string;
  };
};

const TREE_CONTENT: ModuleContent = {
  concepts: treeConcepts,
  conceptBySlug: treeConceptBySlug,
  conceptNeighbors: treeConceptNeighbors,
  questions: treeQuestions,
  passMark: treePassMark,
  tasks: treeTasks,
  taskBySlug: treeTaskBySlug,
  earlierTasks: treeEarlierTasks,
  levelLabels: treeLevels,
  totalPoints: treePoints,
  wardNote: {
    title: "Ward note",
    lead: "Write this the way you would open a model review. Three short answers, each at least a sentence, and an honest tick that you computed a split by hand. Nothing here is uploaded.",
    refusedLabel: "Which columns did you refuse, and what decision time made them illegal?",
    thresholdLabel: "Where did the threshold come from, and what sensitivity were you buying?",
    failureLabel: "Name one way this tree fails on a real ward.",
    handLabel: "I computed at least one split by hand, including the weights, before I trusted the editor.",
  },
};

const LINE_CONTENT: ModuleContent = {
  concepts: lineConcepts,
  conceptBySlug: lineConceptBySlug,
  conceptNeighbors: lineConceptNeighbors,
  questions: lineQuestions,
  passMark: linePassMark,
  tasks: lineTasks,
  taskBySlug: lineTaskBySlug,
  earlierTasks: lineEarlierTasks,
  levelLabels: lineLevels,
  totalPoints: linePoints,
  wardNote: {
    title: "Ward note",
    lead: "Write this the way you would open a model review. Three short answers, each at least a sentence, and an honest tick that you computed a fit by hand. Nothing here is uploaded.",
    refusedLabel: "Which columns did you refuse, and what decision time made them illegal?",
    thresholdLabel: "Which error metrics did you report on later arrivals, and what do the numbers mean in days?",
    failureLabel: "Name one way this length-of-stay line fails on a real ward.",
    handLabel: "I computed at least one slope, intercept, or MSE by hand before I trusted the editor.",
  },
};

const BY_ID: Record<ModuleId, ModuleContent> = {
  "decision-trees": TREE_CONTENT,
  "linear-regression": LINE_CONTENT,
};

/** Content pack for a module. */
export function contentFor(module: ModuleMeta): ModuleContent {
  return BY_ID[module.id];
}

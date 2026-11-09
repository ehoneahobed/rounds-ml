/**
 * The study modules shipped in Rounds.
 * Each module lives under its own base path. The site root lists them in teaching order.
 */

export type ModuleId =
  | "introduction"
  | "linear-regression"
  | "logistic-regression"
  | "decision-trees"
  | "random-forests";

/** Interactive lab kind for a module, or null when the module has no lab. */
export type LabKind = "tree" | "line" | "sigmoid" | "forest" | null;

/**
 * Suggested GitHub identity for a learner's module repo.
 * Export always uses flat Task.file names at the repo root.
 */
export type ModuleGithub = {
  suggestedName: string;
  description: string;
  defaultVisibility: "private" | "public";
  /** Canonical export layout. Learners may rearrange into per-task directories manually. */
  layout: "flat";
};

export type ModuleMeta = {
  id: ModuleId;
  code: string;
  title: string;
  /** Path prefix for the module, with a leading slash and no trailing slash. */
  basePath: string;
  storageKey: string;
  /** Prefix for per-task draft keys in localStorage. */
  taskCodePrefix: string;
  summary: string;
  /** Directory under public for checker scripts, with trailing path used in fetch. */
  graderTestsPath: string;
  /** Cohort files copied into the Pyodide filesystem when a task asks for them. */
  cohortFiles: { url: string; path: string }[];
  /** Interactive lab, if this module has one. */
  lab: LabKind;
  /** Whether the module ends with a ward note. */
  hasWardNote: boolean;
  /** Learner GitHub repo hints; null when the module has no graded tasks yet. */
  github: ModuleGithub | null;
};

export const INTRODUCTION: ModuleMeta = {
  id: "introduction",
  code: "0x01",
  title: "Introduction to machine learning",
  basePath: "/introduction",
  storageKey: "rounds-introduction-v1",
  taskCodePrefix: "rounds-intro-task-code",
  summary: "What ML is, how models learn, and where the rest of Rounds sits on the map.",
  graderTestsPath: "/grader/introduction/tests",
  cohortFiles: [],
  lab: null,
  hasWardNote: false,
  github: null,
};

export const LINEAR_REGRESSION: ModuleMeta = {
  id: "linear-regression",
  code: "0x02",
  title: "Linear regression",
  basePath: "/linear-regression",
  storageKey: "rounds-linear-regression-v1",
  taskCodePrefix: "rounds-linreg-task-code",
  summary: "Fit a line from scratch; the project predicts a continuous outcome from early features.",
  graderTestsPath: "/grader/linear-regression/tests",
  cohortFiles: [
    { url: "/data/los_cohort_a.csv", path: "/data/los_cohort_a.csv" },
    { url: "/data/los_cohort_b.csv", path: "/data/los_cohort_b.csv" },
  ],
  lab: "line",
  hasWardNote: true,
  github: {
    suggestedName: "rounds-0x02-linear-regression",
    description: "Rounds 0x02 — linear regression from scratch, ending in hour-6 length of stay.",
    defaultVisibility: "private",
    layout: "flat",
  },
};

export const LOGISTIC_REGRESSION: ModuleMeta = {
  id: "logistic-regression",
  code: "0x03",
  title: "Logistic regression",
  basePath: "/logistic-regression",
  storageKey: "rounds-logistic-regression-v1",
  taskCodePrefix: "rounds-logreg-task-code",
  summary: "Turn a linear score into a probability; the project is a binary risk score.",
  graderTestsPath: "/grader/logistic-regression/tests",
  cohortFiles: [
    { url: "/data/cohort_a.json", path: "/data/cohort_a.json" },
    { url: "/data/cohort_b.json", path: "/data/cohort_b.json" },
  ],
  lab: "sigmoid",
  hasWardNote: true,
  github: {
    suggestedName: "rounds-0x03-logistic-regression",
    description: "Rounds 0x03 — logistic regression from scratch, ending in hour-6 early warning.",
    defaultVisibility: "private",
    layout: "flat",
  },
};

export const DECISION_TREES: ModuleMeta = {
  id: "decision-trees",
  code: "0x04",
  title: "Decision trees",
  basePath: "/decision-trees",
  storageKey: "rounds-decision-trees-v1",
  taskCodePrefix: "rounds-task-code",
  summary: "Grow a classification tree; the project is an early-warning score you can compare to logistic regression.",
  graderTestsPath: "/grader/tests",
  cohortFiles: [
    { url: "/data/cohort_a.json", path: "/data/cohort_a.json" },
    { url: "/data/cohort_b.json", path: "/data/cohort_b.json" },
  ],
  lab: "tree",
  hasWardNote: true,
  github: {
    suggestedName: "rounds-0x04-decision-trees",
    description: "Rounds 0x04 — CART from scratch, ending in an hour-6 early-warning tree.",
    defaultVisibility: "private",
    layout: "flat",
  },
};

export const RANDOM_FORESTS: ModuleMeta = {
  id: "random-forests",
  code: "0x05",
  title: "Random forests",
  basePath: "/random-forests",
  storageKey: "rounds-random-forests-v1",
  taskCodePrefix: "rounds-rf-task-code",
  summary: "Bag many trees and vote; the project is an early-warning score you can compare to a single tree.",
  graderTestsPath: "/grader/random-forests/tests",
  cohortFiles: [
    { url: "/data/cohort_a.json", path: "/data/cohort_a.json" },
    { url: "/data/cohort_b.json", path: "/data/cohort_b.json" },
  ],
  lab: "forest",
  hasWardNote: true,
  github: {
    suggestedName: "rounds-0x05-random-forests",
    description: "Rounds 0x05 — bagged trees with random features, ending in hour-6 forest early warning.",
    defaultVisibility: "private",
    layout: "flat",
  },
};

/** Teaching order: map first, then supervised models that build on each other. */
export const MODULES: ModuleMeta[] = [
  INTRODUCTION,
  LINEAR_REGRESSION,
  LOGISTIC_REGRESSION,
  DECISION_TREES,
  RANDOM_FORESTS,
];

/** Resolve a module from a pathname, or null on the site home / unknown paths. */
export function moduleFromPath(pathname: string): ModuleMeta | null {
  for (const module of MODULES) {
    if (pathname === module.basePath || pathname.startsWith(`${module.basePath}/`)) {
      return module;
    }
  }
  return null;
}

/** Join the module base path with a site-relative path. */
export function moduleHref(module: ModuleMeta, path = "/"): string {
  if (path === "/") return module.basePath;
  return `${module.basePath}${path}`;
}

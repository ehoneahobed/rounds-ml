/**
 * The study modules shipped in Rounds.
 * Each module lives under its own base path. The site root lists them.
 */

export type ModuleId = "decision-trees" | "linear-regression";

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
};

export const DECISION_TREES: ModuleMeta = {
  id: "decision-trees",
  code: "0x01",
  title: "Decision trees",
  basePath: "/decision-trees",
  storageKey: "rounds-decision-trees-v1",
  taskCodePrefix: "rounds-task-code",
  summary: "Grow a classification tree and fit an hour-6 early-warning score.",
  graderTestsPath: "/grader/tests",
  cohortFiles: [
    { url: "/data/cohort_a.json", path: "/data/cohort_a.json" },
    { url: "/data/cohort_b.json", path: "/data/cohort_b.json" },
  ],
};

export const LINEAR_REGRESSION: ModuleMeta = {
  id: "linear-regression",
  code: "0x02",
  title: "Linear regression",
  basePath: "/linear-regression",
  storageKey: "rounds-linear-regression-v1",
  taskCodePrefix: "rounds-linreg-task-code",
  summary: "Fit a line from scratch and predict length of stay from the hour-6 chart.",
  graderTestsPath: "/grader/linear-regression/tests",
  cohortFiles: [
    { url: "/data/los_cohort_a.csv", path: "/data/los_cohort_a.csv" },
    { url: "/data/los_cohort_b.csv", path: "/data/los_cohort_b.csv" },
  ],
};

export const MODULES: ModuleMeta[] = [DECISION_TREES, LINEAR_REGRESSION];

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

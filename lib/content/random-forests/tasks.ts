import { starters } from "@/lib/content/random-forests/starters";
import type { Task, TaskLevel } from "@/lib/content/types";

export const LEVEL_LABELS: Record<TaskLevel, string> = {
  0: "Level 0 · bagging pieces",
  1: "Level 1 · the forest",
  2: "Level 2 · honesty",
  3: "Level 3 · project",
};

export const tasks: Task[] = [
  {
    slug: "bootstrap",
    file: "0-bootstrap_sample.py",
    number: 0,
    level: 0,
    title: "Sample with replacement",
    points: 6,
    minutes: 20,
    summary: "Bootstrap row indices with a seeded RNG.",
    testFile: "00_bootstrap.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters.bootstrap,
    blocks: [
      {
        type: "p",
        text: "Write `bootstrap_sample(X, y, rng)`. Let `n = len(X)`. Draw `n` indices with `rng.randrange(n)` (with replacement). Return `(X_boot, y_boot, indices)`. Empty or mismatched `X`/`y` raise `ValueError`.",
      },
    ],
  },
  {
    slug: "majority-vote",
    file: "1-majority_vote.py",
    number: 1,
    level: 0,
    title: "Count the hands",
    points: 6,
    minutes: 15,
    summary: "Majority label with ties to the smaller class.",
    testFile: "01_majority_vote.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["majority-vote"],
    blocks: [
      {
        type: "p",
        text: "Write `majority_vote(labels)`. Empty input raises `ValueError`. On a tie, return the smaller label.",
      },
      {
        type: "terminal",
        text: ">>> majority_vote([1, 1, 0, 1, 0])\n1\n>>> majority_vote([0, 1])\n0",
      },
    ],
  },
  {
    slug: "mean-probability",
    file: "2-mean_probability.py",
    number: 2,
    level: 0,
    title: "Average the probabilities",
    points: 6,
    minutes: 20,
    summary: "Column-wise mean across probability rows.",
    testFile: "02_mean_probability.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["mean-probability"],
    blocks: [
      {
        type: "p",
        text: "Write `mean_probability(prob_lists)`. Each inner list is one tree’s `[p0, p1, ...]`. Average position-wise. Empty outer list → `[]`. Ragged lengths raise `ValueError`.",
      },
    ],
  },
  {
    slug: "random-features",
    file: "3-random_features.py",
    number: 3,
    level: 1,
    title: "Fewer columns per split",
    points: 8,
    minutes: 25,
    summary: "Resolve max_features and sample candidate indices.",
    testFile: "03_random_features.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["random-features"],
    blocks: [
      {
        type: "p",
        text: "Write `max_features_count(n_features, max_features=\"sqrt\")` and `random_feature_indices(n_features, max_features, rng)`. `\"sqrt\"` → `max(1, floor(sqrt(n_features)))`. An int is clamped to `[1, n_features]`. Indices come from `rng.sample(range(n_features), k)` and are returned sorted.",
      },
    ],
  },
  {
    slug: "tree",
    file: "4-decision_tree.py",
    number: 4,
    level: 1,
    title: "A tree that can forget columns",
    points: 14,
    minutes: 55,
    summary: "Gini tree with optional max_features at each split.",
    testFile: "04_tree.py",
    needsCohorts: false,
    timeoutMs: 30000,
    starter: starters.tree,
    blocks: [
      {
        type: "p",
        text: "Implement `DecisionTreeClassifier` with the same Gini gain and tie contracts as the decision-tree module (`GAIN_TIE = 1e-12`, lower feature index, then lower threshold). When `max_features` is set, only search the candidate indices from `random_feature_indices` at each split (pass `rng`). `max_features=None` searches every column. Majority ties in a leaf go to the smaller label among `classes_`.",
      },
    ],
  },
  {
    slug: "forest",
    file: "5-random_forest.py",
    number: 5,
    level: 1,
    title: "Many trees, one vote",
    points: 14,
    minutes: 55,
    summary: "Bagged forest with predict and predict_proba.",
    testFile: "05_forest.py",
    needsCohorts: false,
    timeoutMs: 45000,
    starter: starters.forest,
    blocks: [
      {
        type: "p",
        text: "Implement `RandomForestClassifier`. Fit `n_estimators` trees: each gets `bootstrap_sample` from a `random.Random(random_state)` stream (draw a fresh `random.Random(rng.randrange(2**31))` per tree for feature draws, or otherwise keep determinism matching the reference). Store trees in `trees_`. `predict` majority-votes hard labels. `predict_proba` averages tree probability rows. Expose `classes_`, `n_features_`, `feature_names_` optional.",
      },
    ],
  },
  {
    slug: "feature-use",
    file: "6-feature_use_counts.py",
    number: 6,
    level: 2,
    title: "Who got asked",
    points: 8,
    minutes: 25,
    summary: "Count split feature indices across the forest.",
    testFile: "06_feature_use.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["feature-use"],
    blocks: [
      {
        type: "p",
        text: "Write `feature_use_counts(forest)`. Walk each tree in `forest.trees_`. Every internal node with `node.feature is not None` increments that index. Return a list of length `forest.n_features_`.",
      },
    ],
  },
  {
    slug: "threshold-sensitivity",
    file: "7-threshold_for_sensitivity.py",
    number: 7,
    level: 2,
    title: "Highest cutoff that still catches enough",
    points: 8,
    minutes: 30,
    summary: "Sweep thresholds for a sensitivity floor on forest probabilities.",
    testFile: "07_threshold_sensitivity.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["threshold-sensitivity"],
    blocks: [
      {
        type: "p",
        text: "Write `threshold_for_sensitivity(y_true, y_prob, target=0.80)`. Try `0.00, 0.01, ..., 1.00`. Return the highest threshold with sensitivity ≥ target. Else `0.0`.",
      },
    ],
  },
  {
    slug: "leakage",
    file: "8-leakage_report.py",
    number: 8,
    level: 2,
    title: "It was not known at hour 6",
    points: 8,
    minutes: 35,
    summary: "Same column screen as prior modules.",
    testFile: "08_leakage.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters.leakage,
    blocks: [
      {
        type: "p",
        text: "Write `leakage_report(columns, decision_hour=6)`. First matching reason wins: `label`, `identifier`, `temporal_leak`, `name_leak`, `unknown_time`. Name tokens include `los_`, `death`, `discharge`, `icu_`.",
      },
    ],
  },
  {
    slug: "temporal-split",
    file: "9-patient_temporal_split.py",
    number: 9,
    level: 2,
    title: "Later arrivals stay in the test set",
    points: 8,
    minutes: 35,
    summary: "Hold out whole patients, latest arrivals last.",
    testFile: "09_temporal_split.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["temporal-split"],
    blocks: [
      {
        type: "p",
        text: "Write `patient_temporal_split(rows, patient_key, time_key, fraction)`. Same contract as linear and logistic modules.",
      },
    ],
  },
  {
    slug: "early-warning",
    file: "10-forest_early_warning.py",
    number: 10,
    level: 3,
    title: "Hour-6 forest early warning",
    points: 14,
    minutes: 70,
    summary: "A random-forest deterioration model with the usual hour-6 honesty.",
    testFile: "10_early_warning.py",
    needsCohorts: true,
    timeoutMs: 120000,
    starter: starters["early-warning"],
    blocks: [
      {
        type: "p",
        text: "Write `train_forest_early_warning(rows)`. Allowed features only, temporal split 0.25, `RandomForestClassifier(n_estimators=25, max_depth=4, min_samples_leaf=15, max_features=\"sqrt\", random_state=0)`. Threshold on training class-1 probabilities for sensitivity 0.80. Return threshold, train/test sensitivity and specificity, `feature_names`, and `model`. Checker rebuilds the split; test sensitivity ≥ 0.65 and specificity ≥ 0.45 on cohorts A and B.",
      },
    ],
  },
];

export const TOTAL_POINTS = tasks.reduce((sum, task) => sum + task.points, 0);

export function taskBySlug(slug: string): Task | undefined {
  return tasks.find((task) => task.slug === slug);
}

export function earlierTasks(slug: string): Task[] {
  const index = tasks.findIndex((task) => task.slug === slug);
  if (index <= 0) return [];
  return tasks.slice(0, index);
}

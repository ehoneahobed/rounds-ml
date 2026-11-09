import { starters } from "@/lib/content/logistic-regression/starters";
import type { Task, TaskLevel } from "@/lib/content/types";

export const LEVEL_LABELS: Record<TaskLevel, string> = {
  0: "Level 0 · probability",
  1: "Level 1 · the fit",
  2: "Level 2 · metrics and honesty",
  3: "Level 3 · project",
};

export const tasks: Task[] = [
  {
    slug: "sigmoid",
    file: "0-sigmoid.py",
    number: 0,
    level: 0,
    title: "The S-curve",
    points: 6,
    minutes: 20,
    summary: "Map a score to a probability with the sigmoid.",
    testFile: "00_sigmoid.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters.sigmoid,
    blocks: [
      {
        type: "p",
        text: "Write `sigmoid(z)`. If `z` is a number, return a number. If `z` is a list, return a list. Use `1 / (1 + exp(-z))`. For large |z|, clamp the input to about ±500 before calling `exp` so the runtime does not overflow.",
      },
      {
        type: "terminal",
        text: ">>> round(sigmoid(0.0), 6)\n0.5\n>>> [round(v, 3) for v in sigmoid([-2.0, 2.0])]\n[0.119, 0.881]",
      },
    ],
  },
  {
    slug: "log-loss",
    file: "1-log_loss.py",
    number: 1,
    level: 0,
    title: "Mean log loss",
    points: 8,
    minutes: 25,
    summary: "Binary cross-entropy between labels and probabilities.",
    testFile: "01_log_loss.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["log-loss"],
    blocks: [
      {
        type: "p",
        text: "Write `log_loss(y_true, y_prob, eps=1e-15)`. Mean of `-(y log p + (1-y) log(1-p))` after clipping each `p` into `(eps, 1-eps)`. Empty input is 0. Different lengths raise `ValueError`. Labels must be 0 or 1.",
      },
      {
        type: "terminal",
        text: ">>> round(log_loss([1, 0], [0.8, 0.2]), 3)\n0.223",
      },
    ],
  },
  {
    slug: "design-matrix",
    file: "2-design_matrix.py",
    number: 2,
    level: 1,
    title: "A column of ones",
    points: 6,
    minutes: 20,
    summary: "Prepend the intercept column.",
    testFile: "02_design_matrix.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["design-matrix"],
    blocks: [
      {
        type: "p",
        text: "Write `design_matrix(X)`. Each output row is `[1.0, *row]`. An empty table stays empty. Ragged rows raise `ValueError`.",
      },
      {
        type: "terminal",
        text: ">>> design_matrix([[2.0], [3.0]])\n[[1.0, 2.0], [1.0, 3.0]]",
      },
    ],
  },
  {
    slug: "predict-proba",
    file: "3-predict_proba.py",
    number: 3,
    level: 1,
    title: "Probabilities from weights",
    points: 8,
    minutes: 25,
    summary: "σ(Xw) for a design matrix that already has an intercept.",
    testFile: "03_predict_proba.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["predict-proba"],
    blocks: [
      {
        type: "p",
        text: "Write `predict_proba(X, weights)`. Each row of `X` already includes the intercept column. Score is the dot product with `weights`; output is `sigmoid(score)`. Mismatched widths raise `ValueError`.",
      },
      {
        type: "terminal",
        text: ">>> [round(p, 3) for p in predict_proba([[1.0, 0.0], [1.0, 2.0]], [0.0, 1.0])]\n[0.5, 0.881]",
      },
    ],
  },
  {
    slug: "fit-logistic",
    file: "4-fit_logistic.py",
    number: 4,
    level: 1,
    title: "Steps down the log loss",
    points: 12,
    minutes: 50,
    summary: "Batch gradient descent for logistic regression.",
    testFile: "04_fit_logistic.py",
    needsCohorts: false,
    timeoutMs: 30000,
    starter: starters["fit-logistic"],
    blocks: [
      {
        type: "p",
        text: "Write `fit_logistic(X, y, learning_rate, epochs, initial_weights=None)`. `X` already includes the intercept. Default initial weights are zeros. Each epoch: `p = predict_proba(X, w)`, gradient `(1/n) Xᵀ (p − y)`, then `w ← w − learning_rate * gradient`.",
      },
      {
        type: "terminal",
        text: ">>> X = design_matrix([[0.0], [0.0], [1.0], [1.0]])\n>>> w = fit_logistic(X, [0, 0, 1, 1], 0.5, 4000)\n>>> [round(v, 1) for v in predict_proba(X, w)]\n[0.0, 0.0, 1.0, 1.0]",
      },
    ],
  },
  {
    slug: "metrics",
    file: "5-metrics.py",
    number: 5,
    level: 2,
    title: "Confusion and rates",
    points: 10,
    minutes: 35,
    summary: "TP/FP/TN/FN, sensitivity, specificity, and PPV.",
    testFile: "05_metrics.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters.metrics,
    blocks: [
      {
        type: "p",
        text: "Write `confusion_counts`, `sensitivity`, `specificity`, and `positive_predictive_value`. Predict 1 when `probability >= threshold`. If a ratio’s denominator is 0, return 0.0.",
      },
      {
        type: "terminal",
        text: ">>> confusion_counts([1, 1, 0, 0], [0.9, 0.4, 0.6, 0.1], 0.5)\n(1, 1, 1, 1)",
      },
    ],
  },
  {
    slug: "threshold-sensitivity",
    file: "6-threshold_for_sensitivity.py",
    number: 6,
    level: 2,
    title: "Highest cutoff that still catches enough",
    points: 8,
    minutes: 30,
    summary: "Sweep thresholds for a sensitivity floor.",
    testFile: "06_threshold_sensitivity.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["threshold-sensitivity"],
    blocks: [
      {
        type: "p",
        text: "Write `threshold_for_sensitivity(y_true, y_prob, target=0.80)`. Try thresholds `0.00, 0.01, ..., 1.00`. Return the highest threshold whose sensitivity is at least `target`. If none qualify, return `0.0`.",
      },
      {
        type: "terminal",
        text: ">>> threshold_for_sensitivity([1, 1, 0, 0], [0.9, 0.6, 0.6, 0.2], 1.0)\n0.6",
      },
    ],
  },
  {
    slug: "leakage",
    file: "7-leakage_report.py",
    number: 7,
    level: 2,
    title: "It was not known at hour 6",
    points: 10,
    minutes: 40,
    summary: "A column screen with a written priority.",
    testFile: "07_leakage.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters.leakage,
    blocks: [
      {
        type: "p",
        text: "Write `leakage_report(columns, decision_hour=6)`. Each column has `name`, `available_hour`, and `role`. First matching reason wins: `label`, `identifier`, `temporal_leak`, `name_leak`, `unknown_time`. Name tokens include `los_`, `death`, `discharge`, `icu_`. Clean columns are omitted.",
      },
    ],
  },
  {
    slug: "temporal-split",
    file: "8-patient_temporal_split.py",
    number: 8,
    level: 2,
    title: "Later arrivals stay in the test set",
    points: 8,
    minutes: 35,
    summary: "Hold out whole patients, latest arrivals last.",
    testFile: "08_temporal_split.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["temporal-split"],
    blocks: [
      {
        type: "p",
        text: "Write `patient_temporal_split(rows, patient_key, time_key, fraction)`. Order patients by earliest timestamp, then by patient id as a string. The last `ceil(fraction * n)` patients, clamped to `[1, n-1]`, are test. Fraction outside `(0, 1)` or fewer than two patients raises `ValueError`.",
      },
    ],
  },
  {
    slug: "early-warning",
    file: "9-logistic_early_warning.py",
    number: 9,
    level: 3,
    title: "Hour-6 logistic early warning",
    points: 14,
    minutes: 70,
    summary: "A logistic deterioration model that refuses columns a nurse would not have had.",
    testFile: "09_early_warning.py",
    needsCohorts: true,
    timeoutMs: 60000,
    starter: starters["early-warning"],
    blocks: [
      {
        type: "p",
        text: "Write `train_logistic_early_warning(rows)`. Use only `ALLOWED_FEATURES`, `patient_temporal_split` with fraction 0.25, standardize using training means/scales, a design matrix with an intercept, and `fit_logistic`. Choose the threshold on the training rows for sensitivity 0.80. Return `threshold`, the train/test rates, `weights`, `means`, `scales`, and `feature_names` (`['intercept', *ALLOWED_FEATURES]`). Optional: a `probability_fn(rows)` the checker can call. Test sensitivity must stay at least 0.70 and test specificity at least 0.45 on cohort A and hidden cohort B.",
      },
    ],
  },
];

export const TOTAL_POINTS = tasks.reduce((sum, task) => sum + task.points, 0);

export function taskBySlug(slug: string): Task | undefined {
  return tasks.find((task) => task.slug === slug);
}

/** Tasks whose saved drafts are prepended when a later task runs. */
export function earlierTasks(slug: string): Task[] {
  const index = tasks.findIndex((task) => task.slug === slug);
  if (index <= 0) return [];
  return tasks.slice(0, index);
}

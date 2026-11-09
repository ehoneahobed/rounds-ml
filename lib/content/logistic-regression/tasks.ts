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
        text: "A linear score can be any real number—negative, huge, whatever. A probability must sit between 0 and 1. The sigmoid is the S-shaped map that does that job.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "p",
        text: "At z = 0: exp(0) = 1, so σ(0) = 1/(1+1) = 0.5. Large positive z → probability near 1. Large negative z → near 0. For z = 2, σ(2) ≈ 0.881; for z = −2, ≈ 0.119.",
      },
      {
        type: "math",
        latex: "\\sigma(z) = \\frac{1}{1 + e^{-z}}.",
      },
      {
        type: "p",
        text: "If |z| is enormous, `exp(-z)` can overflow. Clamp z to about ±500 before calling `exp`.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `sigmoid(z)`. A number in → a number out. A list in → a list out, element-wise. Tolerance on the public samples is about `1e-3` after rounding as shown.",
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
        text: "MSE is a poor fit for yes/no labels. Log loss asks: how surprised was the model by the true label? Confident and wrong is punished hard. Confident and right costs almost nothing.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "p",
        text: "Labels `[1, 0]`, probabilities `[0.8, 0.2]`. For a positive label use −log(p); for a negative use −log(1−p). So −log(0.8) + −log(0.8), mean ≈ 0.223.",
      },
      {
        type: "math",
        latex: "L = -\\frac{1}{n}\\sum_i \\bigl(y_i\\log p_i + (1-y_i)\\log(1-p_i)\\bigr).",
      },
      {
        type: "p",
        text: "Clip each p into `(eps, 1−eps)` before the logs so you never hit `log(0)`. Default `eps=1e-15`.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `log_loss(y_true, y_prob, eps=1e-15)`. Empty → `0.0`. Different lengths → `ValueError`. Labels must be 0 or 1.",
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
        text: "Same trick as linear regression: logistic scores are a dot product. Put a 1 at the front of every row so the first weight is the intercept.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "p",
        text: "`[[2.0], [3.0]]` → `[[1.0, 2.0], [1.0, 3.0]]`.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `design_matrix(X)`. Empty → `[]`. Ragged rows → `ValueError`. Return a new table.",
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
        text: "Once you have weights, prediction is two steps: score = row · weights, then probability = σ(score). X already includes the intercept column.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "p",
        text: "Rows `[[1, 0], [1, 2]]`, weights `[0, 1]`. Scores are 0 and 2. Probabilities ≈ `[0.5, 0.881]`.",
      },
      {
        type: "math",
        latex: "p_i = \\sigma(x_i^{\\mathsf{T}} w).",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `predict_proba(X, weights)`. Row width must match `len(weights)`—else `ValueError`. Reuse your `sigmoid`.",
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
        text: "There is no one-shot normal equation for log loss. You walk downhill: predict probabilities, measure how they differ from the labels, nudge the weights.",
      },
      {
        type: "math",
        latex: "\\nabla_w = \\frac{1}{n} X^{\\mathsf{T}}(p - y),\\qquad w \\leftarrow w - \\eta\\,\\nabla_w.",
      },
      {
        type: "h2",
        text: "Recipe each epoch",
      },
      {
        type: "ol",
        items: [
          "p = predict_proba(X, w) — X already has the intercept.",
          "errors = p − y (probability minus label).",
          "For each weight j, gradient_j = (1/n) · Σᵢ Xᵢⱼ · errorᵢ.",
          "w ← w − learning_rate · gradient.",
        ],
      },
      {
        type: "p",
        text: "On a separable toy set—two zeros at x=0 labeled 0, two ones at x=1 labeled 1—enough epochs drive predicted probabilities near 0 and 1.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `fit_logistic(X, y, learning_rate, epochs, initial_weights=None)`. Default weights are zeros. Labels must be 0/1. Empty X or length mismatch → `ValueError`.",
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
        text: "A probability is not a yes/no call. You pick a cutoff t: predict 1 when probability ≥ t. Then every row falls into TP, FP, TN, or FN.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "p",
        text: "Labels `[1, 1, 0, 0]`, probs `[0.9, 0.4, 0.6, 0.1]`, threshold 0.5. Predictions `[1, 0, 1, 0]` → one of each: TP, FN, FP, TN. So `(tp, fp, tn, fn) = (1, 1, 1, 1)`.",
      },
      {
        type: "ul",
        items: [
          "Sensitivity = TP / (TP+FN) — of true events, what fraction did you catch?",
          "Specificity = TN / (TN+FP) — of non-events, what fraction did you leave alone?",
          "PPV = TP / (TP+FP) — of alarms, what fraction were real?",
        ],
      },
      {
        type: "p",
        text: "If a denominator is 0, that rate is `0.0`.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `confusion_counts`, `sensitivity`, `specificity`, and `positive_predictive_value`. Counts take `(y_true, y_prob, threshold)` and return `(tp, fp, tn, fn)`. The rate helpers take the four counts.",
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
        text: "In early warning you often care more about catching events than about perfect specificity. Fix a sensitivity floor (say 0.80), then among cutoffs that still catch enough, pick the strictest—the highest threshold.",
      },
      {
        type: "h2",
        text: "Recipe",
      },
      {
        type: "ol",
        items: [
          "Try every threshold in `{0.00, 0.01, …, 1.00}` (101 values).",
          "At each, compute sensitivity from the confusion counts.",
          "Keep the highest threshold whose sensitivity is still ≥ target.",
          "If none qualify, return `0.0`.",
        ],
      },
      {
        type: "p",
        text: "Example: labels `[1, 1, 0, 0]`, probs `[0.9, 0.6, 0.6, 0.2]`, target 1.0 (catch both positives). Threshold 0.6 still catches both; 0.7 drops the 0.6. Answer: `0.6`.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `threshold_for_sensitivity(y_true, y_prob, target=0.80)`. Empty input → `0.0`. Length mismatch → `ValueError`.",
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
        text: "Before you fit, refuse columns that cheat. Decision time is hour 6. Each column is a dict with `name`, `available_hour` (int or `None`), and `role` (`feature`, `label`, or `identifier`).",
      },
      {
        type: "h2",
        text: "First matching reason wins",
      },
      {
        type: "ol",
        items: [
          "`label` — role is `label`.",
          "`identifier` — role is `identifier`.",
          "`temporal_leak` — hour is not `None` and is greater than the decision hour (default 6).",
          "`name_leak` — lowercased name contains any of: discharge, death, mortal, expired, icu_transfer, icu_, future_, day2, outcome, los_.",
          "`unknown_time` — role is `feature` and hour is `None`.",
        ],
      },
      {
        type: "p",
        text: "Return only flagged columns as `{\"name\", \"reason\"}`, in input order. Clean columns are omitted. A late hour outranks a bad name.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `leakage_report(columns, decision_hour=6)`. Note the extra `icu_` token compared with some other modules—names like `icu_los` still flag.",
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
        text: "A random row shuffle can put the same person in train and test. Hold out whole patients, and put the latest arrivals in the test set.",
      },
      {
        type: "h2",
        text: "Recipe",
      },
      {
        type: "ol",
        items: [
          "Group rows by patient id.",
          "Date each patient by their earliest `time_key`.",
          "Sort patients by that time, then by `str(patient_id)`.",
          "Test = last `ceil(fraction * n)` patients, clamped to `[1, n-1]`.",
          "Every row of a patient stays together; keep original order inside each side.",
        ],
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `patient_temporal_split(rows, patient_key, time_key, fraction)` returning `(train_rows, test_rows)`. Fraction not in (0, 1), or fewer than two patients → `ValueError`.",
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
        text: "Put the pieces together. You get admission dicts. Fit logistic regression for `deteriorated` using only hour-6 facts, hold out later patients, standardize from the training side only, freeze a threshold for sensitivity 0.80 on train, and report the rates.",
      },
      {
        type: "h2",
        text: "What you may use",
      },
      {
        type: "table",
        caption: "Decision time is hour 6. Label is deteriorated.",
        headers: ["Column", "Knowable", "In the matrix?"],
        rows: [
          ["patient_id, admission_time", "at arrival", "no — keys for the split"],
          ["age, sex, diabetes, heart_failure", "at arrival", "yes"],
          ["hr, sbp, rr, temp, spo2, lactate, creatinine, wbc", "hour 6", "yes"],
          ["deteriorated", "the label", "no — this is y"],
        ],
      },
      {
        type: "h2",
        text: "Recipe",
      },
      {
        type: "ol",
        items: [
          "Split with `patient_temporal_split(..., fraction=0.25)`.",
          "Build raw feature matrices from `ALLOWED_FEATURES` only.",
          "Compute column means and scales from the training matrix. Apply those same stats to train and test (z-scores). A near-zero variance column may use scale 1.",
          "Add the intercept with `design_matrix`. Fit with `fit_logistic` (a few thousand epochs and a learning rate around 0.5 work on the cohorts).",
          "Choose the threshold on training probabilities for sensitivity 0.80. Score train and test with that frozen cutoff.",
          "Return the dict in the starter (`threshold`, rates, `weights`, `means`, `scales`, `feature_names`). Optional: `probability_fn(rows)` the checker can call.",
        ],
      },
      {
        type: "callout",
        tone: "practice",
        title: "How you are scored",
        text: "The checker rebuilds the official split. Test sensitivity must stay at least 0.70 and test specificity at least 0.45 on cohort A and hidden cohort B. Hardcoding rows will not travel.",
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

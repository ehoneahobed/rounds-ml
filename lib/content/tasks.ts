import { starters } from "@/lib/content/starters";
import type { Task, TaskLevel } from "@/lib/content/types";

export const LEVEL_LABELS: Record<TaskLevel, string> = {
  0: "Level 0 · foundations",
  1: "Level 1 · the tree",
  2: "Level 2 · clinical practice",
  3: "Level 3 · project",
};

export const tasks: Task[] = [
  {
    slug: "gini",
    file: "0-gini_impurity.py",
    number: 0,
    level: 0,
    title: "Two draws from the same node",
    points: 6,
    minutes: 25,
    summary: "Gini impurity of a list of class labels.",
    testFile: "00_gini.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters.gini,
    blocks: [
      {
        type: "p",
        text: "Write `gini_impurity(labels)`. It is \\(1 - \\sum p_k^2\\). An empty list is 0. A single class is 0. Order does not matter, and the function is not limited to two classes.",
      },
      {
        type: "terminal",
        text: ">>> gini_impurity([0, 0, 0, 1])\n0.375\n>>> gini_impurity([0, 1, 0, 1])\n0.5\n>>> gini_impurity([])\n0.0",
      },
      {
        type: "callout",
        tone: "note",
        title: "Auto review",
        text: "The sample above is public. The checker also scores a pure node, a three-class node, and a one-row node. Tolerance on floats is 1e−12.",
      },
    ],
  },
  {
    slug: "entropy",
    file: "1-entropy.py",
    number: 1,
    level: 0,
    title: "Bits of surprise",
    points: 6,
    minutes: 25,
    summary: "Shannon entropy in bits.",
    testFile: "01_entropy.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters.entropy,
    blocks: [
      {
        type: "p",
        text: "Write `entropy(labels)` in bits. Use \\(\\log_2\\). Treat \\(0 \\log 0\\) as 0. Empty input is 0. A fair two-class node is exactly 1. Three equal classes are \\(\\log_2 3\\).",
      },
      {
        type: "terminal",
        text: ">>> entropy([0, 1, 1, 0])\n1.0\n>>> entropy([0, 0, 0, 0])\n0.0",
      },
    ],
  },
  {
    slug: "information-gain",
    file: "2-information_gain.py",
    number: 2,
    level: 0,
    title: "Was the split worth it",
    points: 8,
    minutes: 30,
    summary: "Size-weighted impurity reduction, for Gini and for entropy.",
    testFile: "02_information_gain.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["information-gain"],
    blocks: [
      {
        type: "p",
        text: "Write `information_gain(parent, left, right, criterion='gini')`. Subtract the weighted child impurities from the parent impurity. The weights are `len(left) / n` and `len(right) / n` with `n = len(left) + len(right)`. If the parent or either child is empty, return 0. `criterion` is `gini` or `entropy`. Anything else raises `ValueError`.",
      },
      {
        type: "p",
        text: "You may call your `gini_impurity` and `entropy`. Checks prepend the drafts saved from earlier tasks. If a name is missing, finish that task and come back. The current file is executed last, so a helper you paste here overrides the saved one.",
      },
      {
        type: "terminal",
        text: ">>> parent = [0, 0, 0, 0, 1, 1, 1, 1]\n>>> information_gain(parent, [0, 0, 0, 0], [1, 1, 1, 1], 'gini')\n0.5\n>>> information_gain(parent, [], [1, 1, 1, 1], 'gini')\n0.0",
      },
    ],
  },
  {
    slug: "best-split",
    file: "3-best_numeric_split.py",
    number: 3,
    level: 1,
    title: "Walk the sorted column",
    points: 10,
    minutes: 45,
    summary: "The best midpoint threshold on one numeric feature.",
    testFile: "03_best_split.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["best-split"],
    blocks: [
      {
        type: "p",
        text: "Write `best_numeric_split(values, labels)`. Sort the pairs. A cut is legal only between two adjacent sorted values that differ. The threshold is their midpoint, and `value <= threshold` would go left. Score each cut with Gini gain. Return `(threshold, gain)`.",
      },
      {
        type: "ul",
        items: [
          "Gains within 1e−12 are tied. Keep the lower threshold.",
          "If every gain is at most 1e−12, or the column cannot be cut, return `(float('nan'), 0.0)`.",
          "A single row returns that same pair. A pure label column returns it too.",
          "Mismatched lengths raise `ValueError`.",
        ],
      },
      {
        type: "terminal",
        text: ">>> best_numeric_split([0.8, 1.1, 1.2, 1.4, 2.0, 2.4, 3.1, 4.0], [0, 0, 0, 0, 1, 1, 1, 1])\n(1.7, 0.5)",
      },
      {
        type: "callout",
        tone: "note",
        title: "Unsorted input",
        text: "The checker will hand you the same rows in a shuffled order. Sort them. Do not assume the caller did.",
      },
    ],
  },
  {
    slug: "tree",
    file: "4-decision_tree.py",
    number: 4,
    level: 1,
    title: "A tree, not a library call",
    points: 18,
    minutes: 180,
    summary: "CART for numeric features: fit, predict, and predict_proba.",
    testFile: "04_tree.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters.tree,
    blocks: [
      {
        type: "p",
        text: "Implement `DecisionTreeClassifier`. The docstring in the editor is the contract, including the errors. Read it before you write the recursion. A short version of the rules that are easy to invert:",
      },
      {
        type: "ul",
        items: [
          "Root depth is 0. Stop splitting at depth >= max_depth.",
          "`value <= threshold` goes left. Thresholds are midpoints of adjacent sorted values that differ.",
          "Both children must contain at least `min_samples_leaf` rows.",
          "Keep a split only when Gini gain is > 0 and >= `min_impurity_decrease`. A split that does not change the majority class is still legal if the impurity fell.",
          "Ties within 1e−12: lower feature index, then lower threshold.",
          "Majority ties in a leaf go to the smaller label. `predict_proba` follows sorted `classes_`, including zeros for classes absent from that leaf.",
          "Exclusive-or has no root gain. A deep max_depth must still refuse to split it.",
        ],
      },
      {
        type: "p",
        text: "On the eight-row teaching table from the concept pages (lactate, then age), the root feature is column 0 at threshold 1.8, and the right child splits on age at 64.5. Use that as a private test. The checker builds it too, along with a multiclass column, a leaf-size constraint, and a second `fit` that must replace the first tree.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "Do not import sklearn",
        text: "It is not in the checker, and a wrapper around it would not satisfy the tie rules above. A straightforward scan is fast enough for the rows in these checks. Update class counts as you walk a sorted column if you later time out on the project.",
      },
    ],
  },
  {
    slug: "export-paths",
    file: "5-export_paths.py",
    number: 5,
    level: 1,
    title: "Say the rule out loud",
    points: 8,
    minutes: 40,
    summary: "One sentence per leaf, with the denominator.",
    testFile: "05_export_paths.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["export-paths"],
    blocks: [
      {
        type: "p",
        text: "Write `export_paths(tree, feature_names)`. Depth-first, left then right. Format:",
      },
      {
        type: "code",
        code: "if lactate <= 1.80 AND age > 64.50 then 1 (p=1.00, n=2)",
      },
      {
        type: "ul",
        items: [
          "Left branches use `<=`. Right branches use `>`. Join with ` AND `.",
          "Thresholds and `p` are printed with two decimal places. `p` is the frequency of the predicted class, not of class 1 in particular.",
          "A leaf at the root uses the condition `True`.",
          "The name list must have one entry per fitted feature, or you raise `ValueError`. Exporting before fit raises `RuntimeError`.",
        ],
      },
      {
        type: "p",
        text: "The checker fits trees with your `DecisionTreeClassifier` from the saved draft of task 4, unless you define the class again in this file. A pure formatting function that only hardcodes the teaching tree will fail the other leaves.",
      },
    ],
  },
  {
    slug: "regression",
    file: "6-regression_split.py",
    number: 6,
    level: 1,
    title: "When the label is a number",
    points: 8,
    minutes: 40,
    summary: "Population variance, and the split that reduces it.",
    testFile: "06_regression.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters.regression,
    blocks: [
      {
        type: "p",
        text: "Classification impurity is the wrong tool for a length of stay. Write `variance(values)`, the mean squared deviation from the mean, divided by n. Empty input is 0. Do not divide by n−1. That sample variance is a different statistic, and CART does not use it.",
      },
      {
        type: "p",
        text: "Write `best_regression_split(values, targets)`. Same midpoint rules as the classification search, including the lower-threshold tie break. The score is variance reduction with the same weights as information gain. Return `(float('nan'), 0.0)` when no cut helps, or when the inputs cannot be cut. Mismatched lengths raise `ValueError`.",
      },
      {
        type: "terminal",
        text: ">>> variance([10.0, 10.0, 0.0, 0.0])\n25.0\n>>> best_regression_split([1.0, 2.0, 3.0, 4.0], [10.0, 10.0, 0.0, 0.0])\n(2.5, 25.0)",
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
        text: "Write `leakage_report(columns)`. Decision time is hour 6. Each dictionary has `name`, `available_hour` (an int or None), and `role`. Return only the flagged columns, as `{\"name\", \"reason\"}`, in the order you saw them. The first matching reason wins:",
      },
      {
        type: "ol",
        items: [
          "`label` when role is `label`.",
          "`identifier` when role is `identifier`.",
          "`temporal_leak` when `available_hour` is not None and is greater than 6. Hour 6 is legal.",
          "`name_leak` when the lowercased name contains any starter substring: discharge, death, mortal, expired, icu_transfer, future_, day2, outcome, los_.",
          "`unknown_time` when a feature has no hour.",
        ],
      },
      {
        type: "p",
        text: "A bad name recorded with hour 6 is still a name leak. A late hour outranks a bad name. An empty registry returns an empty list. The checker includes a column called `Death` and a column whose hour is 7 with an otherwise clean name.",
      },
    ],
  },
  {
    slug: "temporal-split",
    file: "8-patient_temporal_split.py",
    number: 8,
    level: 2,
    title: "The future stays in the test set",
    points: 8,
    minutes: 40,
    summary: "Hold out whole patients, latest arrivals last.",
    testFile: "08_temporal_split.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["temporal-split"],
    blocks: [
      {
        type: "p",
        text: "Write `patient_temporal_split`. Date each patient by the earliest `time_key` among their rows. Sort patients by that timestamp, then by `str(patient_id)`. Take the last `ceil(test_fraction * n_patients)` patients as test, but always leave at least one patient on each side.",
      },
      {
        type: "p",
        text: "All rows of a patient travel together. A later row must not pull an otherwise early patient into the test. Preserve the original row order inside each side, and do not sort the list the caller passed you. Timestamps are zero-padded strings. Raise `ValueError` when the fraction is not strictly inside (0, 1), or when fewer than two patients are present.",
      },
      {
        type: "terminal",
        text: "patients by first timestamp: b (Jan 1), a (Jan 2), c (Jan 3), d (Jan 4)\ntest_fraction 0.5 -> test patients c and d\npatient a also has a row on Jan 5, and that row stays in train",
      },
    ],
  },
  {
    slug: "metrics",
    file: "9-clinical_metrics.py",
    number: 9,
    level: 2,
    title: "Sensitivity is a choice",
    points: 10,
    minutes: 45,
    summary: "Operating-point rates, Brier score, and a threshold for a sensitivity target.",
    testFile: "09_metrics.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters.metrics,
    blocks: [
      {
        type: "p",
        text: "Write `clinical_metrics(y_true, y_prob, threshold)`. A row is positive when `y_prob >= threshold`. Return a dict with `sensitivity`, `specificity`, `ppv`, `npv`, `f1`, `brier`, `tp`, `fp`, `tn`, `fn`. Rates with a zero denominator are 0. F1 is `2*tp / (2*tp + fp + fn)`, or 0 when the denominator is 0. Brier is the mean of `(probability - label)^2`. Counts are Python ints.",
      },
      {
        type: "p",
        text: "Write `threshold_for_sensitivity(y_true, y_prob, target_sensitivity)`. Candidates are every distinct probability, plus 0 and 1. Return the highest candidate whose sensitivity is at least the target. If none qualify, return 0. This is how you keep specificity while buying a sensitivity floor. Do not return the lowest such threshold.",
      },
      {
        type: "ul",
        items: [
          "Empty input, or sequences of different lengths, raises `ValueError` from both functions.",
          "A target outside [0, 1] raises `ValueError`.",
          "On labels `[1, 0, 1, 0]` and probabilities `[0.9, 0.8, 0.2, 0.1]` at threshold 0.5, every count is 1 and the Brier score is 0.325.",
        ],
      },
    ],
  },
  {
    slug: "early-warning",
    file: "10-early_warning.py",
    number: 10,
    level: 3,
    title: "Early warning at hour 6",
    points: 8,
    minutes: 90,
    summary: "A deterioration tree that refuses the columns a nurse would not have had.",
    testFile: "10_early_warning.py",
    needsCohorts: true,
    timeoutMs: 45000,
    starter: starters["early-warning"],
    blocks: [
      {
        type: "p",
        text: "500 synthetic admissions, one row each. The label `deteriorated` was drawn from a shallow rule plus noise. About a third of the cohort is positive, richer than a general ward, so the cuts are visible at this size. Several columns predict the label because they are consequences of the stay. Using them is a failing review, not a better model.",
      },
      {
        type: "table",
        caption: "Decision time is hour 6. Allowed features are the ones marked use.",
        headers: ["Column", "Knowable", "In the matrix?"],
        rows: [
          ["patient_id, hospital_id, admission_time", "at arrival", "no — keys, not features"],
          ["age, sex, diabetes, heart_failure", "at arrival", "yes"],
          ["hr, sbp, rr, temp, spo2, lactate, creatinine, wbc", "hour 6", "yes"],
          ["lactate_h30", "hour 30", "no"],
          ["icu_transfer", "after hour 6", "no"],
          ["los_days, discharge_disposition, death_in_hospital", "end of stay", "no"],
          ["deteriorated", "the label", "no — this is y"],
        ],
      },
      {
        type: "p",
        text: "Write `train_early_warning(rows)`. The docstring lists the return value. Fit your own `DecisionTreeClassifier` on the training side of `patient_temporal_split(..., test_fraction=0.25)` only. Depth at most 4. Every leaf at least 10 training rows. `min_samples_leaf=15` is a sound default. Take the class-1 column of `predict_proba`, choose the threshold on the training rows for sensitivity 0.80, and return that frozen number.",
      },
      {
        type: "p",
        text: "The checker does not trust a metrics dict you compute yourself. It rebuilds the split, scores your model on the future patients, and checks that the threshold matches the training rule. It also walks `model.root` and checks leaf sizes. A second cohort, same generator and a different seed, is scored the same way. Hardcoding rows will not travel.",
      },
      {
        type: "callout",
        tone: "practice",
        title: "The bar",
        text: "On each future slice: sensitivity at least 0.75 and specificity at least 0.50. The training target stays 0.80. The gap is there because the next 125 patients are not the previous 375. `excluded` must name every forbidden column. `features` is at least four allowed names, with no duplicates.",
      },
      { type: "p", text: "The first rows of the cohort you can see are below. Cohort B is not shown." },
    ],
  },
];

export function taskBySlug(slug: string): Task | undefined {
  return tasks.find((task) => task.slug === slug);
}

/** Tasks that appear before `slug`, in module order. Their saved drafts are prepended at check time. */
export function earlierTasks(slug: string): Task[] {
  const index = tasks.findIndex((task) => task.slug === slug);
  if (index < 0) return [];
  return tasks.slice(0, index);
}

export const TOTAL_POINTS = tasks.reduce((sum, task) => sum + task.points, 0);

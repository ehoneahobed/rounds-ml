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
        text: "A node in a tree is just a bag of training labels—for example four people: `[0, 0, 0, 1]`. You need a number for how mixed that bag is. Pure (everyone the same) should score 0. Half-and-half should score high. That number is Gini impurity.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "ol",
        items: [
          "Count each class. Here: three `0`s and one `1`. Total n = 4.",
          "Turn counts into shares (proportions): p₀ = 3/4 = 0.75, p₁ = 1/4 = 0.25.",
          "Square each share: 0.75² = 0.5625, 0.25² = 0.0625.",
          "Add the squares: 0.625.",
          "Gini = 1 − that sum = 1 − 0.625 = 0.375.",
        ],
      },
      {
        type: "p",
        text: "In symbols, if each class’s share of the bag is \\(p_k\\),",
      },
      {
        type: "math",
        latex: "G = 1 - \\sum_k p_k^2.",
      },
      {
        type: "p",
        text: "Check the extremes. All one class → only share is 1 → \\(G = 1 - 1 = 0\\). Two classes evenly split (`[0,1,0,1]`) → shares 0.5, 0.5 → \\(G = 1 - 0.25 - 0.25 = 0.5\\). So for a yes/no label, Gini runs from 0 (pure) up to 0.5 (maximally mixed).",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `gini_impurity(labels)` that returns that number for any list of integer class labels (two classes or more). Order of the list must not matter. Empty list → `0.0`. Floats may differ by at most `1e-12` from the exact value.",
      },
      {
        type: "terminal",
        text: ">>> gini_impurity([0, 0, 0, 1])\n0.375\n>>> gini_impurity([0, 1, 0, 1])\n0.5\n>>> gini_impurity([])\n0.0\n>>> gini_impurity([7, 7, 7])\n0.0",
      },
      {
        type: "callout",
        tone: "note",
        title: "What the checker also tries",
        text: "A one-row node (must be 0), and a three-class bag. The public samples above are not the whole test.",
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
        text: "Entropy is a second way to score how mixed a bag of labels is. Same shares as Gini, different arithmetic. Trees in this module’s checker use Gini; you still implement entropy so you can compare the two.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "p",
        text: "Take `[0, 1, 1, 0]` — two of each class. Shares p₀ = 0.5, p₁ = 0.5. Entropy in bits is",
      },
      {
        type: "math",
        latex: "H = -\\bigl(p_0\\log_2 p_0 + p_1\\log_2 p_1 + \\cdots\\bigr).",
      },
      {
        type: "p",
        text: "So \\(H = -(0.5\\log_2 0.5 + 0.5\\log_2 0.5) = -(0.5\\cdot(-1) + 0.5\\cdot(-1)) = 1\\). A fair coin of labels is exactly 1 bit. A pure bag `[0,0,0,0]` has only p=1; that term is 0, so H = 0.",
      },
      {
        type: "p",
        text: "If a class never appears, its share is 0. Do not call `log2(0)`. Treat that term as 0.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `entropy(labels)` using base-2 logs. Empty list → `0.0`. Three equal classes should return `log2(3)`. Tolerance `1e-12`.",
      },
      {
        type: "terminal",
        text: ">>> entropy([0, 1, 1, 0])\n1.0\n>>> entropy([0, 0, 0, 0])\n0.0\n>>> entropy([])\n0.0",
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
        text: "A split sends some people left and some right. Information gain asks: how much cleaner did the bags get? Parent impurity minus the size-weighted impurity of the children.",
      },
      {
        type: "h2",
        text: "Work it by hand once (Gini)",
      },
      {
        type: "p",
        text: "Parent: eight labels `[0,0,0,0,1,1,1,1]`. That is half and half, so parent Gini = 0.5. Perfect split: left all zeros, right all ones. Each child is pure → Gini 0. Weights are 4/8 and 4/8. Gain = 0.5 − (0.5·0 + 0.5·0) = 0.5.",
      },
      {
        type: "math",
        latex:
          "\\mathrm{Gain} = I(\\mathrm{parent}) - \\frac{|L|}{n} I(L) - \\frac{|R|}{n} I(R), \\quad n = |L| + |R|.",
      },
      {
        type: "p",
        text: "If either child is empty, it is not a real split—return 0. Same if the parent is empty.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `information_gain(parent, left, right, criterion='gini')`. Use your saved `gini_impurity` / `entropy` (earlier drafts are prepended when you run checks). `criterion` must be `'gini'` or `'entropy'`; anything else raises `ValueError`.",
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
        text: "You have one numeric column and a label for each row. You want the best yes/no cut: “is this value ≤ some threshold?” Only midpoints between neighboring sorted values that differ are worth trying—any number between those two neighbors sends the same people left and right.",
      },
      {
        type: "h2",
        text: "Recipe",
      },
      {
        type: "ol",
        items: [
          "Pair each value with its label. Sort by the value.",
          "Look between adjacent pairs. If the two values are equal, skip—no new grouping.",
          "Threshold = midpoint of those two values. Everyone with value ≤ threshold would go left; the rest right.",
          "Score that cut with Gini information gain (parent vs left vs right).",
          "Keep the cut with the highest gain. If two gains tie within 1e−12, keep the lower threshold.",
        ],
      },
      {
        type: "p",
        text: "Teaching example: values `[0.8, 1.1, 1.2, 1.4, 2.0, 2.4, 3.1, 4.0]` with labels four 0s then four 1s. The best cut is between 1.4 and 2.0 → threshold 1.7, gain 0.5 (perfect separation).",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `best_numeric_split(values, labels)` returning `(threshold, gain)`. If nothing helps (or you cannot cut—one row, all values equal, pure labels with no useful cut), return `(float('nan'), 0.0)`. Mismatched lengths raise `ValueError`. Sort yourself; the checker will shuffle the input.",
      },
      {
        type: "terminal",
        text: ">>> best_numeric_split([0.8, 1.1, 1.2, 1.4, 2.0, 2.4, 3.1, 4.0], [0, 0, 0, 0, 1, 1, 1, 1])\n(1.7, 0.5)",
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
        text: "Now grow a whole flowchart. `fit` builds the tree from a numeric matrix `X` and labels `y`. `predict` walks each new row to a leaf and returns the majority class. `predict_proba` returns the class frequencies in that leaf (columns ordered by sorted `classes_`).",
      },
      {
        type: "h2",
        text: "How a node decides to split",
      },
      {
        type: "ol",
        items: [
          "If depth is already `max_depth`, or everyone has the same label, or there are too few rows to make two legal children—stop. Make a leaf.",
          "Otherwise try every feature. For each feature, try midpoint thresholds like `best_numeric_split`.",
          "Both children must have at least `min_samples_leaf` rows.",
          "Keep a split only if Gini gain is strictly greater than 0 and at least `min_impurity_decrease`.",
          "Among legal splits, take the highest gain. Ties within 1e−12: lower feature index, then lower threshold.",
          "`value <= threshold` goes left; `>` goes right.",
        ],
      },
      {
        type: "h2",
        text: "Leaves",
      },
      {
        type: "p",
        text: "Majority class wins. If two classes tie in count, pick the smaller label (because `classes_` is sorted). Probabilities are counts / n in that leaf, including 0.0 for a class that never appears in the leaf but exists in `classes_`.",
      },
      {
        type: "p",
        text: "On the eight-row teaching table (lactate then age), a fitted tree with default-ish stops should put the root on column 0 at threshold 1.8, and the high-lactate branch should split age at 64.5. Use that as a private check.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `DecisionTreeClassifier` as in the starter docstring—errors included. Read the docstring before coding. Do not import scikit-learn; it is not in the checker and would not match these tie rules.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "Exclusive-or",
        text: "A dataset where no single feature helps at the root must stay a stump even if `max_depth` is large. If your tree still splits it, your “gain > 0” check is wrong.",
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
        text: "A clinician should be able to read the tree as if-then sentences. Walk every path from the root to a leaf and write one line per leaf.",
      },
      {
        type: "h2",
        text: "Format",
      },
      {
        type: "code",
        code: "if lactate <= 1.80 AND age > 64.50 then 1 (p=1.00, n=2)",
      },
      {
        type: "ul",
        items: [
          "Walk depth-first, left child before right.",
          "Left edge uses `<=`; right edge uses `>`. Join conditions with ` AND `.",
          "Print thresholds and `p` with exactly two decimal places.",
          "`p` is the frequency of the predicted class in that leaf (not always class 1). Always say `n`—the leaf size.",
          "A tree that never split uses the condition `True`.",
        ],
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `export_paths(tree, feature_names)`. Wrong-length `feature_names` → `ValueError`. Export before `fit` → `RuntimeError`. The checker fits trees with your saved `DecisionTreeClassifier` from task 4 unless you redefine the class here.",
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
        text: "If the label is a number (days of stay, price, score), “how mixed?” becomes “how spread out?” Use population variance: average squared distance from the mean, dividing by n—not n−1.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "p",
        text: "`[10, 10, 0, 0]`. Mean = 5. Squared gaps: 25, 25, 25, 25. Variance = 100/4 = 25. A perfect split into `[10,10]` and `[0,0]` makes both children variance 0, so variance reduction is 25 − 0 = 25.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `variance(values)` (empty → 0) and `best_regression_split(values, targets)`. Same midpoint / lower-threshold tie rules as classification, but score with variance reduction weighted like information gain. No helpful cut → `(float('nan'), 0.0)`. Mismatched lengths → `ValueError`.",
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
        text: "Before you fit, refuse columns that cheat. Decision time for this project is hour 6 of an admission. Each column arrives as a dict with `name`, `available_hour` (int or `None`), and `role` (`feature`, `label`, or `identifier`).",
      },
      {
        type: "h2",
        text: "First matching reason wins",
      },
      {
        type: "ol",
        items: [
          "`label` — role is `label` (you never use the answer as an input).",
          "`identifier` — role is `identifier` (patient id, hospital id, …).",
          "`temporal_leak` — `available_hour` is not `None` and is greater than 6. Hour 6 itself is legal.",
          "`name_leak` — lowercased name contains any of: discharge, death, mortal, expired, icu_transfer, future_, day2, outcome, los_.",
          "`unknown_time` — it is a feature and hour is `None`.",
        ],
      },
      {
        type: "p",
        text: "Return only flagged columns as `{\"name\", \"reason\"}`, in input order. Clean columns are omitted. A bad name with hour 6 is still a name leak. A late hour outranks a bad name. Empty input → `[]`.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `leakage_report(columns)`. The checker includes a column named `Death` and a clean-named column with hour 7.",
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
        text: "A random row shuffle can put the same person in train and test. That flatters you. Hold out whole patients, and put the latest arrivals in the test set.",
      },
      {
        type: "h2",
        text: "Recipe",
      },
      {
        type: "ol",
        items: [
          "Group rows by patient id.",
          "Date each patient by their earliest `time_key` (timestamps are comparable strings).",
          "Sort patients by that time, then by `str(patient_id)`.",
          "Test = last `ceil(test_fraction * n_patients)` patients, clamped so each side has at least one patient.",
          "Every row of a patient stays together. Keep original row order inside train and inside test—do not sort the caller’s list in place.",
        ],
      },
      {
        type: "p",
        text: "Example: patients first seen on Jan 1, 2, 3, 4. With `test_fraction=0.5`, test is the last two. If the Jan-2 patient also has a Jan-5 row, that row stays in train with them.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `patient_temporal_split(rows, patient_key, time_key, test_fraction)` returning `(train_rows, test_rows)`. Fraction not strictly inside (0, 1), or fewer than two patients → `ValueError`.",
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
        text: "A leaf (or any model) gives a probability. You still pick a cutoff t: call the case positive when probability ≥ t. Then every test row falls into TP, FP, TN, or FN.",
      },
      {
        type: "h2",
        text: "Rates you already met on the concept pages",
      },
      {
        type: "ul",
        items: [
          "Sensitivity = TP / (TP+FN) — of true events, what fraction did you catch?",
          "Specificity = TN / (TN+FP) — of non-events, what fraction did you leave alone?",
          "PPV = TP / (TP+FP) — of alarms, what fraction were real?",
          "NPV = TN / (TN+FN).",
          "F1 = 2·TP / (2·TP + FP + FN).",
          "Brier = mean of (probability − label)².",
        ],
      },
      {
        type: "p",
        text: "If a denominator is 0, that rate is 0. Worked check: labels `[1,0,1,0]`, probs `[0.9,0.8,0.2,0.1]`, threshold 0.5 → each of TP, FP, TN, FN is 1, and Brier = 0.325.",
      },
      {
        type: "h2",
        text: "Choosing the threshold",
      },
      {
        type: "p",
        text: "`threshold_for_sensitivity` tries every distinct probability plus 0 and 1. Return the highest cutoff whose sensitivity is still ≥ the target. Highest, not lowest—among cutoffs that catch enough events, pick the strictest. If none qualify, return 0.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `clinical_metrics(y_true, y_prob, threshold)` and `threshold_for_sensitivity(y_true, y_prob, target_sensitivity)`. Empty or mismatched lengths → `ValueError`. Target outside [0, 1] → `ValueError`. Counts in the metrics dict are Python ints.",
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
        text: "Put the pieces together. You get a list of admission dicts. Fit a tree only on facts known at hour 6, hold out later patients, freeze a threshold for sensitivity 0.80 on the training side, and return the fitted model with that threshold.",
      },
      {
        type: "h2",
        text: "What you may use",
      },
      {
        type: "table",
        caption: "Decision time is hour 6.",
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
        type: "h2",
        text: "Recipe",
      },
      {
        type: "ol",
        items: [
          "Build the feature matrix from allowed columns only. List every forbidden column in `excluded`.",
          "Split with `patient_temporal_split(..., test_fraction=0.25)`.",
          "Fit your `DecisionTreeClassifier` on the training patients only. Depth ≤ 4. Every leaf ≥ 10 training rows (`min_samples_leaf=15` is a sound default).",
          "Take class-1 probabilities on the training rows. Choose the threshold with `threshold_for_sensitivity(..., 0.80)`.",
          "Return the dict described in the starter docstring (`model`, `features`, `threshold`, `excluded`).",
        ],
      },
      {
        type: "callout",
        tone: "practice",
        title: "How you are scored",
        text: "The checker rebuilds the official split and scores your model on later patients. It checks that your threshold matches the training rule, walks `model.root` for leaf sizes, and requires test sensitivity ≥ 0.75 and specificity ≥ 0.50 on cohort A (shown) and hidden cohort B. Hardcoding rows will not travel.",
      },
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

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
        text: "Bagging starts with a bootstrap sample: draw n training rows with replacement from n rows. Some people appear twice; some never appear. Those missing rows are the out-of-bag set for that tree.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "p",
        text: "n = 4. You call `rng.randrange(4)` four times and get indices `[2, 0, 2, 3]`. The bootstrap X/y are those rows (row 2 twice). The indices list is part of the return value so the checker can verify the draws.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `bootstrap_sample(X, y, rng)` returning `(X_boot, y_boot, indices)`. Draw with `rng.randrange(n)` only—do not use `choices` or shuffle. Empty X or length mismatch with y → `ValueError`.",
      },
      {
        type: "callout",
        tone: "note",
        title: "Determinism",
        text: "The checker seeds `random.Random` and compares your indices exactly. Same seed, same draws.",
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
        text: "A forest’s hard prediction is a vote among trees. Count how often each label appears. The winner is the most common label. On a tie, pick the smaller label—so `[0, 1]` → `0`, not a coin flip.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "p",
        text: "`[1, 1, 0, 1, 0]` → three 1s, two 0s → `1`. `[0, 1]` → one each → smaller label `0`.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `majority_vote(labels)`. Empty input → `ValueError`.",
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
        text: "Soft voting averages probability vectors instead of hard labels. Each tree returns `[p₀, p₁, …]` for one patient. Average position-wise across trees.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "p",
        text: "Two trees: `[0.2, 0.8]` and `[0.4, 0.6]`. Mean = `[0.3, 0.7]`.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `mean_probability(prob_lists)`. Empty outer list → `[]`. Inner lists of unequal length → `ValueError`.",
      },
      {
        type: "terminal",
        text: ">>> mean_probability([[0.2, 0.8], [0.4, 0.6]])\n[0.3, 0.7]",
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
        text: "Random forests do not search every feature at every split. They pick a random subset of columns, then take the best split among those. That de-correlates the trees.",
      },
      {
        type: "h2",
        text: "How many features?",
      },
      {
        type: "ul",
        items: [
          "`None` → use all `n_features`.",
          "`\"sqrt\"` → `max(1, floor(sqrt(n_features)))`. For 9 features that is 3.",
          "A positive int → clamp into `[1, n_features]`.",
        ],
      },
      {
        type: "h2",
        text: "Which indices?",
      },
      {
        type: "p",
        text: "`random_feature_indices` samples `k` distinct indices with `rng.sample(range(n_features), k)` and returns them sorted ascending so the checker’s order is stable.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `max_features_count(n_features, max_features=\"sqrt\")` and `random_feature_indices(n_features, max_features, rng)`. `n_features < 1` or a bad `max_features` → `ValueError`.",
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
        text: "This is the same Gini CART tree as the decision-trees module, plus one knob: at each split you may only search a random subset of features. When `max_features` is `None`, search every column—behavior matches the earlier module.",
      },
      {
        type: "h2",
        text: "Split contract (same as before)",
      },
      {
        type: "ul",
        items: [
          "Score candidates with Gini impurity decrease (information gain with Gini).",
          "Ties within `GAIN_TIE = 1e-12`: prefer the lower feature index, then the lower threshold.",
          "Thresholds are midpoints between consecutive sorted unique values.",
          "Leaf prediction: majority label; ties go to the smaller label among `classes_`.",
          "Also store class probabilities on each leaf for soft voting later.",
        ],
      },
      {
        type: "h2",
        text: "Random features at a split",
      },
      {
        type: "p",
        text: "If `max_features` is set, call `random_feature_indices(n_features, max_features, self.rng)` and only consider those columns. Pass a `random.Random` into the constructor (default seed 0 is fine).",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `DecisionTreeClassifier` with `fit`, `predict`, and `predict_proba`. Expose `root`, `classes_`, and `n_features_` after fitting. Depth and `min_samples_leaf` stop growing early, just as in the trees module.",
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
        text: "A random forest is a loop: for each tree, draw a bootstrap sample, grow a Gini tree with random features at each split, store the tree. Prediction majority-votes hard labels; `predict_proba` averages probability rows.",
      },
      {
        type: "h2",
        text: "Deterministic RNG recipe",
      },
      {
        type: "ol",
        items: [
          "Create `master = random.Random(random_state)`.",
          "For each of `n_estimators` trees: draw `tree_rng = random.Random(master.randrange(2**31))`.",
          "Bootstrap with `bootstrap_sample(X, y, master)` — note the master stream, not `tree_rng`.",
          "Fit `DecisionTreeClassifier(..., max_features=..., rng=tree_rng)` on the bootstrap rows.",
          "Append to `trees_`.",
        ],
      },
      {
        type: "p",
        text: "That ordering matches the reference. If you swap which RNG draws the bootstrap, the checker’s seeds will not line up.",
      },
      {
        type: "h2",
        text: "Predicting",
      },
      {
        type: "ul",
        items: [
          "`predict`: each tree votes a label; `majority_vote` across trees per row.",
          "`predict_proba`: each tree returns a probability row; align to `forest.classes_` if a tree never saw a class, then `mean_probability` across trees.",
        ],
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `RandomForestClassifier` with `fit`, `predict`, and `predict_proba`. After fit: `trees_`, `classes_` (sorted), `n_features_`.",
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
        text: "Which columns did the forest actually split on? Walk every tree and count how often each feature index appears on an internal node. That is a rough importance sketch—not impurity-weighted, just a tally.",
      },
      {
        type: "h2",
        text: "Recipe",
      },
      {
        type: "ol",
        items: [
          "Start a list of zeros of length `forest.n_features_`.",
          "For each tree in `forest.trees_`, walk `tree.root`.",
          "If `node.feature is not None`, increment that index, then visit left and right.",
          "Leaves have `feature is None`—stop there.",
        ],
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `feature_use_counts(forest)` returning that integer list.",
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
        text: "Same operating-point idea as logistic: use class-1 probabilities from the forest, freeze a sensitivity floor, and among cutoffs that still catch enough events pick the highest threshold.",
      },
      {
        type: "h2",
        text: "Recipe",
      },
      {
        type: "ol",
        items: [
          "Predict 1 when probability ≥ threshold.",
          "Try `{0.00, 0.01, …, 1.00}`.",
          "Return the highest threshold with sensitivity ≥ target; else `0.0`.",
        ],
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `threshold_for_sensitivity(y_true, y_prob, target=0.80)`. You may define a small local confusion helper. Empty input → `0.0`. Length mismatch → `ValueError`.",
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
        text: "Before you fit, refuse columns that cheat. Decision time is hour 6. Each column is a dict with `name`, `available_hour`, and `role`.",
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
          "`temporal_leak` — hour is not `None` and is greater than the decision hour.",
          "`name_leak` — lowercased name contains any of: discharge, death, mortal, expired, icu_transfer, icu_, future_, day2, outcome, los_.",
          "`unknown_time` — role is `feature` and hour is `None`.",
        ],
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `leakage_report(columns, decision_hour=6)`. Return only flagged `{\"name\", \"reason\"}` rows in input order.",
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
        text: "Same patient-time holdout as linear and logistic: whole patients together, latest first-seen times in the test set.",
      },
      {
        type: "h2",
        text: "Recipe",
      },
      {
        type: "ol",
        items: [
          "Group by patient; date by earliest `time_key`.",
          "Sort by that time, then `str(patient_id)`.",
          "Test = last `ceil(fraction * n)` patients, clamped to `[1, n-1]`.",
          "Keep original row order inside each side.",
        ],
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `patient_temporal_split(rows, patient_key, time_key, fraction)`. Bad fraction or fewer than two patients → `ValueError`.",
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
        text: "Put the pieces together. Fit a small random forest for `deteriorated` on hour-6 features only, hold out later patients, freeze a train threshold for sensitivity 0.80, and report the rates.",
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
          "Build matrices from `ALLOWED_FEATURES` only (no standardization required for the forest).",
          "Fit `RandomForestClassifier(n_estimators=25, max_depth=4, min_samples_leaf=15, max_features=\"sqrt\", random_state=0)`.",
          "Take class-1 probabilities (`model.classes_.index(1)`). Choose the threshold on the training side for sensitivity 0.80.",
          "Return threshold, train/test sensitivity and specificity, `feature_names`, and `model`.",
        ],
      },
      {
        type: "callout",
        tone: "practice",
        title: "How you are scored",
        text: "The checker rebuilds the official split. Test sensitivity ≥ 0.65 and specificity ≥ 0.45 on cohorts A and B. Hardcoding rows will not travel.",
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

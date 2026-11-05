/** Editor seeds. Each one states the contract and fails until the student fills it in. */

export const starters: Record<string, string> = {
  gini: `def gini_impurity(labels: list[int]) -> float:
    """Gini impurity, 1 - sum(p_k^2).

    Empty input is 0. Label order does not matter. One class is 0.
    """
    raise NotImplementedError
`,
  entropy: `import math


def entropy(labels: list[int]) -> float:
    """Shannon entropy in bits. Treat 0 log 0 as 0. Empty input is 0."""
    raise NotImplementedError
`,
  "information-gain": `def information_gain(parent: list[int], left: list[int], right: list[int], criterion: str = "gini") -> float:
    """Impurity(parent) minus the size-weighted impurity of the children.

    Weights use len(left) + len(right). If the parent or either child is
    empty, return 0. criterion is "gini" or "entropy"; anything else raises
    ValueError.
    """
    raise NotImplementedError
`,
  "best-split": `import math


def best_numeric_split(values: list[float], labels: list[int]) -> tuple[float, float]:
    """Best midpoint split of one numeric column under Gini.

    Sort the column. Cut only between adjacent values that differ.
    Threshold is the midpoint, and value <= threshold goes left.
    Return (threshold, gain). Ties within 1e-12 go to the lower threshold.
    If no split reduces impurity, return (float("nan"), 0.0).
    A single row cannot split. Mismatched lengths raise ValueError.
    """
    raise NotImplementedError
`,
  tree: `class DecisionTreeClassifier:
    """Greedy Gini tree for complete numeric matrices.

    max_depth: root depth is 0. A node at depth >= max_depth is a leaf.
    min_samples_leaf: both children must hold at least this many rows.
    min_impurity_decrease: keep a split only when gain > 0 and gain is at
    least this large. Gains within 1e-12 are tied.

    Tie-break: higher gain, then lower feature index, then lower threshold.
    value <= threshold goes left.
    classes_ are the sorted unique training labels.
    Leaf prediction is the majority class; ties go to the smaller label.
    predict_proba columns follow classes_.

    Store on the instance: root, classes_, max_depth, min_samples_leaf,
    n_features_. Each node has feature (or None), threshold, left, right,
    prediction, probabilities, n_samples.

    fit replaces any previous tree. predict or predict_proba before fit
    raises RuntimeError. Empty X, ragged rows, and a feature-count mismatch
    at predict time raise ValueError. max_depth < 0 or min_samples_leaf < 1
    raises ValueError.
    """

    def __init__(self, max_depth: int = 4, min_samples_leaf: int = 1, min_impurity_decrease: float = 0.0):
        self.max_depth = max_depth
        self.min_samples_leaf = min_samples_leaf
        self.min_impurity_decrease = min_impurity_decrease
        self.root = None
        self.classes_ = []
        self.n_features_ = 0

    def fit(self, X: list[list[float]], y: list[int]):
        raise NotImplementedError

    def predict(self, X: list[list[float]]) -> list[int]:
        raise NotImplementedError

    def predict_proba(self, X: list[list[float]]) -> list[list[float]]:
        raise NotImplementedError
`,
  "export-paths": `def export_paths(tree, feature_names: list[str]) -> list[str]:
    """One string per leaf, depth-first, left then right.

    "if lactate <= 1.80 AND age > 64.50 then 1 (p=1.00, n=2)"
    A tree that never split uses the condition True.
    Thresholds and p use two decimal places. p is the frequency of the
    predicted class. feature_names must match n_features_.
    Exporting before fit raises RuntimeError.
    """
    raise NotImplementedError
`,
  regression: `import math


def variance(values: list[float]) -> float:
    """Population variance, divided by n, not n - 1. Empty input is 0."""
    raise NotImplementedError


def best_regression_split(values: list[float], targets: list[float]) -> tuple[float, float]:
    """Best midpoint split under variance reduction.

    Same threshold rules as best_numeric_split: sort, skip equal adjacent
    values, midpoint, lower threshold wins a tie within 1e-12.
    Return (float("nan"), 0.0) when nothing reduces variance.
    Mismatched lengths raise ValueError.
    """
    raise NotImplementedError
`,
  leakage: `EARLY_WARNING_HOUR = 6

NAME_LEAK_SUBSTRINGS = (
    "discharge",
    "death",
    "mortal",
    "expired",
    "icu_transfer",
    "future_",
    "day2",
    "outcome",
    "los_",
)


def leakage_report(columns: list[dict]) -> list[dict]:
    """Flag columns that cannot be features at hour 6.

    Each column has name, available_hour, and role ("feature", "label",
    or "identifier"). First match wins:
      label, identifier, temporal_leak (hour > 6), name_leak, unknown_time.
    Name match is case-insensitive and uses the substrings above.
    Return [{"name", "reason"}, ...] in input order. Clean columns are omitted.
    """
    raise NotImplementedError
`,
  "temporal-split": `import math


def patient_temporal_split(
    rows: list[dict],
    patient_key: str = "patient_id",
    time_key: str = "admission_time",
    test_fraction: float = 0.25,
) -> tuple[list[dict], list[dict]]:
    """Hold out the patients whose earliest timestamp is latest.

    Order patients by (earliest timestamp, patient id as a string).
    n_test = ceil(test_fraction * n_patients), then clamp to [1, n_patients - 1].
    Every row of a patient stays on the same side, in the original row order.
    Do not reorder the caller's list.
    Timestamps are zero-padded strings that sort chronologically.
    Raise ValueError if test_fraction is not strictly between 0 and 1,
    or if there are fewer than two patients.
    """
    raise NotImplementedError
`,
  metrics: `def clinical_metrics(y_true: list[int], y_prob: list[float], threshold: float) -> dict:
    """Rates at one threshold. Predict positive when probability >= threshold.

    Keys: sensitivity, specificity, ppv, npv, f1, brier, tp, fp, tn, fn.
    A rate with a zero denominator is 0.
    f1 = 2*tp / (2*tp + fp + fn), or 0 when that denominator is 0.
    brier is the mean squared error of the probabilities.
    Counts are ints. Raise ValueError when the two sequences differ in length
    or are empty.
    """
    raise NotImplementedError


def threshold_for_sensitivity(y_true: list[int], y_prob: list[float], target_sensitivity: float) -> float:
    """Highest threshold whose sensitivity is still at least the target.

    Candidates are the unique probabilities plus 0 and 1.
    If none qualify, return 0.
    Raise ValueError on empty input, mismatched lengths, or a target outside [0, 1].
    """
    raise NotImplementedError
`,
  "early-warning": `def train_early_warning(rows: list[dict]) -> dict:
    """Fit an hour-6 deterioration tree and freeze a training threshold.

    Allowed features, and no others:
      age, sex, hr, sbp, rr, temp, spo2, lactate, creatinine, wbc,
      diabetes, heart_failure.

    Never use as features:
      patient_id, hospital_id, admission_time, lactate_h30, los_days,
      discharge_disposition, death_in_hospital, icu_transfer, deteriorated.

    Use patient_temporal_split with test_fraction 0.25. Fit only on the
    training patients. DecisionTreeClassifier max_depth <= 4 and
    min_samples_leaf >= 10. A working start is max_depth=4 and
    min_samples_leaf=15.

    Positive probability is the classes_ column for label 1.
    Choose the threshold with threshold_for_sensitivity on the training
    probabilities, target 0.80. Do not retune it on the test patients.

    Return {"model", "features", "threshold", "excluded"}.
    excluded must include every forbidden name above.
    The root n_samples must equal the number of training rows.
    On the future slice the checker requires sensitivity >= 0.75 and
    specificity >= 0.50. A second cohort with another seed is checked too.
    """
    raise NotImplementedError
`,
};

"""Reference implementation for the Rounds decision-tree module.

The checker grades student code against the same contracts this file implements.
Read the concept pages and attempt the tasks before opening this module.
"""

from __future__ import annotations

import math


# Gains this close are treated as equal so a lower feature index, then a lower
# threshold, can win a tie. Gini values sit well above 1e-12 when a split is real.
GAIN_TIE = 1e-12

EARLY_WARNING_HOUR = 6

# Substrings matched case-insensitively against a column name.
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

ALLOWED_FEATURES = (
    "age",
    "sex",
    "hr",
    "sbp",
    "rr",
    "temp",
    "spo2",
    "lactate",
    "creatinine",
    "wbc",
    "diabetes",
    "heart_failure",
)


def gini_impurity(labels: list[int]) -> float:
    """Gini impurity of a multiset of class labels.

    Gini is the probability that two labels drawn with replacement differ:
    ``1 - sum(p_k^2)``. An empty list is defined as 0 so callers can skip a
    special case before they know a node has rows.
    """
    n = len(labels)
    if n == 0:
        return 0.0
    counts: dict[int, int] = {}
    for label in labels:
        counts[label] = counts.get(label, 0) + 1
    sum_squares = 0.0
    for count in counts.values():
        proportion = count / n
        sum_squares += proportion * proportion
    return 1.0 - sum_squares


def entropy(labels: list[int]) -> float:
    """Shannon entropy in bits. ``0 log 0`` is taken as 0. Empty input is 0."""
    n = len(labels)
    if n == 0:
        return 0.0
    counts: dict[int, int] = {}
    for label in labels:
        counts[label] = counts.get(label, 0) + 1
    total = 0.0
    for count in counts.values():
        proportion = count / n
        total -= proportion * math.log2(proportion)
    return total


def information_gain(
    parent: list[int],
    left: list[int],
    right: list[int],
    criterion: str = "gini",
) -> float:
    """Impurity of ``parent`` minus the size-weighted impurity of the children.

    Either child being empty is not a split, so the gain is 0. The weights use
    ``len(left) + len(right)``, which equals ``len(parent)`` when the children
    partition the parent. ``criterion`` is ``"gini"`` or ``"entropy"``.
    """
    if criterion == "gini":
        impurity = gini_impurity
    elif criterion == "entropy":
        impurity = entropy
    else:
        raise ValueError("criterion must be 'gini' or 'entropy'")
    if len(parent) == 0 or len(left) == 0 or len(right) == 0:
        return 0.0
    n = len(left) + len(right)
    return impurity(parent) - (len(left) / n) * impurity(left) - (len(right) / n) * impurity(right)


def _as_gain_pair(values: list[float], targets: list[float] | list[int], score_fn) -> tuple[float, float]:
    """Shared scan for classification and regression threshold search.

    ``score_fn(parent, left, right) -> float`` is the reduction to maximise.
    Returns ``(threshold, reduction)`` or ``(nan, 0.0)`` when nothing helps.
    """
    if len(values) != len(targets):
        raise ValueError("values and targets must have the same length")
    n = len(values)
    if n < 2:
        return (float("nan"), 0.0)
    order = sorted(range(n), key=lambda index: values[index])
    parent = [targets[index] for index in order]
    best_gain = 0.0
    best_threshold: float | None = None
    for cut in range(n - 1):
        left_value = values[order[cut]]
        right_value = values[order[cut + 1]]
        if left_value == right_value:
            continue
        threshold = (left_value + right_value) / 2.0
        left = parent[: cut + 1]
        right = parent[cut + 1 :]
        gain = score_fn(parent, left, right)
        if gain <= GAIN_TIE:
            continue
        if best_threshold is None or gain > best_gain + GAIN_TIE or (
            abs(gain - best_gain) <= GAIN_TIE and threshold < best_threshold
        ):
            best_gain = gain
            best_threshold = threshold
    if best_threshold is None:
        return (float("nan"), 0.0)
    return (best_threshold, best_gain)


def best_numeric_split(values: list[float], labels: list[int]) -> tuple[float, float]:
    """Best midpoint split of one numeric column under Gini.

    Rows with ``value <= threshold`` go left. Thresholds sit halfway between
    two adjacent sorted values that actually differ. Ties on gain go to the
    lower threshold. If no split reduces impurity, returns ``(nan, 0.0)``.
    """

    def score(parent: list[int], left: list[int], right: list[int]) -> float:
        return information_gain(parent, left, right, "gini")

    return _as_gain_pair(values, labels, score)


def variance(values: list[float]) -> float:
    """Population variance (divide by n, not n - 1). Empty input is 0.

    CART uses this quantity as the regression impurity. It is the mean
    squared error of predicting the node mean.
    """
    n = len(values)
    if n == 0:
        return 0.0
    mean = sum(values) / n
    return sum((value - mean) ** 2 for value in values) / n


def best_regression_split(values: list[float], targets: list[float]) -> tuple[float, float]:
    """Best midpoint split of one column under variance reduction.

    Same threshold rules as :func:`best_numeric_split`. The score is
    ``variance(parent) - weighted variances of the children``.
    """

    def score(parent: list[float], left: list[float], right: list[float]) -> float:
        if len(left) == 0 or len(right) == 0:
            return 0.0
        n = len(left) + len(right)
        return variance(parent) - (len(left) / n) * variance(left) - (len(right) / n) * variance(right)

    return _as_gain_pair(values, targets, score)


class _Node:
    """One node of a binary tree.

    A leaf has ``feature is None``. A split stores the column index and the
    ``<=`` threshold, and both children exist. ``probabilities`` follows
    ``tree.classes_`` and sums to 1.
    """

    def __init__(self) -> None:
        self.feature: int | None = None
        self.threshold: float | None = None
        self.left: _Node | None = None
        self.right: _Node | None = None
        self.prediction: int | None = None
        self.probabilities: list[float] = []
        self.n_samples: int = 0
        self.counts: list[int] = []


def _gini_from_counts(counts: list[int], n: int) -> float:
    if n == 0:
        return 0.0
    sum_squares = 0.0
    for count in counts:
        proportion = count / n
        sum_squares += proportion * proportion
    return 1.0 - sum_squares


class DecisionTreeClassifier:
    """Greedy binary classification tree for complete numeric matrices.

    Parameters
    ----------
    max_depth:
        Root depth is 0. A node whose depth is already ``max_depth`` is a leaf.
        ``max_depth=0`` is a stump that never splits.
    min_samples_leaf:
        Both children of a split must contain at least this many rows.
    min_impurity_decrease:
        A split is kept only when its Gini gain is ``> 0`` and at least this
        large. Gains within ``1e-12`` are tied.
    """

    def __init__(
        self,
        max_depth: int = 4,
        min_samples_leaf: int = 1,
        min_impurity_decrease: float = 0.0,
    ) -> None:
        if max_depth < 0:
            raise ValueError("max_depth must be >= 0")
        if min_samples_leaf < 1:
            raise ValueError("min_samples_leaf must be >= 1")
        if min_impurity_decrease < 0:
            raise ValueError("min_impurity_decrease must be >= 0")
        self.max_depth = max_depth
        self.min_samples_leaf = min_samples_leaf
        self.min_impurity_decrease = min_impurity_decrease
        self.root: _Node | None = None
        self.classes_: list[int] = []
        self.n_features_: int = 0

    def fit(self, X: list[list[float]], y: list[int]) -> DecisionTreeClassifier:
        """Fit on a numeric matrix. Replaces any tree already stored on this instance."""
        self._validate_matrix(X, y)
        self.n_features_ = len(X[0])
        self.classes_ = sorted(set(y))
        self.root = self._build(X, y, depth=0)
        return self

    def predict(self, X: list[list[float]]) -> list[int]:
        """Predicted class for each row. Ties were already broken in the leaf."""
        return [leaf.prediction for leaf in self._leaves_for(X)]  # type: ignore[misc]

    def predict_proba(self, X: list[list[float]]) -> list[list[float]]:
        """Class frequencies in the reached leaf, columns ordered as ``classes_``."""
        return [list(leaf.probabilities) for leaf in self._leaves_for(X)]

    def _validate_matrix(self, X: list[list[float]], y: list[int] | None = None) -> None:
        if len(X) == 0:
            raise ValueError("X is empty")
        width = len(X[0])
        if width == 0:
            raise ValueError("X has no features")
        for row in X:
            if len(row) != width:
                raise ValueError("all rows must have the same number of features")
        if y is not None and len(X) != len(y):
            raise ValueError("X and y must have the same length")

    def _leaves_for(self, X: list[list[float]]) -> list[_Node]:
        if self.root is None:
            raise RuntimeError("fit the tree before predicting")
        self._validate_matrix(X)
        if len(X[0]) != self.n_features_:
            raise ValueError("X has a different number of features than the fitted tree")
        return [self._walk(row) for row in X]

    def _walk(self, row: list[float]) -> _Node:
        node = self.root
        assert node is not None
        while node.feature is not None:
            threshold = node.threshold
            assert threshold is not None and node.left is not None and node.right is not None
            node = node.left if row[node.feature] <= threshold else node.right
        return node

    def _leaf_from_labels(self, y: list[int]) -> _Node:
        """Build a leaf. Majority ties go to the smaller label because classes are sorted."""
        index = {label: position for position, label in enumerate(self.classes_)}
        counts = [0] * len(self.classes_)
        for label in y:
            counts[index[label]] += 1
        best_index = 0
        for position, count in enumerate(counts):
            if count > counts[best_index]:
                best_index = position
        node = _Node()
        node.n_samples = len(y)
        node.counts = counts
        node.probabilities = [count / len(y) for count in counts]
        node.prediction = self.classes_[best_index]
        return node

    def _build(self, X: list[list[float]], y: list[int], depth: int) -> _Node:
        node = self._leaf_from_labels(y)
        if depth >= self.max_depth or len(set(y)) == 1 or len(y) < 2 * self.min_samples_leaf:
            return node
        split = self._best_split(X, y)
        if split is None:
            return node
        feature, threshold, left_index, right_index = split
        node.feature = feature
        node.threshold = threshold
        node.left = self._build(
            [X[index] for index in left_index],
            [y[index] for index in left_index],
            depth + 1,
        )
        node.right = self._build(
            [X[index] for index in right_index],
            [y[index] for index in right_index],
            depth + 1,
        )
        return node

    def _best_split(
        self, X: list[list[float]], y: list[int]
    ) -> tuple[int, float, list[int], list[int]] | None:
        """Return feature, threshold, and row indexes, or None when no legal split helps.

        Class counts move with the scan: after sorting a column, each cut is O(1)
        in the impurity, which keeps a few hundred clinical rows comfortable.
        """
        n = len(y)
        class_index = {label: position for position, label in enumerate(self.classes_)}
        parent_counts = [0] * len(self.classes_)
        for label in y:
            parent_counts[class_index[label]] += 1
        best: tuple[float, int, float, list[int], list[int]] | None = None
        for feature in range(self.n_features_):
            order = sorted(range(n), key=lambda index: X[index][feature])
            counts_left = [0] * len(self.classes_)
            counts_right = parent_counts[:]
            for cut in range(n - 1):
                moved = class_index[y[order[cut]]]
                counts_left[moved] += 1
                counts_right[moved] -= 1
                left_n = cut + 1
                right_n = n - left_n
                if left_n < self.min_samples_leaf or right_n < self.min_samples_leaf:
                    continue
                left_value = X[order[cut]][feature]
                right_value = X[order[cut + 1]][feature]
                if left_value == right_value:
                    continue
                threshold = (left_value + right_value) / 2.0
                gain = _gini_from_counts(parent_counts, n)
                gain -= (left_n / n) * _gini_from_counts(counts_left, left_n)
                gain -= (right_n / n) * _gini_from_counts(counts_right, right_n)
                if gain <= GAIN_TIE or gain < self.min_impurity_decrease:
                    continue
                if best is not None:
                    best_gain, best_feature, best_threshold, _, _ = best
                    better_gain = gain > best_gain + GAIN_TIE
                    tied = abs(gain - best_gain) <= GAIN_TIE
                    better_feature = tied and feature < best_feature
                    better_threshold = tied and feature == best_feature and threshold < best_threshold
                    if not (better_gain or better_feature or better_threshold):
                        continue
                best = (
                    gain,
                    feature,
                    threshold,
                    [order[index] for index in range(left_n)],
                    [order[index] for index in range(left_n, n)],
                )
        if best is None:
            return None
        _, feature, threshold, left_index, right_index = best
        return feature, threshold, left_index, right_index


def export_paths(tree: DecisionTreeClassifier, feature_names: list[str]) -> list[str]:
    """One string per leaf, depth-first, left child before right.

    Format: ``if lactate <= 1.80 AND age > 64.50 then 1 (p=1.00, n=2)``.
    A tree that never split uses the condition ``True``. ``p`` is the leaf
    frequency of the predicted class, printed to two decimal places.
    """
    if tree.root is None:
        raise RuntimeError("fit the tree before exporting paths")
    if len(feature_names) != tree.n_features_:
        raise ValueError("feature_names must have one name per fitted feature")
    paths: list[str] = []

    def visit(node: _Node, conditions: list[str]) -> None:
        if node.feature is None:
            assert node.prediction is not None
            class_index = tree.classes_.index(node.prediction)
            probability = node.probabilities[class_index]
            condition = " AND ".join(conditions) if conditions else "True"
            paths.append(
                f"if {condition} then {node.prediction} (p={probability:.2f}, n={node.n_samples})"
            )
            return
        assert node.threshold is not None and node.left is not None and node.right is not None
        name = feature_names[node.feature]
        visit(node.left, conditions + [f"{name} <= {node.threshold:.2f}"])
        visit(node.right, conditions + [f"{name} > {node.threshold:.2f}"])

    visit(tree.root, [])
    return paths


def leakage_report(columns: list[dict]) -> list[dict]:
    """Flag columns that must not be used as features at hour 6.

    Priority, first match wins: ``label``, ``identifier``, ``temporal_leak``
    (available_hour > 6), ``name_leak`` (a denylisted substring), then
    ``unknown_time`` when a feature has no recorded hour. Clean features are
    omitted. Output preserves input order.
    """
    flagged: list[dict] = []
    for column in columns:
        name = str(column["name"])
        role = column["role"]
        hour = column["available_hour"]
        lowered = name.lower()
        if role == "label":
            reason = "label"
        elif role == "identifier":
            reason = "identifier"
        elif hour is not None and hour > EARLY_WARNING_HOUR:
            reason = "temporal_leak"
        elif any(piece in lowered for piece in NAME_LEAK_SUBSTRINGS):
            reason = "name_leak"
        elif hour is None:
            reason = "unknown_time"
        else:
            continue
        flagged.append({"name": name, "reason": reason})
    return flagged


def patient_temporal_split(
    rows: list[dict],
    patient_key: str = "patient_id",
    time_key: str = "admission_time",
    test_fraction: float = 0.25,
) -> tuple[list[dict], list[dict]]:
    """Hold out the patients whose first timestamp is latest.

    Each patient is dated by their earliest ``time_key``. Patients are ordered
    by that timestamp, then by patient id. The last ``ceil(fraction * n)``
    patients, at least one and at most ``n - 1``, form the test set. Every row
    of a patient stays on the same side, and rows keep their original order.
    Timestamps must be zero-padded strings that sort chronologically.
    """
    if not 0 < test_fraction < 1:
        raise ValueError("test_fraction must be between 0 and 1")
    earliest: dict[object, str] = {}
    for row in rows:
        patient = row[patient_key]
        timestamp = str(row[time_key])
        current = earliest.get(patient)
        if current is None or timestamp < current:
            earliest[patient] = timestamp
    if len(earliest) < 2:
        raise ValueError("need at least two patients")
    patients = sorted(earliest, key=lambda patient: (earliest[patient], str(patient)))
    n_test = math.ceil(test_fraction * len(patients))
    n_test = min(max(n_test, 1), len(patients) - 1)
    test_ids = set(patients[-n_test:])
    train: list[dict] = []
    test: list[dict] = []
    for row in rows:
        if row[patient_key] in test_ids:
            test.append(row)
        else:
            train.append(row)
    return train, test


def clinical_metrics(y_true: list[int], y_prob: list[float], threshold: float) -> dict:
    """Operating-point metrics for a binary score.

    A row is predicted positive when ``y_prob >= threshold``. Sensitivity,
    specificity, PPV, and NPV are 0 when their denominator is 0. F1 is
    ``2*tp / (2*tp + fp + fn)``, or 0 when that denominator is 0. Brier is the
    mean squared error of the probabilities. Counts are ints.
    """
    if len(y_true) == 0 or len(y_true) != len(y_prob):
        raise ValueError("y_true and y_prob must be the same non-zero length")
    tp = fp = tn = fn = 0
    brier = 0.0
    for label, probability in zip(y_true, y_prob):
        predicted = 1 if probability >= threshold else 0
        if predicted == 1 and label == 1:
            tp += 1
        elif predicted == 1 and label == 0:
            fp += 1
        elif predicted == 0 and label == 0:
            tn += 1
        else:
            fn += 1
        brier += (probability - label) ** 2

    def ratio(numerator: int, denominator: int) -> float:
        return numerator / denominator if denominator else 0.0

    f1_denominator = 2 * tp + fp + fn
    return {
        "sensitivity": ratio(tp, tp + fn),
        "specificity": ratio(tn, tn + fp),
        "ppv": ratio(tp, tp + fp),
        "npv": ratio(tn, tn + fn),
        "f1": (2 * tp / f1_denominator) if f1_denominator else 0.0,
        "brier": brier / len(y_true),
        "tp": tp,
        "fp": fp,
        "tn": tn,
        "fn": fn,
    }


def threshold_for_sensitivity(
    y_true: list[int], y_prob: list[float], target_sensitivity: float
) -> float:
    """Highest threshold whose sensitivity is still at least the target.

    Candidates are the unique probabilities plus 0 and 1. Returning the highest
    surviving threshold keeps as many negatives out of the alarm as the target
    allows. If no candidate qualifies, returns 0.
    """
    if len(y_true) == 0 or len(y_true) != len(y_prob):
        raise ValueError("y_true and y_prob must be the same non-zero length")
    if not 0 <= target_sensitivity <= 1:
        raise ValueError("target_sensitivity must be between 0 and 1")
    candidates = set(y_prob)
    candidates.add(0.0)
    candidates.add(1.0)
    best: float | None = None
    for candidate in candidates:
        metrics = clinical_metrics(y_true, y_prob, candidate)
        if metrics["sensitivity"] + 1e-12 >= target_sensitivity and (best is None or candidate > best):
            best = candidate
    return 0.0 if best is None else best


def train_early_warning(rows: list[dict]) -> dict:
    """Fit an hour-6 deterioration tree and freeze a train-set threshold.

    Only the twelve admission-and-hour-6 columns in ``ALLOWED_FEATURES`` are
    used. The patient-time split holds out the latest 25% of patients. The
    threshold is chosen on the training rows for sensitivity 0.80 and is not
    refit on the future slice. The returned model is the fitted tree.
    """
    if len(rows) == 0:
        raise ValueError("rows is empty")
    features = list(ALLOWED_FEATURES)
    excluded = [key for key in rows[0] if key not in features]
    train, _test = patient_temporal_split(rows, test_fraction=0.25)
    model = DecisionTreeClassifier(max_depth=4, min_samples_leaf=15)
    matrix = [[float(row[name]) for name in features] for row in train]
    labels = [int(row["deteriorated"]) for row in train]
    model.fit(matrix, labels)
    positive_index = model.classes_.index(1)
    probabilities = [probs[positive_index] for probs in model.predict_proba(matrix)]
    threshold = threshold_for_sensitivity(labels, probabilities, 0.80)
    return {
        "model": model,
        "features": features,
        "threshold": threshold,
        "excluded": excluded,
    }

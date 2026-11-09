"""Reference implementation for the Rounds random-forests module.

The checker grades student code against these contracts. Read the concept
pages and attempt the tasks before opening this file.
"""

from __future__ import annotations

import json
import math
import random
from typing import Any

GAIN_TIE = 1e-12
EARLY_WARNING_HOUR = 6

NAME_LEAK_SUBSTRINGS = (
    "discharge",
    "death",
    "mortal",
    "expired",
    "icu_transfer",
    "icu_",
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


def bootstrap_sample(
    X: list[list[float]], y: list[int], rng: random.Random
) -> tuple[list[list[float]], list[int], list[int]]:
    """Sample n row indices with replacement using rng.randrange(n)."""
    if len(X) == 0 or len(X) != len(y):
        raise ValueError("X and y must be non-empty and the same length")
    n = len(X)
    indices = [rng.randrange(n) for _ in range(n)]
    return [X[i] for i in indices], [y[i] for i in indices], indices


def majority_vote(labels: list[int]) -> int:
    """Most common label. Ties go to the smaller label."""
    if not labels:
        raise ValueError("labels is empty")
    counts: dict[int, int] = {}
    for label in labels:
        counts[label] = counts.get(label, 0) + 1
    best_label = None
    best_count = -1
    for label, count in counts.items():
        if count > best_count or (count == best_count and best_label is not None and label < best_label):
            best_label = label
            best_count = count
    assert best_label is not None
    return best_label


def mean_probability(prob_lists: list[list[float]]) -> list[float]:
    """Mean of each position across rows of equal-length probability lists."""
    if not prob_lists:
        return []
    width = len(prob_lists[0])
    for row in prob_lists:
        if len(row) != width:
            raise ValueError("ragged probability rows")
    n = len(prob_lists)
    return [sum(row[j] for row in prob_lists) / n for j in range(width)]


def max_features_count(n_features: int, max_features: str | int | None = "sqrt") -> int:
    """Resolve max_features to an int in 1..n_features."""
    if n_features < 1:
        raise ValueError("n_features must be >= 1")
    if max_features is None:
        return n_features
    if max_features == "sqrt":
        return max(1, int(math.floor(math.sqrt(n_features))))
    if isinstance(max_features, int):
        if max_features < 1:
            raise ValueError("max_features must be >= 1")
        return min(max_features, n_features)
    raise ValueError("max_features must be None, 'sqrt', or a positive int")


def random_feature_indices(n_features: int, max_features: str | int | None, rng: random.Random) -> list[int]:
    """Sample without replacement using rng.sample. Return sorted indices."""
    k = max_features_count(n_features, max_features)
    chosen = rng.sample(range(n_features), k)
    return sorted(chosen)


def _gini_from_counts(counts: list[int], n: int) -> float:
    if n == 0:
        return 0.0
    sum_squares = 0.0
    for count in counts:
        proportion = count / n
        sum_squares += proportion * proportion
    return 1.0 - sum_squares


class _Node:
    def __init__(self) -> None:
        self.feature: int | None = None
        self.threshold: float | None = None
        self.left: _Node | None = None
        self.right: _Node | None = None
        self.prediction: int | None = None
        self.probabilities: list[float] = []
        self.n_samples: int = 0
        self.counts: list[int] = []


class DecisionTreeClassifier:
    """Greedy Gini tree. Optional max_features limits candidates at each split."""

    def __init__(
        self,
        max_depth: int = 4,
        min_samples_leaf: int = 1,
        min_impurity_decrease: float = 0.0,
        max_features: str | int | None = None,
        rng: random.Random | None = None,
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
        self.max_features = max_features
        self.rng = rng if rng is not None else random.Random(0)
        self.root: _Node | None = None
        self.classes_: list[int] = []
        self.n_features_: int = 0

    def fit(self, X: list[list[float]], y: list[int]) -> DecisionTreeClassifier:
        self._validate_matrix(X, y)
        self.n_features_ = len(X[0])
        self.classes_ = sorted(set(y))
        self.root = self._build(X, y, depth=0)
        return self

    def predict(self, X: list[list[float]]) -> list[int]:
        return [leaf.prediction for leaf in self._leaves_for(X)]  # type: ignore[misc]

    def predict_proba(self, X: list[list[float]]) -> list[list[float]]:
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
        node.left = self._build([X[i] for i in left_index], [y[i] for i in left_index], depth + 1)
        node.right = self._build([X[i] for i in right_index], [y[i] for i in right_index], depth + 1)
        return node

    def _candidate_features(self) -> list[int]:
        if self.max_features is None:
            return list(range(self.n_features_))
        return random_feature_indices(self.n_features_, self.max_features, self.rng)

    def _best_split(
        self, X: list[list[float]], y: list[int]
    ) -> tuple[int, float, list[int], list[int]] | None:
        n = len(y)
        class_index = {label: position for position, label in enumerate(self.classes_)}
        parent_counts = [0] * len(self.classes_)
        for label in y:
            parent_counts[class_index[label]] += 1
        best: tuple[float, int, float, list[int], list[int]] | None = None
        for feature in self._candidate_features():
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


class RandomForestClassifier:
    """Bagged Gini trees with per-split feature randomness."""

    def __init__(
        self,
        n_estimators: int = 10,
        max_depth: int = 4,
        min_samples_leaf: int = 1,
        max_features: str | int | None = "sqrt",
        random_state: int = 0,
    ) -> None:
        if n_estimators < 1:
            raise ValueError("n_estimators must be >= 1")
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_leaf = min_samples_leaf
        self.max_features = max_features
        self.random_state = random_state
        self.trees_: list[DecisionTreeClassifier] = []
        self.classes_: list[int] = []
        self.n_features_: int = 0

    def fit(self, X: list[list[float]], y: list[int]) -> RandomForestClassifier:
        if len(X) == 0 or len(X) != len(y):
            raise ValueError("X and y must be non-empty and the same length")
        self.n_features_ = len(X[0])
        self.classes_ = sorted(set(y))
        master = random.Random(self.random_state)
        self.trees_ = []
        for _ in range(self.n_estimators):
            tree_rng = random.Random(master.randrange(2**31))
            X_boot, y_boot, _ = bootstrap_sample(X, y, master)
            tree = DecisionTreeClassifier(
                max_depth=self.max_depth,
                min_samples_leaf=self.min_samples_leaf,
                max_features=self.max_features,
                rng=tree_rng,
            )
            tree.fit(X_boot, y_boot)
            self.trees_.append(tree)
        return self

    def predict_proba(self, X: list[list[float]]) -> list[list[float]]:
        if not self.trees_:
            raise RuntimeError("fit the forest before predicting")
        # Align each tree's probability vector to forest.classes_.
        per_tree: list[list[list[float]]] = []
        for tree in self.trees_:
            raw = tree.predict_proba(X)
            aligned: list[list[float]] = []
            for row in raw:
                mapped = [0.0] * len(self.classes_)
                for local_i, label in enumerate(tree.classes_):
                    mapped[self.classes_.index(label)] = row[local_i]
                aligned.append(mapped)
            per_tree.append(aligned)
        out: list[list[float]] = []
        for row_i in range(len(X)):
            rows = [per_tree[t][row_i] for t in range(len(self.trees_))]
            out.append(mean_probability(rows))
        return out

    def predict(self, X: list[list[float]]) -> list[int]:
        votes: list[list[int]] = [tree.predict(X) for tree in self.trees_]
        return [majority_vote([votes[t][i] for t in range(len(self.trees_))]) for i in range(len(X))]


def feature_use_counts(forest: RandomForestClassifier) -> list[int]:
    """Count how often each feature index appears as a split across forest.trees_."""
    counts = [0] * forest.n_features_

    def visit(node: _Node | None) -> None:
        if node is None or node.feature is None:
            return
        counts[node.feature] += 1
        visit(node.left)
        visit(node.right)

    for tree in forest.trees_:
        visit(tree.root)
    return counts


def confusion_counts(y_true: list[int], y_prob: list[float], threshold: float) -> tuple[int, int, int, int]:
    tp = fp = tn = fn = 0
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
    return tp, fp, tn, fn


def sensitivity(tp: int, fp: int, tn: int, fn: int) -> float:
    denominator = tp + fn
    return tp / denominator if denominator else 0.0


def specificity(tp: int, fp: int, tn: int, fn: int) -> float:
    denominator = tn + fp
    return tn / denominator if denominator else 0.0


def threshold_for_sensitivity(y_true: list[int], y_prob: list[float], target: float = 0.80) -> float:
    if len(y_true) != len(y_prob):
        raise ValueError("y_true and y_prob must have the same length")
    if not y_true:
        return 0.0
    best: float | None = None
    for step in range(101):
        candidate = step / 100.0
        tp, fp, tn, fn = confusion_counts(y_true, y_prob, candidate)
        if sensitivity(tp, fp, tn, fn) + 1e-12 >= target and (best is None or candidate > best):
            best = candidate
    return 0.0 if best is None else best


def leakage_report(columns: list[dict[str, Any]], decision_hour: int = EARLY_WARNING_HOUR) -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    for column in columns:
        name = str(column["name"])
        role = str(column["role"])
        hour = column.get("available_hour")
        reason: str | None = None
        if role == "label":
            reason = "label"
        elif role == "identifier":
            reason = "identifier"
        elif hour is not None and hour > decision_hour:
            reason = "temporal_leak"
        elif any(token in name.lower() for token in NAME_LEAK_SUBSTRINGS):
            reason = "name_leak"
        elif role == "feature" and hour is None:
            reason = "unknown_time"
        if reason is not None:
            out.append({"name": name, "reason": reason})
    return out


def patient_temporal_split(
    rows: list[dict[str, Any]],
    patient_key: str,
    time_key: str,
    fraction: float,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    if not 0.0 < fraction < 1.0:
        raise ValueError("fraction must be in (0, 1)")
    by_patient: dict[str, list[dict[str, Any]]] = {}
    first_time: dict[str, str] = {}
    order: list[str] = []
    for row in rows:
        pid = str(row[patient_key])
        if pid not in by_patient:
            by_patient[pid] = []
            first_time[pid] = str(row[time_key])
            order.append(pid)
        by_patient[pid].append(row)
        stamp = str(row[time_key])
        if stamp < first_time[pid]:
            first_time[pid] = stamp
    patients = sorted(order, key=lambda pid: (first_time[pid], pid))
    n = len(patients)
    if n < 2:
        raise ValueError("need at least two patients")
    n_test = int(math.ceil(fraction * n))
    n_test = min(max(n_test, 1), n - 1)
    test_ids = set(patients[-n_test:])
    train = [row for pid in patients if pid not in test_ids for row in by_patient[pid]]
    test = [row for pid in patients if pid in test_ids for row in by_patient[pid]]
    return train, test


def train_forest_early_warning(rows: list[dict[str, Any]]) -> dict[str, Any]:
    """Fit hour-6 random forest for deteriorated and freeze a train threshold."""
    if not rows:
        raise ValueError("rows is empty")
    train_rows, test_rows = patient_temporal_split(rows, "patient_id", "admission_time", 0.25)
    feature_names = list(ALLOWED_FEATURES)
    X_train = [[float(row[name]) for name in feature_names] for row in train_rows]
    y_train = [int(row["deteriorated"]) for row in train_rows]
    X_test = [[float(row[name]) for name in feature_names] for row in test_rows]
    y_test = [int(row["deteriorated"]) for row in test_rows]
    model = RandomForestClassifier(
        n_estimators=25,
        max_depth=4,
        min_samples_leaf=15,
        max_features="sqrt",
        random_state=0,
    )
    model.fit(X_train, y_train)
    positive = model.classes_.index(1)
    train_p = [probs[positive] for probs in model.predict_proba(X_train)]
    test_p = [probs[positive] for probs in model.predict_proba(X_test)]
    threshold = threshold_for_sensitivity(y_train, train_p, 0.80)

    def rates(y_true: list[int], y_prob: list[float]) -> tuple[float, float]:
        tp, fp, tn, fn = confusion_counts(y_true, y_prob, threshold)
        return sensitivity(tp, fp, tn, fn), specificity(tp, fp, tn, fn)

    train_sens, train_spec = rates(y_train, train_p)
    test_sens, test_spec = rates(y_test, test_p)
    return {
        "threshold": threshold,
        "train_sensitivity": train_sens,
        "train_specificity": train_spec,
        "test_sensitivity": test_sens,
        "test_specificity": test_spec,
        "feature_names": feature_names,
        "model": model,
    }


def load_cohort(path: str) -> list[dict[str, Any]]:
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)

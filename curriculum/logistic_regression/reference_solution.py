"""Reference implementation for the Rounds logistic-regression module.

The checker grades student code against these contracts. Read the concept
pages and attempt the tasks before opening this file.
"""

from __future__ import annotations

import json
import math
from typing import Any, Callable

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


def sigmoid(z: float | list[float]) -> float | list[float]:
    """Map a score to a probability in (0, 1). Accept a number or a list."""

    def one(value: float) -> float:
        clamped = max(min(float(value), 500.0), -500.0)
        return 1.0 / (1.0 + math.exp(-clamped))

    if isinstance(z, (list, tuple)):
        return [one(value) for value in z]
    return one(float(z))


def log_loss(y_true: list[int], y_prob: list[float], eps: float = 1e-15) -> float:
    """Mean binary cross-entropy. Empty input is 0. Clip probabilities into (eps, 1-eps)."""
    if len(y_true) != len(y_prob):
        raise ValueError("y_true and y_prob must have the same length")
    n = len(y_true)
    if n == 0:
        return 0.0
    total = 0.0
    for label, probability in zip(y_true, y_prob):
        if label not in (0, 1):
            raise ValueError("labels must be 0 or 1")
        p = min(max(float(probability), eps), 1.0 - eps)
        total += -(label * math.log(p) + (1 - label) * math.log(1.0 - p))
    return total / n


def design_matrix(X: list[list[float]]) -> list[list[float]]:
    """Prepend a column of 1.0 to each row of X. Empty input stays empty."""
    if not X:
        return []
    width = len(X[0])
    out: list[list[float]] = []
    for row in X:
        if len(row) != width:
            raise ValueError("ragged rows")
        out.append([1.0, *[float(value) for value in row]])
    return out


def _dot(row: list[float], weights: list[float]) -> float:
    if len(row) != len(weights):
        raise ValueError("row width must match weights")
    return sum(a * b for a, b in zip(row, weights))


def predict_proba(X: list[list[float]], weights: list[float]) -> list[float]:
    """Return σ(X w) for each row. X already includes the intercept column."""
    scores = [_dot(row, weights) for row in X]
    return [float(sigmoid(score)) for score in scores]  # type: ignore[arg-type]


def fit_logistic(
    X: list[list[float]],
    y: list[int],
    learning_rate: float,
    epochs: int,
    initial_weights: list[float] | None = None,
) -> list[float]:
    """Batch gradient descent for mean log loss.

    X already includes the intercept column. Default initial weights are zeros.
    Use gradient (1/n) Xᵀ (p − y) with p = σ(Xw).
    """
    if not X:
        raise ValueError("X is empty")
    if len(X) != len(y):
        raise ValueError("X and y must have the same number of rows")
    n = len(X)
    width = len(X[0])
    for row in X:
        if len(row) != width:
            raise ValueError("ragged rows")
    for label in y:
        if label not in (0, 1):
            raise ValueError("labels must be 0 or 1")
    weights = list(initial_weights) if initial_weights is not None else [0.0] * width
    if len(weights) != width:
        raise ValueError("initial_weights width mismatch")
    for _ in range(epochs):
        probabilities = predict_proba(X, weights)
        errors = [probabilities[i] - y[i] for i in range(n)]
        gradient = [0.0] * width
        for j in range(width):
            gradient[j] = sum(X[i][j] * errors[i] for i in range(n)) / n
        weights = [weights[j] - learning_rate * gradient[j] for j in range(width)]
    return weights


def confusion_counts(
    y_true: list[int], y_prob: list[float], threshold: float
) -> tuple[int, int, int, int]:
    """Return (tp, fp, tn, fn) using predicted 1 when probability >= threshold."""
    if len(y_true) != len(y_prob):
        raise ValueError("y_true and y_prob must have the same length")
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
    """TP / (TP + FN). 0 when the denominator is 0."""
    denominator = tp + fn
    return tp / denominator if denominator else 0.0


def specificity(tp: int, fp: int, tn: int, fn: int) -> float:
    """TN / (TN + FP). 0 when the denominator is 0."""
    denominator = tn + fp
    return tn / denominator if denominator else 0.0


def positive_predictive_value(tp: int, fp: int, tn: int, fn: int) -> float:
    """TP / (TP + FP). 0 when the denominator is 0."""
    denominator = tp + fp
    return tp / denominator if denominator else 0.0


def threshold_for_sensitivity(
    y_true: list[int], y_prob: list[float], target: float = 0.80
) -> float:
    """Highest threshold in {0.00, 0.01, ..., 1.00} with sensitivity >= target.

    If none qualify, return 0.0.
    """
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
    """Flag columns that are illegal at ``decision_hour``. First matching reason wins."""
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
    """Hold out the latest patients by first-seen timestamp."""
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


def _feature_matrix(rows: list[dict[str, Any]], names: tuple[str, ...] | list[str]) -> list[list[float]]:
    return [[float(row[name]) for name in names] for row in rows]


def _standardize_fit(X: list[list[float]]) -> tuple[list[float], list[float]]:
    n = len(X)
    width = len(X[0])
    means = [sum(row[j] for row in X) / n for j in range(width)]
    scales: list[float] = []
    for j in range(width):
        variance = sum((row[j] - means[j]) ** 2 for row in X) / n
        scales.append(math.sqrt(variance) if variance > 1e-12 else 1.0)
    return means, scales


def _standardize_apply(X: list[list[float]], means: list[float], scales: list[float]) -> list[list[float]]:
    return [[(row[j] - means[j]) / scales[j] for j in range(len(means))] for row in X]


def _rates(y_true: list[int], y_prob: list[float], threshold: float) -> dict[str, float]:
    tp, fp, tn, fn = confusion_counts(y_true, y_prob, threshold)
    return {
        "sensitivity": sensitivity(tp, fp, tn, fn),
        "specificity": specificity(tp, fp, tn, fn),
        "ppv": positive_predictive_value(tp, fp, tn, fn),
    }


def train_logistic_early_warning(rows: list[dict[str, Any]]) -> dict[str, Any]:
    """Fit hour-6 logistic regression for deteriorated and freeze a train threshold."""
    if not rows:
        raise ValueError("rows is empty")
    train_rows, test_rows = patient_temporal_split(rows, "patient_id", "admission_time", 0.25)
    X_train_raw = _feature_matrix(train_rows, ALLOWED_FEATURES)
    X_test_raw = _feature_matrix(test_rows, ALLOWED_FEATURES)
    y_train = [int(row["deteriorated"]) for row in train_rows]
    y_test = [int(row["deteriorated"]) for row in test_rows]
    means, scales = _standardize_fit(X_train_raw)
    X_train = design_matrix(_standardize_apply(X_train_raw, means, scales))
    X_test = design_matrix(_standardize_apply(X_test_raw, means, scales))
    weights = fit_logistic(X_train, y_train, learning_rate=0.5, epochs=2500)
    train_p = predict_proba(X_train, weights)
    test_p = predict_proba(X_test, weights)
    threshold = threshold_for_sensitivity(y_train, train_p, 0.80)
    train_rates = _rates(y_train, train_p, threshold)
    test_rates = _rates(y_test, test_p, threshold)

    def probability_fn(part: list[dict[str, Any]]) -> list[float]:
        raw = _feature_matrix(part, ALLOWED_FEATURES)
        return predict_proba(design_matrix(_standardize_apply(raw, means, scales)), weights)

    return {
        "threshold": threshold,
        "train_sensitivity": train_rates["sensitivity"],
        "train_specificity": train_rates["specificity"],
        "train_ppv": train_rates["ppv"],
        "test_sensitivity": test_rates["sensitivity"],
        "test_specificity": test_rates["specificity"],
        "test_ppv": test_rates["ppv"],
        "weights": weights,
        "means": means,
        "scales": scales,
        "feature_names": ["intercept", *ALLOWED_FEATURES],
        "probability_fn": probability_fn,
    }


def load_cohort(path: str) -> list[dict[str, Any]]:
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)

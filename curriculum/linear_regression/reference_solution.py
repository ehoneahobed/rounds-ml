"""Reference implementation for the Rounds linear-regression module.

The checker grades student code against these contracts. Read the concept
pages and attempt the tasks before opening this file.
"""

from __future__ import annotations

import csv
import math
from typing import Any

GAIN_TIE = 1e-12
EARLY_WARNING_HOUR = 6

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


def mean_squared_error(y_true: list[float], y_pred: list[float]) -> float:
    """Mean of squared residuals. Empty input is 0. Lengths must match."""
    if len(y_true) != len(y_pred):
        raise ValueError("y_true and y_pred must have the same length")
    n = len(y_true)
    if n == 0:
        return 0.0
    total = 0.0
    for truth, pred in zip(y_true, y_pred):
        err = truth - pred
        total += err * err
    return total / n


def mean_absolute_error(y_true: list[float], y_pred: list[float]) -> float:
    """Mean of absolute residuals. Empty input is 0. Lengths must match."""
    if len(y_true) != len(y_pred):
        raise ValueError("y_true and y_pred must have the same length")
    n = len(y_true)
    if n == 0:
        return 0.0
    return sum(abs(truth - pred) for truth, pred in zip(y_true, y_pred)) / n


def residuals(y_true: list[float], y_pred: list[float]) -> list[float]:
    """``y_true[i] - y_pred[i]`` for each row. Lengths must match."""
    if len(y_true) != len(y_pred):
        raise ValueError("y_true and y_pred must have the same length")
    return [truth - pred for truth, pred in zip(y_true, y_pred)]


def predict_univariate(x: list[float], slope: float, intercept: float) -> list[float]:
    """``intercept + slope * x_i`` for each value."""
    return [intercept + slope * value for value in x]


def fit_univariate(x: list[float], y: list[float]) -> tuple[float, float]:
    """Ordinary least squares for one feature.

    Returns ``(slope, intercept)`` for ``y ≈ slope * x + intercept``.
    Fewer than two rows, or a constant ``x``, raises ``ValueError``.
    """
    if len(x) != len(y):
        raise ValueError("x and y must have the same length")
    n = len(x)
    if n < 2:
        raise ValueError("need at least two rows")
    x_bar = sum(x) / n
    y_bar = sum(y) / n
    denom = sum((value - x_bar) ** 2 for value in x)
    if denom == 0.0:
        raise ValueError("x must not be constant")
    numer = sum((xi - x_bar) * (yi - y_bar) for xi, yi in zip(x, y))
    slope = numer / denom
    intercept = y_bar - slope * x_bar
    return slope, intercept


def design_matrix(X: list[list[float]]) -> list[list[float]]:
    """Prepend a column of ones for the intercept.

    Each row of ``X`` is one patient. The result has one extra leading column.
    An empty table stays empty. Ragged rows raise ``ValueError``.
    """
    if not X:
        return []
    width = len(X[0])
    out: list[list[float]] = []
    for row in X:
        if len(row) != width:
            raise ValueError("rows must have equal length")
        out.append([1.0, *row])
    return out


def _matmul(a: list[list[float]], b: list[list[float]]) -> list[list[float]]:
    n = len(a)
    m = len(b[0])
    k = len(b)
    out = [[0.0] * m for _ in range(n)]
    for i in range(n):
        for t in range(k):
            aik = a[i][t]
            for j in range(m):
                out[i][j] += aik * b[t][j]
    return out


def _transpose(a: list[list[float]]) -> list[list[float]]:
    if not a:
        return []
    return [[a[r][c] for r in range(len(a))] for c in range(len(a[0]))]


def _solve(system: list[list[float]], rhs: list[float]) -> list[float]:
    """Gaussian elimination with partial pivoting for a square system."""
    n = len(system)
    aug = [row[:] + [rhs[i]] for i, row in enumerate(system)]
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(aug[r][col]))
        if abs(aug[pivot][col]) < 1e-12:
            raise ValueError("singular system")
        aug[col], aug[pivot] = aug[pivot], aug[col]
        pivot_val = aug[col][col]
        for j in range(col, n + 1):
            aug[col][j] /= pivot_val
        for row in range(n):
            if row == col:
                continue
            factor = aug[row][col]
            for j in range(col, n + 1):
                aug[row][j] -= factor * aug[col][j]
    return [aug[i][n] for i in range(n)]


def fit_ols(X: list[list[float]], y: list[float]) -> list[float]:
    """Fit ``y ≈ X w`` with an intercept column already present in ``X``.

    Solves the normal equations ``(Xᵀ X) w = Xᵀ y``. Row count must match
    ``len(y)`` and be at least the number of columns.
    """
    if not X:
        raise ValueError("X is empty")
    if len(X) != len(y):
        raise ValueError("X and y must have the same number of rows")
    if len(X) < len(X[0]):
        raise ValueError("need at least as many rows as columns")
    xt = _transpose(X)
    xtx = _matmul(xt, X)
    xty = [sum(xt[i][r] * y[r] for r in range(len(y))) for i in range(len(xt))]
    return _solve(xtx, xty)


def predict_linear(X: list[list[float]], weights: list[float]) -> list[float]:
    """Matrix-vector product ``X @ weights``."""
    if not X:
        return []
    if len(X[0]) != len(weights):
        raise ValueError("X width must match weights")
    return [sum(row[j] * weights[j] for j in range(len(weights))) for row in X]


def gradient_descent(
    X: list[list[float]],
    y: list[float],
    learning_rate: float,
    epochs: int,
    initial_weights: list[float] | None = None,
) -> list[float]:
    """Batch gradient descent for ``y ≈ X w``.

    ``X`` already includes the intercept column. The gradient of mean squared
    error is ``(2/n) Xᵀ (Xw - y)``. Weights start at zero unless provided.
    """
    if not X:
        raise ValueError("X is empty")
    if len(X) != len(y):
        raise ValueError("X and y must have the same number of rows")
    n = len(X)
    p = len(X[0])
    weights = list(initial_weights) if initial_weights is not None else [0.0] * p
    if len(weights) != p:
        raise ValueError("initial_weights width must match X")
    if epochs < 0:
        raise ValueError("epochs must be non-negative")
    for _ in range(epochs):
        preds = predict_linear(X, weights)
        errors = [preds[i] - y[i] for i in range(n)]
        for j in range(p):
            grad = 0.0
            for i in range(n):
                grad += X[i][j] * errors[i]
            weights[j] -= learning_rate * (2.0 / n) * grad
    return weights


def r_squared(y_true: list[float], y_pred: list[float]) -> float:
    """Coefficient of determination.

    ``1 - SS_res / SS_tot``. When ``SS_tot`` is 0, return 1.0 if every residual
    is 0, otherwise 0.0. Empty input is 0. Lengths must match.
    """
    if len(y_true) != len(y_pred):
        raise ValueError("y_true and y_pred must have the same length")
    n = len(y_true)
    if n == 0:
        return 0.0
    y_bar = sum(y_true) / n
    ss_res = sum((truth - pred) ** 2 for truth, pred in zip(y_true, y_pred))
    ss_tot = sum((truth - y_bar) ** 2 for truth in y_true)
    if ss_tot == 0.0:
        return 1.0 if ss_res == 0.0 else 0.0
    return 1.0 - ss_res / ss_tot


def standardize(
    X_train: list[list[float]],
    X_other: list[list[float]] | None = None,
) -> tuple[list[list[float]], list[list[float]] | None, list[float], list[float]]:
    """Column-wise z-scores from training statistics only.

    A column with zero training standard deviation stays zero after transform.
    Returns ``(train_scaled, other_scaled_or_None, means, stds)``.
    """
    if not X_train:
        raise ValueError("X_train is empty")
    n = len(X_train)
    p = len(X_train[0])
    for row in X_train:
        if len(row) != p:
            raise ValueError("ragged X_train")
    means = [sum(row[j] for row in X_train) / n for j in range(p)]
    stds: list[float] = []
    for j in range(p):
        var = sum((row[j] - means[j]) ** 2 for row in X_train) / n
        stds.append(math.sqrt(var))

    def transform(rows: list[list[float]]) -> list[list[float]]:
        out: list[list[float]] = []
        for row in rows:
            if len(row) != p:
                raise ValueError("ragged rows")
            scaled = []
            for j in range(p):
                if stds[j] == 0.0:
                    scaled.append(0.0)
                else:
                    scaled.append((row[j] - means[j]) / stds[j])
            out.append(scaled)
        return out

    train_scaled = transform(X_train)
    other_scaled = transform(X_other) if X_other is not None else None
    return train_scaled, other_scaled, means, stds


def fit_ridge(X: list[list[float]], y: list[float], alpha: float) -> list[float]:
    """Ridge regression with intercept column already in ``X``.

    Solves ``(Xᵀ X + α I*) w = Xᵀ y``, where ``I*`` is the identity with a 0
    in the intercept position so the intercept is not shrunk. ``alpha`` must
    be non-negative.
    """
    if alpha < 0:
        raise ValueError("alpha must be non-negative")
    if not X:
        raise ValueError("X is empty")
    if len(X) != len(y):
        raise ValueError("X and y must have the same number of rows")
    xt = _transpose(X)
    xtx = _matmul(xt, X)
    p = len(xtx)
    for j in range(p):
        if j == 0:
            continue
        xtx[j][j] += alpha
    xty = [sum(xt[i][r] * y[r] for r in range(len(y))) for i in range(len(xt))]
    return _solve(xtx, xty)


def leakage_report(columns: list[dict[str, Any]], decision_hour: int = EARLY_WARNING_HOUR) -> list[dict[str, str]]:
    """Flag columns that are illegal at ``decision_hour``.

    Each input dict has ``name``, ``available_hour`` (or ``None``), and ``role``
    (``feature``, ``label``, or ``identifier``). First matching reason wins.
    Clean columns are omitted. Input order is preserved.
    """
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
    """Hold out the latest patients by first-seen timestamp.

    Patients are ordered by earliest ``time_key``, then by ``str(patient_id)``.
    The last ``ceil(fraction * n)`` patients, clamped to ``[1, n-1]``, are test.
    Every row of a patient stays together in original order.
    """
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


def _read_csv(path: str) -> list[dict[str, str]]:
    with open(path, newline="") as handle:
        return list(csv.DictReader(handle))


def train_length_of_stay(csv_path: str) -> dict[str, float]:
    """Fit an hour-6 length-of-stay linear model and score later arrivals.

    Uses only ``ALLOWED_FEATURES``, a 0.25 patient-time holdout, and ordinary
    least squares with an intercept. Returns training and test MAE, RMSE, and
    R² under keys ``train_mae``, ``train_rmse``, ``train_r2``, ``test_mae``,
    ``test_rmse``, ``test_r2``.
    """
    raw = _read_csv(csv_path)
    rows: list[dict[str, Any]] = []
    for row in raw:
        parsed: dict[str, Any] = dict(row)
        for key in (*ALLOWED_FEATURES, "los_days"):
            parsed[key] = float(row[key])
        rows.append(parsed)
    train_rows, test_rows = patient_temporal_split(rows, "patient_id", "admission_time", 0.25)
    def matrix(part: list[dict[str, Any]]) -> tuple[list[list[float]], list[float]]:
        X = [[float(row[name]) for name in ALLOWED_FEATURES] for row in part]
        y = [float(row["los_days"]) for row in part]
        return design_matrix(X), y

    X_train, y_train = matrix(train_rows)
    X_test, y_test = matrix(test_rows)
    weights = fit_ols(X_train, y_train)
    train_pred = predict_linear(X_train, weights)
    test_pred = predict_linear(X_test, weights)

    def pack(prefix: str, truths: list[float], preds: list[float]) -> dict[str, float]:
        mse = mean_squared_error(truths, preds)
        return {
            f"{prefix}_mae": mean_absolute_error(truths, preds),
            f"{prefix}_rmse": math.sqrt(mse),
            f"{prefix}_r2": r_squared(truths, preds),
        }

    return {**pack("train", y_train, train_pred), **pack("test", y_test, test_pred)}

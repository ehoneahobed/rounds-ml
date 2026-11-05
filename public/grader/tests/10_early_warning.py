"""Hour-6 early warning. The official split and threshold below are the contract.

Student helpers are not consulted. A model that was fit on the future slice, or
a threshold chosen there, will not match.
"""

import json
import math
import os

ALLOWED = {
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
}
FORBIDDEN = (
    "patient_id",
    "hospital_id",
    "admission_time",
    "lactate_h30",
    "los_days",
    "discharge_disposition",
    "death_in_hospital",
    "icu_transfer",
    "deteriorated",
)
# Acceptance bar on the future slice. The training target is sensitivity 0.80;
# the untouched patients are allowed a little movement, not a collapse.
SENSITIVITY_BAR = 0.75
SPECIFICITY_BAR = 0.50


def official_split(rows, test_fraction=0.25):
    earliest = {}
    for row in rows:
        patient = row["patient_id"]
        timestamp = str(row["admission_time"])
        current = earliest.get(patient)
        if current is None or timestamp < current:
            earliest[patient] = timestamp
    patients = sorted(earliest, key=lambda patient: (earliest[patient], str(patient)))
    n_test = math.ceil(test_fraction * len(patients))
    n_test = min(max(n_test, 1), len(patients) - 1)
    test_ids = set(patients[-n_test:])
    train, test = [], []
    for row in rows:
        (test if row["patient_id"] in test_ids else train).append(row)
    return train, test


def official_metrics(y_true, y_prob, threshold):
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
    def ratio(numerator, denominator):
        return numerator / denominator if denominator else 0.0
    return {
        "sensitivity": ratio(tp, tp + fn),
        "specificity": ratio(tn, tn + fp),
    }


def official_threshold(y_true, y_prob, target):
    candidates = set(y_prob)
    candidates.add(0.0)
    candidates.add(1.0)
    best = None
    for candidate in candidates:
        metrics = official_metrics(y_true, y_prob, candidate)
        if metrics["sensitivity"] + 1e-12 >= target and (best is None or candidate > best):
            best = candidate
    return 0.0 if best is None else best


def leaf_stats(node):
    """Return (max depth, total leaf rows, minimum leaf rows)."""
    if node.feature is None:
        return 0, node.n_samples, node.n_samples
    left_depth, left_n, left_min = leaf_stats(node.left)
    right_depth, right_n, right_min = leaf_stats(node.right)
    return max(left_depth, right_depth) + 1, left_n + right_n, min(left_min, right_min)


def evaluate(rows, label):
    try:
        result = train_early_warning(rows)
    except Exception as exc:
        check(f"{label}: train_early_warning ran", False, f"{type(exc).__name__}: {exc}")
        return
    check(f"{label}: train_early_warning ran", True, "")
    features = result.get("features")
    excluded = result.get("excluded")
    model = result.get("model")
    if not isinstance(features, list) or not isinstance(excluded, list) or model is None:
        check(f"{label}: return shape", False, "expected model, features, threshold, excluded")
        return
    unique = len(set(features)) == len(features)
    allowed = all(name in ALLOWED for name in features)
    check(f"{label}: at least four allowed features, no duplicates", unique and allowed and len(features) >= 4, str(features))
    leaked = [name for name in features if name in FORBIDDEN]
    check(f"{label}: no forbidden column in features", leaked == [], str(leaked))
    missing = [name for name in FORBIDDEN if name not in excluded]
    check(f"{label}: forbidden columns are listed as excluded", missing == [], str(missing))
    check(f"{label}: max_depth attribute is at most 4", getattr(model, "max_depth", 99) <= 4, str(getattr(model, "max_depth", None)))
    check(
        f"{label}: min_samples_leaf attribute is at least 10",
        getattr(model, "min_samples_leaf", 0) >= 10,
        str(getattr(model, "min_samples_leaf", None)),
    )
    train, test = official_split(rows)
    try:
        depth, total, smallest = leaf_stats(model.root)
    except Exception as exc:
        check(f"{label}: tree can be walked", False, str(exc))
        return
    check(f"{label}: walked depth is at most 4", depth <= 4, str(depth))
    check(f"{label}: every leaf has at least 10 rows", smallest >= 10, str(smallest))
    check(
        f"{label}: the tree was fit on the training patients only",
        total == len(train) == model.root.n_samples,
        f"leaves {total}, root {model.root.n_samples}, train {len(train)}",
    )
    try:
        positive = list(model.classes_).index(1)
        train_x = [[float(row[name]) for name in features] for row in train]
        test_x = [[float(row[name]) for name in features] for row in test]
        train_p = [probs[positive] for probs in model.predict_proba(train_x)]
        test_p = [probs[positive] for probs in model.predict_proba(test_x)]
    except Exception as exc:
        check(f"{label}: predict_proba on the official split", False, str(exc))
        return
    sums_ok = all(abs(sum(probs) - 1.0) < 1e-6 for probs in model.predict_proba(test_x))
    check(f"{label}: test probabilities sum to 1", sums_ok, "each leaf distribution should be a distribution")
    train_y = [int(row["deteriorated"]) for row in train]
    expected_threshold = official_threshold(train_y, train_p, 0.80)
    got_threshold = float(result["threshold"])
    check(
        f"{label}: threshold is the train-set sensitivity 0.80 cut",
        abs(got_threshold - expected_threshold) < 1e-8,
        f"returned {got_threshold}, expected {expected_threshold}",
    )
    test_y = [int(row["deteriorated"]) for row in test]
    scored = official_metrics(test_y, test_p, got_threshold)
    check(
        f"{label}: future-slice sensitivity >= {SENSITIVITY_BAR}",
        scored["sensitivity"] >= SENSITIVITY_BAR,
        f"sensitivity {scored['sensitivity']:.3f}",
    )
    check(
        f"{label}: future-slice specificity >= {SPECIFICITY_BAR}",
        scored["specificity"] >= SPECIFICITY_BAR,
        f"specificity {scored['specificity']:.3f}",
    )


base = os.environ.get("ROUNDS_DATA", "data")
with open(os.path.join(base, "cohort_a.json"), encoding="utf-8") as cohort_file:
    rows_a = json.loads(cohort_file.read())
with open(os.path.join(base, "cohort_b.json"), encoding="utf-8") as cohort_file:
    rows_b = json.loads(cohort_file.read())
evaluate(rows_a, "cohort A")
evaluate(rows_b, "cohort B")

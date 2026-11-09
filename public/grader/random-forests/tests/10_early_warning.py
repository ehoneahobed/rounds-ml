"""Hour-6 random-forest early warning. The official split below is the contract."""

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
SENSITIVITY_BAR = 0.65
SPECIFICITY_BAR = 0.45


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
    best = None
    for step in range(101):
        candidate = step / 100.0
        metrics = official_metrics(y_true, y_prob, candidate)
        if metrics["sensitivity"] + 1e-12 >= target and (best is None or candidate > best):
            best = candidate
    return 0.0 if best is None else best


def evaluate(rows, label):
    try:
        result = train_forest_early_warning(rows)
    except Exception as exc:
        check(f"{label}: train_forest_early_warning ran", False, f"{type(exc).__name__}: {exc}")
        return
    check(f"{label}: train_forest_early_warning ran", True, "")
    if not isinstance(result, dict) or "threshold" not in result or "model" not in result:
        check(f"{label}: return shape", False, "expected dict with threshold and model")
        return
    names = result.get("feature_names")
    if isinstance(names, list):
        leaked = [name for name in names if name in FORBIDDEN]
        check(f"{label}: no forbidden column in feature_names", leaked == [], str(leaked))
        allowed_ok = all(name in ALLOWED for name in names)
        check(f"{label}: feature_names are allowed", allowed_ok, str(names))
    model = result["model"]
    train, test = official_split(rows)
    try:
        features = result["feature_names"]
        train_x = [[float(row[name]) for name in features] for row in train]
        test_x = [[float(row[name]) for name in features] for row in test]
        positive = list(model.classes_).index(1)
        train_p = [probs[positive] for probs in model.predict_proba(train_x)]
        test_p = [probs[positive] for probs in model.predict_proba(test_x)]
    except Exception as exc:
        check(f"{label}: predict_proba on the official split", False, str(exc))
        return
    check(f"{label}: predict_proba on the official split", True, "")
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

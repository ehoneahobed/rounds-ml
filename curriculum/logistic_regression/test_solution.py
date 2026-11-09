"""Unit tests for the logistic-regression reference solution."""

from __future__ import annotations

import math
import unittest
from pathlib import Path

from curriculum.logistic_regression.reference_solution import (
    confusion_counts,
    design_matrix,
    fit_logistic,
    leakage_report,
    load_cohort,
    log_loss,
    patient_temporal_split,
    positive_predictive_value,
    predict_proba,
    sensitivity,
    sigmoid,
    specificity,
    threshold_for_sensitivity,
    train_logistic_early_warning,
)

DATA = Path(__file__).resolve().parents[2] / "public" / "data"


class LogisticRegressionTests(unittest.TestCase):
    def test_sigmoid_and_loss(self) -> None:
        self.assertAlmostEqual(float(sigmoid(0.0)), 0.5)
        self.assertAlmostEqual(log_loss([1, 0], [0.8, 0.2]), -math.log(0.8))
        self.assertEqual(log_loss([], []), 0.0)

    def test_fit_separable(self) -> None:
        X = design_matrix([[0.0], [0.0], [1.0], [1.0]])
        weights = fit_logistic(X, [0, 0, 1, 1], learning_rate=0.5, epochs=4000)
        probs = predict_proba(X, weights)
        self.assertLess(probs[0], 0.05)
        self.assertGreater(probs[3], 0.95)

    def test_metrics_and_threshold(self) -> None:
        tp, fp, tn, fn = confusion_counts([1, 1, 0, 0], [0.9, 0.4, 0.6, 0.1], 0.5)
        self.assertEqual((tp, fp, tn, fn), (1, 1, 1, 1))
        self.assertAlmostEqual(sensitivity(40, 30, 120, 10), 0.8)
        self.assertAlmostEqual(specificity(40, 30, 120, 10), 0.8)
        self.assertAlmostEqual(positive_predictive_value(40, 30, 120, 10), 40 / 70)
        self.assertAlmostEqual(
            threshold_for_sensitivity([1, 1, 0, 0], [0.9, 0.6, 0.6, 0.2], 1.0),
            0.6,
        )

    def test_leakage_and_split(self) -> None:
        report = leakage_report(
            [
                {"name": "lactate", "available_hour": 6, "role": "feature"},
                {"name": "deteriorated", "available_hour": 48, "role": "label"},
                {"name": "patient_id", "available_hour": 0, "role": "identifier"},
                {"name": "lactate_h30", "available_hour": 30, "role": "feature"},
                {"name": "los_proxy", "available_hour": 6, "role": "feature"},
                {"name": "mystery", "available_hour": None, "role": "feature"},
            ]
        )
        self.assertEqual(
            [item["reason"] for item in report],
            ["label", "identifier", "temporal_leak", "name_leak", "unknown_time"],
        )
        rows = [
            {"patient_id": "a", "admission_time": "2022-01-01"},
            {"patient_id": "b", "admission_time": "2022-01-02"},
            {"patient_id": "c", "admission_time": "2022-01-03"},
            {"patient_id": "d", "admission_time": "2022-01-04"},
        ]
        train, test = patient_temporal_split(rows, "patient_id", "admission_time", 0.25)
        self.assertEqual([row["patient_id"] for row in test], ["d"])
        self.assertEqual(len(train), 3)

    def test_early_warning_cohorts(self) -> None:
        for name in ("cohort_a.json", "cohort_b.json"):
            rows = load_cohort(str(DATA / name))
            result = train_logistic_early_warning(rows)
            self.assertGreaterEqual(result["train_sensitivity"], 0.80 - 1e-9)
            self.assertGreaterEqual(result["test_sensitivity"], 0.70)
            self.assertGreaterEqual(result["test_specificity"], 0.45)


if __name__ == "__main__":
    unittest.main()

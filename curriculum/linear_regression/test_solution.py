"""Unit tests for the linear-regression reference solution."""

from __future__ import annotations

import math
import unittest
from pathlib import Path

from curriculum.linear_regression.reference_solution import (
    design_matrix,
    fit_ols,
    fit_ridge,
    fit_univariate,
    gradient_descent,
    leakage_report,
    mean_absolute_error,
    mean_squared_error,
    patient_temporal_split,
    predict_linear,
    predict_univariate,
    r_squared,
    residuals,
    standardize,
    train_length_of_stay,
)

DATA = Path(__file__).resolve().parents[2] / "public" / "data"


class LinearRegressionTests(unittest.TestCase):
    def test_errors_and_fit(self) -> None:
        self.assertEqual(mean_squared_error([], []), 0.0)
        self.assertAlmostEqual(mean_squared_error([2.0, 4.0, 6.0], [1.0, 5.0, 5.0]), 1.0)
        self.assertAlmostEqual(mean_absolute_error([2.0, 4.0, 6.0], [1.0, 5.0, 5.0]), 1.0)
        self.assertEqual(residuals([3.0, 1.0], [2.0, 4.0]), [1.0, -3.0])
        slope, intercept = fit_univariate([0.8, 1.2, 1.6, 2.0, 2.4, 2.8], [2.6, 3.4, 4.2, 5.0, 5.8, 6.6])
        self.assertAlmostEqual(slope, 2.0)
        self.assertAlmostEqual(intercept, 1.0)
        preds = predict_univariate([1.0, 2.0], slope, intercept)
        self.assertAlmostEqual(preds[0], 3.0)
        self.assertAlmostEqual(preds[1], 5.0)

    def test_ols_and_metrics(self) -> None:
        X = design_matrix([[1.0], [2.0], [3.0], [4.0]])
        y = [3.0, 5.0, 7.0, 9.0]
        weights = fit_ols(X, y)
        self.assertAlmostEqual(weights[0], 1.0, places=9)
        self.assertAlmostEqual(weights[1], 2.0, places=9)
        gd = gradient_descent(X, y, learning_rate=0.05, epochs=5000)
        self.assertAlmostEqual(gd[0], 1.0, places=2)
        self.assertAlmostEqual(gd[1], 2.0, places=2)
        self.assertAlmostEqual(r_squared(y, predict_linear(X, weights)), 1.0)
        self.assertEqual(r_squared([2.0, 2.0], [2.0, 2.0]), 1.0)
        self.assertEqual(r_squared([2.0, 2.0], [1.0, 3.0]), 0.0)

    def test_standardize_ridge_leakage_split(self) -> None:
        train = [[0.0, 10.0], [2.0, 20.0], [4.0, 30.0]]
        other = [[2.0, 20.0]]
        scaled, other_scaled, means, stds = standardize(train, other)
        self.assertEqual(means, [2.0, 20.0])
        self.assertAlmostEqual(stds[0], math.sqrt(8 / 3))
        self.assertIsNotNone(other_scaled)
        assert other_scaled is not None
        self.assertAlmostEqual(other_scaled[0][0], 0.0)
        X = design_matrix([[1.0], [2.0], [3.0], [4.0]])
        y = [3.0, 5.0, 7.0, 9.0]
        ridge = fit_ridge(X, y, alpha=1.0)
        self.assertNotAlmostEqual(ridge[1], 2.0)
        report = leakage_report(
            [
                {"name": "lactate", "available_hour": 6, "role": "feature"},
                {"name": "los_days", "available_hour": 72, "role": "label"},
                {"name": "patient_id", "available_hour": 0, "role": "identifier"},
                {"name": "lactate_h30", "available_hour": 30, "role": "feature"},
                {"name": "mystery", "available_hour": None, "role": "feature"},
            ]
        )
        self.assertEqual(
            [item["reason"] for item in report],
            ["label", "identifier", "temporal_leak", "unknown_time"],
        )
        rows = [
            {"patient_id": "a", "admission_time": "2022-01-01", "v": 1},
            {"patient_id": "b", "admission_time": "2022-01-02", "v": 2},
            {"patient_id": "c", "admission_time": "2022-01-03", "v": 3},
            {"patient_id": "d", "admission_time": "2022-01-04", "v": 4},
        ]
        train_rows, test_rows = patient_temporal_split(rows, "patient_id", "admission_time", 0.25)
        self.assertEqual([row["patient_id"] for row in test_rows], ["d"])
        self.assertEqual(len(train_rows), 3)

    def test_project_cohorts(self) -> None:
        for name in ("los_cohort_a.csv", "los_cohort_b.csv"):
            path = DATA / name
            if not path.exists():
                self.skipTest(f"missing {path}")
            report = train_length_of_stay(str(path))
            self.assertLess(report["test_mae"], 2.5)
            self.assertGreater(report["test_r2"], 0.35)


if __name__ == "__main__":
    unittest.main()

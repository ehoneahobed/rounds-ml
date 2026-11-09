"""Unit tests for the random-forests reference solution."""

from __future__ import annotations

import random
import unittest
from pathlib import Path

from curriculum.random_forests.reference_solution import (
    RandomForestClassifier,
    bootstrap_sample,
    feature_use_counts,
    leakage_report,
    load_cohort,
    majority_vote,
    max_features_count,
    mean_probability,
    patient_temporal_split,
    random_feature_indices,
    threshold_for_sensitivity,
    train_forest_early_warning,
)

DATA = Path(__file__).resolve().parents[2] / "public" / "data"


class RandomForestTests(unittest.TestCase):
    def test_bagging_helpers(self) -> None:
        X = [[0.0], [1.0], [2.0], [3.0]]
        y = [0, 1, 0, 1]
        Xb, yb, indices = bootstrap_sample(X, y, random.Random(0))
        self.assertEqual(len(indices), 4)
        self.assertEqual(majority_vote([1, 1, 0, 1, 0]), 1)
        self.assertEqual(majority_vote([0, 1]), 0)
        self.assertEqual(mean_probability([[0.9, 0.1], [0.7, 0.3]]), [0.8, 0.2])
        self.assertEqual(max_features_count(9, "sqrt"), 3)
        idx = random_feature_indices(9, "sqrt", random.Random(1))
        self.assertEqual(len(idx), 3)
        self.assertEqual(idx, sorted(idx))

    def test_forest_predict(self) -> None:
        X = [[0.0, 1.0], [0.0, 2.0], [1.0, 1.0], [1.0, 3.0], [0.0, 0.0], [1.0, 4.0]]
        y = [0, 0, 1, 1, 0, 1]
        forest = RandomForestClassifier(
            n_estimators=5, max_depth=2, min_samples_leaf=1, max_features="sqrt", random_state=0
        )
        forest.fit(X, y)
        self.assertEqual(len(forest.trees_), 5)
        self.assertEqual(len(forest.predict(X)), 6)
        self.assertEqual(len(feature_use_counts(forest)), 2)
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
            result = train_forest_early_warning(rows)
            self.assertGreaterEqual(result["train_sensitivity"], 0.80 - 1e-9)
            self.assertGreaterEqual(result["test_sensitivity"], 0.65)
            self.assertGreaterEqual(result["test_specificity"], 0.45)


if __name__ == "__main__":
    unittest.main()

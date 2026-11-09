"""Locked teaching numbers for the linear-regression module.

Run: ``python3 -m curriculum.linear_regression.figures``
Writes ``data/linear_regression_figures.json``.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "linear_regression_figures.json"

# Six admissions. Length of stay is exactly 1 + 2 * lactate.
# Slope 2, intercept 1. Used on the overview and one-feature pages.
UNIVARIATE = [
    {"patient": "A", "lactate": 0.8, "los": 2.6},
    {"patient": "B", "lactate": 1.2, "los": 3.4},
    {"patient": "C", "lactate": 1.6, "los": 4.2},
    {"patient": "D", "lactate": 2.0, "los": 5.0},
    {"patient": "E", "lactate": 2.4, "los": 5.8},
    {"patient": "F", "lactate": 2.8, "los": 6.6},
]

# Same six, with a wrong line ŷ = 3 + 0.5 x so residuals are obvious.
WRONG_SLOPE = 0.5
WRONG_INTERCEPT = 3.0


def mean(values: list[float]) -> float:
    return sum(values) / len(values)


def fit_univariate(xs: list[float], ys: list[float]) -> tuple[float, float]:
    """Ordinary least squares for one feature: y ≈ slope * x + intercept."""
    x_bar = mean(xs)
    y_bar = mean(ys)
    denom = sum((x - x_bar) ** 2 for x in xs)
    numer = sum((x - x_bar) * (y - y_bar) for x, y in zip(xs, ys))
    slope = numer / denom
    intercept = y_bar - slope * x_bar
    return slope, intercept


def mse(ys: list[float], preds: list[float]) -> float:
    return sum((y - p) ** 2 for y, p in zip(ys, preds)) / len(ys)


def main() -> None:
    xs = [row["lactate"] for row in UNIVARIATE]
    ys = [row["los"] for row in UNIVARIATE]
    slope, intercept = fit_univariate(xs, ys)
    wrong_preds = [WRONG_INTERCEPT + WRONG_SLOPE * x for x in xs]
    residuals = [y - p for y, p in zip(ys, wrong_preds)]
    payload = {
        "univariate": {
            "rows": UNIVARIATE,
            "slope": slope,
            "intercept": intercept,
            "mse": mse(ys, [intercept + slope * x for x in xs]),
            "wrong": {
                "slope": WRONG_SLOPE,
                "intercept": WRONG_INTERCEPT,
                "predictions": wrong_preds,
                "residuals": residuals,
                "mse": mse(ys, wrong_preds),
            },
        },
        "worked": {
            # Three patients for a by-hand MSE: truths 2, 4, 6 and preds 1, 5, 5.
            "y_true": [2.0, 4.0, 6.0],
            "y_pred": [1.0, 5.0, 5.0],
            "mse": (1.0 + 1.0 + 1.0) / 3.0,
            "mae": (1.0 + 1.0 + 1.0) / 3.0,
        },
    }
    assert math.isclose(slope, 2.0)
    assert math.isclose(intercept, 1.0)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()

"""Synthetic admissions for the length-of-stay linear-regression project.

Seeds 7 and 11 are the graded cohorts. Do not regenerate them casually.
Each row is one admission. The label is ``los_days``. Features available at
hour 6 are the same clinical columns as the tree module, minus the binary
deterioration label.
"""

from __future__ import annotations

import csv
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "public" / "data"

ALLOWED = (
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

HEADERS = [
    "patient_id",
    "hospital_id",
    "admission_time",
    *ALLOWED,
    "lactate_h30",
    "los_days",
    "discharge_disposition",
    "death_in_hospital",
    "icu_transfer",
]


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def one_admission(rng: random.Random, index: int) -> dict[str, object]:
    """Draw one synthetic admission whose length of stay is mostly linear in hour-6 labs."""
    age = rng.uniform(28, 88)
    sex = 1 if rng.random() < 0.48 else 0
    hr = rng.gauss(86, 14)
    sbp = rng.gauss(122, 18)
    rr = rng.gauss(18, 3.5)
    temp = rng.gauss(37.0, 0.55)
    spo2 = rng.gauss(96.5, 2.2)
    lactate = abs(rng.gauss(1.7, 0.85))
    creatinine = abs(rng.gauss(1.05, 0.35))
    wbc = abs(rng.gauss(9.5, 3.2))
    diabetes = 1 if rng.random() < 0.28 else 0
    heart_failure = 1 if rng.random() < 0.18 else 0

    # Length of stay in days. Signal is readable by a shallow linear model.
    los = (
        1.2
        + 0.035 * age
        + 1.55 * lactate
        + 0.11 * rr
        + 0.85 * creatinine
        + 1.1 * heart_failure
        + 0.55 * diabetes
        - 0.012 * sbp
        + rng.gauss(0, 0.85)
    )
    los = clamp(los, 1.0, 28.0)

    # Future facts that leak if used as features.
    lactate_h30 = lactate + abs(rng.gauss(0.4, 0.35))
    death = 1 if los > 18 and rng.random() < 0.35 else 0
    icu = 1 if lactate > 3.2 or (heart_failure and rng.random() < 0.4) else 0
    disposition = "expired" if death else ("snf" if los > 10 and rng.random() < 0.3 else "home")

    day = 1 + (index % 28)
    month = 1 + (index // 28) % 12
    year = 2022 + (index // 336)
    hospital = "A" if index % 5 else "B"

    return {
        "patient_id": f"P{index:04d}",
        "hospital_id": hospital,
        "admission_time": f"{year:04d}-{month:02d}-{day:02d}T08:00:00",
        "age": round(age, 2),
        "sex": sex,
        "hr": round(hr, 2),
        "sbp": round(sbp, 2),
        "rr": round(rr, 2),
        "temp": round(temp, 2),
        "spo2": round(spo2, 2),
        "lactate": round(lactate, 3),
        "creatinine": round(creatinine, 3),
        "wbc": round(wbc, 2),
        "diabetes": diabetes,
        "heart_failure": heart_failure,
        "lactate_h30": round(lactate_h30, 3),
        "los_days": round(los, 3),
        "discharge_disposition": disposition,
        "death_in_hospital": death,
        "icu_transfer": icu,
    }


def write_cohort(seed: int, n: int, path: Path) -> None:
    rng = random.Random(seed)
    rows = [one_admission(rng, i) for i in range(n)]
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=HEADERS)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    write_cohort(7, 320, DATA / "los_cohort_a.csv")
    write_cohort(11, 320, DATA / "los_cohort_b.csv")
    # Sanity: a shallow OLS on allowed features should beat predicting the mean.
    from curriculum.linear_regression.reference_solution import train_length_of_stay

    report_a = train_length_of_stay(str(DATA / "los_cohort_a.csv"))
    report_b = train_length_of_stay(str(DATA / "los_cohort_b.csv"))
    print("cohort A", report_a)
    print("cohort B", report_b)
    assert report_a["test_mae"] < 2.5
    assert report_b["test_mae"] < 2.5
    assert report_a["test_r2"] > 0.35
    assert report_b["test_r2"] > 0.35


if __name__ == "__main__":
    main()

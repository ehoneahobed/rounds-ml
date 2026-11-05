"""Synthetic hour-6 deterioration cohort.

The label is generated from a known rule plus noise. It is not estimated from
any real hospital, and it contains no patient information. Leaky columns are
included on purpose so a model that cheats is obvious.
"""

from __future__ import annotations

import json
import random
from datetime import datetime, timedelta
from pathlib import Path


def _clip(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _group_features(rng: random.Random, draw: float) -> tuple[float, float, float, float, float]:
    """Sample lactate, respiratory rate, age, systolic BP, and the label probability.

    The three risk groups sit in ranges a shallow tree can cut: high lactate,
    then high respiratory rate, then an older low-pressure group. Everyone else
    is the stable majority. Ranges do not overlap, so the splits are real
    structure rather than a tail of a bell curve. The cohort is enriched
    (roughly a quarter to a third deteriorate) so a few hundred rows are enough
    to see those cuts. A general ward would be rarer.
    """
    if draw < 0.18:
        return (
            rng.uniform(2.8, 5.5),
            rng.uniform(12, 20),
            rng.uniform(35, 90),
            rng.uniform(112, 155),
            0.90,
        )
    if draw < 0.32:
        return (
            rng.uniform(0.6, 2.0),
            rng.uniform(26, 38),
            rng.uniform(35, 90),
            rng.uniform(112, 155),
            0.80,
        )
    if draw < 0.44:
        return (
            rng.uniform(0.6, 2.0),
            rng.uniform(12, 20),
            rng.uniform(80, 94),
            rng.uniform(82, 100),
            0.72,
        )
    return (
        rng.uniform(0.6, 2.0),
        rng.uniform(12, 20),
        rng.uniform(28, 74),
        rng.uniform(112, 155),
        0.05,
    )


def generate_cohort(n: int = 500, seed: int = 7) -> list[dict]:
    """Build ``n`` admissions, one row each, with a deterministic seed.

    Decision time is hour 6. ``deteriorated`` is drawn from a group-specific
    probability, not copied from a real chart. Columns such as
    ``death_in_hospital`` and ``lactate_h30`` are consequences of the stay,
    not inputs a nurse would have had at hour 6.
    """
    if n < 40:
        raise ValueError("need at least 40 admissions so both sides of a split exist")
    rng = random.Random(seed)
    start = datetime(2023, 1, 1, 0, 0, 0)
    rows: list[dict] = []
    for index in range(n):
        lactate, rr, age, sbp, probability = _group_features(rng, rng.random())
        sex = 1 if rng.random() < 0.47 else 0
        hr = _clip(rng.gauss(88, 16), 42, 165)
        temp = _clip(rng.gauss(36.9, 0.45), 35.2, 40.2)
        spo2 = _clip(rng.gauss(96.4, 2.1), 82, 100)
        creatinine = _clip(rng.lognormvariate(-0.05, 0.38), 0.3, 7.0)
        wbc = _clip(rng.gauss(9.4, 3.2), 1.5, 32)
        diabetes = 1 if rng.random() < 0.27 else 0
        heart_failure = 1 if rng.random() < 0.18 else 0
        deteriorated = 1 if rng.random() < probability else 0

        death = 1 if rng.random() < (0.42 if deteriorated else 0.012) else 0
        los_days = max(1, int(round(rng.gauss(3.5 + 6.5 * deteriorated, 1.6))))
        lactate_h30 = _clip(lactate + 1.35 * deteriorated + rng.gauss(0, 0.25), 0.3, 12)
        icu_transfer = 1 if rng.random() < (0.72 if deteriorated else 0.06) else 0
        if death:
            discharge = "expired"
        elif deteriorated and rng.random() < 0.45:
            discharge = "snf"
        else:
            discharge = "home"

        rows.append(
            {
                "patient_id": f"p{index:04d}",
                "hospital_id": ("A", "B", "C")[index % 3],
                "admission_time": (start + timedelta(hours=index * 18)).strftime("%Y-%m-%dT%H:%M:%S"),
                "age": round(age, 4),
                "sex": sex,
                "hr": round(hr, 4),
                "sbp": round(sbp, 4),
                "rr": round(rr, 4),
                "temp": round(temp, 4),
                "spo2": round(spo2, 4),
                "lactate": round(lactate, 4),
                "creatinine": round(creatinine, 4),
                "wbc": round(wbc, 4),
                "diabetes": diabetes,
                "heart_failure": heart_failure,
                "lactate_h30": round(lactate_h30, 4),
                "los_days": los_days,
                "discharge_disposition": discharge,
                "death_in_hospital": death,
                "icu_transfer": icu_transfer,
                "deteriorated": deteriorated,
            }
        )
    return rows


def write_cohorts(directory: Path) -> None:
    """Write the two cohorts the checker scores: seed 7 (shown) and seed 11 (held out)."""
    directory.mkdir(parents=True, exist_ok=True)
    for name, seed in (("cohort_a.json", 7), ("cohort_b.json", 11)):
        payload = json.dumps(generate_cohort(500, seed), separators=(",", ":"))
        (directory / name).write_text(payload + "\n", encoding="utf-8")


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    write_cohorts(root / "public" / "data")
    print(f"wrote cohorts to {root / 'public' / 'data'}")

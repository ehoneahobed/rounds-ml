"""Numbers the concept pages display. Regenerated, then checked by hand in the pages.

    python3 -m curriculum.figures
"""

from __future__ import annotations

import json
import math
from pathlib import Path

from curriculum.reference_solution import (
    DecisionTreeClassifier,
    best_numeric_split,
    entropy,
    export_paths,
    gini_impurity,
    information_gain,
)


def _round(value: float, places: int = 6) -> float:
    return round(value, places)


def counted_split() -> dict:
    """10 patients, 4 positive. Left 1 of 6 positive. Right 3 of 4 positive."""
    parent = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
    left = [0, 0, 0, 0, 0, 1]
    right = [0, 1, 1, 1]
    parent_gini = gini_impurity(parent)
    left_gini = gini_impurity(left)
    right_gini = gini_impurity(right)
    gain = information_gain(parent, left, right, "gini")
    return {
        "parent": {"n": 10, "positive": 4, "gini": _round(parent_gini, 4), "entropy": _round(entropy(parent), 4)},
        "left": {"n": 6, "positive": 1, "gini": _round(left_gini, 4), "entropy": _round(entropy(left), 4)},
        "right": {"n": 4, "positive": 3, "gini": _round(right_gini, 4), "entropy": _round(entropy(right), 4)},
        "gainGini": _round(gain, 4),
        "gainEntropy": _round(information_gain(parent, left, right, "entropy"), 4),
        "fractionGain": "49/300",
    }


def search_table() -> dict:
    values = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0]
    labels = [0, 0, 1, 0, 1, 1]
    parent = labels[:]
    rows = []
    order = sorted(range(len(values)), key=lambda index: values[index])
    ordered_values = [values[index] for index in order]
    ordered_labels = [labels[index] for index in order]
    best_threshold, best_gain = best_numeric_split(values, labels)
    for cut in range(len(order) - 1):
        if ordered_values[cut] == ordered_values[cut + 1]:
            continue
        threshold = (ordered_values[cut] + ordered_values[cut + 1]) / 2
        left = ordered_labels[: cut + 1]
        right = ordered_labels[cut + 1 :]
        gain = information_gain(parent, left, right, "gini")
        rows.append(
            {
                "threshold": _round(threshold, 2),
                "leftPositive": sum(left),
                "leftN": len(left),
                "rightPositive": sum(right),
                "rightN": len(right),
                "gain": _round(gain, 4),
                "best": abs(threshold - best_threshold) < 1e-9,
            }
        )
    return {
        "values": values,
        "labels": labels,
        "parentGini": _round(gini_impurity(parent), 4),
        "bestThreshold": _round(best_threshold, 2),
        "bestGain": _round(best_gain, 4),
        "candidates": rows,
    }


def _dump_node(node, names: list[str]) -> dict:
    payload = {
        "leaf": node.feature is None,
        "prediction": node.prediction,
        "n": node.n_samples,
        "probabilities": [_round(probability, 4) for probability in node.probabilities],
    }
    if node.feature is None:
        return payload
    payload.update(
        {
            "feature": names[node.feature],
            "featureIndex": node.feature,
            "threshold": node.threshold,
            "left": _dump_node(node.left, names),
            "right": _dump_node(node.right, names),
        }
    )
    return payload


def teaching_tree() -> dict:
    names = ["lactate", "age"]
    matrix = [
        [0.8, 40.0],
        [0.9, 82.0],
        [1.0, 45.0],
        [1.1, 88.0],
        [2.5, 81.0],
        [2.6, 42.0],
        [2.8, 86.0],
        [3.0, 48.0],
    ]
    labels = [0, 0, 0, 0, 1, 0, 1, 0]
    tree = DecisionTreeClassifier().fit(matrix, labels)

    def gini_of(node) -> float:
        return gini_impurity(
            [label for label, count in zip(tree.classes_, node.counts) for _ in range(count)]
        )

    def local_gain(node) -> float:
        left_n = node.left.n_samples
        right_n = node.right.n_samples
        n = node.n_samples
        return gini_of(node) - (left_n / n) * gini_of(node.left) - (right_n / n) * gini_of(node.right)

    root_gain = local_gain(tree.root)
    child = tree.root.right
    child_gain = local_gain(child)
    # Weighted by the share of the training rows that reach the node.
    lactate = (tree.root.n_samples / tree.root.n_samples) * root_gain
    age = (child.n_samples / tree.root.n_samples) * child_gain
    total = lactate + age
    return {
        "featureNames": names,
        "rows": [{"lactate": row[0], "age": row[1], "y": label} for row, label in zip(matrix, labels)],
        "tree": _dump_node(tree.root, names),
        "paths": export_paths(tree, names),
        "rootGain": root_gain,
        "childGain": child_gain,
        "mdi": {
            "lactate": _round(lactate, 4),
            "age": _round(age, 4),
            "lactateShare": _round(lactate / total, 4),
            "ageShare": _round(age / total, 4),
        },
    }


def xor_gain() -> dict:
    """Neither feature of a 2-bit XOR reduces Gini at the root."""
    labels = [0, 1, 1, 0]
    left = [0, 1]
    right = [1, 0]
    return {"gain": _round(information_gain(labels, left, right, "gini"), 4)}


def build() -> dict:
    three_one = -(0.75 * math.log2(0.75) + 0.25 * math.log2(0.25))
    return {
        "counted": counted_split(),
        "search": search_table(),
        "trace": teaching_tree(),
        "xorGain": xor_gain()["gain"],
        "entropyThreeOne": _round(three_one, 4),
        "giniThreeOne": 0.375,
        "quizGain": 0.3,
        "pageConfusion": {"tp": 40, "fp": 30, "tn": 120, "fn": 10, "sensitivity": 0.8, "ppv": _round(40 / 70, 4)},
        "rareScreen": {"ppv": _round(160 / 2120, 4)},
    }


def main() -> None:
    payload = build()
    destination = Path(__file__).resolve().parents[1] / "data" / "figures.json"
    destination.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(destination)


if __name__ == "__main__":
    main()

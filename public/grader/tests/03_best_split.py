"""Threshold search: midpoints, ties, and splits that do not help."""

import math

threshold, gain = best_numeric_split([0.8, 1.1, 1.2, 1.4, 2.0, 2.4, 3.1, 4.0], [0, 0, 0, 0, 1, 1, 1, 1])
check("perfect lactate cut is 1.7", abs(threshold - 1.7) < 1e-9, f"threshold {threshold}")
check("perfect lactate gain is 0.5", abs(gain - 0.5) < 1e-12, f"gain {gain}")

# Unsorted input must be sorted before the scan.
threshold_b, gain_b = best_numeric_split([2.0, 0.8, 4.0, 1.4], [1, 0, 1, 0])
check("unsorted column still cuts at 1.7", abs(threshold_b - 1.7) < 1e-9, f"threshold {threshold_b}")
check("unsorted perfect split still gains 0.5", abs(gain_b - 0.5) < 1e-9, f"gain {gain_b}")

# Equal adjacent values are not a cut. Values 1, 2, 2, 5 and labels that make 1.5 win.
threshold_c, _gain_c = best_numeric_split([1.0, 2.0, 2.0, 5.0], [0, 0, 1, 1])
check("tie inside equal values resolves to midpoint 3.5 or 1.5", math.isfinite(threshold_c), f"{threshold_c}")
# Left of 1.5 is [0], right is [0, 1, 1]. Left of 3.5 is [0, 0, 1], right is [1].
# Parent two and two, Gini 0.5.
# Cut 1.5: left gini 0 (n=1), right counts 1 and 2, n=3, gini = 1 - (1/9 + 4/9) = 4/9
# gain = 0.5 - (1/4)*0 - (3/4)*(4/9) = 0.5 - 1/3 = 1/6
# Cut 3.5: left counts 2 and 1, n=3, gini 4/9; right gini 0 n=1
# gain = 0.5 - (3/4)*(4/9) - 0 = 1/6
# Tie, so the lower threshold 1.5 wins.
check("tied gains keep the lower threshold", abs(threshold_c - 1.5) < 1e-9, f"threshold {threshold_c}")

no_cut, no_gain = best_numeric_split([1.0, 1.0, 1.0], [0, 1, 0])
check("identical values do not invent a threshold", math.isnan(no_cut), f"{no_cut}")
check("identical values gain 0", no_gain == 0.0, f"{no_gain}")

pure_cut, pure_gain = best_numeric_split([1.0, 2.0, 3.0], [1, 1, 1])
check("a pure column is not split", math.isnan(pure_cut) and pure_gain == 0.0, f"{pure_cut}, {pure_gain}")

short_cut, short_gain = best_numeric_split([1.0], [0])
check("a single row cannot split", math.isnan(short_cut) and short_gain == 0.0, f"{short_cut}")

raised = False
try:
    best_numeric_split([1.0, 2.0], [0])
except ValueError:
    raised = True
check("mismatched lengths raise ValueError", raised, "values and labels must align")

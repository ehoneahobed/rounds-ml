"""Population variance and variance reduction."""

import math

check("empty variance is 0", variance([]) == 0.0, "defined as 0")
check("constant variance is 0", abs(variance([4.0, 4.0, 4.0]) - 0.0) < 1e-12, "no spread")

# Mean 5, deviations 5, 5, -5, -5, mean square 25.
spread = variance([10.0, 10.0, 0.0, 0.0])
check("population variance divides by n", abs(spread - 25.0) < 1e-12, f"got {spread}")

threshold, reduction = best_regression_split([1.0, 2.0, 3.0, 4.0], [10.0, 10.0, 0.0, 0.0])
check("perfect regression cut is 2.5", abs(threshold - 2.5) < 1e-9, f"{threshold}")
check("perfect regression reduction is 25", abs(reduction - 25.0) < 1e-9, f"{reduction}")

# A noisier column. Expected reduction is recomputed from the definition here,
# not by calling the student function twice.
values = [1.0, 2.0, 3.0, 10.0]
targets = [0.0, 0.0, 0.0, 9.0]

def _variance(items):
    mean = sum(items) / len(items)
    return sum((item - mean) ** 2 for item in items) / len(items)

parent_v = _variance(targets)
left_v = _variance([0.0, 0.0, 0.0])
right_v = _variance([9.0])
expected = parent_v - (3 / 4) * left_v - (1 / 4) * right_v
got_threshold, got_reduction = best_regression_split(values, targets)
check("skewed regression cut is 6.5", abs(got_threshold - 6.5) < 1e-9, f"{got_threshold}")
check("skewed reduction matches the definition", abs(got_reduction - expected) < 1e-9, f"got {got_reduction}")

no_threshold, no_reduction = best_regression_split([1.0, 2.0, 3.0], [5.0, 5.0, 5.0])
check("constant target is not split", math.isnan(no_threshold) and no_reduction == 0.0, f"{no_threshold}, {no_reduction}")

flat, flat_reduction = best_regression_split([2.0, 2.0, 2.0], [1.0, 4.0, 9.0])
check("identical inputs are not split", math.isnan(flat) and flat_reduction == 0.0, f"{flat}")

# Tie: both cuts reduce variance equally on a symmetric pattern, lower threshold wins.
# values 1, 2, 3 targets 0, 5, 0. Cut 1.5 and cut 2.5 are mirrors.
tie_threshold, tie_reduction = best_regression_split([1.0, 2.0, 3.0], [0.0, 5.0, 0.0])
check("tied regression cuts keep the lower threshold", abs(tie_threshold - 1.5) < 1e-9, f"{tie_threshold}")
check("tied regression cut still helps", tie_reduction > 0, f"{tie_reduction}")

raised = False
try:
    best_regression_split([1.0, 2.0], [1.0])
except ValueError:
    raised = True
check("mismatched lengths raise ValueError", raised, "one target per value")

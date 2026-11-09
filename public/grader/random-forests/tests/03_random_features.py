import math
import random

check("sqrt9", max_features_count(9, "sqrt") == 3)
check("sqrt2", max_features_count(2, "sqrt") == 1)
check("clamp", max_features_count(5, 99) == 5)
check("none", max_features_count(4, None) == 4)
rng = random.Random(1)
idx = random_feature_indices(9, "sqrt", rng)
check("sorted", idx == sorted(idx))
check("unique", len(idx) == len(set(idx)) == 3)
check("range", all(0 <= i < 9 for i in idx))

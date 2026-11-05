"""Gini impurity checks. Expected values are computed from the definition."""

check("empty node is 0", gini_impurity([]) == 0.0, "empty input is defined as 0")

pure = gini_impurity([1, 1, 1, 1])
check("pure node is 0", abs(pure - 0.0) < 1e-12, f"got {pure}")

balanced = gini_impurity([0, 1, 0, 1])
check("balanced binary node is 0.5", abs(balanced - 0.5) < 1e-12, f"got {balanced}")

# 3 of class 0 and 1 of class 1: 1 - ((3/4)^2 + (1/4)^2) = 0.375
three_one = gini_impurity([0, 0, 0, 1])
check("3/1 split is 0.375", abs(three_one - 0.375) < 1e-12, f"got {three_one}")

# Order does not matter.
reordered = gini_impurity([1, 0, 0, 0])
check("label order does not matter", abs(reordered - three_one) < 1e-12, f"got {reordered}")

# Three classes, counts 2, 1, 1 on n=4: 1 - (0.5^2 + 0.25^2 + 0.25^2) = 0.625
multi = gini_impurity([0, 0, 1, 2])
check("three-class node is 0.625", abs(multi - 0.625) < 1e-12, f"got {multi}")

single = gini_impurity([7])
check("one row is pure", abs(single - 0.0) < 1e-12, f"got {single}")

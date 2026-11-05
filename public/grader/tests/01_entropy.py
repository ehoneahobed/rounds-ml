"""Entropy checks, in bits."""

import math

check("empty node is 0", entropy([]) == 0.0, "empty input is defined as 0")
check("pure node is 0", abs(entropy([0, 0, 0, 0]) - 0.0) < 1e-12, "a sure outcome has no surprise")

balanced = entropy([0, 1, 1, 0])
check("balanced binary node is 1 bit", abs(balanced - 1.0) < 1e-12, f"got {balanced}")

# Counts 3 and 1: -(0.75 log2 0.75 + 0.25 log2 0.25)
expected = -(0.75 * math.log2(0.75) + 0.25 * math.log2(0.25))
got = entropy([0, 0, 0, 1])
check("3/1 split matches the definition", abs(got - expected) < 1e-12, f"got {got}, expected {expected}")

# Three equal classes: log2(3)
third = entropy([0, 1, 2, 0, 1, 2])
check("three equal classes are log2(3)", abs(third - math.log2(3)) < 1e-12, f"got {third}")

check("label order does not matter", abs(entropy([1, 0, 0, 0]) - got) < 1e-12, "same multiset")

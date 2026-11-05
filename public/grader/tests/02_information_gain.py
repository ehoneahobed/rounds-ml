"""Information gain, including the empty-child rule and both criteria."""

import math

parent = [0, 0, 0, 0, 1, 1, 1, 1]
left = [0, 0, 0, 0]
right = [1, 1, 1, 1]
gain = information_gain(parent, left, right, "gini")
check("a perfect split gains 0.5 Gini", abs(gain - 0.5) < 1e-12, f"got {gain}")

# Parent 4/4 Gini 0.5. Left three zeros. Right four 1s and one 0.
# Right Gini = 1 - ((4/5)^2 + (1/5)^2) = 0.32. Gain = 0.5 - (5/8)*0.32 = 0.3
messy = information_gain([0, 0, 0, 0, 1, 1, 1, 1], [0, 0, 0], [1, 1, 1, 1, 0], "gini")
check("weighted imperfect split gains 0.3", abs(messy - 0.3) < 1e-12, f"got {messy}")

zero = information_gain(parent, [], right, "gini")
check("empty left child gains 0", zero == 0.0, f"got {zero}")
check("empty right child gains 0", information_gain(parent, left, [], "gini") == 0.0, "not a split")
check("empty parent gains 0", information_gain([], [0], [1], "gini") == 0.0, "nothing to explain")

# Same perfect split under entropy: parent entropy 1, children 0, gain 1.
bit = information_gain(parent, left, right, "entropy")
check("perfect split gains 1 bit", abs(bit - 1.0) < 1e-12, f"got {bit}")

# Entropy gain for the messy split.
parent_h = 1.0
right_labels = [1, 1, 1, 1, 0]
right_h = -(0.8 * math.log2(0.8) + 0.2 * math.log2(0.2))
expected_h = parent_h - (5 / 8) * right_h
got_h = information_gain(parent, [0, 0, 0], right_labels, "entropy")
check("entropy uses the same weights", abs(got_h - expected_h) < 1e-12, f"got {got_h}")

raised = False
try:
    information_gain(parent, left, right, "accuracy")
except ValueError:
    raised = True
check("unknown criterion raises ValueError", raised, "only gini and entropy are defined")

import random

X = [[0.0], [1.0], [2.0], [3.0]]
y = [0, 1, 0, 1]
rng = random.Random(0)
Xb, yb, indices = bootstrap_sample(X, y, rng)
check("len", len(Xb) == len(yb) == len(indices) == 4)
check("values", all(Xb[i] == X[indices[i]] and yb[i] == y[indices[i]] for i in range(4)))
check("with_replacement_possible", len(indices) == 4)
rng2 = random.Random(0)
_, _, indices2 = bootstrap_sample(X, y, rng2)
check("seeded", indices == indices2)
try:
    bootstrap_sample([], [], random.Random(0))
    check("empty", False)
except ValueError:
    check("empty", True)

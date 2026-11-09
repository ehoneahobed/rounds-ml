import math

check("empty", log_loss([], []) == 0.0)
expected = -math.log(0.8)
check("worked", abs(log_loss([1, 0], [0.8, 0.2]) - expected) < 1e-12)
check("clip", log_loss([1], [0.0]) < 40)
try:
    log_loss([1], [0.5, 0.5])
    check("length", False, "expected ValueError")
except ValueError:
    check("length", True)
try:
    log_loss([2], [0.5])
    check("label", False, "expected ValueError")
except ValueError:
    check("label", True)

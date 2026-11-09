check("empty", mean_absolute_error([], []) == 0.0)
check("worked", abs(mean_absolute_error([2.0, 4.0, 6.0], [1.0, 5.0, 5.0]) - 1.0) < 1e-12)
check("abs", abs(mean_absolute_error([0.0], [-3.0]) - 3.0) < 1e-12)
try:
    mean_absolute_error([1.0], [])
    check("length", False, "expected ValueError")
except ValueError:
    check("length", True)

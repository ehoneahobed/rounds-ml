check("empty", mean_squared_error([], []) == 0.0)
check("worked", abs(mean_squared_error([2.0, 4.0, 6.0], [1.0, 5.0, 5.0]) - 1.0) < 1e-12)
check("perfect", mean_squared_error([1.0, 2.0], [1.0, 2.0]) == 0.0)
try:
    mean_squared_error([1.0], [1.0, 2.0])
    check("length", False, "expected ValueError")
except ValueError:
    check("length", True)

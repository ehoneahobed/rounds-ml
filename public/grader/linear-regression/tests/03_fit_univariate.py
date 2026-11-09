x = [0.8, 1.2, 1.6, 2.0, 2.4, 2.8]
y = [2.6, 3.4, 4.2, 5.0, 5.8, 6.6]
slope, intercept = fit_univariate(x, y)
check("slope", abs(slope - 2.0) < 1e-9)
check("intercept", abs(intercept - 1.0) < 1e-9)
try:
    fit_univariate([1.0], [2.0])
    check("short", False)
except ValueError:
    check("short", True)
try:
    fit_univariate([2.0, 2.0, 2.0], [1.0, 2.0, 3.0])
    check("constant", False)
except ValueError:
    check("constant", True)

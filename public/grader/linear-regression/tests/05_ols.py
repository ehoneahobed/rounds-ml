X = [[1.0, 1.0], [1.0, 2.0], [1.0, 3.0], [1.0, 4.0]]
y = [3.0, 5.0, 7.0, 9.0]
w = fit_ols(X, y)
check("intercept", abs(w[0] - 1.0) < 1e-9)
check("slope", abs(w[1] - 2.0) < 1e-9)
preds = predict_linear(X, w)
check("predict", all(abs(a - b) < 1e-9 for a, b in zip(preds, y)))
try:
    fit_ols([[1.0, 2.0]], [1.0])
    check("underdetermined", False)
except ValueError:
    check("underdetermined", True)

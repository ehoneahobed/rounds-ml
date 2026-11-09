X = [[1.0, 1.0], [1.0, 2.0], [1.0, 3.0], [1.0, 4.0]]
y = [3.0, 5.0, 7.0, 9.0]
w = gradient_descent(X, y, 0.05, 5000)
check("near_ols_b", abs(w[0] - 1.0) < 0.05)
check("near_ols_w", abs(w[1] - 2.0) < 0.05)
z = gradient_descent(X, y, 0.05, 0)
check("zero_epochs", z == [0.0, 0.0])

check("signs", residuals([5.0, 1.0], [7.0, 0.0]) == [-2.0, 1.0])
check("predict", predict_univariate([1.5, 2.0], 2.0, 1.0) == [4.0, 5.0])
check("zero", residuals([3.0], [3.0]) == [0.0])
try:
    residuals([1.0], [1.0, 2.0])
    check("length", False)
except ValueError:
    check("length", True)

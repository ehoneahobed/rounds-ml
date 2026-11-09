probs = predict_proba([[1.0, 0.0], [1.0, 2.0]], [0.0, 1.0])
check("half", abs(probs[0] - 0.5) < 1e-12)
check("pos", abs(probs[1] - 1 / (1 + __import__("math").exp(-2))) < 1e-12)
try:
    predict_proba([[1.0, 2.0]], [0.0])
    check("width", False, "expected ValueError")
except ValueError:
    check("width", True)

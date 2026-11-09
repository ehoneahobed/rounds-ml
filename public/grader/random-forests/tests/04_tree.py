import random

X = [[0.0, 1.0], [0.0, 2.0], [1.0, 1.0], [1.0, 3.0], [0.0, 0.0], [1.0, 4.0]]
y = [0, 0, 1, 1, 0, 1]
tree = DecisionTreeClassifier(max_depth=2, min_samples_leaf=1, max_features=None, rng=random.Random(0))
tree.fit(X, y)
preds = tree.predict(X)
check("fit_predict_len", len(preds) == 6)
check("classes", tree.classes_ == [0, 1])
proba = tree.predict_proba([[0.0, 1.0]])
check("proba_sum", abs(sum(proba[0]) - 1.0) < 1e-9)

limited = DecisionTreeClassifier(max_depth=3, min_samples_leaf=1, max_features="sqrt", rng=random.Random(2))
limited.fit(X, y)
check("limited_features", limited.n_features_ == 2)
check("limited_predict", len(limited.predict(X)) == 6)

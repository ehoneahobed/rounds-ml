X = [[0.0, 1.0], [0.0, 2.0], [1.0, 1.0], [1.0, 3.0], [0.0, 0.0], [1.0, 4.0]]
y = [0, 0, 1, 1, 0, 1]
forest = RandomForestClassifier(n_estimators=5, max_depth=3, min_samples_leaf=1, max_features="sqrt", random_state=0)
forest.fit(X, y)
counts = feature_use_counts(forest)
check("len", len(counts) == 2)
check("nonneg", all(c >= 0 for c in counts))
check("used", sum(counts) >= 1)

X = [[0.0, 1.0], [0.0, 2.0], [1.0, 1.0], [1.0, 3.0], [0.0, 0.0], [1.0, 4.0]]
y = [0, 0, 1, 1, 0, 1]
forest = RandomForestClassifier(n_estimators=5, max_depth=2, min_samples_leaf=1, max_features="sqrt", random_state=0)
forest.fit(X, y)
check("n_trees", len(forest.trees_) == 5)
check("n_features", forest.n_features_ == 2)
preds = forest.predict(X)
check("pred_len", len(preds) == 6)
proba = forest.predict_proba(X)
check("proba_rows", len(proba) == 6)
check("proba_sum", all(abs(sum(row) - 1.0) < 1e-9 for row in proba))
forest2 = RandomForestClassifier(n_estimators=5, max_depth=2, min_samples_leaf=1, max_features="sqrt", random_state=0)
forest2.fit(X, y)
check("seeded", forest.predict(X) == forest2.predict(X))

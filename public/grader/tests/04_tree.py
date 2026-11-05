"""The tree contract: splits, depth, leaf size, ties, and probabilities."""

def _fit(X, y, **kwargs):
    tree = DecisionTreeClassifier(**kwargs)
    tree.fit(X, y)
    return tree

# Obvious one-feature cut at 1.5. The value 1.5 itself goes left.
simple = _fit([[0.0], [1.0], [2.0], [3.0]], [0, 0, 1, 1])
check("root feature is column 0", simple.root.feature == 0, f"feature {simple.root.feature}")
check("root threshold is 1.5", abs(simple.root.threshold - 1.5) < 1e-9, f"{simple.root.threshold}")
check("threshold value goes left", simple.predict([[1.5]]) == [0], f"{simple.predict([[1.5]])}")
check("right side is class 1", simple.predict([[1.5000001], [3.0]]) == [1, 1], f"{simple.predict([[1.5], [3.0]])}")
probs = simple.predict_proba([[0.0], [3.0]])
check("pure leaves are certain", probs == [[1.0, 0.0], [0.0, 1.0]], f"{probs}")
check("classes are sorted", simple.classes_ == [0, 1], f"{simple.classes_}")

# min_samples_leaf blocks the greedy one-row leaf.
# values 1..5, labels 0,0,0,0,1. Unrestricted cut is 4.5. With leaf size 2 the cut is 3.5.
loose = _fit([[1.0], [2.0], [3.0], [4.0], [5.0]], [0, 0, 0, 0, 1], min_samples_leaf=1)
tight = _fit([[1.0], [2.0], [3.0], [4.0], [5.0]], [0, 0, 0, 0, 1], min_samples_leaf=2)
check("unrestricted leaf-size cut is 4.5", abs(loose.root.threshold - 4.5) < 1e-9, f"{loose.root.threshold}")
check("min_samples_leaf=2 moves the cut to 3.5", abs(tight.root.threshold - 3.5) < 1e-9, f"{tight.root.threshold}")
check("both children of the legal cut predict 0", tight.predict([[1.0], [4.0], [5.0]]) == [0, 0, 0], f"{tight.predict([[1.0], [4.0], [5.0]])}")

stump = _fit([[1.0], [2.0], [3.0], [4.0], [5.0]], [0, 0, 0, 0, 1], max_depth=0)
check("max_depth 0 does not split", stump.root.feature is None, f"feature {stump.root.feature}")
check("max_depth 0 predicts the majority", stump.predict([[99.0]]) == [0], f"{stump.predict([[99.0]])}")

blocked = _fit([[1.0], [2.0], [3.0], [4.0], [5.0]], [0, 0, 0, 0, 1], min_impurity_decrease=0.5)
check("a huge impurity floor refuses every split", blocked.root.feature is None, "gain cannot reach 0.5 here")

# Identical features, mixed labels, tie goes to the smaller label.
tied = _fit([[1.0], [1.0], [1.0], [1.0]], [1, 0, 1, 0])
check("no-gain data stays a leaf", tied.root.feature is None, f"{tied.root.feature}")
check("a 50/50 leaf predicts the smaller label", tied.predict([[1.0]]) == [0], f"{tied.predict([[1.0]])}")
check("tied leaf probability is 0.5", abs(tied.predict_proba([[1.0]])[0][0] - 0.5) < 1e-12, f"{tied.predict_proba([[1.0]])}")

# Two identical columns. Feature 0 wins the tie.
mirror = _fit([[0.0, 0.0], [0.0, 0.0], [1.0, 1.0], [1.0, 1.0]], [0, 0, 1, 1])
check("equal gains keep the lower feature index", mirror.root.feature == 0, f"feature {mirror.root.feature}")

# Multiclass: thresholds 0.5 then 1.5, probabilities align with [0, 1, 2].
multi = _fit([[0.0], [0.0], [1.0], [1.0], [2.0], [2.0]], [0, 0, 1, 1, 2, 2])
check("multiclass classes are sorted", multi.classes_ == [0, 1, 2], f"{multi.classes_}")
check("multiclass root cut is the lower tied threshold", abs(multi.root.threshold - 0.5) < 1e-9, f"{multi.root.threshold}")
check("multiclass predictions", multi.predict([[0.0], [1.0], [2.0]]) == [0, 1, 2], f"{multi.predict([[0.0], [1.0], [2.0]])}")
check(
    "multiclass probability columns",
    multi.predict_proba([[2.0]]) == [[0.0, 0.0, 1.0]],
    f"{multi.predict_proba([[2.0]])}",
)

# Greedy limitation: XOR has no root gain, so a deep tree still does not split.
xor_X = [[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]]
xor_y = [0, 1, 1, 0]
xor_tree = _fit(xor_X, xor_y, max_depth=6)
check("XOR has no greedy split", xor_tree.root.feature is None, f"feature {xor_tree.root.feature}")

# Teaching tree: lactate then age. Locked to the hand calculation.
lactate_age = [
    [0.8, 40.0],
    [0.9, 82.0],
    [1.0, 45.0],
    [1.1, 88.0],
    [2.5, 81.0],
    [2.6, 42.0],
    [2.8, 86.0],
    [3.0, 48.0],
]
labels = [0, 0, 0, 0, 1, 0, 1, 0]
traced = _fit(lactate_age, labels)
check("teaching root is lactate", traced.root.feature == 0, f"feature {traced.root.feature}")
check("teaching root threshold is 1.8", abs(traced.root.threshold - 1.8) < 1e-9, f"{traced.root.threshold}")
check("low lactate is a pure leaf", traced.root.left.feature is None and traced.root.left.prediction == 0, "left should be class 0")
check("high lactate splits on age", traced.root.right.feature == 1, f"feature {traced.root.right.feature}")
check("age threshold is 64.5", abs(traced.root.right.threshold - 64.5) < 1e-9, f"{traced.root.right.threshold}")
check(
    "teaching predictions",
    traced.predict(lactate_age) == labels,
    f"{traced.predict(lactate_age)}",
)

# Probabilities sum to 1, and a second fit replaces the first.
second = DecisionTreeClassifier(max_depth=2)
second.fit([[0.0], [1.0]], [0, 0])
second.fit([[0.0], [1.0], [2.0], [3.0]], [1, 1, 0, 0])
check("refit replaces classes", second.classes_ == [0, 1], f"{second.classes_}")
total = sum(second.predict_proba([[0.0]])[0])
check("probabilities sum to 1", abs(total - 1.0) < 1e-12, f"{total}")

# Errors worth raising.
raised_empty = False
try:
    DecisionTreeClassifier().fit([], [])
except ValueError:
    raised_empty = True
check("empty X raises ValueError", raised_empty, "fit needs rows")

raised_ragged = False
try:
    DecisionTreeClassifier().fit([[1.0, 2.0], [1.0]], [0, 1])
except ValueError:
    raised_ragged = True
check("ragged rows raise ValueError", raised_ragged, "rows must share a width")

raised_early = False
try:
    DecisionTreeClassifier().predict([[1.0]])
except RuntimeError:
    raised_early = True
check("predict before fit raises RuntimeError", raised_early, "there is no tree yet")

raised_depth = False
try:
    DecisionTreeClassifier(max_depth=-1)
except ValueError:
    raised_depth = True
check("negative depth raises ValueError", raised_depth, "depth starts at 0")

# Sample accounting on the teaching tree.
def _leaf_total(node):
    if node.feature is None:
        return node.n_samples
    return _leaf_total(node.left) + _leaf_total(node.right)

check("leaf sizes add up to the root", _leaf_total(traced.root) == traced.root.n_samples == 8, f"root n={traced.root.n_samples}")
check("stored depth and leaf size", traced.max_depth == 4 and traced.min_samples_leaf == 1, "defaults stay visible")
check("n_features_", traced.n_features_ == 2, f"{traced.n_features_}")

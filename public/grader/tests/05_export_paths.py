"""Rule strings: formatting, order, and the unsplittable leaf."""

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
tree = DecisionTreeClassifier().fit(lactate_age, labels)
paths = export_paths(tree, ["lactate", "age"])
expected = [
    "if lactate <= 1.80 then 0 (p=1.00, n=4)",
    "if lactate > 1.80 AND age <= 64.50 then 0 (p=1.00, n=2)",
    "if lactate > 1.80 AND age > 64.50 then 1 (p=1.00, n=2)",
]
check("teaching tree exports three rules", paths == expected, "\n".join(paths))

pure = DecisionTreeClassifier().fit([[1.0], [1.0], [1.0], [1.0]], [1, 1, 1, 0])
pure_paths = export_paths(pure, ["x"])
check(
    "a leaf with no split says True",
    pure_paths == ["if True then 1 (p=0.75, n=4)"],
    str(pure_paths),
)

tied = DecisionTreeClassifier().fit([[1.0], [1.0], [1.0], [1.0]], [0, 1, 0, 1])
check(
    "tied leaf names the smaller class",
    export_paths(tied, ["x"]) == ["if True then 0 (p=0.50, n=4)"],
    str(export_paths(tied, ["x"])),
)

raised = False
try:
    export_paths(tree, ["lactate"])
except ValueError:
    raised = True
check("wrong number of names raises ValueError", raised, "one name per column")

raised_fit = False
try:
    export_paths(DecisionTreeClassifier(), ["x"])
except RuntimeError:
    raised_fit = True
check("export before fit raises RuntimeError", raised_fit, "there is no tree yet")

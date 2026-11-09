check("clear", majority_vote([1, 1, 0, 1, 0]) == 1)
check("tie", majority_vote([0, 1]) == 0)
check("all", majority_vote([2, 2, 2]) == 2)
try:
    majority_vote([])
    check("empty", False)
except ValueError:
    check("empty", True)

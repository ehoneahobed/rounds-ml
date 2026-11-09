check("empty", design_matrix([]) == [])
check("basic", design_matrix([[2.0], [3.0]]) == [[1.0, 2.0], [1.0, 3.0]])
try:
    design_matrix([[1.0], [1.0, 2.0]])
    check("ragged", False, "expected ValueError")
except ValueError:
    check("ragged", True)

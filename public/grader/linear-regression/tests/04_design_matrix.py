check("basic", design_matrix([[2.0], [3.0]]) == [[1.0, 2.0], [1.0, 3.0]])
check("empty", design_matrix([]) == [])
check("wide", design_matrix([[1.0, 2.0]]) == [[1.0, 1.0, 2.0]])
try:
    design_matrix([[1.0], [1.0, 2.0]])
    check("ragged", False)
except ValueError:
    check("ragged", True)

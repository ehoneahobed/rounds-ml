check("empty", mean_probability([]) == [])
got = mean_probability([[0.9, 0.1], [0.7, 0.3]])
check("avg0", abs(got[0] - 0.8) < 1e-12)
check("avg1", abs(got[1] - 0.2) < 1e-12)
try:
    mean_probability([[0.5], [0.1, 0.9]])
    check("ragged", False)
except ValueError:
    check("ragged", True)

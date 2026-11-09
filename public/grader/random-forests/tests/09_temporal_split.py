rows = [
    {"patient_id": "a", "admission_time": "2022-01-01", "v": 1},
    {"patient_id": "b", "admission_time": "2022-01-02", "v": 2},
    {"patient_id": "c", "admission_time": "2022-01-03", "v": 3},
    {"patient_id": "d", "admission_time": "2022-01-04", "v": 4},
]
train, test = patient_temporal_split(rows, "patient_id", "admission_time", 0.25)
check("test_id", [row["patient_id"] for row in test] == ["d"])
check("train_n", len(train) == 3)
try:
    patient_temporal_split(rows, "patient_id", "admission_time", 0.0)
    check("fraction", False)
except ValueError:
    check("fraction", True)

"""Patient-level future holdout."""

rows = [
    {"patient_id": "a", "admission_time": "2024-01-02", "x": 1},
    {"patient_id": "b", "admission_time": "2024-01-01", "x": 2},
    {"patient_id": "a", "admission_time": "2024-01-05", "x": 3},
    {"patient_id": "c", "admission_time": "2024-01-03", "x": 4},
    {"patient_id": "d", "admission_time": "2024-01-04", "x": 5},
]

train, test = patient_temporal_split(rows, test_fraction=0.5)
check(
    "half of the patients, by first timestamp, are held out",
    [row["patient_id"] for row in train] == ["a", "b", "a"],
    str([row["patient_id"] for row in train]),
)
check(
    "the later patients are the test set",
    [row["patient_id"] for row in test] == ["c", "d"],
    str([row["patient_id"] for row in test]),
)
check(
    "a later row does not drag that patient into the test",
    all(row["patient_id"] != "a" for row in test),
    "patient a has a row on Jan 5 but their first row is Jan 2",
)

train_small, test_small = patient_temporal_split(rows, test_fraction=0.25)
check(
    "ceil(0.25 * 4) holds out one patient",
    [row["patient_id"] for row in test_small] == ["d"],
    str([row["patient_id"] for row in test_small]),
)
check(
    "the other rows stay in their original order",
    [row["x"] for row in train_small] == [1, 2, 3, 4],
    str([row["x"] for row in train_small]),
)

tied = [
    {"patient_id": "m", "admission_time": "2024-02-01", "x": 1},
    {"patient_id": "k", "admission_time": "2024-02-01", "x": 2},
]
train_tie, test_tie = patient_temporal_split(tied, test_fraction=0.5)
check(
    "equal timestamps break ties by patient id",
    [row["patient_id"] for row in train_tie] == ["k"] and [row["patient_id"] for row in test_tie] == ["m"],
    f"train {[row['patient_id'] for row in train_tie]} test {[row['patient_id'] for row in test_tie]}",
)

# The original list is not reordered.
original_ids = [row["patient_id"] for row in rows]
_ = patient_temporal_split(rows, test_fraction=0.5)
check("the input list stays in place", [row["patient_id"] for row in rows] == original_ids, "do not sort the caller's list")

for fraction in (0.0, 1.0, -0.2, 1.5):
    raised = False
    try:
        patient_temporal_split(rows, test_fraction=fraction)
    except ValueError:
        raised = True
    check(f"fraction {fraction} raises ValueError", raised, "fraction must be strictly between 0 and 1")

raised_one = False
try:
    patient_temporal_split([{"patient_id": "only", "admission_time": "2024-01-01"}], test_fraction=0.5)
except ValueError:
    raised_one = True
check("one patient raises ValueError", raised_one, "both sides have to exist")

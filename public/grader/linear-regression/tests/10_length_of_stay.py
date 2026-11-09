import json
report = train_length_of_stay("/data/los_cohort_a.csv")
needed = ["train_mae", "train_rmse", "train_r2", "test_mae", "test_rmse", "test_r2"]
check("keys", all(k in report for k in needed))
check("a_mae", report["test_mae"] < 2.5, json.dumps(report))
check("a_r2", report["test_r2"] > 0.35, json.dumps(report))
report_b = train_length_of_stay("/data/los_cohort_b.csv")
check("b_mae", report_b["test_mae"] < 2.5, json.dumps(report_b))
check("b_r2", report_b["test_r2"] > 0.35, json.dumps(report_b))

cols = [
    {"name": "lactate", "available_hour": 6, "role": "feature"},
    {"name": "deteriorated", "available_hour": 48, "role": "label"},
    {"name": "patient_id", "available_hour": 0, "role": "identifier"},
    {"name": "lactate_h30", "available_hour": 30, "role": "feature"},
    {"name": "los_proxy", "available_hour": 6, "role": "feature"},
    {"name": "mystery", "available_hour": None, "role": "feature"},
]
report = leakage_report(cols)
reasons = [item["reason"] for item in report]
names = [item["name"] for item in report]
check("reasons", reasons == ["label", "identifier", "temporal_leak", "name_leak", "unknown_time"])
check("skips_clean", "lactate" not in names)
check("name_before_hour_ok", "los_proxy" in names)

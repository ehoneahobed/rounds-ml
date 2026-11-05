"""Hour-6 column screen. Priority is part of the contract."""

columns = [
    {"name": "hr", "available_hour": 6, "role": "feature"},
    {"name": "deteriorated", "available_hour": None, "role": "label"},
    {"name": "patient_id", "available_hour": 0, "role": "identifier"},
    {"name": "lactate_h30", "available_hour": 30, "role": "feature"},
    {"name": "discharge_disposition", "available_hour": 6, "role": "feature"},
    {"name": "death_in_hospital", "available_hour": 80, "role": "feature"},
    {"name": "spo2", "available_hour": None, "role": "feature"},
    {"name": "future_creatinine", "available_hour": 6, "role": "feature"},
    {"name": "age", "available_hour": 0, "role": "feature"},
    {"name": "Death", "available_hour": 6, "role": "feature"},
    {"name": "notes", "available_hour": 7, "role": "feature"},
    {"name": "ward_day2_note", "available_hour": 6, "role": "feature"},
]

report = leakage_report(columns)
by_name = {item["name"]: item["reason"] for item in report}

check("vital at hour 6 is kept", "hr" not in by_name, str(report))
check("age at admission is kept", "age" not in by_name, str(report))
check("label role wins", by_name.get("deteriorated") == "label", str(by_name.get("deteriorated")))
check("identifier role wins", by_name.get("patient_id") == "identifier", str(by_name.get("patient_id")))
check("later lab is a temporal leak", by_name.get("lactate_h30") == "temporal_leak", str(by_name.get("lactate_h30")))
check(
    "a bad name at hour 6 is still a name leak",
    by_name.get("discharge_disposition") == "name_leak",
    str(by_name.get("discharge_disposition")),
)
check(
    "a late hour outranks a bad name",
    by_name.get("death_in_hospital") == "temporal_leak",
    str(by_name.get("death_in_hospital")),
)
check("missing hour is unknown_time", by_name.get("spo2") == "unknown_time", str(by_name.get("spo2")))
check("future_ prefix is a name leak", by_name.get("future_creatinine") == "name_leak", str(by_name.get("future_creatinine")))
check("name match is case insensitive", by_name.get("Death") == "name_leak", str(by_name.get("Death")))
check("hour 7 is already too late", by_name.get("notes") == "temporal_leak", str(by_name.get("notes")))
check("day2 inside a name leaks", by_name.get("ward_day2_note") == "name_leak", str(by_name.get("ward_day2_note")))

flagged_names = [item["name"] for item in report]
expected_order = [
    "deteriorated",
    "patient_id",
    "lactate_h30",
    "discharge_disposition",
    "death_in_hospital",
    "spo2",
    "future_creatinine",
    "Death",
    "notes",
    "ward_day2_note",
]
check("flagged columns keep input order", flagged_names == expected_order, str(flagged_names))
check("empty registry flags nothing", leakage_report([]) == [], "expected an empty list")

# Hour exactly 6 is legal. A column available at hour 6 with a clean name stays out.
edge = leakage_report([{"name": "lactate", "available_hour": 6, "role": "feature"}])
check("hour 6 exactly is not a temporal leak", edge == [], str(edge))

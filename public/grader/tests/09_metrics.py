"""Confusion-matrix rates, Brier, and the sensitivity threshold."""

metrics = clinical_metrics([1, 0, 1, 0], [0.9, 0.8, 0.2, 0.1], 0.5)
check("tp fp tn fn at 0.5", (metrics["tp"], metrics["fp"], metrics["tn"], metrics["fn"]) == (1, 1, 1, 1), str(metrics))
check("sensitivity is 0.5", abs(metrics["sensitivity"] - 0.5) < 1e-12, str(metrics["sensitivity"]))
check("specificity is 0.5", abs(metrics["specificity"] - 0.5) < 1e-12, str(metrics["specificity"]))
check("ppv is 0.5", abs(metrics["ppv"] - 0.5) < 1e-12, str(metrics["ppv"]))
check("npv is 0.5", abs(metrics["npv"] - 0.5) < 1e-12, str(metrics["npv"]))
check("f1 uses the count formula", abs(metrics["f1"] - 0.5) < 1e-12, str(metrics["f1"]))
check("brier is 0.325", abs(metrics["brier"] - 0.325) < 1e-12, str(metrics["brier"]))

silent = clinical_metrics([1, 0], [0.1, 0.1], 0.5)
check("no predicted positives has ppv 0", silent["ppv"] == 0.0 and silent["tp"] == 0 and silent["fp"] == 0, str(silent))
check("the one true negative keeps specificity 1", abs(silent["specificity"] - 1.0) < 1e-12, str(silent["specificity"]))
check("npv with a miss is 0.5", abs(silent["npv"] - 0.5) < 1e-12, str(silent["npv"]))
check("f1 is 0 when there are no true positives", silent["f1"] == 0.0, str(silent["f1"]))
check("brier of those two scores is 0.41", abs(silent["brier"] - 0.41) < 1e-12, str(silent["brier"]))

# >= threshold, so a probability equal to the cut is positive.
edge = clinical_metrics([1, 0], [0.5, 0.5], 0.5)
check("probability equal to the threshold is positive", (edge["tp"], edge["fp"], edge["fn"], edge["tn"]) == (1, 1, 0, 0), str(edge))

# Worked clinical matrix: 40, 30, 120, 10 is not rebuilt here; this smaller one
# checks the same ratios the page uses (sens 40/50, ppv 40/70) via counts.
page = clinical_metrics(
    [1] * 50 + [0] * 150,
    [0.9] * 40 + [0.2] * 10 + [0.9] * 30 + [0.2] * 120,
    0.5,
)
check("page example sensitivity is 0.8", abs(page["sensitivity"] - 0.8) < 1e-12, str(page["sensitivity"]))
check("page example ppv is 40/70", abs(page["ppv"] - (40 / 70)) < 1e-12, str(page["ppv"]))
check("page example specificity is 0.8", abs(page["specificity"] - 0.8) < 1e-12, str(page["specificity"]))

quiz = threshold_for_sensitivity([1, 1, 0, 0], [0.9, 0.6, 0.6, 0.2], 1.0)
check("highest threshold that still catches both positives is 0.6", abs(quiz - 0.6) < 1e-12, str(quiz))

high = threshold_for_sensitivity([1, 0, 1, 0], [0.9, 0.8, 0.2, 0.1], 0.5)
check("target 0.5 can sit at 0.9", abs(high - 0.9) < 1e-12, str(high))

everyone = threshold_for_sensitivity([1, 0, 1, 0], [0.9, 0.8, 0.2, 0.1], 1.0)
check("catching the 0.2 positive lowers the threshold to 0.2", abs(everyone - 0.2) < 1e-12, str(everyone))

none_needed = threshold_for_sensitivity([1, 0], [0.4, 0.3], 0.0)
check("target 0 returns 1.0", abs(none_needed - 1.0) < 1e-12, str(none_needed))

impossible = threshold_for_sensitivity([0, 0, 0], [0.2, 0.4, 0.6], 1.0)
check("no positive label cannot hit sensitivity 1", impossible == 0.0, str(impossible))

for bad in (1.2, -0.01):
    raised = False
    try:
        threshold_for_sensitivity([1, 0], [0.5, 0.4], bad)
    except ValueError:
        raised = True
    check(f"target {bad} raises ValueError", raised, "target must sit in [0, 1]")

raised_len = False
try:
    clinical_metrics([1, 0], [0.5], 0.5)
except ValueError:
    raised_len = True
check("mismatched metric lengths raise ValueError", raised_len, "one probability per label")

raised_empty = False
try:
    threshold_for_sensitivity([], [], 0.5)
except ValueError:
    raised_empty = True
check("empty threshold input raises ValueError", raised_empty, "there is no operating point on no rows")

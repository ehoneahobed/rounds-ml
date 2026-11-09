t = threshold_for_sensitivity([1, 1, 0, 0], [0.9, 0.6, 0.6, 0.2], 1.0)
check("highest", abs(t - 0.6) < 1e-12)
t2 = threshold_for_sensitivity([1, 0], [0.4, 0.3], 0.80)
check("fallback_ok", t2 == 0.0 or t2 <= 0.4)

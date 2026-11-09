/** Starter files for the logistic-regression tasks. */

export const starters = {
  sigmoid: `import math


def sigmoid(z):
    """Map a score to a probability in (0, 1). Accept a number or a list."""
    raise NotImplementedError
`,
  "log-loss": `import math


def log_loss(y_true, y_prob, eps=1e-15):
    """Mean binary cross-entropy. Empty input is 0. Clip probabilities into (eps, 1-eps)."""
    raise NotImplementedError
`,
  "design-matrix": `def design_matrix(X):
    """Prepend a column of 1.0 to each row of X. Empty input stays empty."""
    raise NotImplementedError
`,
  "predict-proba": `def predict_proba(X, weights):
    """Return σ(X w) for each row. X already includes the intercept column."""
    raise NotImplementedError
`,
  "fit-logistic": `def fit_logistic(X, y, learning_rate, epochs, initial_weights=None):
    """Batch gradient descent for mean log loss.

    X already includes the intercept column. Default initial weights are zeros.
    Use gradient (1/n) Xᵀ (p − y) with p = σ(Xw).
    """
    raise NotImplementedError
`,
  metrics: `def confusion_counts(y_true, y_prob, threshold):
    """Return (tp, fp, tn, fn) using predicted 1 when probability >= threshold."""
    raise NotImplementedError


def sensitivity(tp, fp, tn, fn):
    """TP / (TP + FN). 0 when the denominator is 0."""
    raise NotImplementedError


def specificity(tp, fp, tn, fn):
    """TN / (TN + FP). 0 when the denominator is 0."""
    raise NotImplementedError


def positive_predictive_value(tp, fp, tn, fn):
    """TP / (TP + FP). 0 when the denominator is 0."""
    raise NotImplementedError
`,
  "threshold-sensitivity": `def threshold_for_sensitivity(y_true, y_prob, target=0.80):
    """Highest threshold in {0.00, 0.01, ..., 1.00} with sensitivity >= target.

    If none qualify, return 0.0.
    """
    raise NotImplementedError
`,
  leakage: `def leakage_report(columns, decision_hour=6):
    """Return [{name, reason}, ...] for illegal columns. First reason wins."""
    raise NotImplementedError
`,
  "temporal-split": `def patient_temporal_split(rows, patient_key, time_key, fraction):
    """Hold out the latest patients by first-seen timestamp.

    Return (train_rows, test_rows). Every row of a patient stays together.
    """
    raise NotImplementedError
`,
  "early-warning": `ALLOWED_FEATURES = (
    "age",
    "sex",
    "hr",
    "sbp",
    "rr",
    "temp",
    "spo2",
    "lactate",
    "creatinine",
    "wbc",
    "diabetes",
    "heart_failure",
)


def train_logistic_early_warning(rows):
    """Fit hour-6 logistic regression for deteriorated.

    Use only ALLOWED_FEATURES, patient_temporal_split with fraction 0.25,
    training-set standardization, a design matrix with intercept, and fit_logistic.
    Choose the threshold on the training side for sensitivity 0.80.
    Return a dict with keys:
      threshold, train_sensitivity, train_specificity, train_ppv,
      test_sensitivity, test_specificity, test_ppv,
      weights, means, scales, feature_names
    feature_names is ["intercept", *ALLOWED_FEATURES].
    Optional: probability_fn(rows) -> list of probabilities.
    """
    raise NotImplementedError
`,
};

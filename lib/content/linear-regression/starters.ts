/** Starter files for the linear-regression tasks. */

export const starters = {
  mse: `def mean_squared_error(y_true, y_pred):
    """Mean of (y_true - y_pred)^2. Empty input is 0. Lengths must match."""
    raise NotImplementedError
`,
  mae: `def mean_absolute_error(y_true, y_pred):
    """Mean of |y_true - y_pred|. Empty input is 0. Lengths must match."""
    raise NotImplementedError
`,
  residuals: `def residuals(y_true, y_pred):
    """Return y_true[i] - y_pred[i] for each i. Lengths must match."""
    raise NotImplementedError


def predict_univariate(x, slope, intercept):
    """Return intercept + slope * value for each value in x."""
    raise NotImplementedError
`,
  "fit-univariate": `def fit_univariate(x, y):
    """Return (slope, intercept) for y ≈ slope * x + intercept.

    Need at least two rows. A constant x raises ValueError.
    """
    raise NotImplementedError
`,
  "design-matrix": `def design_matrix(X):
    """Prepend a column of 1.0 to each row of X. Empty input stays empty."""
    raise NotImplementedError
`,
  ols: `def fit_ols(X, y):
    """Fit y ≈ X w with the intercept column already in X.

    Solve (Xᵀ X) w = Xᵀ y. Return the weight list w.
    """
    raise NotImplementedError


def predict_linear(X, weights):
    """Return the matrix-vector product X @ weights."""
    raise NotImplementedError
`,
  "gradient-descent": `def gradient_descent(X, y, learning_rate, epochs, initial_weights=None):
    """Batch gradient descent for y ≈ X w.

    X already includes the intercept column. Default initial weights are zeros.
    Use the gradient (2/n) Xᵀ (Xw - y).
    """
    raise NotImplementedError
`,
  "r-squared": `def r_squared(y_true, y_pred):
    """1 - SS_res / SS_tot.

    When SS_tot is 0, return 1.0 if residuals are all 0, else 0.0.
    Empty input is 0.
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
  "length-of-stay": `ALLOWED_FEATURES = (
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


def train_length_of_stay(csv_path):
    """Fit hour-6 length of stay with OLS and score later arrivals.

    Return a dict with train_mae, train_rmse, train_r2, test_mae, test_rmse, test_r2.
    Use only ALLOWED_FEATURES, patient_temporal_split with fraction 0.25, and an intercept.
    """
    raise NotImplementedError
`,
} as const;

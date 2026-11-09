/** Starter files for the linear-regression tasks. */

export const starters = {
  mse: `def mean_squared_error(y_true, y_pred):
    """Average of (truth - prediction)^2.

    Empty lists -> 0.0. Different lengths -> ValueError.
    """
    raise NotImplementedError
`,
  mae: `def mean_absolute_error(y_true, y_pred):
    """Average of |truth - prediction| (label units).

    Empty lists -> 0.0. Different lengths -> ValueError.
    """
    raise NotImplementedError
`,
  residuals: `def residuals(y_true, y_pred):
    """Signed gaps: truth[i] - prediction[i]. Lengths must match."""
    raise NotImplementedError


def predict_univariate(x, slope, intercept):
    """Line predictions: intercept + slope * x_i for each x_i."""
    raise NotImplementedError
`,
  "fit-univariate": `def fit_univariate(x, y):
    """Closed-form OLS for one feature: return (slope, intercept).

    Need at least two rows. Constant x -> ValueError.
    """
    raise NotImplementedError
`,
  "design-matrix": `def design_matrix(X):
    """Prepend a 1.0 to each row so the first weight is the intercept.

    Empty table stays []. Ragged rows -> ValueError.
    """
    raise NotImplementedError
`,
  ols: `def fit_ols(X, y):
    """Solve (Xᵀ X) w = Xᵀ y. X already has the intercept column.

    Need at least as many rows as columns. Return weight list w.
    """
    raise NotImplementedError


def predict_linear(X, weights):
    """Row-wise dot products: X @ weights."""
    raise NotImplementedError
`,
  "gradient-descent": `def gradient_descent(X, y, learning_rate, epochs, initial_weights=None):
    """Batch GD for MSE. Gradient is (2/n) Xᵀ (Xw - y).

    X already includes the intercept. Default initial weights are zeros.
    """
    raise NotImplementedError
`,
  "r-squared": `def r_squared(y_true, y_pred):
    """1 - SS_res / SS_tot. Better than always predicting the mean?

    When SS_tot is 0: return 1.0 if residuals are all 0, else 0.0.
    Empty input is 0.
    """
    raise NotImplementedError
`,
  leakage: `def leakage_report(columns, decision_hour=6):
    """Flag illegal columns as [{name, reason}, ...]. First reason wins."""
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

    Use only ALLOWED_FEATURES, patient_temporal_split(fraction=0.25),
    design_matrix + fit_ols. Return train/test mae, rmse, and r2.
    """
    raise NotImplementedError
`,
} as const;

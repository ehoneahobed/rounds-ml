import { starters } from "@/lib/content/linear-regression/starters";
import type { Task, TaskLevel } from "@/lib/content/types";

export const LEVEL_LABELS: Record<TaskLevel, string> = {
  0: "Level 0 · foundations",
  1: "Level 1 · the line",
  2: "Level 2 · clinical practice",
  3: "Level 3 · project",
};

export const tasks: Task[] = [
  {
    slug: "mse",
    file: "0-mean_squared_error.py",
    number: 0,
    level: 0,
    title: "The average squared gap",
    points: 6,
    minutes: 20,
    summary: "Mean squared error of a list of truths and predictions.",
    testFile: "00_mse.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters.mse,
    blocks: [
      {
        type: "p",
        text: "A prediction is a number. The truth is another number. The gap between them is the residual. Squaring the gap punishes large misses more than small ones. Mean squared error (MSE) is the average of those squares.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "ol",
        items: [
          "Truths `[2, 4, 6]`, predictions `[1, 5, 5]`.",
          "Gaps: `2−1 = 1`, `4−5 = −1`, `6−5 = 1`.",
          "Squares: `1`, `1`, `1`.",
          "Mean: `(1+1+1)/3 = 1`.",
        ],
      },
      {
        type: "p",
        text: "In symbols,",
      },
      {
        type: "math",
        latex: "\\mathrm{MSE} = \\frac{1}{n}\\sum_i (y_i - \\hat{y}_i)^2.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `mean_squared_error(y_true, y_pred)`. Empty lists → `0.0`. Different lengths → `ValueError`. Floats may differ by at most `1e-12`.",
      },
      {
        type: "terminal",
        text: ">>> mean_squared_error([2.0, 4.0, 6.0], [1.0, 5.0, 5.0])\n1.0\n>>> mean_squared_error([], [])\n0.0",
      },
      {
        type: "callout",
        tone: "note",
        title: "What the checker also tries",
        text: "A perfect fit (MSE 0), a one-row case, and a length mismatch that must raise.",
      },
    ],
  },
  {
    slug: "mae",
    file: "1-mean_absolute_error.py",
    number: 1,
    level: 0,
    title: "The average absolute gap",
    points: 6,
    minutes: 20,
    summary: "Mean absolute error in the label's units.",
    testFile: "01_mae.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters.mae,
    blocks: [
      {
        type: "p",
        text: "MAE keeps the gap in the same units as the label (days of stay, dollars, mmHg). No squaring—just the absolute value, then the mean. Large outliers hurt less than they do under MSE.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "p",
        text: "Same lists as MSE: truths `[2, 4, 6]`, predictions `[1, 5, 5]`. Absolute gaps `|1|`, `|−1|`, `|1|`. Mean = 1. Same number as MSE here only because each gap was ±1.",
      },
      {
        type: "math",
        latex: "\\mathrm{MAE} = \\frac{1}{n}\\sum_i |y_i - \\hat{y}_i|.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `mean_absolute_error(y_true, y_pred)`. Empty → `0.0`. Different lengths → `ValueError`.",
      },
      {
        type: "terminal",
        text: ">>> mean_absolute_error([2.0, 4.0, 6.0], [1.0, 5.0, 5.0])\n1.0\n>>> mean_absolute_error([], [])\n0.0",
      },
    ],
  },
  {
    slug: "residuals",
    file: "2-residuals.py",
    number: 2,
    level: 0,
    title: "Truth minus prediction",
    points: 8,
    minutes: 25,
    summary: "Residuals and a univariate prediction.",
    testFile: "02_residuals.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters.residuals,
    blocks: [
      {
        type: "p",
        text: "Before averaging errors, you often want the signed list itself: residual = truth − prediction. Positive means you under-predicted; negative means you over-predicted.",
      },
      {
        type: "h2",
        text: "A one-feature line",
      },
      {
        type: "p",
        text: "The simplest model is a straight line: prediction = intercept + slope × x. For x = `[1.5, 2.0]`, slope 2, intercept 1 → predictions `[4.0, 5.0]`.",
      },
      {
        type: "math",
        latex: "\\hat{y} = b + m x.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `residuals(y_true, y_pred)` and `predict_univariate(x, slope, intercept)`. Residuals: mismatched lengths → `ValueError`. Predict: return a new list, one value per x.",
      },
      {
        type: "terminal",
        text: ">>> residuals([5.0, 1.0], [7.0, 0.0])\n[-2.0, 1.0]\n>>> predict_univariate([1.5, 2.0], 2.0, 1.0)\n[4.0, 5.0]",
      },
    ],
  },
  {
    slug: "fit-univariate",
    file: "3-fit_univariate.py",
    number: 3,
    level: 1,
    title: "Slope and intercept",
    points: 10,
    minutes: 35,
    summary: "Closed-form ordinary least squares for one feature.",
    testFile: "03_fit_univariate.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["fit-univariate"],
    blocks: [
      {
        type: "p",
        text: "Given pairs (x, y), ordinary least squares picks the slope and intercept that minimize MSE. For one feature there is a closed form—no guess-and-check.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "ol",
        items: [
          "Compute means x̄ and ȳ.",
          "Slope m = Σ((xᵢ − x̄)(yᵢ − ȳ)) / Σ((xᵢ − x̄)²).",
          "Intercept b = ȳ − m · x̄.",
        ],
      },
      {
        type: "p",
        text: "Check: x = `[0.8, 1.2, 1.6, 2.0, 2.4, 2.8]`, y = `[2.6, 3.4, 4.2, 5.0, 5.8, 6.6]`. That is exactly the line y = 2x + 1, so the fit returns `(2.0, 1.0)`.",
      },
      {
        type: "math",
        latex: "m = \\frac{\\sum_i (x_i-\\bar{x})(y_i-\\bar{y})}{\\sum_i (x_i-\\bar{x})^2},\\quad b = \\bar{y} - m\\bar{x}.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `fit_univariate(x, y)` returning `(slope, intercept)`. Need at least two rows. A constant x (denominator 0) → `ValueError`. Mismatched lengths → `ValueError`.",
      },
      {
        type: "terminal",
        text: ">>> fit_univariate([0.8, 1.2, 1.6, 2.0, 2.4, 2.8], [2.6, 3.4, 4.2, 5.0, 5.8, 6.6])\n(2.0, 1.0)",
      },
    ],
  },
  {
    slug: "design-matrix",
    file: "4-design_matrix.py",
    number: 4,
    level: 1,
    title: "A column of ones",
    points: 8,
    minutes: 25,
    summary: "Prepend the intercept column to a feature table.",
    testFile: "04_design_matrix.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["design-matrix"],
    blocks: [
      {
        type: "p",
        text: "Multivariate linear models write prediction as a dot product: row · weights. The intercept is just another weight—if every row starts with a 1. That leading column of ones is the design-matrix trick.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "p",
        text: "`[[2.0], [3.0]]` becomes `[[1.0, 2.0], [1.0, 3.0]]`. Two features would become three columns: ones, then feature A, then feature B.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `design_matrix(X)`. Empty table → `[]`. Rows of unequal length → `ValueError`. Do not mutate the caller’s rows in place—return a new table.",
      },
      {
        type: "terminal",
        text: ">>> design_matrix([[2.0], [3.0]])\n[[1.0, 2.0], [1.0, 3.0]]",
      },
    ],
  },
  {
    slug: "ols",
    file: "5-fit_ols.py",
    number: 5,
    level: 1,
    title: "The normal equations",
    points: 12,
    minutes: 50,
    summary: "Multivariate ordinary least squares with an intercept column already present.",
    testFile: "05_ols.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters.ols,
    blocks: [
      {
        type: "p",
        text: "With several features (and a leading column of ones), the best weight vector w still minimizes MSE. The calculus shortcut is the normal equations: solve a square linear system instead of searching.",
      },
      {
        type: "math",
        latex: "(X^{\\mathsf{T}} X)\\, w = X^{\\mathsf{T}} y.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "p",
        text: "X already has the intercept column: rows `[1,1]`, `[1,2]`, `[1,3]`, `[1,4]` and y = `[3,5,7,9]`. The line is ŷ = 1 + 2x, so w = `[1.0, 2.0]`. Predicting with those weights recovers y.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `fit_ols(X, y)` and `predict_linear(X, weights)`. X already includes the intercept. Need at least as many rows as columns. Empty X, length mismatch, or a singular system → `ValueError`. You may solve the system with Gaussian elimination (partial pivoting) or any correct linear solver you write yourself—no numpy required.",
      },
      {
        type: "terminal",
        text: ">>> X = [[1.0, 1.0], [1.0, 2.0], [1.0, 3.0], [1.0, 4.0]]\n>>> fit_ols(X, [3.0, 5.0, 7.0, 9.0])\n[1.0, 2.0]\n>>> predict_linear(X, [1.0, 2.0])\n[3.0, 5.0, 7.0, 9.0]",
      },
    ],
  },
  {
    slug: "gradient-descent",
    file: "6-gradient_descent.py",
    number: 6,
    level: 1,
    title: "Steps down the bowl",
    points: 10,
    minutes: 45,
    summary: "Batch gradient descent for mean squared error.",
    testFile: "06_gradient_descent.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["gradient-descent"],
    blocks: [
      {
        type: "p",
        text: "OLS solves in one shot. Gradient descent walks downhill instead: start from a guess for w, compute how MSE changes if you nudge each weight, then take a small step opposite that gradient. Repeat for many epochs.",
      },
      {
        type: "math",
        latex: "\\nabla_w \\mathrm{MSE} = \\frac{2}{n} X^{\\mathsf{T}}(Xw - y),\\qquad w \\leftarrow w - \\eta\\,\\nabla_w.",
      },
      {
        type: "h2",
        text: "Recipe each epoch",
      },
      {
        type: "ol",
        items: [
          "Predict ŷ = Xw (X already has the intercept column).",
          "Errors = ŷ − y (prediction minus truth).",
          "For each weight j, gradient_j = (2/n) · Σᵢ Xᵢⱼ · errorᵢ.",
          "w ← w − learning_rate · gradient.",
        ],
      },
      {
        type: "p",
        text: "With enough epochs and a sane learning rate on the four-row line from the OLS task, you should land near `[1, 2]` again.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `gradient_descent(X, y, learning_rate, epochs, initial_weights=None)`. Default initial weights are all zeros. Empty X or length mismatch → `ValueError`. Return the final weight list.",
      },
      {
        type: "terminal",
        text: ">>> X = [[1.0, 1.0], [1.0, 2.0], [1.0, 3.0], [1.0, 4.0]]\n>>> w = gradient_descent(X, [3.0, 5.0, 7.0, 9.0], 0.05, 5000)\n>>> [round(v, 2) for v in w]\n[1.0, 2.0]",
      },
    ],
  },
  {
    slug: "r-squared",
    file: "7-r_squared.py",
    number: 7,
    level: 1,
    title: "Better than the average",
    points: 8,
    minutes: 30,
    summary: "Coefficient of determination.",
    testFile: "07_r_squared.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["r-squared"],
    blocks: [
      {
        type: "p",
        text: "R² asks: how much better are your predictions than always guessing the mean of y? 1 means you explain all of the variance. 0 means you did no better than the mean. Negative means you did worse.",
      },
      {
        type: "h2",
        text: "Work it by hand once",
      },
      {
        type: "ol",
        items: [
          "SS_res = Σ (yᵢ − ŷᵢ)² — leftover error after your model.",
          "SS_tot = Σ (yᵢ − ȳ)² — leftover error if you always predicted the mean.",
          "R² = 1 − SS_res / SS_tot.",
        ],
      },
      {
        type: "p",
        text: "Truths `[2, 4, 6]`. Perfect predictions → R² = 1. Predictions all `4` (the mean) → SS_res = SS_tot → R² = 0.",
      },
      {
        type: "math",
        latex: "R^2 = 1 - \\frac{\\mathrm{SS}_{\\mathrm{res}}}{\\mathrm{SS}_{\\mathrm{tot}}}.",
      },
      {
        type: "h2",
        text: "Edge cases",
      },
      {
        type: "p",
        text: "When every truth is the same, SS_tot is 0. Return `1.0` if every residual is also 0 (you matched the constant), else `0.0`. Empty input → `0.0`.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `r_squared(y_true, y_pred)`. Different lengths → `ValueError`.",
      },
      {
        type: "terminal",
        text: ">>> r_squared([2.0, 4.0, 6.0], [2.0, 4.0, 6.0])\n1.0\n>>> r_squared([2.0, 4.0, 6.0], [4.0, 4.0, 4.0])\n0.0",
      },
    ],
  },
  {
    slug: "leakage",
    file: "8-leakage_report.py",
    number: 8,
    level: 2,
    title: "It was not known at hour 6",
    points: 10,
    minutes: 40,
    summary: "A column screen with a written priority.",
    testFile: "08_leakage.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters.leakage,
    blocks: [
      {
        type: "p",
        text: "Before you fit, refuse columns that cheat. Decision time for this project is hour 6 of an admission. Each column arrives as a dict with `name`, `available_hour` (int or `None`), and `role` (`feature`, `label`, or `identifier`).",
      },
      {
        type: "h2",
        text: "First matching reason wins",
      },
      {
        type: "ol",
        items: [
          "`label` — role is `label` (you never use the answer as an input).",
          "`identifier` — role is `identifier` (patient id, hospital id, …).",
          "`temporal_leak` — `available_hour` is not `None` and is greater than the decision hour (default 6). Hour 6 itself is legal.",
          "`name_leak` — lowercased name contains any of: discharge, death, mortal, expired, icu_transfer, future_, day2, outcome, los_.",
          "`unknown_time` — it is a feature and hour is `None`.",
        ],
      },
      {
        type: "p",
        text: "Return only flagged columns as `{\"name\", \"reason\"}`, in input order. Clean columns are omitted. A bad name with hour 6 is still a name leak. A late hour outranks a bad name. Empty input → `[]`.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `leakage_report(columns, decision_hour=6)`. The checker includes a column named like a length-of-stay proxy and a clean-named column that arrives after hour 6.",
      },
    ],
  },
  {
    slug: "temporal-split",
    file: "9-patient_temporal_split.py",
    number: 9,
    level: 2,
    title: "Later arrivals stay in the test set",
    points: 8,
    minutes: 35,
    summary: "Hold out whole patients, latest arrivals last.",
    testFile: "09_temporal_split.py",
    needsCohorts: false,
    timeoutMs: 20000,
    starter: starters["temporal-split"],
    blocks: [
      {
        type: "p",
        text: "A random row shuffle can put the same person in train and test. That flatters you. Hold out whole patients, and put the latest arrivals in the test set.",
      },
      {
        type: "h2",
        text: "Recipe",
      },
      {
        type: "ol",
        items: [
          "Group rows by patient id.",
          "Date each patient by their earliest `time_key` (timestamps are comparable strings).",
          "Sort patients by that time, then by `str(patient_id)`.",
          "Test = last `ceil(fraction * n_patients)` patients, clamped so each side has at least one patient (`[1, n-1]`).",
          "Every row of a patient stays together. Keep original row order inside train and inside test—do not sort the caller’s list in place.",
        ],
      },
      {
        type: "p",
        text: "Example: patients first seen on Jan 1, 2, 3, 4. With `fraction=0.5`, test is the last two. If the Jan-2 patient also has a Jan-5 row, that row stays in train with them.",
      },
      {
        type: "h2",
        text: "What to write",
      },
      {
        type: "p",
        text: "Implement `patient_temporal_split(rows, patient_key, time_key, fraction)` returning `(train_rows, test_rows)`. Fraction not strictly inside (0, 1), or fewer than two patients → `ValueError`.",
      },
    ],
  },
  {
    slug: "length-of-stay",
    file: "10-length_of_stay.py",
    number: 10,
    level: 3,
    title: "Length of stay at hour 6",
    points: 14,
    minutes: 70,
    summary: "An OLS length-of-stay model that refuses the columns a nurse would not have had.",
    testFile: "10_length_of_stay.py",
    needsCohorts: true,
    timeoutMs: 45000,
    starter: starters["length-of-stay"],
    blocks: [
      {
        type: "p",
        text: "Put the pieces together. You get a CSV path. Fit a linear model for `los_days` using only facts known at hour 6, hold out later patients, and report train/test MAE, RMSE, and R².",
      },
      {
        type: "h2",
        text: "What you may use",
      },
      {
        type: "table",
        caption: "Decision time is hour 6. Label is los_days.",
        headers: ["Column", "Knowable", "In the matrix?"],
        rows: [
          ["patient_id, admission_time", "at arrival", "no — keys for the split"],
          ["age, sex, diabetes, heart_failure", "at arrival", "yes"],
          ["hr, sbp, rr, temp, spo2, lactate, creatinine, wbc", "hour 6", "yes"],
          ["los_days", "end of stay", "no — this is y"],
        ],
      },
      {
        type: "h2",
        text: "Recipe",
      },
      {
        type: "ol",
        items: [
          "Read the CSV. Cast `ALLOWED_FEATURES` and `los_days` to floats.",
          "Split with `patient_temporal_split(..., fraction=0.25)`.",
          "Build a design matrix (intercept column) from `ALLOWED_FEATURES` only—on train and on test separately.",
          "Fit with `fit_ols` on the training matrix. Predict with `predict_linear`.",
          "RMSE is `sqrt(mean_squared_error(...))`. Pack the six metrics named in the starter.",
        ],
      },
      {
        type: "callout",
        tone: "practice",
        title: "How you are scored",
        text: "The checker scores cohort A (shown) and hidden cohort B. Test MAE must stay under 2.5 and test R² above 0.35 on both. Hardcoding rows will not travel.",
      },
    ],
  },
];

export const TOTAL_POINTS = tasks.reduce((sum, task) => sum + task.points, 0);

export function taskBySlug(slug: string): Task | undefined {
  return tasks.find((task) => task.slug === slug);
}

/** Tasks whose saved drafts are prepended when a later task runs. */
export function earlierTasks(slug: string): Task[] {
  const index = tasks.findIndex((task) => task.slug === slug);
  if (index <= 0) return [];
  return tasks.slice(0, index);
}

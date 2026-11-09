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
        text: "Write `mean_squared_error(y_true, y_pred)`. It is the mean of `(y_true[i] - y_pred[i])^2`. An empty pair of lists is 0. Different lengths raise `ValueError`.",
      },
      {
        type: "terminal",
        text: ">>> mean_squared_error([2.0, 4.0, 6.0], [1.0, 5.0, 5.0])\n1.0\n>>> mean_squared_error([], [])\n0.0",
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
        text: "Write `mean_absolute_error(y_true, y_pred)`. Empty input is 0. Different lengths raise `ValueError`.",
      },
      {
        type: "terminal",
        text: ">>> mean_absolute_error([2.0, 4.0, 6.0], [1.0, 5.0, 5.0])\n1.0",
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
        text: "Write `residuals(y_true, y_pred)` returning the list of `y_true[i] - y_pred[i]`. Write `predict_univariate(x, slope, intercept)` returning `intercept + slope * value` for each value.",
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
        text: "Write `fit_univariate(x, y)` returning `(slope, intercept)`. Need at least two rows. A constant `x` raises `ValueError`. Mismatched lengths raise `ValueError`.",
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
        text: "Write `design_matrix(X)`. Each output row is `[1.0, *row]`. An empty table stays empty. Ragged rows raise `ValueError`.",
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
        text: "Write `fit_ols(X, y)` solving `(Xᵀ X) w = Xᵀ y`, and `predict_linear(X, weights)`. `X` already includes the intercept column. Need at least as many rows as columns.",
      },
      {
        type: "terminal",
        text: ">>> X = [[1.0, 1.0], [1.0, 2.0], [1.0, 3.0], [1.0, 4.0]]\n>>> fit_ols(X, [3.0, 5.0, 7.0, 9.0])\n[1.0, 2.0]",
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
        text: "Write `gradient_descent(X, y, learning_rate, epochs, initial_weights=None)`. Use gradient `(2/n) Xᵀ (Xw - y)`. Default initial weights are zeros. `X` already includes the intercept column.",
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
        text: "Write `r_squared(y_true, y_pred)`. When `SS_tot` is 0, return 1.0 if every residual is 0, else 0.0. Empty input is 0.",
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
        text: "Write `leakage_report(columns, decision_hour=6)`. Each column has `name`, `available_hour`, and `role`. First matching reason wins: `label`, `identifier`, `temporal_leak`, `name_leak`, `unknown_time`. Name tokens include `los_`. Clean columns are omitted.",
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
        text: "Write `patient_temporal_split(rows, patient_key, time_key, fraction)`. Order patients by earliest timestamp, then by patient id as a string. The last `ceil(fraction * n)` patients, clamped to `[1, n-1]`, are test. Fraction outside `(0, 1)` or fewer than two patients raises `ValueError`.",
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
        text: "Write `train_length_of_stay(csv_path)`. Use only `ALLOWED_FEATURES`, `patient_temporal_split` with fraction 0.25, a design matrix with an intercept, and `fit_ols`. Return `train_mae`, `train_rmse`, `train_r2`, `test_mae`, `test_rmse`, and `test_r2`. The checker scores cohort A (shown) and cohort B (hidden). Test MAE must stay under 2.5 and test R² above 0.35 on both.",
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

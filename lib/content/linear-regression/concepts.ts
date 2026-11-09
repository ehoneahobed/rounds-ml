import type { Concept } from "@/lib/content/types";

/**
 * Linear-regression concepts in teaching order.
 * Error measures come before fitting; one-feature fit before the design matrix.
 */
export const concepts: Concept[] = [
  {
    slug: "what-it-is",
    number: "01",
    title: "What the line is",
    minutes: 15,
    summary: "Predict a number with a slope and an intercept.",
    blocks: [
      {
        type: "p",
        text: "At hour 6 of an admission you have vitals and labs already resulted. The question in this module is how many days the stay will last—a number, not a yes/no. That number is the label. Features are columns you are allowed to use at decision time. Length of stay itself is not a feature.",
      },
      {
        type: "p",
        text: "A decision tree answers with a flowchart of ≤ / > questions. Linear regression answers with a line: multiply features by weights, add a bias, get a prediction. Training means finding those weights. The trained model is the weights—not a tree of questions.",
      },
      {
        type: "p",
        text: "With one feature \\(x\\) (here lactate) the line is",
      },
      {
        type: "math",
        latex: "\\hat{y} = w x + b.",
      },
      {
        type: "p",
        text: "\\(w\\) is the slope: days of predicted stay per unit of lactate. \\(b\\) is the intercept: the prediction when lactate is 0. On the six-patient teaching table below, the exact fit is slope 2 and intercept 1, so \\(\\hat{y} = 2x + 1\\). Lactate 1.5 predicts 4 days.",
      },
      {
        type: "table",
        caption: "Six admissions. Length of stay here is exactly 1 + 2 × lactate.",
        headers: ["Patient", "Lactate", "Length of stay (days)"],
        rows: [
          ["A", "0.8", "2.6"],
          ["B", "1.2", "3.4"],
          ["C", "1.6", "4.2"],
          ["D", "2.0", "5.0"],
          ["E", "2.4", "5.8"],
          ["F", "2.8", "6.6"],
        ],
      },
      { type: "lab" },
      {
        type: "callout",
        tone: "note",
        title: "Line lab",
        text: "Drag slope and intercept. The gold sticks are residuals—truth minus prediction. Snap to best fit when you want the teaching line.",
      },
    ],
  },
  {
    slug: "error-and-fit",
    number: "02",
    title: "Error and the best fit",
    minutes: 28,
    summary: "Residuals, MSE/MAE, then the closed-form line for one feature.",
    blocks: [
      {
        type: "p",
        text: "Residual for one row: \\(e = y - \\hat{y}\\). Positive means the line predicted too low; negative means too high. Truth 5, prediction 7 → residual −2.",
      },
      {
        type: "p",
        text: "Mean squared error averages the squared residuals. Mean absolute error averages the absolute residuals (same units as the label—days here).",
      },
      {
        type: "math",
        latex: "\\mathrm{MSE} = \\frac{1}{n}\\sum_i (y_i - \\hat{y}_i)^2, \\quad \\mathrm{MAE} = \\frac{1}{n}\\sum_i |y_i - \\hat{y}_i|.",
      },
      {
        type: "p",
        text: "Truths [2, 4, 6], predictions [1, 5, 5]: residuals 1, −1, 1. MSE = 1, MAE = 1. Empty lists: both 0. Different lengths: raise an error.",
      },
      {
        type: "h2",
        text: "Fitting one feature",
      },
      {
        type: "p",
        text: "Ordinary least squares picks \\(w\\) and \\(b\\) that minimize MSE on the training rows. For one feature the closed form is",
      },
      {
        type: "math",
        latex: "w = \\frac{\\sum_i (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum_i (x_i - \\bar{x})^2}, \\quad b = \\bar{y} - w\\bar{x}.",
      },
      {
        type: "p",
        text: "If every \\(x\\) is the same, the denominator is 0—there is no unique slope; this module’s `fit_univariate` raises `ValueError`. On the teaching table the formula returns slope 2 and intercept 1, and MSE is 0.",
      },
      {
        type: "reveal",
        title: "Pause and compute",
        prompt: "Wrong line: slope 0.5, intercept 3. Patient A has lactate 0.8 and los 2.6. What is the residual?",
        answer: "Prediction \\(3 + 0.5\\times 0.8 = 3.4\\). Residual \\(2.6 - 3.4 = -0.8\\).",
      },
      {
        type: "p",
        text: "R² compares your residuals to predicting the mean of \\(y\\) every time: \\(R^2 = 1 - \\mathrm{SS}_{res}/\\mathrm{SS}_{tot}\\). Perfect predictions → 1. Predicting the mean → 0. Worse than the mean → negative.",
      },
    ],
  },
  {
    slug: "many-features",
    number: "03",
    title: "Several features at once",
    minutes: 25,
    summary: "Design matrix, normal equations, and a short path downhill.",
    blocks: [
      {
        type: "p",
        text: "With several features, stack a column of ones (the intercept) in front of the feature matrix \\(X\\). That design matrix times a weight vector \\(w\\) gives predictions \\(\\hat{y} = Xw\\).",
      },
      {
        type: "terminal",
        text: "design_matrix([[2.0], [3.0]]) → [[1, 2], [1, 3]]",
      },
      {
        type: "p",
        text: "Minimizing MSE leads to the normal equations",
      },
      {
        type: "math",
        latex: "X^\\top X\\, w = X^\\top y.",
      },
      {
        type: "p",
        text: "Solve for \\(w\\) when \\(X^\\top X\\) is invertible. Singular systems raise in this module—do not invent a pseudoinverse unless a later task says so. No NumPy and no scikit-learn in the checker; implement the linear algebra the tasks ask for.",
      },
      {
        type: "h2",
        text: "Gradient descent",
      },
      {
        type: "p",
        text: "Another route to the same bowl: start from some weights and walk downhill. Each step: \\(w \\leftarrow w - \\eta \\nabla\\), where \\(\\eta\\) is the learning rate (step size) and \\(\\nabla\\) is the gradient of MSE with respect to \\(w\\). Too large an \\(\\eta\\) overshoots; too small crawls. Closed form is exact when it exists; GD matters when the system is huge or you want a path you can regularize step by step.",
      },
    ],
  },
  {
    slug: "shipping",
    number: "04",
    title: "Scaling, ridge, and shipping",
    minutes: 28,
    summary: "Stabilize weights, refuse leaked columns, read MAE on later arrivals.",
    blocks: [
      {
        type: "h2",
        text: "Scaling and ridge",
      },
      {
        type: "p",
        text: "Features on different scales (age vs lactate) make gradients and penalties awkward. Standardize using means and standard deviations from the training patients only—never pool test rows into those statistics.",
      },
      {
        type: "p",
        text: "Ridge adds \\(\\alpha\\|w\\|^2\\) pressure toward smaller slopes. In this module’s solve the intercept is left unpenalized (a 0 on that diagonal of the penalty). Larger \\(\\alpha\\) shrinks the feature weights; it does not force the intercept to zero.",
      },
      {
        type: "h2",
        text: "Hour 6, time, and site",
      },
      {
        type: "p",
        text: "Predict length of stay with facts known at hour 6. Refuse death, disposition, future labs, identifiers, and name leaks such as a column containing `los_` even if someone stamped available_hour 6. Hold out whole patients with later arrivals in the test set—random row splits flatter you.",
      },
      {
        type: "p",
        text: "Test MAE in days is the average absolute miss on those later arrivals. R² says how much better you are than predicting the training mean. An assay that reads 15% low at hospital B feeds the same slope a different number—the predicted stay moves with the assay, not only with the patient.",
      },
      {
        type: "callout",
        tone: "practice",
        title: "What you hand over",
        text: "Columns refused, train/test errors in days, and one failure mode (assay shift, small n, wrong decision time). That is the ward note for this module.",
      },
    ],
  },
];

export function conceptBySlug(slug: string): Concept | undefined {
  return concepts.find((concept) => concept.slug === slug);
}

export function conceptNeighbors(slug: string): { previous?: Concept; next?: Concept } {
  const index = concepts.findIndex((concept) => concept.slug === slug);
  if (index < 0) return {};
  return {
    previous: index > 0 ? concepts[index - 1] : undefined,
    next: index < concepts.length - 1 ? concepts[index + 1] : undefined,
  };
}

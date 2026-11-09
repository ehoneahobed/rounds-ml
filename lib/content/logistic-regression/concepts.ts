import type { Concept } from "@/lib/content/types";

/**
 * Logistic-regression concepts in teaching order.
 * Builds on the linear score from Module 02; owns probability and classification metrics.
 */
export const concepts: Concept[] = [
  {
    slug: "score-and-sigmoid",
    number: "01",
    title: "From a score to a probability",
    minutes: 22,
    summary: "Same linear score as before; the sigmoid turns it into a number between 0 and 1.",
    blocks: [
      {
        type: "p",
        text: "Linear regression predicted a number. This module asks a yes/no question: spam or not, default or not, churn or not—any binary label. You still start with a linear score—a weighted sum of features plus a bias—but a raw score is not a probability. It can be −4 or 9. You need a number between 0 and 1 that you can threshold into an alarm. This module’s project uses a clinical risk label; the math is the same for fraud or ticket escalation.",
      },
      {
        type: "p",
        text: "Logistic regression keeps the linear score",
      },
      {
        type: "math",
        latex: "z = w_1 x_1 + w_2 x_2 + \\cdots + b",
      },
      {
        type: "p",
        text: "and pushes it through the sigmoid (logistic) function",
      },
      {
        type: "math",
        latex: "\\sigma(z) = \\frac{1}{1 + e^{-z}}.",
      },
      {
        type: "p",
        text: "\\(\\sigma(z)\\) is always between 0 and 1. Large positive \\(z\\) → probability near 1. Large negative \\(z\\) → near 0. \\(z = 0\\) → exactly 0.5. That probability is what this module means by “the model’s output” before you pick a threshold.",
      },
      { type: "lab" },
      {
        type: "callout",
        tone: "note",
        title: "Sigmoid lab",
        text: "Drag the score. Watch the probability move on the S-curve. Then move the threshold and see when the same probability becomes an alarm.",
      },
      {
        type: "table",
        caption: "Eight teaching admissions. High lactate and older age lean toward deterioration in this toy table.",
        headers: ["Patient", "Lactate", "Age", "Deteriorated"],
        rows: [
          ["A", "0.9", "42", "0"],
          ["B", "1.1", "55", "0"],
          ["C", "1.4", "48", "0"],
          ["D", "1.6", "61", "0"],
          ["E", "2.2", "70", "1"],
          ["F", "2.5", "66", "1"],
          ["G", "2.8", "74", "1"],
          ["H", "3.1", "58", "1"],
        ],
      },
      {
        type: "p",
        text: "With one feature (lactate) the score is \\(z = w x + b\\) and the probability is \\(\\sigma(z)\\). Training means finding \\(w\\) and \\(b\\) so those probabilities sit high on the 1s and low on the 0s—not so the score equals the label the way a length-of-stay line equals days.",
      },
      {
        type: "reveal",
        title: "Pause and compute",
        prompt: "Score z = 0. What is σ(z)? Score z = 2 (use e^(−2) ≈ 0.135). About what is σ(2)?",
        answer: "σ(0) = 0.5. σ(2) = 1/(1+0.135) ≈ 0.88.",
      },
    ],
  },
  {
    slug: "log-loss",
    number: "02",
    title: "Log loss and fitting",
    minutes: 30,
    summary: "Why squared error is the wrong teacher here, and how gradient steps settle the weights.",
    blocks: [
      {
        type: "p",
        text: "In linear regression you minimized mean squared error between prediction and days. Here the prediction is a probability \\(p = \\sigma(z)\\), and the label is 0 or 1. Squared error still “works” numerically, but the natural loss for probabilities is log loss (binary cross-entropy).",
      },
      {
        type: "math",
        latex:
          "\\ell = -\\bigl(y\\log p + (1-y)\\log(1-p)\\bigr), \\quad \\mathrm{LogLoss} = \\frac{1}{n}\\sum_i \\ell_i.",
      },
      {
        type: "p",
        text: "If the true label is 1, you want \\(p\\) near 1: the loss is \\(-\\log p\\). Predicting 0.9 costs a little; predicting 0.1 costs a lot. If the label is 0, the loss is \\(-\\log(1-p)\\). Empty input in this module’s `log_loss` is 0. Probabilities are clipped slightly off 0 and 1 so \\(\\log\\) never sees an exact 0.",
      },
      {
        type: "reveal",
        title: "Pause and compute",
        prompt: "One row, y = 1, p = 0.8. What is the log loss for that row? (Use natural log; ln 0.8 ≈ −0.223.)",
        answer: "ℓ = −ln 0.8 ≈ 0.223. If p were 0.2 with y = 1, ℓ = −ln 0.2 ≈ 1.61—much worse.",
      },
      {
        type: "h2",
        text: "No tidy closed form",
      },
      {
        type: "p",
        text: "Ordinary least squares had a closed-form solution for the line. Logistic log loss does not give a one-shot linear algebra solve of the same shape. You fit with iteration—usually gradient descent (or a cousin). Each step: compute the average gradient of log loss with respect to the weights, then step downhill.",
      },
      {
        type: "p",
        text: "With a design matrix \\(X\\) that already includes a column of ones for the intercept, and probabilities \\(p = \\sigma(Xw)\\) row-wise, one useful gradient for mean log loss is",
      },
      {
        type: "math",
        latex: "\\nabla = \\frac{1}{n} X^\\top (p - y).",
      },
      {
        type: "p",
        text: "Then \\(w \\leftarrow w - \\eta \\nabla\\). Too large a learning rate \\(\\eta\\) overshoots; too small crawls. This module’s tasks ask for batch gradient descent with that gradient—no NumPy, no scikit-learn in the checker.",
      },
      {
        type: "callout",
        tone: "note",
        title: "Same shape as linear GD",
        text: "Linear regression’s MSE gradient was (2/n) Xᵀ(Xw − y). Logistic’s is (1/n) Xᵀ(p − y) with p = σ(Xw). Same “prediction minus truth, pushed back through X”—different prediction.",
      },
    ],
  },
  {
    slug: "threshold-and-metrics",
    number: "03",
    title: "Threshold and clinical metrics",
    minutes: 32,
    summary: "Probability is not an alarm until you pick a cutoff; sensitivity and PPV answer different questions.",
    blocks: [
      {
        type: "p",
        text: "The model returns a probability. You still choose a threshold \\(t\\): raise an alarm when \\(p \\ge t\\). Lower \\(t\\) flags more people (catch more true events, more false alarms). Higher \\(t\\) flags fewer.",
      },
      {
        type: "h2",
        text: "The four boxes",
      },
      {
        type: "ul",
        items: [
          "True positive (TP): deteriorated, and you flagged them.",
          "False positive (FP): did not deteriorate, but you flagged them.",
          "True negative (TN): did not deteriorate, and you left them alone.",
          "False negative (FN): deteriorated, and you missed them.",
        ],
      },
      {
        type: "p",
        text: "Example: 200 later patients, 50 true deteriorations. Counts TP 40, FP 30, TN 120, FN 10.",
      },
      { type: "bench", which: "confusion" },
      {
        type: "h2",
        text: "Sensitivity, specificity, PPV",
      },
      {
        type: "p",
        text: "Sensitivity = TP / (TP + FN) = 40/50 = 0.80 — of the people who truly deteriorated, what fraction did we catch?",
      },
      {
        type: "p",
        text: "Specificity = TN / (TN + FP) = 120/150 = 0.80 — of the people who did not deteriorate, what fraction did we leave alone?",
      },
      {
        type: "p",
        text: "Positive predictive value (PPV) = TP / (TP + FP) = 40/70 ≈ 0.57 — of the alarms, what fraction were real?",
      },
      {
        type: "p",
        text: "When the event is rare, PPV collapses even if sensitivity stays high. At 2% prevalence, sensitivity 0.80 and specificity 0.80 can yield PPV near 0.075. Most alarms are wrong—that is arithmetic, not a broken sigmoid.",
      },
      {
        type: "h2",
        text: "Choosing the threshold on purpose",
      },
      {
        type: "p",
        text: "This module’s early-warning project picks a threshold on the training patients so sensitivity is at least 0.80: try candidate cutoffs, keep the highest threshold that still meets that floor. Highest, not lowest—among thresholds that catch enough events, pick the strictest (fewer false alarms for the same floor).",
      },
      {
        type: "reveal",
        title: "Pause and compute",
        prompt: "Labels [1, 1, 0, 0], probabilities [0.9, 0.6, 0.6, 0.2]. You need sensitivity 1.0. Which threshold does the “highest that still meets the floor” rule return: 0.9, 0.6, or 0.2?",
        answer: "0.6. Threshold 0.9 only catches one positive (sensitivity 0.5). Both 0.6 and 0.2 catch both positives; the highest such cutoff is 0.6.",
      },
    ],
  },
  {
    slug: "shipping",
    number: "04",
    title: "Several features and shipping",
    minutes: 28,
    summary: "Design matrix, hour-6 honesty, temporal split, and what you hand over.",
    blocks: [
      {
        type: "p",
        text: "With several features, prepend a column of ones and learn a weight vector—same design-matrix habit as linear regression. Prediction is \\(p = \\sigma(Xw)\\), not \\(Xw\\) itself.",
      },
      {
        type: "terminal",
        text: "design_matrix([[2.0], [3.0]]) → [[1, 2], [1, 3]]\nprobabilities = sigmoid(score for each row)",
      },
      {
        type: "h2",
        text: "Hour 6 only",
      },
      {
        type: "p",
        text: "The clinical job matches the decision-tree project you will meet later: at hour 6, estimate deterioration risk. Safe columns are facts known then. Illegal: the label itself, death, disposition, future labs, identifiers, and name leaks such as `los_` or `death` in the column name. Unknown available hour → treat as unsafe until proven.",
      },
      {
        type: "p",
        text: "Hold out whole patients with later arrivals in the test set. Shuffling rows can put the same patient on both sides and flatter you.",
      },
      {
        type: "h2",
        text: "The library call",
      },
      {
        type: "p",
        text: "Once you can fit from scratch, read the same model in scikit-learn so production code stays short. The ideas are identical: coefficients are the weights, `predict_proba` is the sigmoid output.",
      },
      {
        type: "code",
        caption: "Same hour-6 features, library logistic regression.",
        code: `from sklearn.linear_model import LogisticRegression

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)
y_prob = model.predict_proba(X_test)[:, 1]`,
      },
      {
        type: "p",
        text: "Sklearn’s solver and defaults will not match your from-scratch run digit-for-digit. The checker still grades your implementations against fixed contracts.",
      },
      {
        type: "h2",
        text: "What you hand over",
      },
      {
        type: "p",
        text: "Refuse leaked columns, freeze a threshold with a stated sensitivity floor, report sensitivity and PPV on later arrivals, and name one failure mode (assay shift, rare-event PPV collapse, tiny coefficient on a noisy lab). That is the ward note. Decision trees will ask the same clinical question with a flowchart instead of weights—keep this note so the comparison is honest.",
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

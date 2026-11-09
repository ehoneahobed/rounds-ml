import type { Question } from "@/lib/content/quiz";

export const PASS_MARK = 11;

export const questions: Question[] = [
  {
    id: "sigmoid-half",
    prompt: "What is σ(0) for the sigmoid σ(z) = 1 / (1 + e^(−z))?",
    choices: [
      { id: "A", text: "0" },
      { id: "B", text: "0.5" },
      { id: "C", text: "1" },
      { id: "D", text: "e" },
    ],
    correct: "B",
    explanation: "1 / (1 + e^0) = 1 / (1 + 1) = 0.5.",
  },
  {
    id: "sigmoid-large",
    prompt: "As z goes to +∞, σ(z) approaches:",
    choices: [
      { id: "A", text: "0" },
      { id: "B", text: "0.5" },
      { id: "C", text: "1" },
      { id: "D", text: "−1" },
    ],
    correct: "C",
    explanation: "Large positive scores map to probabilities near 1.",
  },
  {
    id: "why-not-mse",
    prompt: "Why does this module train logistic regression with log loss rather than MSE on the 0/1 labels?",
    choices: [
      { id: "A", text: "Because MSE cannot be computed for numbers" },
      { id: "B", text: "Because log loss is the natural loss for probability outputs on Bernoulli labels" },
      { id: "C", text: "Because sklearn forbids MSE" },
      { id: "D", text: "Because log loss ignores false alarms" },
    ],
    correct: "B",
    explanation: "Binary cross-entropy / log loss matches a probabilistic 0/1 model.",
  },
  {
    id: "logloss-row",
    prompt: "For one row with y = 1 and p = 0.8, log loss is −ln(0.8). About what is that?",
    choices: [
      { id: "A", text: "≈ 0.22" },
      { id: "B", text: "≈ 1.61" },
      { id: "C", text: "≈ 0.80" },
      { id: "D", text: "≈ 0.00" },
    ],
    correct: "A",
    explanation: "−ln(0.8) ≈ 0.223. Predicting 0.2 when y = 1 would be ≈ 1.61.",
  },
  {
    id: "gradient-shape",
    prompt: "With design matrix X (including intercept) and p = σ(Xw), the mean log-loss gradient used here is:",
    choices: [
      { id: "A", text: "(1/n) Xᵀ (p − y)" },
      { id: "B", text: "(2/n) Xᵀ (Xw − y)" },
      { id: "C", text: "Xᵀ X w − Xᵀ y" },
      { id: "D", text: "p − y only, ignoring X" },
    ],
    correct: "A",
    explanation: "That is the batch gradient for mean binary cross-entropy with a sigmoid link.",
  },
  {
    id: "threshold-trade",
    prompt: "You lower the alarm threshold t. What happens?",
    choices: [
      { id: "A", text: "You usually catch fewer true events and raise fewer false alarms" },
      { id: "B", text: "You usually catch more true events and raise more false alarms" },
      { id: "C", text: "Sensitivity and false alarms both must fall" },
      { id: "D", text: "The sigmoid changes shape" },
    ],
    correct: "B",
    explanation: "A lower cutoff flags more people—more TP and more FP, typically.",
  },
  {
    id: "sensitivity-def",
    prompt: "TP 40, FP 30, TN 120, FN 10. What is sensitivity?",
    choices: [
      { id: "A", text: "40/70" },
      { id: "B", text: "40/50" },
      { id: "C", text: "120/150" },
      { id: "D", text: "40/200" },
    ],
    correct: "B",
    explanation: "Sensitivity = TP/(TP+FN) = 40/50 = 0.8.",
  },
  {
    id: "ppv-def",
    prompt: "Same counts. What is PPV?",
    choices: [
      { id: "A", text: "40/50" },
      { id: "B", text: "120/150" },
      { id: "C", text: "40/70" },
      { id: "D", text: "30/150" },
    ],
    correct: "C",
    explanation: "PPV = TP/(TP+FP) = 40/70.",
  },
  {
    id: "rare-ppv",
    prompt: "Why can PPV be poor even when sensitivity looks fine?",
    choices: [
      { id: "A", text: "Because the sigmoid is undefined for rare events" },
      { id: "B", text: "Because when positives are scarce, even a modest false-positive rate creates many false alarms" },
      { id: "C", text: "Because PPV ignores true positives" },
      { id: "D", text: "Because thresholds cannot be chosen on training data" },
    ],
    correct: "B",
    explanation: "Low prevalence × many negatives → many FPs → PPV collapses.",
  },
  {
    id: "threshold-rule",
    prompt: "Labels [1,1,0,0], probs [0.9,0.6,0.6,0.2], need sensitivity ≥ 1.0. Highest valid threshold?",
    choices: [
      { id: "A", text: "0.9" },
      { id: "B", text: "0.6" },
      { id: "C", text: "0.2" },
      { id: "D", text: "1.0" },
    ],
    correct: "B",
    explanation: "0.9 only catches one positive. 0.6 and 0.2 catch both; the highest is 0.6.",
  },
  {
    id: "leakage",
    prompt: "Which column is illegal for an hour-6 deterioration model?",
    choices: [
      { id: "A", text: "Lactate resulted by hour 6" },
      { id: "B", text: "Age" },
      { id: "C", text: "Death in hospital" },
      { id: "D", text: "Heart rate at hour 6" },
    ],
    correct: "C",
    explanation: "Death is an end-of-stay fact—not known at hour 6.",
  },
  {
    id: "temporal",
    prompt: "Why is a random row split dangerous here?",
    choices: [
      { id: "A", text: "Because JSON cannot be shuffled" },
      { id: "B", text: "Because rows from the same patient can land in both train and test" },
      { id: "C", text: "Because sigmoid requires sorted ages" },
      { id: "D", text: "Because logistic regression cannot use a test set" },
    ],
    correct: "B",
    explanation: "Patient leakage across the split flatters the test score.",
  },
  {
    id: "vs-linear",
    prompt: "What does logistic regression reuse from linear regression?",
    choices: [
      { id: "A", text: "Mean squared error as the only loss" },
      { id: "B", text: "A linear score in the features, then a nonlinear link to the output" },
      { id: "C", text: "A flowchart of ≤ / > questions" },
      { id: "D", text: "Clustering of unlabeled rows" },
    ],
    correct: "B",
    explanation: "Same weighted score; sigmoid maps it to a probability.",
  },
  {
    id: "vs-tree",
    prompt: "Compared with a decision tree on the same deterioration label, logistic regression’s trained model is:",
    choices: [
      { id: "A", text: "A list of weights (and bias), not a flowchart of questions" },
      { id: "B", text: "Always more accurate on every ward" },
      { id: "C", text: "Unable to output a probability" },
      { id: "D", text: "Unsupervised" },
    ],
    correct: "A",
    explanation: "Logistic regression stores coefficients; trees store splits.",
  },
];

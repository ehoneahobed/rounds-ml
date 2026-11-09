import type { Question } from "@/lib/content/quiz";

export const PASS_MARK = 11;

export const questions: Question[] = [
  {
    id: "variance",
    prompt: "A deep tree flips its root split when two training rows are removed. That is mainly:",
    choices: [
      { id: "A", text: "High bias" },
      { id: "B", text: "High variance" },
      { id: "C", text: "Leakage" },
      { id: "D", text: "A missing sigmoid" },
    ],
    correct: "B",
    explanation: "The fitted model moves a lot when the sample moves a little—variance.",
  },
  {
    id: "bagging-def",
    prompt: "In bagging, each tree is trained on:",
    choices: [
      { id: "A", text: "A bootstrap sample of the training rows (with replacement)" },
      { id: "B", text: "Only the out-of-bag rows" },
      { id: "C", text: "The temporal test patients" },
      { id: "D", text: "A single random feature forever" },
    ],
    correct: "A",
    explanation: "Bootstrap aggregating redraws training rows with replacement for each tree.",
  },
  {
    id: "bootstrap-vs-split",
    prompt: "How does a bootstrap sample differ from a patient-time train/test split?",
    choices: [
      { id: "A", text: "They are the same operation" },
      { id: "B", text: "Bootstrap grows trees; the temporal split holds out later patients for honest scoring" },
      { id: "C", text: "Bootstrap is only for regression" },
      { id: "D", text: "Temporal splits sample with replacement" },
    ],
    correct: "B",
    explanation: "Bagging redraws training data; the holdout is still required for a fair test score.",
  },
  {
    id: "majority",
    prompt: "Votes [1, 1, 0, 1, 0]. Majority label under this module’s rule?",
    choices: [
      { id: "A", text: "0" },
      { id: "B", text: "1" },
      { id: "C", text: "0.6" },
      { id: "D", text: "Undefined" },
    ],
    correct: "B",
    explanation: "Three 1s beat two 0s.",
  },
  {
    id: "mean-prob",
    prompt: "Tree probabilities [0.9, 0.8, 0.2, 0.7, 0.4]. Mean class-1 probability?",
    choices: [
      { id: "A", text: "0.50" },
      { id: "B", text: "0.60" },
      { id: "C", text: "0.80" },
      { id: "D", text: "1.00" },
    ],
    correct: "B",
    explanation: "(0.9+0.8+0.2+0.7+0.4)/5 = 0.60.",
  },
  {
    id: "max-features",
    prompt: "Why restrict max_features at each split?",
    choices: [
      { id: "A", text: "To make every tree identical" },
      { id: "B", text: "To decorrelate trees so their mistakes cancel more often" },
      { id: "C", text: "To avoid needing a threshold" },
      { id: "D", text: "Because Gini cannot use all features" },
    ],
    correct: "B",
    explanation: "Random feature subsets keep trees from always picking the same strong feature first.",
  },
  {
    id: "sqrt",
    prompt: "p = 9 features. Teaching default max_features under sqrt?",
    choices: [
      { id: "A", text: "1" },
      { id: "B", text: "3" },
      { id: "C", text: "9" },
      { id: "D", text: "81" },
    ],
    correct: "B",
    explanation: "floor(sqrt(9)) = 3.",
  },
  {
    id: "oob",
    prompt: "Out-of-bag rows are:",
    choices: [
      { id: "A", text: "Rows left out of a given bootstrap, usable as a rough check for that tree" },
      { id: "B", text: "The only legal test set in this module’s project" },
      { id: "C", text: "Future labs leaked into training" },
      { id: "D", text: "Rows with missing labels" },
    ],
    correct: "A",
    explanation: "OOB rows were not drawn into that bootstrap; the project still uses a temporal holdout.",
  },
  {
    id: "vs-tree",
    prompt: "Compared with one deep tree, a random forest is usually:",
    choices: [
      { id: "A", text: "More brittle to small training changes" },
      { id: "B", text: "Steadier, but harder to read as a short list of rules" },
      { id: "C", text: "A linear score with a sigmoid" },
      { id: "D", text: "Unsupervised clustering" },
    ],
    correct: "B",
    explanation: "Averaging many trees reduces variance; the flowchart is no longer a single readable path.",
  },
  {
    id: "vs-logistic",
    prompt: "A fair reason to try a forest after logistic regression on the same binary task:",
    choices: [
      { id: "A", text: "Forests never overfit" },
      { id: "B", text: "Forests can capture feature interactions without hand-built cross terms" },
      { id: "C", text: "Logistic regression cannot output a probability" },
      { id: "D", text: "Forests legalize leakage" },
    ],
    correct: "B",
    explanation: "Trees carve interactions via splits; logistic needs engineered products or a deeper model.",
  },
  {
    id: "boosting-map",
    prompt: "How does boosting differ from a random forest at a map level?",
    choices: [
      { id: "A", text: "Boosting grows trees sequentially to fix remaining errors; forests grow bagged trees in parallel" },
      { id: "B", text: "Boosting is unsupervised only" },
      { id: "C", text: "They are identical algorithms" },
      { id: "D", text: "Boosting forbids thresholds" },
    ],
    correct: "A",
    explanation: "Sequential residual-fitting vs parallel bagged trees.",
  },
  {
    id: "leakage",
    prompt: "Which column is still illegal for the hour-6 forest project?",
    choices: [
      { id: "A", text: "Lactate resulted by hour 6" },
      { id: "B", text: "Age" },
      { id: "C", text: "Death in hospital" },
      { id: "D", text: "Heart rate at hour 6" },
    ],
    correct: "C",
    explanation: "End-of-stay death is not known at decision time—bagging does not change that.",
  },
  {
    id: "threshold",
    prompt: "This module’s early-warning project freezes a threshold by:",
    choices: [
      { id: "A", text: "Picking 0.5 forever" },
      { id: "B", text: "Highest cutoff on training probabilities that still meets sensitivity 0.80" },
      { id: "C", text: "Minimizing training Gini only" },
      { id: "D", text: "Using the test set to tune the cutoff" },
    ],
    correct: "B",
    explanation: "Same sensitivity-floor rule as logistic and the single-tree project; tune on train only.",
  },
  {
    id: "n-estimators",
    prompt: "Increasing n_estimators usually:",
    choices: [
      { id: "A", text: "Removes the need for a test set" },
      { id: "B", text: "Adds trees until gains plateau, at linear compute cost" },
      { id: "C", text: "Forces max_features to equal p" },
      { id: "D", text: "Converts the forest into logistic regression" },
    ],
    correct: "B",
    explanation: "More trees typically help until returns flatten; cost grows with the count.",
  },
];

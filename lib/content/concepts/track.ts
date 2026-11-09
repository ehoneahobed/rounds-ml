import type { Concept } from "@/lib/content/types";

/**
 * Decision-tree concepts in teaching order.
 * Impurity measures come before information gain; classification before regression trees.
 */
export const track: Concept[] = [
  {
    slug: "what-it-is",
    number: "01",
    title: "What a decision tree is",
    minutes: 18,
    summary: "A flowchart of yes/no questions, not a bag of weights.",
    blocks: [
      {
        type: "p",
        text: "Linear and logistic regression learn weights. When you say those models are trained, you mean the weights and bias settled. A decision tree is different. Training means building a flowchart: a short list of yes/no questions about the features. The trained model is that flowchart. You walk a new row down it to get a prediction.",
      },
      {
        type: "p",
        text: "Trees are supervised learning: you learn from past rows that already have the answer written down. That answer can be a class (did they deteriorate: 0 or 1) or a number (how many days they stayed). Most of this module uses the 0-or-1 case. A later page covers the number case—you still ask yes/no questions about the features, but the leaf stores an average instead of a majority vote.",
      },
      {
        type: "p",
        text: "The common name for this family of algorithms is CART — Classification And Regression Trees. Same flowchart idea either way. For classification, a leaf predicts a class (and often a probability). For regression, a leaf predicts a number, usually the average of the training labels that landed there.",
      },
      {
        type: "h2",
        text: "A tiny example you can walk by hand",
      },
      {
        type: "p",
        text: "Here are eight people who were already in hospital. For each one we know two facts at the bedside: their lactate (a blood test) and their age. We also know what happened next: whether they got meaningfully worse within 48 hours. Write 1 if they did, 0 if they did not. Those two facts are what we may ask about. That 0-or-1 outcome is what we are trying to predict.",
      },
      { type: "lab" },
      {
        type: "table",
        caption: "Eight past admissions. Lactate and age are inputs. Deteriorated is the answer we already know for these eight.",
        headers: ["Patient", "Lactate", "Age", "Deteriorated"],
        rows: [
          ["A", "0.8", "40", "0"],
          ["B", "0.9", "82", "0"],
          ["C", "1.0", "45", "0"],
          ["D", "1.1", "88", "0"],
          ["E", "2.5", "81", "1"],
          ["F", "2.6", "42", "0"],
          ["G", "2.8", "86", "1"],
          ["H", "3.0", "48", "0"],
        ],
      },
      {
        type: "p",
        text: "A finished tree for this table asks only two questions. First: is lactate at or below 1.80? Patients A, B, C, and D say yes. All four have deteriorated = 0, so that path stops and predicts 0. Patients E, F, G, and H say no. Their answers are mixed—two 0s and two 1s—so they get a second question: is age at or below 64.5? The younger ones (F and H) both have 0, so that path predicts 0. The older ones (E and G) both have 1, so that path predicts 1.",
      },
      {
        type: "p",
        text: "A new patient is walked the same way. Lactate 2.7 and age 50: lactate is above 1.80, age is at or below 64.5, so the prediction is 0. Someone with lactate 0.9 stops after the first question and never gets asked about age—the age question only exists on the high-lactate path.",
      },
      {
        type: "h2",
        text: "Names for what you just walked",
      },
      {
        type: "p",
        text: "The lactate question at the top is the root. Every patient is asked it first. Each place where the tree asks a question is a node. If that question still sends people two ways, it is an internal node. The age question is an internal node. The two ways out of a question are branches: left if the value is at or below the cutoff (the threshold), right if it is above. A place that stops and gives an answer—with no further question—is a leaf. In the example, “lactate ≤ 1.80 → predict 0” is a leaf.",
      },
      {
        type: "p",
        text: "Depth is how many questions you have already passed through, counting from zero at the root. The lactate question is depth 0. The age question is depth 1. When one question creates two groups, that question’s node is the parent and the two groups are its children—same idea as a family tree.",
      },
      {
        type: "p",
        text: "A leaf’s prediction, for a 0-or-1 label, is whichever answer was more common among the training patients who landed there. If the counts tie, this module picks 0 so the answer does not depend on row order. You can also read a probability: count of 1s divided by how many people are in that leaf. “1.00 on n=2” means both of two people—not a law of nature. Say the denominator when you say the probability.",
      },
      {
        type: "p",
        text: "Nobody typed those two questions in advance. The algorithm grew them from the table. The next pages are how it chooses each question.",
      },
    ],
  },
  {
    slug: "choosing-splits",
    number: "02",
    title: "How a classification split is chosen",
    minutes: 35,
    summary: "Impurity, then information gain, then the greedy search.",
    blocks: [
      {
        type: "p",
        text: "In linear models you reduce loss. In a classification tree you reduce impurity: how mixed the labels are in a group. A pure group is all one class. A mixed group still holds both. Every split tries to make the children purer than the parent.",
      },
      {
        type: "h2",
        text: "Measure impurity: Gini",
      },
      {
        type: "p",
        text: "You need a number for “how mixed is this group?” One common number is Gini impurity. Start with a concrete bag of labels, say four patients: 0, 0, 0, 1.",
      },
      {
        type: "ol",
        items: [
          "Count each class. Three zeros, one one. Total four people.",
          "Turn counts into shares of the bag. Share of 0 is 3/4 = 0.75. Share of 1 is 1/4 = 0.25.",
          "Square each share: 0.75² = 0.5625, 0.25² = 0.0625.",
          "Add those squares: 0.5625 + 0.0625 = 0.625.",
          "Gini is 1 minus that sum: 1 − 0.625 = 0.375.",
        ],
      },
      {
        type: "p",
        text: "In symbols, if each class’s share of the group is called \\(p\\) (one \\(p\\) per class), Gini is",
      },
      {
        type: "math",
        latex: "G = 1 - (p_0^2 + p_1^2 + \\cdots).",
      },
      {
        type: "p",
        text: "Check the extremes so the number has meaning. Everyone the same class (all 0s): the only share is 1, and \\(G = 1 - 1^2 = 0\\)—pure, no mixture. Half and half (two 0s, two 1s): shares 0.5 and 0.5, and \\(G = 1 - (0.25 + 0.25) = 0.5\\)—as mixed as a two-class bag can get. So Gini runs from 0 (pure) up to 0.5 (even split) for a yes/no label.",
      },
      {
        type: "h2",
        text: "Measure impurity: entropy",
      },
      {
        type: "p",
        text: "Entropy is a second way to score the same mixture. Use the same shares, but instead of squaring them you use \\(-p \\log_2 p\\) for each class and add those terms. For 0.75 and 0.25 you get about 0.811 bits. A pure bag is again 0. If a class has share 0, treat that term as 0 (you are not taking log of zero in practice).",
      },
      {
        type: "math",
        latex: "H = -\\bigl(p_0\\log_2 p_0 + p_1\\log_2 p_1 + \\cdots\\bigr).",
      },
      {
        type: "p",
        text: "Gini and entropy usually rank splits the same way. This module’s tree checker uses Gini; the tasks ask you to implement both.",
      },
      { type: "bench", which: "impurity" },
      {
        type: "h2",
        text: "Score a split: information gain",
      },
      {
        type: "p",
        text: "Gini or entropy tells you how mixed one group is. After you ask a yes/no question, that one group becomes two groups — a left child and a right child. You need a single score for the question: how much cleaner did the labels get overall?",
      },
      {
        type: "p",
        text: "That score is called information gain. Pick one impurity measure and stick with it for the comparison. If you use Gini, people often say Gini gain. If you use entropy, that is the classic “information gain” from ID3/C4.5. Same formula either way: gain = impurity before the split, minus impurity after the split.",
      },
      {
        type: "p",
        text: "Both children count. You:",
      },
      {
        type: "ol",
        items: [
          "Compute impurity on the parent (everyone, before the question).",
          "Compute impurity on the left child (the yes / ≤ group).",
          "Compute impurity on the right child (the no / > group).",
          "Average the two child scores, weighted by size. If 6 of 10 went left, left gets weight 0.6.",
          "Gain = parent impurity − that weighted average.",
        ],
      },
      {
        type: "p",
        text: "Why weight by size? A split that makes a tiny leaf pure but leaves most people in a messy bag is not as good as a split that improves both sides. Weighting keeps the score honest.",
      },
      {
        type: "math",
        latex: "\\mathrm{Gain} = I(\\mathrm{parent}) - \\frac{n_L}{n} I(\\mathrm{left}) - \\frac{n_R}{n} I(\\mathrm{right}).",
      },
      {
        type: "p",
        text: "Here \\(I\\) is whichever impurity you chose — Gini or entropy. Example with Gini: parent has 10 rows and Gini 0.48. Left has 6 rows and Gini 5/18. Right has 4 rows and Gini 3/8. Gain = 0.48 − (6/10)×(5/18) − (4/10)×(3/8) = 49/300 ≈ 0.163.",
      },
      { type: "countedTable" },
      {
        type: "reveal",
        title: "Pause and compute",
        prompt: "Parent Gini is 0.5. Left gets half the rows and is pure (Gini 0). Right gets the other half with Gini 0.5. What is the Gini gain?",
        answer: "After-score = (1/2)×0 + (1/2)×0.5 = 0.25. Gain = 0.5 − 0.25 = 0.25. If you only looked at the pure left side you would overstate how good the split is.",
      },
      {
        type: "h2",
        text: "Search every candidate, keep the best",
      },
      {
        type: "p",
        text: "At a node, try every feature. For a numeric column, sort the values and try thresholds at midpoints between neighboring values that differ—any number between those two neighbors sends the same people left and right. Score each candidate with information gain. Keep the question with the highest gain. Ties: earlier feature index, then lower threshold (this module’s contract).",
      },
      { type: "searchTable" },
      {
        type: "p",
        text: "That habit is greedy: best step at this node, then move on. It does not rewrite earlier questions. Recurse on each child that is still mixed, until every leaf is pure or a stopping rule fires. The recipe name is CART—classification and regression trees.",
      },
      {
        type: "callout",
        tone: "practice",
        title: "What you just earned",
        text: "You can compute Gini and entropy, score a split with information gain, and describe how the algorithm picks the root question. Tasks 0–4 are those pieces in code.",
      },
    ],
  },
  {
    slug: "regression-trees",
    number: "03",
    title: "When the label is a number",
    minutes: 20,
    summary: "Same greedy search; variance instead of Gini; leaf is the mean.",
    blocks: [
      {
        type: "p",
        text: "Gini and entropy need class counts. Length of stay is a number. Mixture then means how far the numbers sit from the group’s average.",
      },
      {
        type: "p",
        text: "Impurity is population variance: mean squared deviation from the mean, divided by \\(n\\) (not \\(n-1\\)). Empty group: 0.",
      },
      {
        type: "math",
        latex: "\\mathrm{Var} = \\frac{1}{n}\\sum_i (y_i - \\bar{y})^2.",
      },
      {
        type: "p",
        text: "Values [10, 10, 0, 0]: mean 5, variance \\(((5)^2 + (5)^2 + (-5)^2 + (-5)^2)/4 = 25\\).",
      },
      {
        type: "p",
        text: "Gain is still parent impurity minus size-weighted child impurities—now called variance reduction. Same midpoint search and tie rules as classification. Leaf prediction is the mean of the training targets in that leaf.",
      },
      {
        type: "terminal",
        text: "targets [10, 10, 0, 0] on values [1, 2, 3, 4]\nbest cut at 2.5 → left [10, 10], right [0, 0]\nvariance reduction = 25",
      },
      {
        type: "callout",
        tone: "note",
        title: "Keep the tools straight",
        text: "Class label → Gini or entropy → information gain → majority leaf. Numeric label → variance → variance reduction → mean leaf. Same tree skeleton either way.",
      },
    ],
  },
  {
    slug: "growing-and-sklearn",
    number: "04",
    title: "Growing, stopping, and sklearn",
    minutes: 22,
    summary: "When to stop, why trees overfit, and the library knobs that match.",
    blocks: [
      {
        type: "p",
        text: "If you always split until every leaf is pure, a large table grows a huge tree that memorizes noise. Stopping rules cut that short—even if a leaf is still mixed.",
      },
      {
        type: "ul",
        items: [
          "max_depth — most questions on any path. Depth 0 means no questions: predict the majority (or mean) of the whole training group.",
          "min_samples_leaf — smallest child a split may create. Both sides must meet it.",
          "min_impurity_decrease — keep a split only if gain is at least this (and usually strictly greater than 0).",
        ],
      },
      {
        type: "p",
        text: "Pre-pruning is stopping while you grow. Post-pruning grows larger, then cuts branches that do not help on held-out data. Either way the point is the same: a shallower tree often generalizes better.",
      },
      {
        type: "h2",
        text: "The same ideas in scikit-learn",
      },
      {
        type: "code",
        caption: "Classifier. Use DecisionTreeRegressor for a numeric label; criterion becomes squared_error.",
        code: `from sklearn.tree import DecisionTreeClassifier, export_text

tree = DecisionTreeClassifier(
    criterion="gini",       # or "entropy"
    max_depth=3,
    min_samples_leaf=5,
)
tree.fit(X_train, y_train)
print(export_text(tree, feature_names=feature_names))
y_hat = tree.predict(X_test)
y_prob = tree.predict_proba(X_test)[:, 1]`,
      },
      {
        type: "p",
        text: "Those kwargs are the stopping rules you already know. `fit` grows the flowchart; `predict` walks each row; `predict_proba` reads class fractions in the leaf. This module’s from-scratch tree matches fixed tie and stop contracts so two correct solutions grow the same tree—sklearn’s defaults can differ slightly on ties.",
      },
      {
        type: "p",
        text: "Missing values: decide before fit (impute with a training-set statistic, or drop rows). Do not leave blanks for the tree to invent. Feature importances from mean decrease in impurity count how often a column was useful in splits; continuous columns get more candidate cuts, so a high score is not a cause.",
      },
      {
        type: "p",
        text: "A random forest is many trees on reshuffled rows and random feature subsets, then an average of their votes. Steadier score; you lose a single readable path. Every tree in the pile still asks ≤ / > questions and still memorizes leaked columns if you feed them.",
      },
    ],
  },
  {
    slug: "using-it",
    number: "05",
    title: "Using the tree on the ward",
    minutes: 25,
    summary: "Walk a row, refuse illegal columns, split by time, read sensitivity and PPV.",
    blocks: [
      {
        type: "p",
        text: "Prediction is the walk you already did: start at the root, take left or right at each threshold, stop at a leaf. Export the paths as rules a clinician can read aloud.",
      },
      { type: "paths" },
      {
        type: "h2",
        text: "Hour 6 only",
      },
      {
        type: "p",
        text: "This project scores deterioration risk at hour 6 of an admission. Features may only be facts known by then. Death, discharge disposition, length of stay, and a lactate drawn at hour 30 are labels or future assays—not features. Identifiers (patient id, encounter id) are not features. If a column’s available hour is unknown, treat it as unsafe until proven.",
      },
      {
        type: "p",
        text: "A random row split can put two hours from the same patient on both train and test. The test set then is not a future, unseen patient, and the score flatters you. Hold out whole patients, with later arrivals in the test set.",
      },
      {
        type: "h2",
        text: "Threshold and metrics",
      },
      {
        type: "p",
        text: "The leaf gives a probability. You still choose a threshold: call the case positive when probability ≥ t. Sensitivity is TP / (TP + FN)—of the people who truly deteriorated, how many you flagged. PPV is TP / (TP + FP)—of the alarms, how many were real. When the event is rare, PPV falls even if sensitivity looks fine.",
      },
      { type: "bench", which: "confusion" },
      {
        type: "reveal",
        title: "Pause and compute",
        prompt: "TP 40, FP 30, TN 120, FN 10. Sensitivity? PPV?",
        answer: "Sensitivity \\(40/50 = 0.8\\). PPV \\(40/70 \\approx 0.57\\).",
      },
      {
        type: "p",
        text: "A leaf with n=2 and p=1.00 is a frequency, not a law—say the denominator. A hospital-id feature is a memorized ward. An assay that reads differently at site B moves the same blood across your thresholds. Ship the tree with the columns you refused, the threshold you chose, and one honest failure mode.",
      },
    ],
  },
];

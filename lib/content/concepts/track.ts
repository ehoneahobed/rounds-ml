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
        text: "Linear and logistic regression learn weights. When you say those models are trained, you mean the weights and bias settled. A decision tree is different. Training means building a flowchart: a short list of yes/no questions about the features. The trained model is that flowchart. You walk a new row down it to get a prediction. Same contrast whether the rows are loans, tickets, or—in this module’s project—admissions.",
      },
      {
        type: "p",
        text: "Trees are supervised learning: you learn from past rows that already have the answer written down. That answer can be a class (0 or 1) or a number. Most of this module uses the 0-or-1 case. A later page covers the number case—you still ask yes/no questions about the features, but the leaf stores an average instead of a majority vote.",
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
        text: "Here are eight rows. Each has two features and a 0/1 label. In the teaching lab those columns are named lactate and age, and the label is deterioration—because that matches this module’s project data. Mentally swap them for “debt ratio” and “income,” or “cart value” and “visits,” if that helps you. The split logic does not care about the names.",
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
    minutes: 40,
    summary: "Turn the tree into rules, refuse leaked columns, split by time, and read sensitivity and PPV.",
    blocks: [
      {
        type: "p",
        text: "You already know how to grow a tree and how to walk one patient down it. This page is about using that tree as if you were shipping it: say the rules out loud, refuse columns that cheat, test on later patients, and turn a leaf probability into a yes/no alarm you can defend.",
      },
      {
        type: "h2",
        text: "Say the tree as rules",
      },
      {
        type: "p",
        text: "Every path from the root to a leaf is one if-then rule. The eight-patient teaching tree exports as three lines:",
      },
      { type: "paths" },
      {
        type: "p",
        text: "Read the first line as: “If lactate is at or below 1.80, predict 0. All four training patients on that path had label 0, so the probability is 1.00 on n=4.” The other two lines are the high-lactate branch, split by age. When you hand a tree to a clinician, these sentences are the model—not a black box of weights.",
      },
      {
        type: "p",
        text: "Always say the denominator with the probability. “1.00 on n=2” means both of two people. That can flip to 0.50 the next week. “1.00 on n=40” is a stronger frequency.",
      },
      {
        type: "h2",
        text: "Only facts known at hour 6",
      },
      {
        type: "p",
        text: "This project’s job is: at hour 6 of an admission, estimate whether the patient will deteriorate later. At that moment a nurse has age, sex, vitals, labs that have already resulted, and diagnoses already on the chart. She does not yet know how the stay ends, whether the patient dies, or what a lactate drawn on day two will say.",
      },
      {
        type: "p",
        text: "If you train on columns that only exist after the decision, the tree looks brilliant and fails on the next admission. That cheat is called leakage. Concrete examples:",
      },
      {
        type: "ul",
        items: [
          "Safe at hour 6: respiratory rate measured at hour 6, lactate resulted by hour 6, age.",
          "Illegal — the label itself: “deteriorated within 48 hours.” You do not use the answer as an input.",
          "Illegal — future facts: death in hospital, discharge disposition, a lactate drawn at hour 30, length of stay.",
          "Illegal — identifiers: patient id, encounter id, hospital id. Those memorize a person or a ward, not a pattern.",
          "Illegal — name leaks: a column whose name contains something like `los_`, `death`, or `discharge` even if someone stamped available_hour 6.",
          "Unsafe until proven: a feature whose available hour is unknown. Treat it as illegal until you know when it exists.",
        ],
      },
      {
        type: "p",
        text: "In the tasks you will write a small screen, `leakage_report`, that walks each column and returns the first matching reason. The order matters: label, then identifier, then too-late hour, then bad name, then unknown time.",
      },
      {
        type: "h2",
        text: "Test on later patients, not shuffled rows",
      },
      {
        type: "p",
        text: "After you refuse bad columns, you still need an honest score. A common mistake is to shuffle every row and put 25% in a “test” set. That can put hour 4 of patient A in training and hour 10 of the same patient A in testing. The tree has already seen that person. The test score flatters you.",
      },
      {
        type: "p",
        text: "The fix used in this module: keep every row of a patient together, sort patients by when they first appear, and hold out the latest arrivals as the test set. Training learns from earlier patients. Testing asks whether the tree still works on people who arrived later. That is closer to how a model would be used on the ward.",
      },
      {
        type: "callout",
        tone: "note",
        title: "One sentence",
        text: "Train on the past. Score on the future. Never leak the same patient across both sides.",
      },
      {
        type: "h2",
        text: "From a leaf probability to a yes/no alarm",
      },
      {
        type: "p",
        text: "A classification leaf does not only say 0 or 1. It also stores a probability: the fraction of training patients in that leaf who had label 1. For a new patient, `predict_proba` returns that fraction. You still have to choose a cutoff: call the case “positive” (raise an alarm) when the probability is at least some threshold \\(t\\). Example: if \\(t = 0.5\\), probability 0.6 is an alarm and 0.4 is not.",
      },
      {
        type: "p",
        text: "Lowering \\(t\\) flags more people (you catch more true events, but you also cry wolf more often). Raising \\(t\\) flags fewer people (quieter alarms, but you miss more true events). The next section names those trade-offs.",
      },
      {
        type: "h2",
        text: "The four boxes: TP, FP, TN, FN",
      },
      {
        type: "p",
        text: "Once you pick a threshold, every test patient falls into one of four boxes:",
      },
      {
        type: "ul",
        items: [
          "True positive (TP): deteriorated, and you flagged them.",
          "False positive (FP): did not deteriorate, but you flagged them (false alarm).",
          "True negative (TN): did not deteriorate, and you left them alone.",
          "False negative (FN): deteriorated, and you missed them.",
        ],
      },
      {
        type: "p",
        text: "Imagine 200 later patients. Fifty truly deteriorated. Your tree with some threshold gives: TP 40, FP 30, TN 120, FN 10. Check: 40+10 = 50 deteriorations, 30+120 = 150 non-deteriorations, 200 total.",
      },
      { type: "bench", which: "confusion" },
      {
        type: "h2",
        text: "Sensitivity and PPV",
      },
      {
        type: "p",
        text: "Sensitivity answers: of the people who truly deteriorated, what fraction did we catch? That is TP / (TP + FN). In the example: 40 / (40+10) = 40/50 = 0.80. Eight in ten events were flagged. The two you missed are the false negatives.",
      },
      {
        type: "p",
        text: "Positive predictive value (PPV) answers a different question: of the alarms we raised, what fraction were real? That is TP / (TP + FP). In the example: 40 / (40+30) = 40/70 ≈ 0.57. Only about 57% of alarms were true events—even though sensitivity and specificity both look high.",
      },
      {
        type: "reveal",
        title: "Pause and compute",
        prompt: "Same counts: TP 40, FP 30, TN 120, FN 10. What is specificity? (Of the people who did not deteriorate, what fraction did you leave alone?)",
        answer: "Specificity = TN / (TN + FP) = 120 / (120+30) = 120/150 = 0.80.",
      },
      {
        type: "p",
        text: "When the event is rare, PPV collapses even if sensitivity stays at 0.80. Suppose 2% of 10,000 patients deteriorate (200 events). Sensitivity 0.80 catches 160 of them. Specificity 0.80 means 20% of the 9,800 non-events are false alarms → 1,960 false positives. PPV = 160 / (160+1960) ≈ 0.075. Most alarms are wrong. That is not the tree “breaking”—it is arithmetic when positives are scarce.",
      },
      {
        type: "h2",
        text: "Choosing the threshold on purpose",
      },
      {
        type: "p",
        text: "This module’s early-warning project picks a threshold on the training patients so that sensitivity is at least 0.80: try candidate cutoffs, keep the highest threshold that still meets that floor. Highest, not lowest—so among thresholds that catch enough events, you pick the strictest one (fewer false alarms for the same sensitivity floor).",
      },
      {
        type: "p",
        text: "Worked sketch: labels [1, 1, 0, 0] and probabilities [0.9, 0.6, 0.6, 0.2]. You want sensitivity at least 1.0 (catch both positives). Threshold 0.9 catches only the first positive (sensitivity 0.5). Threshold 0.6 catches both positives (and one false alarm). Threshold 0.2 also catches both, but it is lower. The rule returns 0.6.",
      },
      {
        type: "h2",
        text: "What you hand over",
      },
      {
        type: "p",
        text: "A finished review of this tree is not only a score. Write down: which columns you refused and why (hour 6), which threshold you froze and what sensitivity you were buying, and one honest failure mode. Examples of failure modes: a leaf with n=2 that looks certain; a hospital id that memorized a ward; a lactate assay at site B that reads 15% lower, so the same blood crosses your cut differently. That short note is the ward note at the end of the module. Next, random forests bag many trees so one brittle flowchart is not the whole model.",
      },
    ],
  },
];


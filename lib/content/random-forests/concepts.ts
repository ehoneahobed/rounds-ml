import type { Concept } from "@/lib/content/types";

/**
 * Random-forest concepts in teaching order.
 * Assumes CART / Gini from the decision-tree module; builds bagging and feature randomness.
 */
export const concepts: Concept[] = [
  {
    slug: "why-ensemble",
    number: "01",
    title: "Why one tree is brittle",
    minutes: 20,
    summary: "A single tree can flip on small data changes; ensembles average that noise away.",
    blocks: [
      {
        type: "p",
        text: "You already know a decision tree: a flowchart of ≤ / > questions. It is easy to read and easy to overfit. Change a few training rows and the first split can jump to a different feature. A leaf with n=2 can look certain and then fail next week. That brittleness shows up whether you are scoring fraud, predicting churn, triaging tickets, or—in this module’s project—hour-6 deterioration risk.",
      },
      {
        type: "p",
        text: "The usual name for that brittleness is high variance: the model’s answer moves a lot when the training sample moves a little. Bias is the other error—being systematically wrong. A stump (one split) is often high bias and low variance. A deep tree is often low bias and high variance.",
      },
      {
        type: "h2",
        text: "The ensemble idea",
      },
      {
        type: "p",
        text: "An ensemble trains several models and combines their answers. If the members make different mistakes, the combination can be steadier than any one member. Random forests are an ensemble of decision trees. You will build the two ingredients that make the forest work: bagging (different row samples) and random feature subsets at each split (so the trees are not clones of each other).",
      },
      {
        type: "table",
        caption: "Eight teaching rows (same toy as the tree module). Mentally swap names for debt ratio / income if you like.",
        headers: ["Row", "Lactate", "Age", "Label"],
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
        type: "callout",
        tone: "note",
        title: "What you already bring",
        text: "Gini, information gain, stopping rules, leakage, temporal splits, and thresholds stay the same. This module adds how many trees you grow and how you keep them different.",
      },
      {
        type: "reveal",
        title: "Pause",
        prompt: "A deep tree fits the training set almost perfectly but flips its root split when you remove two rows. Is that mainly bias or variance?",
        answer: "Variance—the fitted tree changes a lot when the sample changes a little.",
      },
    ],
  },
  {
    slug: "bagging",
    number: "02",
    title: "Bagging",
    minutes: 25,
    summary: "Bootstrap the rows, grow one tree per sample, then vote or average probabilities.",
    blocks: [
      {
        type: "p",
        text: "Bagging means bootstrap aggregating. Draw a training set the same size as the original by sampling rows with replacement. Some rows appear more than once; some are left out. Grow a tree on that sample. Repeat. At prediction time, combine the trees.",
      },
      {
        type: "h2",
        text: "How you combine",
      },
      {
        type: "ul",
        items: [
          "Classification label: majority vote across trees. This module’s tie-break picks the smaller class label so two correct solutions match.",
          "Classification probability: average the class-1 probabilities from each tree’s `predict_proba`. That averaged probability is what you threshold into an alarm.",
          "Regression forest (mention only): average the numeric predictions. This module’s project is classification.",
        ],
      },
      {
        type: "h2",
        text: "A three-bootstrap sketch",
      },
      {
        type: "p",
        text: "Imagine four rows with labels [0, 0, 1, 1]. Three bootstrap draws might be [0,0,0,1], [0,1,1,1], and [0,0,1,1]. Three shallow trees disagree on a new row: votes 0, 1, 1 → majority 1. Probabilities 0.25, 0.75, 0.60 → mean 0.53. The vote and the mean can disagree near 0.5; this module’s early-warning project thresholds the mean probability.",
      },
      {
        type: "reveal",
        title: "Pause and compute",
        prompt: "Five trees vote [1, 1, 0, 1, 0]. What is the majority label under this module’s tie rule? Probabilities [0.9, 0.8, 0.2, 0.7, 0.4]—what is the mean?",
        answer: "Votes: three 1s and two 0s → majority 1. Mean probability = (0.9+0.8+0.2+0.7+0.4)/5 = 0.60.",
      },
      {
        type: "callout",
        tone: "practice",
        title: "Bootstrap ≠ shuffle split",
        text: "A train/test split holds out whole patients for scoring. A bootstrap redraws training rows (with replacement) to grow each tree. You still need an honest holdout for the final score—bagging does not replace the temporal test set.",
      },
    ],
  },
  {
    slug: "random-features",
    number: "03",
    title: "What makes it random",
    minutes: 28,
    summary: "At each split, only try a random subset of features so the trees stop cloning each other.",
    blocks: [
      {
        type: "p",
        text: "If every bagged tree sees every feature at every split, they often pick the same strong feature first and stay correlated. Correlated mistakes do not cancel. Random forests fix that by restricting the candidate features at each split.",
      },
      {
        type: "p",
        text: "At a node with \\(p\\) features, draw `max_features` indices without replacement and only search thresholds on those columns. Teaching default for classification: \\(\\sqrt{p}\\) (rounded down, at least 1). With 12 hour-6 features, that is 3 candidates per split.",
      },
      { type: "lab" },
      {
        type: "callout",
        tone: "note",
        title: "Forest lab",
        text: "Watch a few shallow trees disagree on the teaching rows, then see the majority vote and the mean probability settle.",
      },
      {
        type: "h2",
        text: "Knobs you already know",
      },
      {
        type: "ul",
        items: [
          "`n_estimators` — how many trees. More usually helps until it plateaus; cost grows linearly.",
          "`max_depth`, `min_samples_leaf` — same stopping idea as a single tree. Forests often tolerate slightly deeper members because the vote damps noise.",
          "`max_features` — how random each split is. Too small and trees are weak; too large and they look alike.",
          "`random_state` — seed so two correct solutions match the checker.",
        ],
      },
      {
        type: "reveal",
        title: "Pause",
        prompt: "p = 9 features. What is the teaching default for max_features under sqrt?",
        answer: "floor(sqrt(9)) = 3.",
      },
    ],
  },
  {
    slug: "shipping",
    number: "04",
    title: "Shipping and comparison",
    minutes: 30,
    summary: "OOB intuition, feature use counts, hour-6 honesty, sklearn, and how forests sit next to logistic and a single tree.",
    blocks: [
      {
        type: "h2",
        text: "Out-of-bag rows",
      },
      {
        type: "p",
        text: "Each bootstrap leaves out roughly 37% of rows. Those out-of-bag (OOB) rows can be scored by trees that never trained on them—an honest-ish check without a separate validation file. This module’s graded project still uses the patient-time holdout so the comparison to logistic and the single tree stays fair. Treat OOB as intuition, not a replacement for the temporal test.",
      },
      {
        type: "h2",
        text: "Which features got used",
      },
      {
        type: "p",
        text: "A simple teaching importance: count how often each feature appears as a split across all trees. Strong drivers rise; pure noise stays near zero. It is not a causal story—only a frequency of use under this forest’s randomness.",
      },
      {
        type: "h2",
        text: "Hour 6 still means hour 6",
      },
      {
        type: "p",
        text: "Bagging does not legalize leakage. Refuse the label, identifiers, future labs, and name leaks. Hold out later patients. Choose a threshold on training probabilities for sensitivity at least 0.80—same rule as logistic and the single tree.",
      },
      {
        type: "code",
        caption: "Same idea in the library after you can build it yourself.",
        code: `from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(
    n_estimators=25,
    max_depth=4,
    min_samples_leaf=15,
    max_features="sqrt",
    random_state=0,
)
model.fit(X_train, y_train)
y_prob = model.predict_proba(X_test)[:, 1]`,
      },
      {
        type: "h2",
        text: "Compare three shapes",
      },
      {
        type: "ul",
        items: [
          "Logistic regression — one linear score → probability. Smooth, interpretable weights, can miss interactions unless you engineer them.",
          "One decision tree — readable rules, brittle, captures interactions.",
          "Random forest — many trees, steadier, harder to read aloud; still tabular.",
        ],
      },
      {
        type: "h2",
        text: "Boosting on the map",
      },
      {
        type: "p",
        text: "Boosting grows trees in sequence: each new tree focuses on residuals the current ensemble still gets wrong. Random forests grow trees in parallel on bootstraps. Both are tree ensembles; the training story differs. Rounds does not build boosting here—only places it so the word is not a surprise later.",
      },
      {
        type: "callout",
        tone: "practice",
        title: "What you hand over",
        text: "Columns refused, threshold and sensitivity floor, n_estimators / depth / max_features you froze, and one forest failure mode (trees still correlated, leakage, assay shift, unreadability in review). That is the ward note.",
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

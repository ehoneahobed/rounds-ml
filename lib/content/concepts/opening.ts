import type { Concept } from "@/lib/content/types";

export const opening: Concept[] = [
  {
    slug: "the-job",
    number: "01",
    title: "The job, not the diagram",
    minutes: 25,
    summary: "What a decision tree is for in clinical machine learning, and what finishing this module means.",
    blocks: [
      {
        type: "p",
        text: "Most of the models that actually get used on hospital tables are trees, or ensembles of trees. A deterioration score, a readmission score, a no-show model, a coding assist on tabular claims: the first serious baseline is still a tree-shaped model on columns, not a network on pixels. If you cannot say what a split is doing, you cannot debug the model that will ship, and you cannot tell a clinician why a patient was flagged.",
      },
      {
        type: "p",
        text: "This module is decision trees at the depth a working engineer needs. You will compute impurity by hand, implement CART for numeric features, and then do the part tutorials skip: refuse columns that did not exist at decision time, hold out future patients, and pick a threshold for a sensitivity target. The dataset is synthetic. The habits are the ones that transfer to a real extract.",
      },
      {
        type: "h2",
        text: "What you are building toward",
      },
      {
        type: "p",
        text: "The project at the end is an early-warning score at hour 6 of an admission. The label is deterioration within 48 hours, generated from a known rule plus noise, not copied from a chart. You may use vitals and labs that have resulted by hour 6. You may not use the discharge disposition, a later lactate, the length of stay, or the fact that the patient died. A tree that uses those will look brilliant and be useless on the ward, because those facts are not known when the score would be shown.",
      },
      {
        type: "p",
        text: "Ward teams already add up threshold scores such as NEWS2 from respiratory rate, oxygen, blood pressure, pulse, consciousness, and temperature. A learned tree is one way to combine vitals and labs into thresholds. It does not replace knowing that a simple score exists, and on a real project you would report your model next to that score. This cohort has no consciousness or oxygen-device column, so you will not reimplement NEWS2 here. You will build the thing NEWS2 is a cousin of: a set of axis-aligned cuts, chosen to reduce impurity, then frozen and evaluated on patients the tree did not train on.",
      },
      {
        type: "h2",
        text: "What this module will not pretend",
      },
      {
        type: "ul",
        items: [
          "It will not make you ready to deploy into an electronic health record. Deployment, monitoring, and the clinical owner of a score are a later kind of work.",
          "It is not a regulatory determination. A score that influences care can fall under clinical decision support expectations. An engineer asks the clinical and compliance owners before anything is shown to a ward. This page is practice, not legal advice.",
          "It does not cover images, notes, or gradient boosting. Boosting is the usual tabular baseline after this, and it is made of the same splits. If you skip the habits on this page, boosting just memorizes the ward faster.",
          "The rows are synthetic and enriched: roughly a third deteriorate, so a few hundred admissions are enough to see the cuts. A general ward is rarer. The metrics page shows what rarity does to the positive predictive value.",
        ],
      },
      {
        type: "h2",
        text: "How to work",
      },
      {
        type: "p",
        text: "Read a concept page with a pencil. When a page says to stop and compute, do it before you open the answer. Then sit the knowledge check. Then the tasks, in order. Later tasks call the functions you wrote earlier. The checker runs in your browser. Nothing you type is uploaded.",
      },
      {
        type: "p",
        text: "Budget about 16 focused hours: six on the pages, one on the check, the rest on the tasks. The tree itself is the long one. Stopping overnight is fine. Skipping the hand calculation is how this subject stays foggy for weeks.",
      },
      {
        type: "callout",
        tone: "practice",
        title: "Finish line",
        text: "You can compute a Gini gain, including the weights. You can implement the split search and a depth-limited tree. You can export a leaf as a sentence with its denominator. You can name a column that leaks at hour 6. You can hold out future patients. You can choose the highest threshold that still hits a sensitivity target, and you can say what that number is not: it is not a diagnosis.",
      },
    ],
  },
  {
    slug: "partition",
    number: "02",
    title: "A tree is a partition",
    minutes: 35,
    summary: "Recursive axis-aligned cuts, what a leaf predicts, and why the search is greedy.",
    blocks: [
      {
        type: "p",
        text: "You have a table. Each row is an admission. Each column is a number known at a decision time. One column is the label you are trying to predict, here usually 1 for deteriorated and 0 for not. Fitting chooses the questions. Predicting answers them for a new row.",
      },
      {
        type: "p",
        text: "A binary decision tree asks one question of the form `feature <= threshold`. Rows that pass go left. Rows that fail go right. Each side is either asked another question or declared a leaf. The leaf predicts a constant: the majority class of the training rows that landed there, or, for a regression tree, their mean. The set of leaves is a partition of the feature space into axis-aligned boxes. Every patient falls in exactly one box.",
      },
      {
        type: "partition",
      },
      {
        type: "p",
        text: "The figure is the eight-row teaching table you will build by hand on the next pages. Low lactate is one box, all class 0. High lactate splits again on age. Two of the boxes predict 0. One predicts 1. The geometry and the drawn tree are the same object.",
      },
      {
        type: "h2",
        text: "The algorithm you are implementing",
      },
      {
        type: "p",
        text: "CART grows the tree greedily. At a node, try every feature and every legal threshold, score each candidate by how much it reduces impurity, and keep the best. Then do the same on each child. Stop when the node is pure, when it is too shallow to split, when a child would be too small, or when no split improves the impurity.",
      },
      {
        type: "code",
        caption: "The shape of fit. The tasks pin down every tie and every stop.",
        code: `def build(rows, depth):
    if should_stop(rows, depth):
        return leaf(rows)
    feature, threshold = best_split(rows)
    left, right = partition(rows, feature, threshold)
    return split(feature, threshold, build(left, depth + 1), build(right, depth + 1))`,
      },
      {
        type: "p",
        text: "Greedy means locally best, not globally best. Finding the smallest tree that fits a table is computationally hard, and production libraries do not try. They take the best question available at this node and live with the consequences. That is the algorithm you need to be able to defend, including the case where it fails.",
      },
      {
        type: "h2",
        text: "Where greedy gives up",
      },
      {
        type: "p",
        text: "Consider four patients and two binary features, with the label equal to exclusive-or: the label is 1 only when the two features disagree. At the root, splitting on either feature produces two children that are still half and half. The Gini gain is exactly 0. A tree of any depth, grown greedily, never splits. It predicts the majority class for everyone. Interactions that are invisible one feature at a time are invisible to CART. Ensembles and deeper feature construction are how people get those patterns later. They do not change this fact about a single greedy tree.",
      },
      {
        type: "callout",
        tone: "note",
        title: "Why the questions are binary",
        text: "A multiway split on a category can be approximated by repeated binary splits. One question form, `<= threshold`, keeps the search well-defined for numeric columns. This module's tree is numeric only. Categorical columns are discussed when you search for a split, and you will not implement the multiway case.",
      },
      {
        type: "h2",
        text: "What a prediction is",
      },
      {
        type: "p",
        text: "The class prediction is the majority label in the leaf. If two classes tie, this module chooses the smaller label, so the result does not depend on row order. The probability is the leaf's class frequency, not a calibrated risk. A leaf with two patients, both positive, reports 1.00. That number is a fraction with denominator 2. You will be asked to say the denominator out loud. Small leaves are where trees become fiction.",
      },
    ],
  },
  {
    slug: "impurity",
    number: "03",
    title: "Gini, entropy, and a gain you can finish",
    minutes: 45,
    summary: "The two impurities CART uses, and the weighted average people forget.",
    blocks: [
      {
        type: "p",
        text: "Impurity measures how mixed the labels in a node are. A pure node, all one class, has impurity 0. A node that is an even mix is as impure as that criterion gets. A split is useful when the children are purer than the parent, after you account for their sizes.",
      },
      {
        type: "h2",
        text: "Gini",
      },
      {
        type: "p",
        text: "Draw two labels from the node at random, with replacement. The probability they differ is the Gini impurity. If the class proportions are \\(p_k\\),",
      },
      {
        type: "math",
        latex: "\\mathrm{Gini} = 1 - \\sum_k p_k^2.",
      },
      {
        type: "p",
        text: "For two classes with positive proportion \\(p\\), that is \\(2p(1-p)\\). A 50/50 node has Gini 0.5. A node that is three of one class and one of the other has Gini \\(1 - (0.75^2 + 0.25^2) = 0.375\\). An empty node is defined as 0 so the code has a base case. Order of the labels does not matter. You are scoring a multiset.",
      },
      {
        type: "h2",
        text: "Entropy",
      },
      {
        type: "p",
        text: "Entropy is the average surprise, in bits:",
      },
      {
        type: "math",
        latex: "H = -\\sum_k p_k \\log_2 p_k, \\quad \\text{with } 0 \\log 0 = 0.",
      },
      {
        type: "p",
        text: "A pure node is 0. A fair coin is 1 bit. Three equal classes are \\(\\log_2 3\\). A 3/1 node is about 0.811 bits. Gini and entropy usually rank splits similarly. They are not interchangeable numbers: 0.5 Gini is not 0.5 bits. This module grows trees with Gini. Entropy is here so you can read either formula when a paper or a library flag uses it.",
      },
      {
        type: "h2",
        text: "The gain, with the weights",
      },
      {
        type: "p",
        text: "Information gain is the parent's impurity minus the size-weighted impurity of the children.",
      },
      {
        type: "math",
        latex: "\\mathrm{Gain} = I(\\mathrm{parent}) - \\frac{n_L}{n} I(L) - \\frac{n_R}{n} I(R).",
      },
      {
        type: "p",
        text: "The weights are the whole point. A tiny pure leaf should not cancel a huge mixed sibling. If either child is empty, there was no split, and the gain is 0. \\(n\\) is \\(n_L + n_R\\).",
      },
      {
        type: "countedTable",
      },
      {
        type: "p",
        text: "Parent Gini is exactly \\(12/25 = 0.48\\). The left child is \\(5/18\\). The right child is \\(3/8\\). The gain is",
      },
      {
        type: "math",
        latex: "\\frac{12}{25} - \\frac{6}{10}\\cdot\\frac{5}{18} - \\frac{4}{10}\\cdot\\frac{3}{8} = \\frac{49}{300} \\approx 0.1633.",
      },
      {
        type: "reveal",
        title: "Pause and compute",
        prompt: "Eight patients, four deteriorated and four not. The left child is four patients, all class 0. The right child is four patients, all class 1. What is the Gini gain?",
        answer: "Parent Gini is 0.5. Both children are pure, so their Gini is 0. The gain is 0.5. Under entropy the same split gains 1 bit, because the parent entropy of a fair split is 1 and both children are 0. Same weights, different impurity.",
      },
      {
        type: "h2",
        text: "Mistakes that survive a casual reading",
      },
      {
        type: "ul",
        items: [
          "Forgetting the weights and subtracting a plain average of the two impurities.",
          "Defining Gini as \\(\\sum p_k^2\\) and dropping the \\(1 -\\). That quantity goes up when the node gets purer, so the search runs backwards.",
          "Using \\(\\log_{10}\\) or a natural log and still calling the unit bits.",
          "Integer division. Class counts have to become proportions with a real division.",
          "Treating Gini 0.5 and entropy 1 as the same statement. Both describe a fair node. They are not the same scale.",
        ],
      },
      {
        type: "bench",
        which: "impurity",
      },
      {
        type: "callout",
        tone: "practice",
        title: "Regression, one sentence",
        text: "When the label is a number, such as length of stay, the impurity is the population variance: the mean squared error of predicting the node mean, divided by n, not by n−1. The gain is the variance reduction, with the same weights. You will implement that as its own task. The tree you ship in this module is a classifier.",
      },
    ],
  },
  {
    slug: "search",
    number: "04",
    title: "Searching for the split",
    minutes: 40,
    summary: "Midpoints, ties, categories, and what to do with a missing lactate.",
    blocks: [
      {
        type: "p",
        text: "A numeric feature on n rows offers infinitely many thresholds and only n−1 places where the impurity can change. Sort the column. Walk from left to right. Impurity changes only when a new row joins the left child, so you only score a cut between two adjacent sorted values, and only when those two values differ. Any threshold between them produces the same children. This module places the threshold at the midpoint, and sends `value <= threshold` left.",
      },
      {
        type: "p",
        text: "The table below is a six-row lactate column with three deteriorations. Parent Gini is 0.5. Two cuts both gain 0.25. The contract says ties within 1e−12 go to the lower threshold, so 1.25 wins and 2.25 does not.",
      },
      {
        type: "searchTable",
      },
      {
        type: "p",
        text: "Sort before you scan. An unsorted column does not change the answer if you sort it, and it changes the answer into nonsense if you forget. Identical adjacent values are not a cut: you cannot send two patients with the same lactate to different children with a `<=` test.",
      },
      {
        type: "h2",
        text: "Cost, said once",
      },
      {
        type: "p",
        text: "Sorting a column is the expensive step. The scan after that can be linear if you update class counts as each row moves from right to left, instead of rebuilding the label lists on every cut. At a few hundred rows the slow version is fine, and it is the one you should write first if it makes the logic obvious. The reference solution updates counts because the early-warning table is large enough that a careless inner loop gets unpleasant. Correctness is the assignment. If a run times out, the count update is the fix, not a different impurity.",
      },
      {
        type: "h2",
        text: "Which feature, when several look equal",
      },
      {
        type: "p",
        text: "Across features, keep the higher gain. If two gains differ by at most 1e−12, keep the lower feature index. If the same feature offers two thresholds with that same gain, keep the lower threshold. The rule is boring on purpose. Two people who follow it grow the same tree. A library that breaks ties at random will not match your tests, and it will not match your colleague's notebook.",
      },
      {
        type: "h2",
        text: "Categories, without implementing them",
      },
      {
        type: "p",
        text: "A binary column is already a numeric column of zeros and ones. The midpoint falls at 0.5, and `<= 0.5` sends the zeros left. A column with k categories has \\(2^{k-1} - 1\\) ways to split into two non-empty groups. For two-class Gini or entropy, CART does not enumerate them. It orders the categories by their positive rate and then treats that order like a numeric column, scoring only k−1 cuts. For regression, order by the mean of the target. For more than two classes the shortcut does not hold. You do not need to code this. You need to know why a library can split `admission_type` without trying every subset, and why a high-cardinality code, such as a raw diagnosis identifier, will be offered far too many cuts.",
      },
      {
        type: "h2",
        text: "Missing values",
      },
      {
        type: "p",
        text: "The tree you write assumes every entry is a number. Real lactate columns are not like that. Three practical options:",
      },
      {
        type: "ol",
        items: [
          "Decide, before the fit, what a missing value means, and impute it or drop the row. Record the decision. A median filled in from the whole table, including the future patients, leaks.",
          "Add a missingness indicator, or a dedicated 'missing' branch, when the absence itself is informative. A lactate that was never ordered is not the same as a lactate of 1.0.",
          "Surrogate splits: extra questions the tree uses only when the primary feature is missing, so a deployed row can still be routed. Sklearn can do this in some tree settings. You will not implement surrogates. You will refuse to pretend a blank cell is a zero.",
        ],
      },
      {
        type: "callout",
        tone: "warn",
        title: "A missing value is a data decision",
        text: "Filling it silently is how a tree learns the imputation constant as if it were physiology. If you impute, fit the imputer on the training patients only, and apply that frozen rule to the test patients.",
      },
    ],
  },
];

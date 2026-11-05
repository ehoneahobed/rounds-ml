import type { Concept } from "@/lib/content/types";

export const algorithm: Concept[] = [
  {
    slug: "in-code",
    number: "05",
    title: "Building the tree in code",
    minutes: 40,
    summary: "The node contract, the stop rules, and a tree you can check by hand.",
    blocks: [
      {
        type: "p",
        text: "The implementation task is a class, `DecisionTreeClassifier`, not a call to a library. Sklearn will be the tool you use at work once you can tell when it disagreed with you. It is not available in the checker, and importing it skips the only part of this module that makes the later tools legible.",
      },
      {
        type: "h2",
        text: "What a node stores",
      },
      {
        type: "ul",
        items: [
          "`feature`: column index, or none on a leaf.",
          "`threshold`: the midpoint. Rows with `value <= threshold` go left.",
          "`left` and `right`: both present on a split, both absent on a leaf.",
          "`n_samples`: how many training rows reached the node.",
          "`probabilities`: class frequencies in `classes_` order, summing to 1. A class that never appears in this leaf still has a slot, with frequency 0.",
          "`prediction`: the majority class. Ties go to the smaller label. Because `classes_` is sorted, the first maximum count is the smaller label.",
        ],
      },
      {
        type: "p",
        text: "The fitted tree stores `classes_`, the sorted unique training labels, plus `max_depth`, `min_samples_leaf`, and `n_features_` so a caller can see the contract the tree was built under. Root depth is 0. A node at depth `>= max_depth` is a leaf, so `max_depth=0` never splits. Both children of a split must contain at least `min_samples_leaf` rows. A split is kept only when its Gini gain is greater than 0 and at least `min_impurity_decrease`. Gains within 1e−12 are tied, and the tie breaks toward the lower feature index, then the lower threshold.",
      },
      {
        type: "h2",
        text: "The eight-row tree",
      },
      {
        type: "p",
        text: "Lactate in column 0, age in column 1. Labels are 0, 0, 0, 0, 1, 0, 1, 0. The best lactate cut and the best age cut at the root have the same gain, 0.125. Column 0 wins the tie. The low-lactate side is pure. The high-lactate side is two and two, and age splits it perfectly at 64.5. Gain on that child is 0.5.",
      },
      {
        type: "partition",
      },
      {
        type: "paths",
      },
      {
        type: "p",
        text: "Walk a new row the same way. Lactate 2.7 and age 50: 2.7 > 1.80, so right; 50 <= 64.50, so left; prediction 0. Lactate 1.7 goes left immediately, even if the patient is 90, because the root question is asked first. A value equal to the threshold goes left. That is the `<=` rule, and it is easy to get backwards once.",
      },
      {
        type: "h2",
        text: "Stops that are not obvious",
      },
      {
        type: "ul",
        items: [
          "A split whose both leaves predict the same class can still be legal. Impurity fell. You split. The early task where four negatives and one positive, with a minimum leaf of 2, cuts at 3.5 and both leaves predict 0.",
          "Exclusive-or, as on the partition page, has gain 0 at the root. `max_depth=6` does not save you. The tree stays a leaf.",
          "`min_impurity_decrease=0.5` blocks ordinary binary splits, because a Gini gain cannot exceed 0.5 when the parent itself is at most 0.5. It is a sledgehammer used to test the floor, not a setting you would ship.",
          "Calling `fit` again replaces `classes_` and the root. Predicting before `fit` is an error. Ragged rows are an error. An empty table is an error.",
        ],
      },
      {
        type: "callout",
        tone: "practice",
        title: "How to test your tree before the checker",
        text: "Pure labels. A depth of 0. One column with an obvious cut, including a row that lands exactly on the threshold. Two identical columns, which must use column 0. A 50/50 leaf, which must predict the smaller label. If those five pass, the longer checks are about discipline rather than a mystery.",
      },
      {
        type: "p",
        text: "Leaf frequencies are not calibrated probabilities. With a minimum leaf of 1, a tree can report 0 or 1 because it isolated a single patient. Raising `min_samples_leaf` is the first control, and it is the one the early-warning project requires. Platt scaling and isotonic regression are how you would shrink those frequencies toward the base rate later. You will not implement them. You will report a Brier score so a wildly confident leaf is visible.",
      },
    ],
  },
  {
    slug: "overfitting",
    number: "06",
    title: "A tree that memorized the ward",
    minutes: 30,
    summary: "Depth, leaf size, and what cost-complexity pruning is asking.",
    blocks: [
      {
        type: "p",
        text: "The eight-row tree fits its training rows perfectly. That is a warning, not a trophy. If every feature combination is unique, a deep enough tree isolates every patient, training accuracy goes to 1, and the next admission is a guess. Hospital data makes this worse than textbook noise. A deep tree will split on a lab's local rounding, on a documentation habit, or on `hospital_id` if you were careless enough to leave it in the matrix. The next site does not share those cuts.",
      },
      {
        type: "h2",
        text: "Pre-pruning, which you will use",
      },
      {
        type: "p",
        text: "Three knobs stop the growth while you build:",
      },
      {
        type: "ul",
        items: [
          "`max_depth`. A communication limit as much as a statistical one. A depth-4 tree has at most 16 leaves. You can read 16 rules. You cannot read 400.",
          "`min_samples_leaf`. Both children must be at least this large. It is the direct defense against `p=1.00, n=2`.",
          "`min_impurity_decrease`. Ignore splits whose gain is real but tiny. The default in this module is 0, which still requires the gain to be greater than 0.",
        ],
      },
      {
        type: "p",
        text: "Libraries also offer `min_samples_split`, a floor on the parent rather than the child. You can live without it while `min_samples_leaf` is doing the work. The early-warning project caps depth at 4 and requires leaves of at least 10 training rows. Those are teaching bounds for a few hundred admissions, not universal clinical constants.",
      },
      {
        type: "h2",
        text: "Post-pruning, which you should recognize",
      },
      {
        type: "p",
        text: "Cost-complexity pruning grows a large tree and then cuts it back. Write the training cost as",
      },
      {
        type: "math",
        latex: "R_\\alpha(T) = R(T) + \\alpha \\, |T|,",
      },
      {
        type: "p",
        text: "where \\(R(T)\\) is the number of training mistakes and \\(|T|\\) is the number of leaves. A stump that makes 6 mistakes has cost \\(6 + \\alpha\\). A three-leaf tree that makes 2 mistakes has cost \\(2 + 3\\alpha\\). The larger tree is cheaper while \\(2 + 3\\alpha < 6 + \\alpha\\), which is \\(\\alpha < 2\\). At \\(\\alpha = 2\\) they tie. Above 2, the stump wins. Sklearn's `ccp_alpha` is this trade, using a weighted impurity rather than raw mistake counts. You will not implement the weakest-link search. When you read the parameter later, it is this equation.",
      },
      {
        type: "h2",
        text: "The honest number",
      },
      {
        type: "p",
        text: "Training impurity always falls as the tree grows. The number you report is on patients the tree did not fit. For admissions, those patients should be later in time, and no patient should contribute rows to both sides. The next page is that rule. A tree with perfect training accuracy and a mediocre future slice has memorized the ward. Publish the pair of numbers. Hiding the training number does not make the future number better, but showing only the training number is how bad models get presented.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "A site column is a memorized ward",
        text: "If hospital B's lactate assay reads low, a tree that is allowed to ask `hospital_id == B` will learn a different threshold per site and look strong in-sample. It has not learned physiology. It has learned the codebook. Keep the site out of the features, then report the metrics by site anyway, so a failure on one hospital is visible.",
      },
    ],
  },
];

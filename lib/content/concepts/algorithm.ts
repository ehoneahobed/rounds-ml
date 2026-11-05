import type { Concept } from "@/lib/content/types";

export const algorithm: Concept[] = [
  {
    slug: "in-code",
    number: "06",
    title: "Building the tree in code",
    minutes: 40,
    summary: "The node that stores one question, the stops, and a tree you can check by hand.",
    blocks: [
      {
        type: "p",
        text: "The tree on the table is a few questions and a prediction at each leaf. A program stores each of those as a node. The class is `DecisionTreeClassifier`. Two correct implementations grow the same tree, because every tie and every stop is fixed.",
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
        text: "The eight patients, written down",
      },
      {
        type: "p",
        text: "Lactate in column 0, age in column 1. Labels are 0, 0, 0, 0, 1, 0, 1, 0. The best lactate cut and the best age cut at the root have the same gain, 0.125. Column 0 wins the tie. The low-lactate side is pure. The high-lactate side is two and two, and age splits it at 64.5. Gain on that child is 0.5.",
      },
      {
        type: "partition",
      },
      {
        type: "paths",
      },
      {
        type: "p",
        text: "Walk a new row the same way. Lactate 2.7 and age 50: 2.7 > 1.80, so right; 50 <= 64.50, so left; prediction 0. Lactate 1.7 goes left immediately, even if the patient is 90, because the root question is asked first. A value equal to the threshold goes left.",
      },
      {
        type: "h2",
        text: "Stops that are easy to miss",
      },
      {
        type: "ul",
        items: [
          "A split whose both leaves predict the same class can still be legal. Impurity fell, so the split stands. Four patients with label 0 and one with label 1, and a minimum leaf of 2, can cut at 3.5 and leave both leaves predicting 0.",
          "When the label is 1 only if two yes/no features disagree, every single-feature cut has gain 0. The tree stays a leaf even with max_depth 6.",
          "`min_impurity_decrease=0.5` blocks ordinary binary splits, because a Gini gain cannot exceed 0.5 when the parent itself is at most 0.5. It is a floor used to test the rule.",
          "Calling `fit` again replaces `classes_` and the root. Predicting before `fit` is an error. Ragged rows are an error. An empty table is an error.",
        ],
      },
      {
        type: "callout",
        tone: "practice",
        title: "Five trees worth growing by hand",
        text: "Pure labels. A depth of 0. One column with an obvious cut, including a row that lands exactly on the threshold. Two identical columns, which must use column 0. A 50/50 leaf, which must predict the smaller label. If those five match, the longer cases are about discipline.",
      },
      {
        type: "p",
        text: "A leaf probability is a count of training rows divided by the size of the leaf. With `min_samples_leaf=1`, a tree can report 0 or 1 because it isolated one patient. A minimum of 10 keeps that probability from resting on a single row.",
      },
    ],
  },
  {
    slug: "sklearn",
    number: "07",
    title: "The same tree in scikit-learn",
    minutes: 25,
    summary: "The same fit, predict, and stops, under the library's argument names.",
    blocks: [
      {
        type: "p",
        text: "The class you just specified is also a library call. `X_train` is the feature table. `y_train` is the label column. `fit` grows the tree. `predict` walks a new row to a leaf. `predict_proba` returns the leaf frequencies.",
      },
      {
        type: "code",
        caption: "Gini, a depth cap, and a minimum leaf size.",
        code: `from sklearn.tree import DecisionTreeClassifier, export_text

model = DecisionTreeClassifier(
    criterion="gini",
    max_depth=4,
    min_samples_leaf=10,
)
model.fit(X_train, y_train)
model.predict(X_test)
model.predict_proba(X_test)
print(export_text(model, feature_names=feature_names, decimals=2))`,
      },
      {
        type: "h2",
        text: "What each argument is",
      },
      {
        type: "ul",
        items: [
          "`criterion=\"gini\"` is the Gini impurity. `\"entropy\"` switches the formula and still uses the same weights.",
          "`max_depth=4` stops at depth 4. The root is depth 0. `None` keeps splitting until another stop fires.",
          "`min_samples_leaf=10` refuses a split that would put fewer than 10 training rows in either child.",
          "`min_samples_split` is a floor on the parent instead of the child. The class above does not take it. `min_samples_leaf` is the floor that class uses.",
          "`min_impurity_decrease` ignores a split whose gain is positive but smaller than the number you set. The default is 0, which still requires the gain to be greater than 0.",
        ],
      },
      {
        type: "h2",
        text: "Where the two can disagree",
      },
      {
        type: "p",
        text: "Both place a numeric threshold at the midpoint between two neighboring values, and both send `value <= threshold` left. `predict_proba` columns follow the sorted class labels, the same role as `classes_`. `export_text` prints its own sentences. Read them as the same walk. A path from the class above looks like `if lactate > 1.80 AND age > 64.50 then 1 (p=1.00, n=2)`.",
      },
      {
        type: "p",
        text: "Ties are the other gap. The class above keeps the lower feature index, then the lower threshold, when two gains are within 1e−12. scikit-learn's `splitter=\"best\"` often lands on the same cut. `splitter=\"random\"` does not. When a path is specified to the threshold, follow the class. When you are exploring a table and you only need a shallow readable tree, `DecisionTreeClassifier` is the tool.",
      },
      {
        type: "callout",
        tone: "practice",
        title: "One patient, both ways",
        text: "Fit the class and a DecisionTreeClassifier on the eight-row lactate and age table, with max_depth=2 and min_samples_leaf=1. Walk one patient both ways. If the predicted class differs, print both sets of questions and see which tie broke differently.",
      },
    ],
  },
  {
    slug: "overfitting",
    number: "08",
    title: "A tree that memorized the ward",
    minutes: 30,
    summary: "Depth, leaf size, and the cost of an extra leaf.",
    blocks: [
      {
        type: "p",
        text: "The eight-row tree fits its training rows perfectly. Every person lands in a leaf that matches their label. If every feature combination is unique, a deep enough tree isolates every patient, training accuracy goes to 1, and the next admission is a guess. Hospital data makes this worse than a textbook. A deep tree will split on a lab's local rounding, on a documentation habit, or on a hospital identifier left in the table. Another hospital does not share those cuts.",
      },
      {
        type: "h2",
        text: "Stopping the growth while you build",
      },
      {
        type: "p",
        text: "Three arguments stop the growth during the fit.",
      },
      {
        type: "ul",
        items: [
          "`max_depth`. A limit on how many questions a path may ask. A depth-4 tree has at most 16 leaves. Sixteen rules can be read. Four hundred cannot.",
          "`min_samples_leaf`. Both children must be at least this large. It is the direct defense against a leaf that says `p=1.00, n=2`.",
          "`min_impurity_decrease`. Ignore splits whose gain is real but tiny. The default is 0, which still requires the gain to be greater than 0.",
        ],
      },
      {
        type: "p",
        text: "Libraries also offer `min_samples_split`, a floor on the parent rather than the child. `min_samples_leaf` already keeps a child from being tiny. For the hour-6 score, depth stays at most 4 and each leaf holds at least 10 training rows. Those bounds fit a few hundred admissions.",
      },
      {
        type: "h2",
        text: "Growing a large tree, then cutting it back",
      },
      {
        type: "p",
        text: "Cost-complexity pruning grows a large tree and then removes leaves. Write the training cost as",
      },
      {
        type: "math",
        latex: "R_\\alpha(T) = R(T) + \\alpha \\, |T|,",
      },
      {
        type: "p",
        text: "where \\(R(T)\\) is the number of training mistakes and \\(|T|\\) is the number of leaves. A stump is a tree with one question and two leaves. A stump that makes 6 mistakes has cost \\(6 + \\alpha\\). A three-leaf tree that makes 2 mistakes has cost \\(2 + 3\\alpha\\). The larger tree is cheaper while \\(2 + 3\\alpha < 6 + \\alpha\\), which is \\(\\alpha < 2\\). At \\(\\alpha = 2\\) they tie. Above 2, the stump wins. `ccp_alpha` in scikit-learn is this trade, using a weighted impurity rather than raw mistake counts. Setting the argument turns this equation. The search that removes the leaves belongs to the library.",
      },
      {
        type: "h2",
        text: "The number that counts",
      },
      {
        type: "p",
        text: "Training impurity always falls as the tree grows. The number to report is on patients the tree did not use to grow. For admissions, those patients are people who arrived later, and no patient contributes rows to both sides. A tree that is perfect on the rows it grew from, and ordinary on rows it never saw, has memorized the ward. Report both numbers.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "A site column is a memorized ward",
        text: "If hospital B's lactate assay reads low, a tree that is allowed to ask `hospital_id == B` will learn a different threshold per site and look strong on the rows it trained on. It has learned the codebook. Keep the site out of the features, then report the metrics by site anyway, so a failure on one hospital is visible.",
      },
    ],
  },
];

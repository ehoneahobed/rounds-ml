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
        text: "The tree in the lab is a few questions and a prediction at each leaf. A program stores each question as a node. The class that holds the whole tree is called DecisionTreeClassifier. A class here means a Python object you write, with fit to grow the tree and predict to walk a new row. Two correct versions grow the same tree, because every tie and every stop is fixed.",
      },
      {
        type: "h2",
        text: "What a node stores",
      },
      {
        type: "ul",
        items: [
          "`feature`: which column the question uses, counted from 0. A leaf has no question, so this is empty.",
          "`threshold`: the number in the question. Rows at or below it go left.",
          "`left` and `right`: the two children. A leaf has neither.",
          "`n_samples`: how many training rows reached this node.",
          "`probabilities`: the share of each class in this node, in the order of `classes_`. The shares add up to 1. A class that never appears here still has a slot, with share 0.",
          "`prediction`: the most common class. A tie goes to the smaller label. `classes_` is the sorted list of labels the tree saw, so the first class with the highest count is the smaller label.",
        ],
      },
      {
        type: "p",
        text: "After fit, the tree also remembers `classes_`, `max_depth`, `min_samples_leaf`, and `n_features_`, which is how many columns it was given. The root is depth 0. A node at depth `>= max_depth` is a leaf, so `max_depth` 0 never asks a question and predicts the majority of the whole group. Both children must hold at least `min_samples_leaf` rows. A split is kept only when its Gini gain is greater than 0 and at least `min_impurity_decrease`. Gains within 0.000000000001 are a tie. The tie keeps the earlier column, then the lower number.",
      },
      {
        type: "h2",
        text: "The eight patients, written down",
      },
      {
        type: "p",
        text: "Lactate is column 0. Age is column 1. The labels, in row order, are 0, 0, 0, 0, 1, 0, 1, 0. At the root, the best lactate question and the best age question both gain 0.125. Column 0 wins the tie. The low-lactate side is pure. The high-lactate side is two and two, and age splits it at 64.5. The gain on that child is 0.5.",
      },
      {
        type: "partition",
      },
      {
        type: "paths",
      },
      {
        type: "p",
        text: "Walk a new row the same way. Lactate 2.7 and age 50: 2.7 is above 1.80, so right; 50 is at or below 64.50, so left; prediction 0. Lactate 1.7 goes left immediately, even if the patient is 90, because the root question is asked first. A value equal to the threshold goes left.",
      },
      {
        type: "h2",
        text: "Stops that are easy to miss",
      },
      {
        type: "ul",
        items: [
          "Both children can predict the same class and the split can still be legal. What matters is that the impurity fell. Four patients with label 0 and one with label 1, and a minimum leaf of 2, can cut at 3.5 and leave both leaves predicting 0.",
          "When the label is 1 only if two yes/no features disagree, every single-feature question has gain 0. The tree stays a leaf even if max_depth is 6.",
          "`min_impurity_decrease` of 0.5 blocks ordinary yes/no splits. A Gini gain cannot be larger than 0.5 when the parent itself is at most 0.5. The number is a floor for testing the rule.",
          "Calling fit again replaces the tree. Predicting before fit is an error. Rows of different lengths are an error. An empty table is an error.",
        ],
      },
      {
        type: "callout",
        tone: "practice",
        title: "Five trees worth growing by hand",
        text: "All labels the same. A depth of 0, which must predict the majority and ask nothing. One column with an obvious cut, including a row that lands exactly on the threshold and must go left. Two identical columns, which must use column 0. A leaf that is half and half, which must predict 0. If those five match, the longer cases are about keeping the same rules.",
      },
      {
        type: "p",
        text: "A leaf probability is a count divided by the size of the leaf. With min_samples_leaf set to 1, a tree can report 0 or 1 because it isolated one patient. A minimum of 10 keeps that probability from resting on a single row.",
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
        text: "scikit-learn is a Python library that already contains this tree. A library is code someone else wrote and you call. X_train is the table of features for the training patients. y_train is their label column. fit grows the tree. predict walks a new row to a leaf and returns the class. predict_proba returns the class shares in that leaf.",
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
          "`criterion=\"gini\"` chooses the Gini ruler. `\"entropy\"` switches the ruler and still weights each child by its size.",
          "`max_depth=4` stops a path at depth 4. The root is depth 0. `None` keeps asking until another stop fires.",
          "`min_samples_leaf=10` refuses a question that would put fewer than 10 training rows in either child.",
          "`min_samples_split` is a floor on the parent, the group before the question, rather than on the child. The class you write does not take this argument. `min_samples_leaf` is the floor that class uses.",
          "`min_impurity_decrease` ignores a question whose gain is positive but smaller than the number you set. The default is 0, which still requires the gain to be greater than 0.",
        ],
      },
      {
        type: "h2",
        text: "Where the two can disagree",
      },
      {
        type: "p",
        text: "Both put a numeric threshold at the halfway point between two neighboring values, and both send `value <= threshold` left. predict_proba lines the classes up in sorted order, the same job as `classes_`. export_text prints its own sentences for the same walk. A path from the class you write looks like `if lactate > 1.80 AND age > 64.50 then 1 (p=1.00, n=2)`.",
      },
      {
        type: "p",
        text: "Ties are the other gap. The class you write keeps the earlier column, then the lower number, when two gains are within 0.000000000001. scikit-learn's `splitter=\"best\"` often lands on the same question. `splitter=\"random\"` picks among questions and will not match. When a path has to match a stated threshold, follow the class you write. When you are exploring a table and you want a shallow readable tree, DecisionTreeClassifier is the tool.",
      },
      {
        type: "callout",
        tone: "practice",
        title: "One patient, both ways",
        text: "Fit the class you write and a DecisionTreeClassifier on the eight-row lactate and age table, with max_depth=2 and min_samples_leaf=1. Walk one patient both ways. If the predicted class differs, print both sets of questions and see which tie broke differently.",
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
        text: "The eight-row tree fits its training rows perfectly. Every person lands in a leaf that matches their label. That can be a warning. If every combination of features is unique, a deep enough tree puts each patient in a private leaf. Accuracy on the training rows, the fraction of those rows the tree gets right, goes to 1. The next admission is then a guess. This is called memorizing the training rows.",
      },
      {
        type: "p",
        text: "Hospital tables make memorizing easy. A deep tree will split on a lab's local rounding, on a habit of how a ward writes notes, or on a hospital id left in the table. Another hospital does not share those splits.",
      },
      {
        type: "h2",
        text: "Stopping the growth while you build",
      },
      {
        type: "p",
        text: "Three arguments stop the growth during fit. You already met the first two as limits on the questions.",
      },
      {
        type: "ul",
        items: [
          "`max_depth`. How many questions one path may ask. A depth-4 tree has at most 16 leaves. Sixteen rules can be read aloud. Four hundred cannot.",
          "`min_samples_leaf`. Both children must be at least this large. It is the direct defense against a leaf that says the probability is 1.00 based on 2 patients.",
          "`min_impurity_decrease`. Ignore a split whose gain is real but tiny. The default is 0, which still requires the gain to be greater than 0.",
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
        text: "Another approach grows a large tree and then removes leaves. The cost of a tree is its training mistakes plus a penalty for each leaf:",
      },
      {
        type: "math",
        latex: "R_\\alpha(T) = R(T) + \\alpha \\, |T|,",
      },
      {
        type: "p",
        text: "\\(R(T)\\) is how many training rows the tree gets wrong. \\(|T|\\) is how many leaves it has. \\(\\alpha\\) is the price of one extra leaf. A stump is a tree with one question and two leaves. A stump that makes 6 mistakes costs \\(6 + \\alpha\\). A three-leaf tree that makes 2 mistakes costs \\(2 + 3\\alpha\\). The larger tree is cheaper while \\(2 + 3\\alpha < 6 + \\alpha\\), which is \\(\\alpha < 2\\). At \\(\\alpha = 2\\) they tie. Above 2, the stump wins. `ccp_alpha` in scikit-learn is this trade, using a weighted impurity rather than raw mistake counts. Setting the argument turns this equation. The search that removes the leaves belongs to the library.",
      },
      {
        type: "h2",
        text: "The number that counts",
      },
      {
        type: "p",
        text: "Training impurity always falls as the tree grows. The number to report is on patients the tree did not use. Call those the test patients. For admissions, the test patients are people who arrived later, and no patient contributes rows to both the training side and the test side. A tree that is perfect on the rows it learned from, and ordinary on rows it never saw, has memorized the ward. Report both numbers.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "A hospital id is a memorized ward",
        text: "An assay is the machine that measures a lab. If hospital B's lactate assay reads low, a tree that is allowed to ask whether the hospital id is B will learn a different lactate line per hospital and look strong on the rows it trained on. It learned the codebook. Keep the hospital id out of the features. Still report the results separately for each hospital, so a failure at one site is visible.",
      },
    ],
  },
];

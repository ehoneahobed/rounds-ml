import type { Concept } from "@/lib/content/types";

export const opening: Concept[] = [
  {
    slug: "the-job",
    number: "01",
    title: "The decision at hour 6",
    minutes: 15,
    summary: "Predict deterioration from columns that have already resulted.",
    blocks: [
      {
        type: "p",
        text: "At hour 6 of an admission the question is specific. Will this patient deteriorate in the next 48 hours? The score uses the chart as it stands then: age, sex, heart rate, systolic blood pressure, respiratory rate, temperature, oxygen saturation, lactate, creatinine, white count, and diagnoses already on the record. Discharge disposition, a lactate drawn at hour 30, length of stay, and in-hospital death come later. They stay out of the features.",
      },
      {
        type: "p",
        text: "The model for that score is a decision tree. The next page says what one is, how a new patient walks down it, and how it is grown. The pages after that take the growth apart: how mixed a group is, which thresholds are legal, and the class you write. After that class is specified, you will see the same fit as a scikit-learn call.",
      },
      {
        type: "h2",
        text: "The score you will fit",
      },
      {
        type: "p",
        text: "The project at the end of this module is that hour-6 score. The admissions are synthetic. About a third of them deteriorate, denser than a general ward, so the cuts show up in a few hundred rows. The label is a known rule plus noise. You still attach a clock to every column. A measurement after hour 6 is illegal even when the file contains it.",
      },
      {
        type: "p",
        text: "Wards already add threshold scores such as NEWS2 from respiratory rate, oxygen, blood pressure, pulse, consciousness, and temperature. Your tree is that kind of object with the thresholds learned from data and with labs included. When you evaluate it, compare it with a single cut on lactate and a single cut on respiratory rate.",
      },
      {
        type: "h2",
        text: "What you are learning to do",
      },
      {
        type: "ul",
        items: [
          "Measure how mixed a group of labels is, and how much a split cleans it up.",
          "Grow a tree with a depth limit and a minimum number of patients in each leaf.",
          "Read a leaf as a sentence that includes how many patients it rests on.",
          "Keep a column only when it was known at hour 6.",
          "Test on patients who arrive later.",
          "Choose an alarm threshold for a sensitivity you name in advance.",
        ],
      },
    ],
  },
  {
    slug: "overview",
    number: "02",
    title: "What a decision tree is",
    minutes: 25,
    summary: "The questions, the leaves, how a tree is grown, and the library call that does the same thing.",
    blocks: [
      {
        type: "p",
        text: "A decision tree is a list of yes/no questions about the columns. You ask the first question. The answer sends the patient left or right. You ask the next question for that side, until you reach a stopping point called a leaf. The leaf predicts one class.",
      },
      {
        type: "h2",
        text: "Four patients",
      },
      {
        type: "p",
        text: "A feature is a column you are allowed to ask about. The label is the column you are trying to predict. Here the label is 1 if the patient deteriorated and 0 if they did not.",
      },
      {
        type: "table",
        caption: "A small table. Lactate and age are features. Deteriorated is the label.",
        headers: ["Patient", "Lactate", "Age", "Deteriorated"],
        rows: [
          ["A", "0.8", "40", "0"],
          ["B", "1.0", "45", "0"],
          ["C", "2.6", "48", "0"],
          ["D", "2.8", "81", "1"],
        ],
      },
      {
        type: "p",
        text: "One possible tree asks two questions. First: is lactate at or below 1.80? Patients A and B pass, and both have label 0, so that side stops and predicts 0. Patients C and D fail the first question. Second question, only for them: is age at or below 64.5? C passes and has label 0, so that leaf predicts 0. D fails and has label 1, so that leaf predicts 1.",
      },
      {
        type: "p",
        text: "Predicting a new patient is the same walk. Lactate 2.7 and age 50 fails the first question and passes the second, so the prediction is 0. Lactate 0.9 stops at the first question, whatever the age is, because a later question is only asked on the side the patient actually took. The thresholds are midpoints of the values on either side of the cut: (1.0 + 2.6) / 2 = 1.80, and (48 + 81) / 2 = 64.5. These four rows are part of the eight-row figure on the next page.",
      },
      {
        type: "h2",
        text: "The words for the picture",
      },
      {
        type: "ul",
        items: [
          "A node is one question, or a leaf.",
          "The root is the first question. Every patient is asked the root.",
          "The threshold is the number in the question. Lactate 1.80 is a threshold.",
          "Left means the value is at or below the threshold. Right means it is above.",
          "A leaf has no question. It stores a prediction.",
          "Depth counts questions from the root. The root is depth 0. The age question above is depth 1.",
        ],
      },
      {
        type: "h2",
        text: "How the tree is grown",
      },
      {
        type: "p",
        text: "You do not invent the questions by hand. Fit builds them from the training rows.",
      },
      {
        type: "ol",
        items: [
          "Put every training row at the root.",
          "Try each feature. For a numeric feature, try cut points between values that actually appear. The search page lists which cut points count.",
          "Keep the question whose two sides are less mixed than the group you started with. The impurity page is the number for mixed.",
          "Repeat on each side.",
          "Stop on a side when every row has the same label, when you have reached the depth limit (max_depth), when a side would contain fewer rows than the leaf minimum (min_samples_leaf), or when no question makes the sides less mixed.",
        ],
      },
      {
        type: "p",
        text: "The tree picks the best question it can see at the node it is standing on, then moves on. It does not go back and rewrite an earlier question. That habit is called greedy. The name of this whole recipe is CART: classification and regression trees. Classification means the label is a class, 0 or 1 in this module. One later task uses a numeric label. That is the regression half, and it is not needed to follow the pages in between.",
      },
      {
        type: "p",
        text: "A leaf predicts the most common label among the training rows that reached it. If 0 and 1 are equally common, predict 0, the smaller label, so the answer does not depend on the order of the rows. The probability of a class in that leaf is its count divided by the number of rows in the leaf. Two deteriorated patients out of two is a probability of 1.00 with a denominator of 2.",
      },
      {
        type: "h2",
        text: "The same three steps in scikit-learn",
      },
      {
        type: "p",
        text: "A library grows this object for you. X_train is the feature table. y_train is the label column. fit grows the tree. predict walks a new row to a leaf.",
      },
      {
        type: "code",
        caption: "The destination, before the details. max_depth=3 means at most three questions on any path.",
        code: `from sklearn.tree import DecisionTreeClassifier

model = DecisionTreeClassifier(max_depth=3)
model.fit(X_train, y_train)
model.predict(X_new)`,
      },
      {
        type: "p",
        text: "The tasks ask you to write this class yourself, with the tie rules and the stopping rules written down. After that implementation, a later page maps each argument in scikit-learn onto the rule you coded, and names the places a library tree can print a different path. Read the call now so the later formulas have an object to belong to. Use your own class whenever a task asks for a path.",
      },
    ],
  },
  {
    slug: "partition",
    number: "03",
    title: "The same tree, drawn as boxes",
    minutes: 25,
    summary: "Each cut is a straight line. Every patient lands in one leaf.",
    blocks: [
      {
        type: "p",
        text: "Put lactate on the horizontal axis and age on the vertical axis. A lactate question is a vertical line. An age question is a horizontal line. Patients on the left of a line took the `<=` branch. Patients on the right took the `>` branch. Each leaf is one box, and the boxes do not overlap. Every patient lands in exactly one box. That is the same fact as every patient reaching exactly one leaf.",
      },
      {
        type: "partition",
      },
      {
        type: "p",
        text: "The figure is the eight-row table you will compute by hand once impurity has a formula. Low lactate is one box, and every patient in it has label 0, so the leaf predicts 0. High lactate is split by age. The younger box predicts 0. The older box predicts 1. The drawing and the tree are the same object. If you can point at a patient's box, you can say which questions they passed.",
      },
      {
        type: "h2",
        text: "Reading a leaf",
      },
      {
        type: "p",
        text: "The prediction is the most common label in the box. A tie predicts the smaller label, 0 before 1. The probability reported for the predicted class is how many training patients in the box have that label, divided by how many training patients are in the box. A box with two patients, both deteriorated, reports 1.00. Say the denominator when you say the probability. A later page turns each box into a sentence you can read aloud.",
      },
      {
        type: "callout",
        tone: "note",
        title: "One question shape",
        text: "Every question in this module is `feature <= threshold`. A yes/no column is stored as 0 and 1, so the same shape covers it: the cut falls at 0.5, and the zeros go left. The tasks use numeric columns. Categories with more than two values are described on the search page, after you know how a numeric cut is scored.",
      },
      {
        type: "p",
        text: "The next page gives a number to the phrase 'less mixed', so the growing rule from the overview can choose one question over another.",
      },
    ],
  },
  {
    slug: "impurity",
    number: "04",
    title: "Gini, entropy, and a gain you can finish",
    minutes: 50,
    summary: "The number for a mixed node, and the weighted average that makes a split worth keeping.",
    blocks: [
      {
        type: "p",
        text: "The growing rule keeps the question that leaves the two sides less mixed than the parent. Impurity is that measurement. A pure node, all one class, has impurity 0. A node split evenly between the classes is as mixed as that formula gets. A split is worth keeping when the children are purer than the parent, after you account for how many rows each child holds.",
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
        text: "A pure node is 0. A fair coin, half the rows in each class, is 1 bit. Three equal classes are \\(\\log_2 3\\). A 3/1 node is about 0.811 bits. Gini and entropy usually pick the same split. The numbers are on different scales: a fair node is Gini 0.5 and entropy 1. This module grows trees with Gini. Entropy is here so the `criterion` argument in scikit-learn, and the same word in a paper, already has a formula.",
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
        text: "The weights are the reason to write the formula down. A tiny pure leaf does not cancel a large mixed sibling. If the parent or either child has no rows, there was no split, and the gain is 0. \\(n\\) is \\(n_L + n_R\\).",
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
        text: "A split with gain zero",
      },
      {
        type: "p",
        text: "Four patients and two yes/no features. The label is 1 only when the two features disagree. That pattern is called exclusive-or. At the root, splitting on either feature leaves two children that are still half and half. The Gini gain is 0, so the tree does not ask the question. It stays a single leaf and predicts the most common label for everyone. Raising max_depth does not help, because the root already refuses every cut. The features only matter together, and a greedy tree looks at one feature at a time.",
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
        title: "When the label is a number",
        text: "Length of stay is a number, not a class. The impurity is then the average squared distance from the node mean, divided by n. The gain uses the same weights. One task asks for that formula. Every other tree in this module predicts a class.",
      },
    ],
  },
  {
    slug: "search",
    number: "05",
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
        text: "Sorting a column is the expensive step. After the sort, the scan can walk once if you update the class counts as each row moves from the right child into the left, instead of rebuilding both label lists at every cut. At a few hundred rows the slower version is readable, and it is a good first draft. The early-warning table is large enough that the count update matters. If a check times out, update the counts. The impurity formula stays the same.",
      },
      {
        type: "h2",
        text: "Which feature, when several look equal",
      },
      {
        type: "p",
        text: "Across features, keep the higher gain. If two gains differ by at most 1e−12, keep the lower feature index. Column 0 beats column 1 when the gains tie. If the same feature offers two thresholds with that same gain, keep the lower threshold. Two people who follow this rule grow the same tree. The scikit-learn page, after the implementation, says what to expect when a library breaks the tie another way.",
      },
      {
        type: "h2",
        text: "Categories, without implementing them",
      },
      {
        type: "p",
        text: "The tasks use numeric columns. A column that is already 0 or 1 is numeric: the midpoint is 0.5, and `<= 0.5` sends the zeros left. A column with k named categories, such as admission type, has many ways to split into two groups. For two classes, CART does not try every grouping. It sorts the categories by how often the label is 1, then scores only k−1 cuts along that order, the same walk as a numeric column. For a numeric label, it sorts by the average label instead. With three or more classes that shortcut does not hold. You will not code the category case. You do need it when a library splits `admission_type` in one line, and when a column like a raw diagnosis code offers so many cuts that the tree can memorize the code.",
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
          "Decide, before the fit, what a missing value means. Fill it in, or drop the row, and write the decision down. Filling means choosing a stand-in number, often the training median. A median computed from the whole table, including future patients, uses information you would not have had.",
          "Add a second column that is 1 when the value was missing, when the absence itself matters. A lactate that was never ordered is a different fact from a lactate of 1.0.",
          "A surrogate is a backup question used only when the main feature is missing, so a new row can still be routed. You will not code surrogates. A blank cell is not a zero unless you decided, in writing, that it is.",
        ],
      },
      {
        type: "callout",
        tone: "warn",
        title: "A missing value is a data decision",
        text: "If you fill the blank with a number, compute that number on the training patients only, and apply the same number to the test patients. A fill computed on everyone lets the future rows change the stand-in.",
      },
    ],
  },
];

import type { Concept } from "@/lib/content/types";

export const opening: Concept[] = [
  {
    slug: "the-job",
    number: "01",
    title: "The decision at hour 6",
    minutes: 15,
    summary: "The chart at hour 6, and the question that chart can answer.",
    blocks: [
      {
        type: "p",
        text: "Hour 6 of an admission. The chart in front of you is only partly written. Age, sex, heart rate, systolic blood pressure, respiratory rate, temperature, oxygen saturation, lactate, creatinine, white count, and the diagnoses already on the record are there. How the stay ends is not. A lactate drawn at hour 30 is not. Length of stay, an ICU transfer on day two, and death in hospital are not.",
      },
      {
        type: "p",
        text: "The question on that chart is specific. Will this patient deteriorate in the next 48 hours?",
      },
      {
        type: "p",
        text: "Past admissions answer it as a table. Each row is one patient. The columns are the numbers that had already resulted by hour 6. The last column is the label: 1 if they deteriorated, 0 if they did not. In this project about a third of the rows deteriorated, denser than a general ward, so a pattern can show up in a few hundred patients. The rows are synthetic. The label comes from a known rule plus noise. A measurement after hour 6 is still absent from the chart, even when the file happens to contain the number.",
      },
      {
        type: "p",
        text: "Wards already score a question like this by hand. NEWS2 adds points when respiratory rate, oxygen, blood pressure, pulse, consciousness, or temperature crosses a fixed line. Those lines were chosen in advance. The same kind of score can use labs as well as vitals, and the lines can be read off past rows instead of written down by a committee.",
      },
    ],
  },
  {
    slug: "overview",
    number: "02",
    title: "What a decision tree is",
    minutes: 25,
    summary: "Eight patients, two questions, and the leaves those questions make.",
    blocks: [
      {
        type: "p",
        text: "Take eight past admissions. Two columns are enough to see the pattern: lactate and age. Green spheres did not deteriorate. Rust spheres did. The table below is the same eight people.",
      },
      { type: "lab" },
      {
        type: "table",
        caption: "Eight admissions. Lactate and age are the columns you can ask about. Deteriorated is the label.",
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
        type: "h2",
        text: "Two questions",
      },
      {
        type: "p",
        text: "A decision tree is a short list of yes/no questions about the columns. Everyone is asked the first question. The answer sends them one way or the other. A question on a side is asked only of the people who reached that side. A side with nothing left to ask is a leaf, and the leaf predicts one class.",
      },
      {
        type: "p",
        text: "The first question is: is lactate at or below 1.80? Patients A, B, C, and D pass. All four have label 0, so that side stops and predicts 0. Patients E, F, G, and H fail the first question. They are still mixed, two of each label, so they get a second question: is age at or below 64.5? F and H pass, and both have label 0, so that leaf predicts 0. E and G fail, and both have label 1, so that leaf predicts 1.",
      },
      {
        type: "p",
        text: "A new patient takes the same walk. Lactate 2.7 and age 50 fails the first question and passes the second, so the prediction is 0. Lactate 0.9 stops at the first question. Age never comes up, because the age question lives only on the side this patient did not take.",
      },
      {
        type: "p",
        text: "The numbers in the questions are halfway between the values on either side of the jump. Lactate jumps from 1.1 to 2.5, and (1.1 + 2.5) / 2 = 1.80. On the high-lactate side, age jumps from 48 to 81, and (48 + 81) / 2 = 64.5.",
      },
      {
        type: "h2",
        text: "Names for the parts you just walked",
      },
      {
        type: "ul",
        items: [
          "A feature is a column you may ask about. Lactate is a feature. Age is a feature. The label is the column you are trying to predict.",
          "A node is one question, or a leaf.",
          "The root is the first question. Every patient is asked the root.",
          "The threshold is the number in the question. 1.80 is a threshold.",
          "Left means the value is at or below the threshold. Right means it is above.",
          "A leaf stores a prediction and has no question of its own.",
          "Depth counts questions from the root. The root is depth 0. The age question is depth 1.",
        ],
      },
      {
        type: "h2",
        text: "Where the questions came from",
      },
      {
        type: "p",
        text: "Nobody wrote those two questions down in advance. They were grown from the eight rows.",
      },
      {
        type: "ol",
        items: [
          "Put every training row in one group. Training rows are the patients the tree is allowed to learn from.",
          "For a numeric column, a candidate cut sits halfway between two neighboring values that differ. Any number between those two values would send the same people left and right. The halfway point is the one this module uses.",
          "Keep the question whose two sides are less mixed than the group you started with. A side that is all one label is cleaner than a pile of both labels.",
          "Repeat on each side that is still mixed.",
          "Stop on a side when every row has the same label, when you have reached the depth limit (max_depth), when a further cut would leave a side with fewer rows than the leaf minimum (min_samples_leaf), or when no question makes the sides less mixed.",
        ],
      },
      {
        type: "p",
        text: "The tree commits to the best question it can see in the group it is standing in, then moves on. It does not go back and rewrite an earlier question. That habit is called greedy. The name of the whole recipe is CART: classification and regression trees. Classification means the label is a class. Here the class is 0 or 1.",
      },
      {
        type: "p",
        text: "A leaf predicts the most common label among the training rows that reached it. If 0 and 1 are equally common, the leaf predicts 0, the smaller label, so the answer does not depend on the order of the rows. The probability of a class in that leaf is its count divided by the number of rows in the leaf. Two deteriorated patients out of two is a probability of 1.00, and the denominator is 2.",
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
        text: "The two questions are also two walls on the table. Lactate runs one way, age the other. A lactate question is a wall at one lactate, the same value for every age. An age question is a wall at one age, and it stands only on the high-lactate side, because that is the only side that asked about age.",
      },
      {
        type: "partition",
      },
      { type: "lab" },
      {
        type: "p",
        text: "Patients on the low side of a wall took the `<=` branch. Patients on the high side took the `>` branch. Low lactate is one region, and every patient there has label 0, so the leaf predicts 0. High lactate splits by age. The younger region predicts 0. The older region predicts 1. The regions do not overlap. Every patient stands in exactly one of them. That is the same fact as every patient reaching exactly one leaf. Point at a patient's region and you can say which questions they passed.",
      },
      {
        type: "h2",
        text: "Reading a leaf",
      },
      {
        type: "p",
        text: "The prediction is the most common label in the region. A tie predicts the smaller label, 0 before 1. The probability of the predicted class is how many training patients in the region have that label, divided by how many training patients are in the region. A region with two patients, both deteriorated, reports 1.00. Say the denominator when you say the probability.",
      },
      {
        type: "callout",
        tone: "note",
        title: "One question shape",
        text: "Every question has the shape `feature <= threshold`. A yes/no column is stored as 0 and 1, so the same shape covers it. The cut falls at 0.5, and the zeros go left.",
      },
    ],
  },
  {
    slug: "impurity",
    number: "04",
    title: "Gini, entropy, and a gain you can finish",
    minutes: 50,
    summary: "A number for a mixed group, and the weighted average that says a split was worth keeping.",
    blocks: [
      {
        type: "p",
        text: "On the table, the low-lactate side was all label 0. The high-lactate side, before the age wall, was two labels mixed together. Impurity is the number for that mixture. A pure group, all one class, has impurity 0. A group split evenly between the classes is as mixed as the formula gets. A split is worth keeping when the two sides are purer than the group you started from, after you account for how many rows each side holds.",
      },
      {
        type: "h2",
        text: "Gini",
      },
      {
        type: "p",
        text: "Draw two labels from the group at random, with replacement. The probability they differ is the Gini impurity. If the class proportions are \\(p_k\\),",
      },
      {
        type: "math",
        latex: "\\mathrm{Gini} = 1 - \\sum_k p_k^2.",
      },
      {
        type: "p",
        text: "For two classes with positive proportion \\(p\\), that is \\(2p(1-p)\\). A 50/50 group has Gini 0.5. A group that is three of one class and one of the other has Gini \\(1 - (0.75^2 + 0.25^2) = 0.375\\). An empty group is defined as 0 so the code has a base case. Order of the labels does not matter. You are scoring a multiset.",
      },
      {
        type: "h2",
        text: "Entropy",
      },
      {
        type: "p",
        text: "Entropy is another measurement of the same mixture. It is the average surprise, in bits:",
      },
      {
        type: "math",
        latex: "H = -\\sum_k p_k \\log_2 p_k, \\quad \\text{with } 0 \\log 0 = 0.",
      },
      {
        type: "p",
        text: "A pure group is 0. A fair coin, half the rows in each class, is 1 bit. Three equal classes are \\(\\log_2 3\\). A 3/1 group is about 0.811 bits. Gini and entropy usually pick the same split. The numbers are on different scales: a fair group is Gini 0.5 and entropy 1. The trees in this module grow with Gini.",
      },
      {
        type: "h2",
        text: "The gain, with the weights",
      },
      {
        type: "p",
        text: "Information gain is the parent's impurity minus the size-weighted impurity of the children. The parent is the group before the question. The children are the two sides after it.",
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
        text: "Four patients and two yes/no features. The label is 1 only when the two features disagree. That pattern is called exclusive-or. At the root, splitting on either feature leaves two children that are still half and half. The Gini gain is 0, so the tree does not ask the question. It stays a single leaf and predicts the most common label for everyone. A larger max_depth does not help, because the root already refuses every cut. The features only matter together, and a greedy tree looks at one feature at a time.",
      },
      {
        type: "h2",
        text: "Mistakes that survive a casual reading",
      },
      {
        type: "ul",
        items: [
          "Forgetting the weights and subtracting a plain average of the two impurities.",
          "Defining Gini as \\(\\sum p_k^2\\) and dropping the \\(1 -\\). That quantity goes up when the group gets purer, so the search runs backwards.",
          "Using \\(\\log_{10}\\) or a natural log and still calling the unit bits.",
          "Integer division. Class counts have to become proportions with a real division.",
          "Treating Gini 0.5 and entropy 1 as the same statement. Both describe a fair group. They are not the same scale.",
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
        text: "Length of stay is a number, not a class. The impurity is then the average squared distance from the group mean, divided by the number of rows. The gain uses the same weights. A tree that predicts a class uses Gini.",
      },
    ],
  },
  {
    slug: "search",
    number: "05",
    title: "Searching for the split",
    minutes: 40,
    summary: "Midpoints, ties, categories, and a missing lactate.",
    blocks: [
      {
        type: "p",
        text: "The lactate wall sits at 1.80 because that is halfway between 1.1 and 2.5. A numeric feature on n rows offers infinitely many thresholds and only n−1 places where the impurity can change. Sort the column. Walk from left to right. Impurity changes only when a new row joins the left child, so you only score a cut between two adjacent sorted values, and only when those two values differ. Any threshold between them produces the same children. The threshold goes at the midpoint, and `value <= threshold` goes left.",
      },
      {
        type: "p",
        text: "The table below is a six-row lactate column with three deteriorations. Parent Gini is 0.5. Two cuts both gain 0.25. Ties within 1e−12 go to the lower threshold, so 1.25 wins and 2.25 does not.",
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
        text: "One pass after the sort",
      },
      {
        type: "p",
        text: "Sorting a column is the expensive step. After the sort, the scan can walk once if you update the class counts as each row moves from the right child into the left, instead of rebuilding both label lists at every cut. At a few hundred rows the slower version is readable, and it is a good first draft. The hour-6 table is large enough that the count update matters. The impurity formula stays the same either way.",
      },
      {
        type: "h2",
        text: "Which feature, when several look equal",
      },
      {
        type: "p",
        text: "Across features, keep the higher gain. If two gains differ by at most 1e−12, keep the lower feature index. Column 0 beats column 1 when the gains tie. If the same feature offers two thresholds with that same gain, keep the lower threshold. Two people who follow this rule grow the same tree. On the eight patients, the best lactate cut and the best age cut at the root both gain 0.125. Lactate is column 0, so lactate wins, and the age wall appears only on the high-lactate side.",
      },
      {
        type: "h2",
        text: "A column of names",
      },
      {
        type: "p",
        text: "A column that is already 0 or 1 is numeric. The midpoint is 0.5, and `<= 0.5` sends the zeros left. A column with k named categories, such as admission type, has many ways to split into two groups. For two classes, CART does not try every grouping. It sorts the categories by how often the label is 1, then scores only k−1 cuts along that order, the same walk as a numeric column. For a numeric label, it sorts by the average label instead. With three or more classes that shortcut does not hold. A raw diagnosis code can offer so many cuts that the tree memorizes the code.",
      },
      {
        type: "h2",
        text: "A blank lactate",
      },
      {
        type: "p",
        text: "The tree so far assumes every entry is a number. A real lactate column has blanks. Three ways to handle a blank:",
      },
      {
        type: "ol",
        items: [
          "Decide, before the fit, what a missing value means. Fill it in, or drop the row, and write the decision down. Filling means choosing a stand-in number, often the median of the training patients. A median computed from the whole table, including patients you are holding out, uses rows the tree should not have seen.",
          "Add a second column that is 1 when the value was missing, when the absence itself matters. A lactate that was never ordered is a different fact from a lactate of 1.0.",
          "A surrogate is a backup question used only when the main feature is missing, so a new row can still be routed. A blank cell is a zero only when you decided, in writing, that it is.",
        ],
      },
      {
        type: "callout",
        tone: "warn",
        title: "A missing value is a data decision",
        text: "If you fill the blank with a number, compute that number on the training patients only, and apply the same number to the patients you held out. A fill computed on everyone lets the held-out rows change the stand-in.",
      },
    ],
  },
];

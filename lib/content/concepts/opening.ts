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
        text: "A person has been in the hospital for six hours. Call that moment hour 6. The chart in front of you is only partly written, and the question you can ask is only about what is already on it.",
      },
      {
        type: "p",
        text: "Already written: age and sex. The vital signs: heart rate, systolic blood pressure (the top number of a blood pressure), respiratory rate (breaths per minute), temperature, and oxygen saturation. The labs that have come back: lactate, creatinine, and white count. Diagnoses already on the record.",
      },
      {
        type: "p",
        text: "Not written yet: how the stay ends, a lactate drawn at hour 30, how many days they stay, a move to intensive care on day two, and whether they die in the hospital. Those facts come later. They cannot be used to answer a question asked at hour 6.",
      },
      {
        type: "h2",
        text: "The question, and the table that holds past answers",
      },
      {
        type: "p",
        text: "The question is: will this patient deteriorate in the next 48 hours? Deteriorate means get meaningfully worse. Record the answer as 1 if they did and 0 if they did not. That 0-or-1 answer is the label. The label is the column you are trying to predict.",
      },
      {
        type: "p",
        text: "Past stays are a table. A row is one patient. A column is one kind of fact, such as lactate. A feature is a column you are allowed to ask about. Lactate can be a feature. The label is not a feature. You do not ask a question whose answer is the thing you are trying to predict.",
      },
      {
        type: "p",
        text: "In this project about one row in three has label 1. That is more often than on a typical ward, so a pattern can show up in a few hundred rows. The rows are made up. A made-up table is safe to practice on, and the label was generated from a known rule with some randomness mixed in. A measurement taken after hour 6 stays out of the features, even when the file happens to contain the number.",
      },
      {
        type: "p",
        text: "Wards already answer a question like this by hand. A score called NEWS2 adds points when breathing, oxygen, blood pressure, pulse, alertness, or temperature crosses a line chosen in advance. The same kind of score can include labs, and the lines can be read off past rows.",
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
        text: "Take eight past admissions. Two columns are enough to see the pattern: lactate and age. In the lab, each person is a sphere on the node they have reached. Green did not deteriorate. Rust did. The table under the lab is the same eight people.",
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
        text: "A decision tree is a short list of yes/no questions about the features. Everyone is asked the first question. The answer sends them one way or the other. A later question is asked only of the people who reached that side. A side with nothing left to ask is a leaf. The leaf states one prediction: 0 or 1. Those two possible answers are the classes.",
      },
      {
        type: "p",
        text: "The first question is: is lactate at or below 1.80? Patients A, B, C, and D pass. All four have label 0, so that side stops and predicts 0. Patients E, F, G, and H fail the first question. Their group is mixed, which means it still contains both labels: two 0s and two 1s. They get a second question: is age at or below 64.5? F and H pass, and both have label 0, so that leaf predicts 0. E and G fail, and both have label 1, so that leaf predicts 1.",
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
          "Put every training row in one group. Training rows are the past patients the tree is allowed to learn from.",
          "Try a yes/no question on a feature. For a numeric feature the number in the question sits halfway between two neighboring values that differ. Any number between those two values would send the same people left and right.",
          "Keep the question whose two sides are cleaner than the group you started with. A side that is all one label is cleaner than a side that still holds both labels.",
          "Repeat on each side that is still mixed.",
          "Stop on a side when every row has the same label, when a path has asked as many questions as you allowed, when a further question would make a side smaller than the smallest side you allowed, or when no question makes the sides cleaner.",
        ],
      },
      {
        type: "p",
        text: "Two limits have names. max_depth is the most questions on any path. The first question is depth 0, so max_depth 0 asks nothing and predicts the most common label in the whole group. On labels 1, 1, 0 that prediction is 1. min_samples_leaf is the smallest side you will allow a question to create.",
      },
      {
        type: "p",
        text: "The tree picks the best question it can see in the group it is standing in, then moves on. It does not go back and rewrite an earlier question. That habit is called greedy. The name of this recipe is CART, short for classification and regression trees. Classification means the label is a class, here 0 or 1. Regression means the label is a number, such as a length of stay.",
      },
      {
        type: "p",
        text: "A leaf predicts the most common label among the training rows that reached it. If 0 and 1 are equally common, the leaf predicts 0, the smaller label, so the answer does not depend on the order of the rows. Labels 0, 0, 1, 1 have no question that helps, and the leaf predicts 0. The probability of a class in that leaf is its count divided by the number of rows in the leaf. Two deteriorated patients out of two is a probability of 1.00. The 2 on the bottom is the denominator, and you say it when you say the probability.",
      },
    ],
  },
  {
    slug: "partition",
    number: "03",
    title: "What a split is",
    minutes: 25,
    summary: "One yes/no question divides one group of patients into two.",
    blocks: [
      {
        type: "p",
        text: "A split is one yes/no question that divides a group of patients into two smaller groups. Every patient goes to one side. Nobody is left out, and nobody is sent to both sides. The group you start with is the parent. The two groups you end up with are the children. A decision tree is a chain of splits. You split a child again only when that child still contains both labels.",
      },
      {
        type: "h2",
        text: "Split the eight patients",
      },
      {
        type: "p",
        text: "The parent is all eight. Six did not deteriorate. Two did. If a new person arrived and all you knew was that they belong to this group, you would guess 0, and you would be wrong for the two who deteriorated.",
      },
      {
        type: "p",
        text: "Split them with one question: is lactate at or below 1.80? The left child is patients A, B, C, and D. All four have label 0. This child is pure. Pure means every person in the group has the same label. There is nothing left to separate, so this side stops, and anyone who lands here is predicted 0.",
      },
      {
        type: "p",
        text: "The right child is patients E, F, G, and H. Two deteriorated and two did not. This child is mixed. Mixed means the group still contains both labels, so it can be split again. The second question is asked only of these four: is age at or below 64.5? The younger child is F and H, both label 0. The older child is E and G, both label 1. Both of those children are pure, so the splitting stops. Three children remain, and they are the three leaves.",
      },
      {
        type: "h2",
        text: "The same splits, drawn flat",
      },
      {
        type: "p",
        text: "The drawing puts lactate across and age up, and drops one dot for each patient. The first split is the vertical line at lactate 1.80. Dots to the left of it are the left child. Dots to the right are the right child. The second split is the horizontal line at age 64.5, and it crosses only the right-hand side, because that is the only child that was still mixed. The boxes are those children. They do not overlap. Every dot sits in one box, which is the same fact as every patient reaching one leaf.",
      },
      {
        type: "partition",
      },
      { type: "lab" },
      {
        type: "p",
        text: "Point at a dot and name the splits that caught it. A dot left of 1.80 only met the lactate question. A dot on the lower right failed the lactate question and passed the age question. A dot on the upper right failed both. The lab draws those same three groups as the tree.",
      },
      {
        type: "h2",
        text: "The question always has the same shape",
      },
      {
        type: "p",
        text: "Every split asks `column <= number`. Yes goes left. No goes right. A yes/no column stored as 0 and 1 uses that same shape. The number between 0 and 1 is 0.5, so the zeros go left and the ones go right.",
      },
    ],
  },
  {
    slug: "impurity",
    number: "04",
    title: "How mixed a group is",
    minutes: 50,
    summary: "A pure node, a coin-flip node, and the number that tells them apart.",
    blocks: [
      {
        type: "p",
        text: "The lactate split made two children. The left child is four patients, all label 0. You know the label of everyone in it. The right child is two and two. You do not. Impurity is the number for that difference. It is 0 when a node is pure, and it gets larger as the labels inside the node get more mixed.",
      },
      {
        type: "h2",
        text: "A pure node",
      },
      {
        type: "p",
        text: "A node is pure when every patient in it has the same label. The left child is pure: four patients, label 0. Predict 0, and that prediction matches every training patient who reached it. There is nobody in the node who needed a different prediction. The impurity of a pure node is 0.",
      },
      {
        type: "p",
        text: "A node with one patient is pure. A node with fifty patients, all label 1, is pure. The size does not matter. The labels agree.",
      },
      {
        type: "h2",
        text: "A mixed node",
      },
      {
        type: "p",
        text: "A node is mixed when it holds more than one label. Some mixed nodes are almost pure. Some are a mess. The difference is the balance.",
      },
      {
        type: "p",
        text: "Picture the messiest group two labels can make. Eight patients, four deteriorated and four not. There is no majority. Guess a label for someone in that group and you are wrong about half the time. The two labels are in a dead heat. That picture is the high end of the scale. Nothing with a yes/no label is more mixed than this.",
      },
      {
        type: "p",
        text: "Now a group that is only slightly mixed. Eight patients, seven label 0 and one label 1. Guess 0 and you are wrong for one person out of eight. The node is impure, because that one person is in there, and it is far cleaner than the four-and-four group.",
      },
      {
        type: "p",
        text: "The root of the teaching tree sits between those pictures. Six label 0 and two label 1. Guess 0 and you are wrong for two people out of eight. The right child, two and two, is the dead heat.",
      },
      {
        type: "h2",
        text: "Gini: how often two drawn labels disagree",
      },
      {
        type: "p",
        text: "Gini impurity turns that picture into a chance. Draw two labels from the node at random. Put the first label back before you draw the second, so the same patient's label can come up twice. Ask whether the two labels differ.",
      },
      {
        type: "p",
        text: "In a pure node the two labels never differ. Gini is 0. In the four-and-four node, each draw is label 1 half the time and label 0 half the time, so the two draws differ half the time. Gini is 0.5. That 0.5 is the dead heat, written as a number. It is the high end for a label with two classes.",
      },
      {
        type: "p",
        text: "If the share of each class is \\(p_k\\), the chance the two draws differ is",
      },
      {
        type: "math",
        latex: "\\mathrm{Gini} = 1 - \\sum_k p_k^2.",
      },
      {
        type: "p",
        text: "For two classes, with share \\(p\\) of the positive class, that is \\(2p(1-p)\\). Work a three-and-one node by hand. Three patients are label 0 and one is label 1, so the shares are 0.75 and 0.25. Square them: \\(0.75^2 = 0.5625\\) and \\(0.25^2 = 0.0625\\). Add those squares to get 0.625. Gini is \\(1 - 0.625 = 0.375\\). The node is impure. It is cleaner than the dead heat of 0.5, and dirtier than a pure 0. An empty node is defined as 0, so a side with nobody in it still has a number. The order of the labels does not change the result. You are counting how many of each label you have.",
      },
      {
        type: "h2",
        text: "Entropy: the same mix, in bits",
      },
      {
        type: "p",
        text: "Entropy asks how surprised you are by a label drawn from the node. The unit is bits.",
      },
      {
        type: "math",
        latex: "H = -\\sum_k p_k \\log_2 p_k, \\quad \\text{with } 0 \\log 0 = 0.",
      },
      {
        type: "p",
        text: "A pure node does not surprise you. You already know the label, so the entropy is 0. The four-and-four node is a coin flip, and a coin flip is 1 bit. The three-and-one node is about 0.811 bits: some surprise, and less than a coin flip. Gini and entropy usually keep the same split. They are different rulers for the same mix. A coin-flip node is Gini 0.5 and entropy 1. The trees here grow with Gini.",
      },
      {
        type: "h2",
        text: "Did the split help?",
      },
      {
        type: "p",
        text: "A split helps when its children are less mixed than the parent. The gain is the number for that improvement. You score both children, and a larger child gets a larger vote. The vote is the child's size divided by the parent's size.",
      },
      {
        type: "p",
        text: "The vote is the whole point of the formula. Suppose the parent has 100 patients and is badly mixed. One child has 2 patients, both label 0, so it is pure. The other child has the remaining 98, still badly mixed. The split cleaned up 2 people and left 98 in the mess. Giving those two children equal weight would flatter the split. The child of 2 gets a vote of 2/100. The child of 98 gets a vote of 98/100.",
      },
      {
        type: "math",
        latex: "\\mathrm{Gain} = I(\\mathrm{parent}) - \\frac{n_L}{n} I(L) - \\frac{n_R}{n} I(R).",
      },
      {
        type: "p",
        text: "\\(I\\) is the impurity of that group. \\(n\\) is \\(n_L + n_R\\). If the parent or either child has no rows, there was no split, and the gain is 0.",
      },
      {
        type: "countedTable",
      },
      {
        type: "p",
        text: "The table above is one split, counted out. Positive means label 1. Negative means label 0. The parent has 4 positive and 6 negative, so 10 patients, and its Gini is \\(12/25 = 0.48\\). The left child has 1 positive and 5 negative, Gini \\(5/18\\), and it holds 6 of the 10 patients. The right child has 3 positive and 1 negative, Gini \\(3/8\\), and it holds 4 of the 10. The gain weights each child by that share:",
      },
      {
        type: "math",
        latex: "\\frac{12}{25} - \\frac{6}{10}\\cdot\\frac{5}{18} - \\frac{4}{10}\\cdot\\frac{3}{8} = \\frac{49}{300} \\approx 0.1633.",
      },
      {
        type: "p",
        text: "The children are cleaner than the parent, so the gain is positive. The bench further down starts from this same split. Change a count and the gain moves with it.",
      },
      {
        type: "p",
        text: "The votes matter most when the children have different sizes. Eight patients, four of each label, so the parent Gini is 0.5. The left child is three patients, all class 0, so its Gini is 0. The right child is five patients, four class 1 and one class 0. The shares are 0.8 and 0.2, and its Gini is \\(1 - (0.8^2 + 0.2^2) = 0.32\\). The right child holds 5 of the 8 patients, so its vote is 5/8. Gain = \\(0.5 - (5/8) \\times 0.32 = 0.30\\). Calling the gain 0.32, or stopping at \\((5/8) \\times 0.32 = 0.20\\), drops part of that formula.",
      },
      {
        type: "reveal",
        title: "Pause and compute",
        prompt: "Eight patients, four deteriorated and four not. The left child is four patients, all class 0. The right child is four patients, all class 1. What is the Gini gain?",
        answer: "The parent is the dead heat, so its Gini is 0.5. Both children are pure, so their Gini is 0. Each child holds half the patients. Gain = 0.5 − (4/8)×0 − (4/8)×0 = 0.5. The split removed all of the mixture. Under entropy the parent is 1 bit and both children are 0, so the gain is 1 bit.",
      },
      {
        type: "h2",
        text: "A split that does not help",
      },
      {
        type: "p",
        text: "Four patients, and two yes/no columns. The label is 1 only when the two answers disagree. Split on the first column. Each side is still half and half, still Gini 0.5, so the gain is 0. Split on the second column and the same thing happens. The tree refuses the split. It stays one leaf and predicts the most common label for everyone. A deeper tree does not change this, because the first split was already refused. The two columns only matter together, and a split looks at one column at a time. This pattern is called exclusive-or.",
      },
      {
        type: "h2",
        text: "Three slips in the arithmetic",
      },
      {
        type: "ul",
        items: [
          "Forgetting the votes and subtracting a plain average of the two child impurities.",
          "Writing Gini as the sum of the squares and leaving off the \\(1 -\\). That number rises as the node gets purer, so the search would keep the worse split.",
          "Using integer division, so 3/4 becomes 0. Class counts have to become shares with a real division.",
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
        text: "So far the label has been a class, 0 or 1. Length of stay is a number. Mixture then means how far those numbers sit from the group's average. The impurity is the average of the squared distances from that average, divided by the number of rows. The gain still gives each child a vote equal to its size. A tree that predicts a class keeps using Gini.",
      },
    ],
  },
  {
    slug: "search",
    number: "05",
    title: "Where the question puts its number",
    minutes: 40,
    summary: "The halfway point between two patients, and what happens when two splits tie.",
    blocks: [
      {
        type: "p",
        text: "A split on lactate needs a number in the question. For the eight patients that number is 1.80, halfway between 1.1 and 2.5. Any number between those two sends the same patients left and right. The halfway point is the number the question writes down. A value at or below it goes left.",
      },
      {
        type: "p",
        text: "Sort the column first. You only consider a gap between two neighbors whose values differ. A column with four entries 1.0, 2.0, 2.0, 5.0 has two legal halfway points: (1.0 + 2.0) / 2 = 1.5, and (2.0 + 5.0) / 2 = 3.5. The two equal 2.0s are not a gap. A `<=` question cannot send two patients with the same lactate to different children.",
      },
      {
        type: "p",
        text: "The table below is a six-row lactate column with three deteriorations. The parent is half and half, so its Gini is 0.5. Two gaps both gain 0.25. When two gains are this close, within 0.000000000001, treat them as a tie and keep the lower number. So 1.25 wins and 2.25 does not.",
      },
      {
        type: "searchTable",
      },
      {
        type: "p",
        text: "Sort before you scan. Forgetting the sort turns the gaps into nonsense. After the sort, keep a tally of how many 0s and 1s sit on each side, and update the tally as one patient moves from the right child into the left. Rebuilding both lists at every gap is the same Gini formula and is a good first draft. The hour-6 table is large enough that the tally is the one that finishes.",
      },
      {
        type: "h2",
        text: "When two questions look equally good",
      },
      {
        type: "p",
        text: "Keep the higher gain. If two gains differ by at most 0.000000000001, treat them as equal and keep the earlier column. Columns are numbered from 0. Column 0 is the first feature, column 1 is the second. Column 0 wins a tie against column 1 even when column 1's number is smaller. If the same column offers two numbers with that same gain, keep the lower number. On the eight patients, the best lactate question and the best age question at the root both gain 0.125. Lactate is column 0, so lactate is asked first, and age is asked only of the patients who went right.",
      },
      {
        type: "h2",
        text: "A column of words",
      },
      {
        type: "p",
        text: "A column that is already 0 or 1 is numeric. The halfway point is 0.5, and `<= 0.5` sends the zeros left. A column of words, such as emergency, urgent, and elective, is different. For a 0-or-1 label, sort those words by how often the label is 1, then walk the gaps in that order the same way you walk a numeric column. For a numeric label, sort the words by the average label instead. With three or more classes that shortcut stops holding. A raw diagnosis code has so many different words that a tree can give each code its own leaf. That leaf then matches one code, and a new hospital's codes will not match it.",
      },
      {
        type: "h2",
        text: "A blank lactate",
      },
      {
        type: "p",
        text: "The tree so far assumes every entry is a number. A real lactate column has blanks. Decide what a blank means before the tree is grown.",
      },
      {
        type: "ol",
        items: [
          "Fill the blank, or drop the row, and write the decision down. Filling means choosing a stand-in number. A common stand-in is the median of the training patients: line those lactates up and take the middle one. Compute that middle on the training patients only.",
          "Add a second column that is 1 when the value was missing, when the absence itself matters. A lactate that was never ordered is a different fact from a lactate of 1.0.",
          "A surrogate is a backup question, used only when the main feature is blank, so a new row can still be sent left or right. A blank cell is a zero only when you decided, in writing, that it is.",
        ],
      },
      {
        type: "callout",
        tone: "warn",
        title: "A missing value is a data decision",
        text: "If you fill the blank with a number, compute that number on the training patients only, and apply the same number to everyone else. A fill computed on the whole table lets the patients the tree is not learning from change the stand-in.",
      },
    ],
  },
];

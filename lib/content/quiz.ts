export type ChoiceId = "A" | "B" | "C" | "D";

export type Question = {
  id: string;
  prompt: string;
  choices: { id: ChoiceId; text: string }[];
  correct: ChoiceId;
  explanation: string;
};

/** Score required to clear the knowledge check. */
export const PASS_MARK = 14;

export const questions: Question[] = [
  {
    id: "gini-3-1",
    prompt: "What is the Gini impurity of the labels [0, 0, 0, 1]?",
    choices: [
      { id: "A", text: "0.375" },
      { id: "B", text: "0.25" },
      { id: "C", text: "0.5" },
      { id: "D", text: "0.75" },
    ],
    correct: "A",
    explanation:
      "Proportions are 0.75 and 0.25. Gini is 1 − (0.75² + 0.25²) = 1 − (0.5625 + 0.0625) = 0.375.",
  },
  {
    id: "entropy-pure",
    prompt: "What is the entropy, in bits, of a node whose labels are all the same class?",
    choices: [
      { id: "A", text: "1" },
      { id: "B", text: "0" },
      { id: "C", text: "0.5" },
      { id: "D", text: "It is undefined" },
    ],
    correct: "B",
    explanation: "A sure outcome has no surprise. Entropy is 0, and the 0 log 0 term contributes nothing.",
  },
  {
    id: "gain-weighted",
    prompt:
      "Eight patients, four of each class, so the parent Gini is 0.5. The left child is three patients, all class 0. The right child is five patients: four class 1 and one class 0. What is the Gini gain?",
    choices: [
      { id: "A", text: "0.30" },
      { id: "B", text: "0.32" },
      { id: "C", text: "0.50" },
      { id: "D", text: "0.20" },
    ],
    correct: "A",
    explanation:
      "The left child is pure. The right Gini is 1 − (0.8² + 0.2²) = 0.32. Gain = 0.5 − (5/8)×0.32 = 0.5 − 0.2 = 0.30. Dropping the weight is how you land on 0.32 or 0.20.",
  },
  {
    id: "midpoints",
    prompt: "A sorted numeric column is 1.0, 2.0, 2.0, 5.0. Which thresholds are legal midpoints?",
    choices: [
      { id: "A", text: "1.5 and 3.5" },
      { id: "B", text: "1.5, 2.0, and 3.5" },
      { id: "C", text: "2.0 only" },
      { id: "D", text: "1.0, 2.0, and 5.0" },
    ],
    correct: "A",
    explanation:
      "You may cut only between adjacent sorted values that differ. The two equal 2.0s are not a cut. The legal midpoints are (1+2)/2 = 1.5 and (2+5)/2 = 3.5.",
  },
  {
    id: "tie-feature",
    prompt:
      "Two features produce the same Gini gain, within 1e−12. Feature 0 would cut at 4.0. Feature 1 would cut at 1.0. Which split does this module keep?",
    choices: [
      { id: "A", text: "Feature 1, because 1.0 is the smaller threshold" },
      { id: "B", text: "Feature 0, because the feature index is smaller" },
      { id: "C", text: "Either. Tie breaks are random" },
      { id: "D", text: "The split with more rows on the left" },
    ],
    correct: "B",
    explanation:
      "Higher gain wins, then the lower feature index, then the lower threshold. The index is compared before the threshold, so column 0 wins even though 4.0 is larger than 1.0.",
  },
  {
    id: "depth-zero",
    prompt: "A tree with max_depth 0 is fit on labels [1, 1, 0]. What does it predict for a new row?",
    choices: [
      { id: "A", text: "1" },
      { id: "B", text: "0" },
      { id: "C", text: "It refuses to fit" },
      { id: "D", text: "0.67" },
    ],
    correct: "A",
    explanation:
      "Depth 0 never splits. The majority of [1, 1, 0] is 1. The probability would be about 0.67, but the class prediction is the majority label.",
  },
  {
    id: "tie-label",
    prompt:
      "Every feature value is identical, so no split has positive gain. The labels are [0, 0, 1, 1]. What does the leaf predict?",
    choices: [
      { id: "A", text: "1" },
      { id: "B", text: "0" },
      { id: "C", text: "A random class" },
      { id: "D", text: "The mean, 0.5, as the class" },
    ],
    correct: "B",
    explanation:
      "The counts tie. This module keeps the smaller label, which is 0. The probability of that class is 0.50, and the predicted class is still 0.",
  },
  {
    id: "regression-variance",
    prompt: "What is the population variance of the targets [10, 10, 0, 0]? (Divide by n, not n−1.)",
    choices: [
      { id: "A", text: "25" },
      { id: "B", text: "50" },
      { id: "C", text: "0" },
      { id: "D", text: "5" },
    ],
    correct: "A",
    explanation: "Mean is 5. Squared deviations are 25, 25, 25, 25. Divide by 4 → 25. CART uses /n, not sample variance.",
  },
  {
    id: "safe-column",
    prompt: "You are scoring deterioration at hour 6. Which column is safe to use as a feature?",
    choices: [
      { id: "A", text: "Discharge disposition, recorded at the end of the stay" },
      { id: "B", text: "A lactate drawn at hour 30" },
      { id: "C", text: "Respiratory rate measured at hour 6" },
      { id: "D", text: "Whether the patient died in hospital" },
    ],
    correct: "C",
    explanation:
      "The respiratory rate exists at the decision time. Discharge, a later lactate, and in-hospital death are consequences of the stay. They will fit beautifully and fail on the next admission.",
  },
  {
    id: "random-split",
    prompt: "A random split of rows puts two hours from the same patient on both sides of the split. What goes wrong?",
    choices: [
      { id: "A", text: "Gini becomes undefined" },
      { id: "B", text: "The test set is no longer a future, unseen patient, so the score flatters you" },
      { id: "C", text: "Trees cannot learn numeric features" },
      { id: "D", text: "Specificity becomes identical to sensitivity" },
    ],
    correct: "B",
    explanation:
      "The test row is not a new person in the future. Shared patients, and a test set that is not later in time, leak information across the cut. Split by patient and hold out the later arrivals.",
  },
  {
    id: "assay",
    prompt:
      "Hospital B's lactate assay reads 15% lower than hospital A's. You ship a threshold learned on A. What should you expect on B?",
    choices: [
      { id: "A", text: "The threshold still means the same physiology" },
      { id: "B", text: "Some patients who would have been flagged on A's assay are missed on B" },
      { id: "C", text: "Only categorical features are affected" },
      { id: "D", text: "Gini rescales the column automatically" },
    ],
    correct: "B",
    explanation:
      "A lactate of 2.2 on A is 1.87 on B. A cut at 2.0 flags one and misses the other. The impurity criterion does not know about the assay. Report metrics by site.",
  },
  {
    id: "small-leaf",
    prompt: "A leaf contains 2 patients, both positive, so the exported rule says p=1.00, n=2. What do you tell a clinician?",
    choices: [
      { id: "A", text: "The rule is a law. The denominator does not matter" },
      { id: "B", text: "The frequency is 1.00 and the denominator is 2, so it is a weak estimate" },
      { id: "C", text: "p=1.00 means the test-set specificity is perfect" },
      { id: "D", text: "Increase max_depth so the leaf can keep growing" },
    ],
    correct: "B",
    explanation:
      "Leaf frequency is a fraction. With n=2 it will swing to 0 or 1 by chance. Say the denominator. Raising depth makes more leaves this small, which is the opposite of the fix.",
  },
  {
    id: "mdi",
    prompt: "Mean decrease in impurity ranks a continuous lab above a binary history flag. What is a fair description?",
    choices: [
      { id: "A", text: "The lab is the cause of the outcome" },
      { id: "B", text: "The sum counts split opportunities, so a continuous column is offered more cuts. It is not a cause" },
      { id: "C", text: "Continuous features are invalid and should be dropped" },
      { id: "D", text: "Replace Gini with accuracy and the ranking becomes causal" },
    ],
    correct: "B",
    explanation:
      "MDI adds weighted impurity decrease. Columns with more candidate thresholds get more chances to contribute. Permutation importance is a better description of dependence, and neither one is a mechanism.",
  },
  {
    id: "sensitivity",
    prompt:
      "200 patients, 50 of whom deteriorated. The counts are TP 40, FP 30, TN 120, FN 10. What is the sensitivity?",
    choices: [
      { id: "A", text: "40/70" },
      { id: "B", text: "40/50" },
      { id: "C", text: "120/150" },
      { id: "D", text: "40/200" },
    ],
    correct: "B",
    explanation:
      "Sensitivity is true positives over everyone who deteriorated: 40/(40+10) = 40/50. 40/70 is the positive predictive value. 120/150 is the specificity.",
  },
  {
    id: "ppv",
    prompt: "Using the same counts (TP 40, FP 30, TN 120, FN 10), what is the positive predictive value?",
    choices: [
      { id: "A", text: "40/50" },
      { id: "B", text: "40/70" },
      { id: "C", text: "120/130" },
      { id: "D", text: "30/150" },
    ],
    correct: "B",
    explanation:
      "Positive predictive value is true positives over everyone you flagged: 40/(40+30) = 40/70. About 57% of alarms are the event, even though sensitivity and specificity are both 0.80.",
  },
  {
    id: "rare-ppv",
    prompt:
      "Prevalence is 2%, sensitivity is 0.80, and specificity is 0.80. What happens to the positive predictive value, relative to a case where those rates looked comfortable?",
    choices: [
      { id: "A", text: "It stays near 0.80" },
      { id: "B", text: "It falls to about 0.075, because most alarms are false when the event is rare" },
      { id: "C", text: "It becomes undefined" },
      { id: "D", text: "It equals the specificity" },
    ],
    correct: "B",
    explanation:
      "In 10,000 patients, 160 true positives and 1,960 false positives. PPV is 160/2120 ≈ 0.075. Sensitivity did not change. The ward lives with the 0.075.",
  },
  {
    id: "threshold",
    prompt:
      "Labels [1, 1, 0, 0], probabilities [0.9, 0.6, 0.6, 0.2]. You want the highest threshold whose sensitivity is still at least 1. What do you return?",
    choices: [
      { id: "A", text: "0.9" },
      { id: "B", text: "0.6" },
      { id: "C", text: "0.2" },
      { id: "D", text: "0.0" },
    ],
    correct: "B",
    explanation:
      "0.9 catches only one of the two positives, so sensitivity is 0.5. 0.6 catches both (and the other row that also has probability 0.6). 0.2 also catches both, but it is lower, so 0.6 wins. A row is positive when its probability is >= the threshold.",
  },
];

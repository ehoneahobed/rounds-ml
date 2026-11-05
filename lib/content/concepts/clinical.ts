import type { Concept } from "@/lib/content/types";

export const clinical: Concept[] = [
  {
    slug: "leakage",
    number: "09",
    title: "Leakage, time, and site",
    minutes: 45,
    summary: "Decision time, a screen for each column, and a split that keeps later arrivals together.",
    blocks: [
      {
        type: "p",
        text: "Leakage is training on a fact that did not exist at the moment the score would have been shown. The tree looks brilliant on the table and fails on the next real patient, because that fact will not be there yet. The decision time here is hour 6. Write that at the top of the work. Every column then has one question: could a person standing at hour 6 have known this value?",
      },
      {
        type: "h2",
        text: "Facts that arrive too late",
      },
      {
        type: "ul",
        items: [
          "Discharge disposition, including the word expired. It is how the stay ended.",
          "Death in hospital, length of stay, and a move to intensive care on day two.",
          "A lactate drawn at hour 30. The name lactate is not enough. The clock on the measurement is the column.",
          "The label itself, stored under another header.",
          "A note that goals of care were discussed the night before a death. Text leaks the same way, more quietly.",
          "Any summary whose window runs past hour 6: medications counted at discharge, the highest lactate of the whole stay, a count of intensive-care hours.",
          "A word such as a ward name replaced by the average label of patients on that ward, when the average used the whole table. The code for the ward then contains future patients' labels.",
          "Identifiers. A patient id is not a risk factor. With a deep tree and a unique id, each patient can get a private leaf.",
        ],
      },
      {
        type: "p",
        text: "A sepsis label often looks forward across a window of organ-failure scores. If the features are measured inside that same window, the tree is predicting the label with the ingredients of the label. Ask where the label's clock starts before you trust the column.",
      },
      {
        type: "h2",
        text: "A screen for each column",
      },
      {
        type: "p",
        text: "leakage_report reads a list of columns. Each column has a name, an available_hour, and a role. The role is feature, label, or identifier. The first matching reason wins. Clean columns are left out of the report. The order of the input is kept.",
      },
      {
        type: "ol",
        items: [
          "label, if the role is label.",
          "identifier, if the role is identifier.",
          "temporal_leak, if available_hour is greater than 6. Hour 6 itself is legal. The value existed at the decision time.",
          "name_leak, if the lowercased name contains any of: discharge, death, mortal, expired, icu_transfer, future_, day2, outcome, los_.",
          "unknown_time, if a feature has no recorded hour. A missing clock is a question for a person. The screen flags it.",
        ],
      },
      {
        type: "p",
        text: "A suspicious name at hour 6 is still a name leak. Someone may have recorded the hour wrong, and the name is the backstop. A late hour outranks a bad name, because the clock is the sharper fact. The screen will not catch a column called lab_result_b that is secretly tomorrow's creatinine. You still have to know what you extracted.",
      },
      {
        type: "h2",
        text: "Who the tree is tested on",
      },
      {
        type: "p",
        text: "A random shuffle of rows puts hour 5 and hour 6 of the same patient on opposite sides, and it puts next week's patients into the training set. The test rows are then not new people in the future. The score looks better than it is. Keep every row of a patient on the same side, and make the test patients the ones who arrived later.",
      },
      {
        type: "p",
        text: "patient_temporal_split dates each patient by their earliest timestamp. Patients are ordered by that time, and by patient id as a string when the times match. The last slice is the test set. Its size is the fraction times the number of patients, rounded up, and then clamped so it is at least 1 and at most one less than the number of patients. Every row of a patient stays together, in the original order. A patient whose first row is in January and whose second row is in March stays in training if the January row is early. The March row must not drag them into the test. Timestamps are strings with zeros padded so that alphabetical order is chronological order. Fewer than two patients, or a fraction outside the open range from 0 to 1, raises ValueError.",
      },
      {
        type: "p",
        text: "This table is one row per admission, so keeping patients together and keeping rows together land in the same place. The function is still written by patient. Serial vitals are several rows for one person, and a later row of that person must stay with the earlier ones.",
      },
      {
        type: "h2",
        text: "The same blood, a different machine",
      },
      {
        type: "p",
        text: "Suppose the tree learned on hospital A flags deterioration when lactate is above 2.0. Hospital B's assay, the machine that measures lactate, reads 15% lower. The same blood produces a smaller number.",
      },
      {
        type: "table",
        caption: "A line at 2.0 learned on hospital A, applied to B's readings.",
        headers: ["Patient", "Lactate on A", "Reading on B", "Deteriorated", "Flagged on A", "Flagged on B"],
        rows: [
          ["1", "1.2", "1.02", "0", "no", "no"],
          ["2", "1.8", "1.53", "0", "no", "no"],
          ["3", "2.2", "1.87", "1", "yes", "no"],
          ["4", "2.5", "2.125", "1", "yes", "yes"],
          ["5", "3.0", "2.55", "1", "yes", "yes"],
          ["6", "4.0", "3.40", "1", "yes", "yes"],
        ],
      },
      {
        type: "p",
        text: "On A, all 4 of the patients who deteriorated were flagged. On B, 3 of those 4 were flagged. Patient 3's true lactate is 2.2, which is above 2.0, but B's machine reports 1.87 and the flag is missed. Nothing about the patient changed. Gini does not rescale a column. If you train on several hospitals, either put each site's numbers on a common scale using that site's training patients only, or accept that one shared line is a compromise. Report the results by hospital either way. The hospital id stays out of the features. You can still group the results by it.",
      },
    ],
  },
  {
    slug: "rules",
    number: "10",
    title: "Rules a clinician can read",
    minutes: 35,
    summary: "One sentence per leaf, with the denominator, and what an importance bar is counting.",
    blocks: [
      {
        type: "p",
        text: "On a ward, the useful output of a shallow tree is often the sentence for a leaf, not a bare probability. export_paths walks the tree depth-first: finish the whole left side before the right side. It writes one sentence per leaf.",
      },
      {
        type: "code",
        code: "if lactate > 1.80 AND age > 64.50 then 1 (p=1.00, n=2)",
      },
      {
        type: "p",
        text: "Read that sentence as: among training patients with lactate above 1.80 and age above 64.50, both of the two deteriorated. p is the share of the predicted class, printed to two decimals. n is how many training patients the leaf rests on. Say n. A frequency of 1.00 from two patients is a weak estimate. It will swing if one of those patients had gone the other way.",
      },
      {
        type: "p",
        text: "The written conditions use `<=` for a left branch and `>` for a right branch. Numbers are printed to two decimal places and joined by ` AND `. A tree that never split has the condition True. The list of feature names must have one name per column the tree was fit on. Exporting before fit is an error.",
      },
      {
        type: "paths",
      },
      {
        type: "p",
        text: "A limit on depth is also a limit on what a person can read aloud. If you cannot imagine saying the leaf to a colleague, the tree has more questions than this use can carry.",
      },
      {
        type: "h2",
        text: "What an importance bar is adding up",
      },
      {
        type: "p",
        text: "Mean decrease in impurity adds, for each feature, the impurity that fell at questions using that feature. Each question is weighted by the fraction of training rows that reached it. On the teaching tree the root gain is 0.125, and that question is lactate, so lactate contributes 0.125. The age question gains 0.5, but only 4 of the 8 rows reach it, so age contributes \\(0.5 \\times 4/8 = 0.25\\). Divide each by the total 0.375 and lactate is one third, age is two thirds. The first question is not the largest contributor. Age's question cleaned its group more.",
      },
      {
        type: "p",
        text: "The sum gives extra chances to a column with many possible numbers. Lactate can be cut in many places. A yes/no history flag can be cut in one place. A patient id left in the table can isolate every row and soak up the sum. Permutation importance is a second description: shuffle that column on patients the tree did not train on, and see how much the score drops. Both numbers describe a dependence. Neither one is a cause. A bar chart of them is not a mechanism.",
      },
      {
        type: "callout",
        tone: "practice",
        title: "A sentence you can actually say",
        text: "This score sorts patients using lactate, respiratory rate, age, and blood pressure measured by hour 6. The alarm line was chosen so that, on past training patients, about 80% of those who later deteriorated were flagged. It is not a diagnosis. The leaves are frequencies with denominators. It has not been shown to change what a ward should do.",
      },
    ],
  },
  {
    slug: "metrics",
    number: "11",
    title: "Metrics that change a decision",
    minutes: 45,
    summary: "Of those who deteriorate, how many you flag, and of the alarms, how many are real.",
    blocks: [
      {
        type: "p",
        text: "Accuracy is the fraction of patients the score gets right. It is a poor headline when the event is uncommon. If 20% of patients deteriorate, a score that never alarms is 80% accurate and finds nobody. Two questions matter more. Of the people who deteriorate, how many do you flag? Of the people you flag, how many were going to deteriorate?",
      },
      {
        type: "h2",
        text: "Four counts",
      },
      {
        type: "p",
        text: "Flag a patient when the leaf's probability of deterioration is at or above a chosen line. That line is the threshold. On 200 patients, 50 of whom deteriorated, suppose you flag 70 people. Of those 70, 40 really deteriorated and 30 did not. Of the 130 you left alone, 120 really did not deteriorate and 10 did.",
      },
      {
        type: "ul",
        items: [
          "A true positive is a person who deteriorated and was flagged. There are 40.",
          "A false positive is a person who did not deteriorate and was flagged. There are 30.",
          "A true negative is a person who did not deteriorate and was left alone. There are 120.",
          "A false negative is a person who deteriorated and was left alone. There are 10.",
          "Sensitivity is true positives divided by everyone who deteriorated: 40/50 = 0.80.",
          "Specificity is true negatives divided by everyone who did not deteriorate: 120/150 = 0.80.",
          "Positive predictive value is true positives divided by everyone you flagged: 40/70, about 0.57.",
          "Negative predictive value is true negatives divided by everyone you left alone: 120/130, about 0.92.",
        ],
      },
      {
        type: "p",
        text: "When a denominator is 0, the rate is defined as 0. F1 combines the true positives with the two kinds of mistakes that touch them: \\(2 \\times tp / (2 \\times tp + fp + fn)\\), and 0 when that denominator is 0. Use the raw counts. Brier score is the average of \\((p - y)^2\\), where p is the predicted probability and y is the true 0 or 1. A confident wrong leaf is punished hard. A hard 0-or-1 prediction can look fine on sensitivity and ugly on Brier. Report both.",
      },
      {
        type: "h2",
        text: "A rare event changes what the alarms feel like",
      },
      {
        type: "p",
        text: "Keep sensitivity and specificity at 0.80 and drop the share of patients who deteriorate to 2%. In 10,000 patients there are 200 who deteriorate. True positives: 160. False negatives: 40. True negatives: 7,840. False positives: 1,960. The positive predictive value is \\(160/2120\\), about 0.075. About 7 or 8 alarms in 100 are the event. Sensitivity did not move. The ward lives with the 0.075.",
      },
      {
        type: "bench",
        which: "confusion",
      },
      {
        type: "h2",
        text: "The threshold is a choice",
      },
      {
        type: "p",
        text: "Missing a deterioration and raising a false alarm do not cost the same, until the alarms are so common that people ignore them. threshold_for_sensitivity returns the highest threshold whose sensitivity is still at least the target you named. Highest, so you flag as few extra people as you can while still meeting the target. The candidates are the distinct probabilities the model produced, plus 0 and 1. If none of them meets the target, return 0.",
      },
      {
        type: "reveal",
        title: "Pause and compute",
        prompt: "Labels [1, 1, 0, 0], probabilities [0.9, 0.6, 0.6, 0.2], target sensitivity 1. Which threshold do you return?",
        answer: "0.6. A threshold of 0.9 flags only the first of the two people who deteriorated, so sensitivity is 0.5. A threshold of 0.6 flags both of them, and also the person with label 0 whose probability is 0.6. A threshold of 0.2 also flags both, but it is lower, so 0.6 wins. A probability equal to the threshold is flagged.",
      },
      {
        type: "p",
        text: "Choose that threshold on the training patients, or on a slice you set aside for the choice, and then freeze it. Choosing it on the test patients makes the test report look better than a frozen line would. The hour-6 check rebuilds the threshold from the training probabilities.",
      },
      {
        type: "p",
        text: "ROC-AUC compresses the ranking of patients across every threshold into one number. It can look calm when the event is rare, because the many true negatives dominate the picture. Average precision follows the positive predictive value as the threshold moves, so it notices when alarms are mostly false. A table by hospital and by age band shows a failure that one hospital-wide number hid.",
      },
    ],
  },
  {
    slug: "shipping",
    number: "12",
    title: "What you would actually hand over",
    minutes: 25,
    summary: "The hour-6 score as a review a colleague can read.",
    blocks: [
      {
        type: "p",
        text: "The hour-6 score is one function on the made-up admissions. The pattern in that table is a shallow set of questions on lactate, respiratory rate, age, and blood pressure, plus noise, plus columns that predict the label because they happen later. A correct tree, a correct hold-out of later patients, and a refusal to touch those columns is the score. A model that uses death in hospital looks stronger and fails the review.",
      },
      {
        type: "h2",
        text: "What you would put in front of a reviewer",
      },
      {
        type: "ol",
        items: [
          "Decision time: hour 6. The list of columns and the hour each one becomes knowable.",
          "The columns you refused, by name, including identifiers and the label.",
          "The patient-time split. Training is 75% of patients. The test patients are the latest arrivals.",
          "The tree: depth at most 4, leaves of at least 10 training rows, Gini, numeric features only.",
          "The threshold, chosen on the training rows so sensitivity is 0.80, then frozen.",
          "Sensitivity and specificity on the later arrivals. The bar there is 0.75 and 0.50. The training target stays 0.80.",
          "One way the score fails, in plain language. An assay that reads low, a leaf of two patients, a leaked column you almost used, or a ward where deterioration is rarer than in this table.",
        ],
      },
      {
        type: "p",
        text: "The ward note on this site is that review, written by you and stored only in this browser. Writing the decision time down is the habit.",
      },
      {
        type: "h2",
        text: "Checks that keep the rules from drifting",
      },
      {
        type: "p",
        text: "Gini on a pure node, on a half-and-half node, and on a three-and-one node. A tie between two thresholds that resolves to the lower number. A column whose hour is late and whose name is also bad, so you know the late hour wins. A patient whose later row does not pull them into the test set. Counts whose sensitivity is 40/50 and whose positive predictive value is 40/70. Those checks keep a rewrite of the tree from silently changing the rules.",
      },
      {
        type: "h2",
        text: "Many trees, the same question",
      },
      {
        type: "p",
        text: "A random forest grows many trees. Each tree sees a reshuffled sample of the rows and a random handful of the columns, and the forest averages their votes. The average is steadier than one tree. You can no longer read a single path. Gradient boosting, the family behind XGBoost and LightGBM, fits the next tree to what the current trees still get wrong. It is the usual strong score on a clinical table. Every tree in that pile still asks whether a column is at or below a number, still memorizes a leaked column, and still needs a threshold chosen off the patients you are reporting.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "Real charts do not belong in a side project",
        text: "This table is generated. A real extract is governed by HIPAA, the US law for medical records, and often by an IRB, the committee that approves research on people. Do not paste a row from a job, a placement, or a dump that looks public into a notebook you do not control. An identifier in the feature table is a modeling bug and, on real data, a privacy bug. If a score might influence care, the clinical and compliance owners decide whether it is allowed to.",
      },
    ],
  },
];

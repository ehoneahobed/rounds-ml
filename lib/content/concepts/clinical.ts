import type { Concept } from "@/lib/content/types";

export const clinical: Concept[] = [
  {
    slug: "leakage",
    number: "09",
    title: "Leakage, time, and site",
    minutes: 45,
    summary: "Decision time, the column screen, and a split that keeps the future in the test set.",
    blocks: [
      {
        type: "p",
        text: "The expensive bug in a clinical tree is not a wrong Gini formula. It is training on a fact that did not exist when the score would have been shown. The decision time in this module is hour 6 of the admission. Write that at the top of the work. Every column then has to answer a dull question: was this value knowable at hour 6?",
      },
      {
        type: "h2",
        text: "Columns that feel clever and are not",
      },
      {
        type: "ul",
        items: [
          "Discharge disposition, including 'expired'. It is how the stay ended.",
          "`death_in_hospital`, length of stay, an ICU transfer that happens on day two.",
          "A lactate drawn at hour 30. The name `lactate` is not enough. The timestamp is the column.",
          "The label itself, under another header.",
          "A note that says goals of care were discussed the night before a death. Text models leak this way even more quietly.",
          "Any aggregate whose window extends past hour 6: medications counted at discharge, a maximum lactate over the whole stay, a count of ICU hours.",
          "A category replaced by the average label of rows in that category, when the average was computed on the whole table. The code for 'ward 4 east' then contains the future patients' labels.",
          "Identifiers. `patient_id` is not a risk factor. With a deep tree and a unique id, it is a memorization key.",
        ],
      },
      {
        type: "p",
        text: "A sepsis label often looks forward across a window of organ-failure scores. If your features are measured inside that same window, the model is predicting the label with the ingredients of the label. Ask where the label's clock starts before you trust the column.",
      },
      {
        type: "h2",
        text: "The screen you will code",
      },
      {
        type: "p",
        text: "`leakage_report` takes a registry of columns, each with `name`, `available_hour`, and `role`. Role is `feature`, `label`, or `identifier`. The first matching reason wins, and clean columns are omitted. Order of the input is preserved.",
      },
      {
        type: "ol",
        items: [
          "`label` if the role is label.",
          "`identifier` if the role is identifier.",
          "`temporal_leak` if `available_hour` is greater than 6. Hour 6 itself is legal.",
          "`name_leak` if the lowercased name contains any of: `discharge`, `death`, `mortal`, `expired`, `icu_transfer`, `future_`, `day2`, `outcome`, `los_`.",
          "`unknown_time` if a feature has no recorded hour. An unknown clock is not a clean column. It is a question for a human, and the automatic screen flags it.",
        ],
      },
      {
        type: "p",
        text: "A bad name at hour 6 is still a name leak: someone recorded the hour wrong, and the name is the backstop. A late hour outranks a bad name, because the timestamp is the sharper fact. The screen is a spec, not a substitute for reading the data dictionary. It will not catch a column called `lab_result_b` that is secretly tomorrow's creatinine. You still have to know what you extracted.",
      },
      {
        type: "h2",
        text: "Random rows are the wrong test",
      },
      {
        type: "p",
        text: "A random split of rows puts hour 5 and hour 6 of the same patient on opposite sides, and it puts next week's patients in the training set. The score flatters you. Split by patient, and cut time so the test patients are the ones who arrived later.",
      },
      {
        type: "p",
        text: "`patient_temporal_split` dates each patient by their earliest timestamp. Patients are ordered by that timestamp, then by patient id as a string. The last `ceil(fraction * n)` patients, at least one and at most n−1, are the test set. Every row of a patient stays together, in the original order. A patient whose first row is in January and whose second row is in March stays in the training set if their first row is early. The March row must not drag them into the test. Timestamps are zero-padded strings that sort chronologically. Fewer than two patients, or a fraction outside (0, 1), is a `ValueError`.",
      },
      {
        type: "p",
        text: "The early-warning cohort is one row per admission, so the patient rule and a row rule coincide. The function is still written by patient, because the next extract you see will have serial vitals, and you do not want to rewrite the split under pressure.",
      },
      {
        type: "h2",
        text: "An assay is a site shift",
      },
      {
        type: "p",
        text: "Suppose the tree learned on hospital A flags deterioration when lactate is above 2.0. Hospital B's assay reads 15% lower. The same blood, a different number:",
      },
      {
        type: "table",
        caption: "A threshold of 2.0 learned on hospital A, applied to B's readings.",
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
        text: "Sensitivity goes from 4/4 to 3/4. Nothing about the patient changed. Gini does not correct a scale. If you train on several hospitals, either standardize within site using training-site statistics only, or accept that a shared threshold is a compromise, and always report the metrics by hospital. The project forbids `hospital_id` as a feature and still expects you to be able to group by it.",
      },
    ],
  },
  {
    slug: "rules",
    number: "10",
    title: "Rules a clinician can read",
    minutes: 35,
    summary: "Path strings, denominators, and why the root feature is not automatically the cause.",
    blocks: [
      {
        type: "p",
        text: "On a ward, the useful output of a shallow tree is often the path, not a floating probability. `export_paths` walks depth-first, left child before right, and emits one string per leaf:",
      },
      {
        type: "code",
        code: "if lactate > 1.80 AND age > 64.50 then 1 (p=1.00, n=2)",
      },
      {
        type: "p",
        text: "Conditions use `<=` on the left and `>` on the right, thresholds printed to two decimal places, joined by ` AND `. `p` is the frequency of the predicted class, also to two decimals. A tree that never split has the condition `True`. The feature-name list must have one name per fitted column. Exporting before fit is an error.",
      },
      {
        type: "paths",
      },
      {
        type: "p",
        text: "Read the last rule to a colleague as: among patients with lactate above 1.80 and age above 64.50, both of the two training patients deteriorated. The denominator is 2. Say it. A depth limit is also a reading limit. If you cannot imagine saying the leaf out loud, the tree is too large for the use you have in mind.",
      },
      {
        type: "h2",
        text: "Importance is an accounting identity",
      },
      {
        type: "p",
        text: "Mean decrease in impurity adds up, for each feature, the impurity reduction at nodes that split on it, weighted by the fraction of training rows that reached that node. On the teaching tree the root gain is 0.125, all of it lactate, and the child gain of 0.5 is age, but only half the rows reach that child. So lactate contributes \\(0.125\\) and age contributes \\(0.5 \\times 4/8 = 0.25\\). Normalized, lactate is one third and age is two thirds. The root feature is not the most important feature by this accounting. Age's split was cleaner.",
      },
      {
        type: "p",
        text: "That sum is biased toward columns that are offered more cuts. A continuous lactate gets many thresholds. A binary history flag gets one. A raw patient identifier, if you failed to drop it, can isolate every row and soak up the sum. None of this is a cause. Permutation importance is the more honest descriptive check: shuffle the column on patients the tree did not train on, and see how much the metric drops. It is still not a cause. It is a dependence. You will not code either importance in the tasks. You will be asked not to narrate a bar chart as a mechanism.",
      },
      {
        type: "callout",
        tone: "practice",
        title: "A sentence you can actually say",
        text: "This score sorts patients using lactate, respiratory rate, age, and blood pressure measured by hour 6. The alarm threshold was chosen so that, on past training patients, about 80% of those who later deteriorated were flagged. It is not a diagnosis, the leaves are frequencies with denominators, and it has not been shown to change what a ward should do.",
      },
    ],
  },
  {
    slug: "metrics",
    number: "11",
    title: "Metrics that change a decision",
    minutes: 45,
    summary: "Sensitivity, the positive predictive value under rarity, and where the threshold is chosen.",
    blocks: [
      {
        type: "p",
        text: "Accuracy is the wrong headline as soon as the event is uncommon. If 20% of patients deteriorate, a model that never alarms is 80% accurate and finds nobody. The early-warning question is closer to: of the people who deteriorate, how many do we flag, and of the people we flag, how many were going to deteriorate?",
      },
      {
        type: "h2",
        text: "Four counts",
      },
      {
        type: "p",
        text: "Predict positive when the probability is greater than or equal to the threshold. On 200 patients, 50 of whom deteriorated, suppose the counts are 40 true positives, 30 false positives, 120 true negatives, and 10 false negatives.",
      },
      {
        type: "ul",
        items: [
          "Sensitivity = 40/50 = 0.80. Of the people who deteriorated, the fraction flagged.",
          "Specificity = 120/150 = 0.80. Of the people who did not, the fraction left alone.",
          "Positive predictive value = 40/70 ≈ 0.57. Of the alarms, the fraction who deteriorated.",
          "Negative predictive value = 120/130 ≈ 0.92. Of the people left alone, the fraction who did not deteriorate.",
        ],
      },
      {
        type: "p",
        text: "When a denominator is 0, this module defines the rate as 0. F1 is \\(2 \\cdot tp / (2 \\cdot tp + fp + fn)\\), and 0 when that denominator is 0. Do not round the counts into the formula. Brier score is the mean squared error of the probabilities, \\(\\mathrm{mean}((p - y)^2)\\). A confident wrong leaf is punished. A hard 0/1 prediction can look fine on sensitivity and ugly on Brier, or the reverse. Report both.",
      },
      {
        type: "h2",
        text: "Rarity collapses the positive predictive value",
      },
      {
        type: "p",
        text: "Keep sensitivity and specificity at 0.80 and drop the prevalence to 2%. In 10,000 patients there are 200 positives. True positives: 160. False negatives: 40. True negatives: 7,840. False positives: 1,960. The positive predictive value is \\(160/2120 \\approx 0.075\\). About 7 or 8 alarms in 100 are the event. Sensitivity did not move. The ward experiences the 0.075, not the 0.80. This is the conversation that matters for any screening-style score, and it is why a single accuracy number should make you suspicious.",
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
        text: "Missing a deterioration and raising a false alarm are not symmetric, up to the point where alarms are ignored. `threshold_for_sensitivity` takes the highest threshold whose sensitivity is still at least the target. Highest, so you keep every negative you can while meeting the target. Candidates are the unique probabilities, plus 0 and 1. If no candidate qualifies, return 0.",
      },
      {
        type: "reveal",
        title: "Pause and compute",
        prompt: "Labels [1, 1, 0, 0], probabilities [0.9, 0.6, 0.6, 0.2], target sensitivity 1. Which threshold do you return?",
        answer: "0.6. A threshold of 0.9 catches only the first positive, sensitivity 0.5. A threshold of 0.6 catches both positives (and one negative). A threshold of 0.2 also catches both, but it is lower, so it loses. Using >= means the row whose probability equals 0.6 is flagged.",
      },
      {
        type: "p",
        text: "Choose that threshold on the training patients, or on a validation slice, and freeze it. Choosing it on the test patients flatters the test report. The early-warning checker recomputes the threshold from your model's training probabilities and rejects a number that was tuned on the future slice.",
      },
      {
        type: "p",
        text: "Two plots you should recognize when you meet them, and that you will not implement here. ROC-AUC summarizes the ranking across thresholds and can look calm when the event is rare. Average precision summarizes the precision-recall curve and moves when the positive predictive value moves. A subgroup table, by hospital and by age band, will show a failure that the average hid. One number for the whole hospital is not a safety argument.",
      },
    ],
  },
  {
    slug: "shipping",
    number: "12",
    title: "What you would actually hand over",
    minutes: 25,
    summary: "The early-warning project as a review, and the habits that survive contact with boosting.",
    blocks: [
      {
        type: "p",
        text: "The last task is the whole module in one function. You are not hunting for a clever feature. The signal in the synthetic cohort is a shallow set of cuts on lactate, respiratory rate, age, and blood pressure, with noise, plus columns that predict the label because they happen later. A correct tree, a correct split, and a refusal to touch those columns is the pass. A model that uses `death_in_hospital` will look stronger and fail the review.",
      },
      {
        type: "h2",
        text: "What you would put in front of a reviewer",
      },
      {
        type: "ol",
        items: [
          "Decision time: hour 6. The dictionary of columns and the hour each one becomes knowable.",
          "The columns you refused, by name, including identifiers and the label.",
          "The patient-time split, training fraction 75%, test patients the latest arrivals.",
          "The tree: depth at most 4, leaves at least 10 training rows, Gini, numeric features only.",
          "The threshold, chosen on the training rows for sensitivity 0.80, then frozen.",
          "Future-slice sensitivity and specificity. The bar in the checker is 0.75 and 0.50, because the next slice will not match the training slice exactly. The training target stays 0.80.",
          "One failure mode in plain language. Assay shift, a small leaf, a leaked column you almost used, a prevalence lower than this enriched cohort.",
        ],
      },
      {
        type: "p",
        text: "The ward note on this site is that review, written by you, stored only in this browser. It is not graded by a hidden model. It is the habit of writing the decision time down.",
      },
      {
        type: "h2",
        text: "Tests that belong next to the model",
      },
      {
        type: "p",
        text: "Impurity on a pure node, a fair node, and a 3/1 node. A threshold tie that resolves to the lower cut. A leakage case where the hour is late and the name is also bad, so you know which reason wins. A patient whose later row does not pull them into the test. A confusion matrix whose sensitivity is 40/50 and whose positive predictive value is 40/70. If those tests exist, a refactor of the tree cannot silently change the contract.",
      },
      {
        type: "h2",
        text: "The next models, without faking that you have built them",
      },
      {
        type: "p",
        text: "A random forest averages deep trees grown on resampled rows and random subsets of columns. The variance drops. The paths get harder to read. Gradient boosting, the family behind XGBoost and LightGBM, fits each new tree to the residual of the current ensemble. It is the usual strong baseline on a clinical table. Every tree in that ensemble still asks `feature <= threshold`, still memorizes a leaked column, and still needs a threshold chosen off the test set. Nothing you practiced here becomes optional when the import changes from a single tree to a booster.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "Real charts do not belong in a side project",
        text: "This cohort is generated. A real extract is governed by HIPAA and, often, an IRB. Do not paste a row from a job, a placement, or a public-looking dump into a notebook you do not control. An identifier in the feature matrix is both a modeling bug and, on real data, a privacy bug. If a score might influence care, the clinical and compliance owners decide whether it is allowed to. That is not a determination this module can make.",
      },
      {
        type: "p",
        text: "The knowledge check is next, then the tasks. The check asks for the gain, the tie, the leaked column, and the threshold. The tasks ask you to code them.",
      },
    ],
  },
];

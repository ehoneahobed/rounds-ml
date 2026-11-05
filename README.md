# Rounds

Rounds is a practical machine-learning project, shaped like a software-engineering studio: concept pages, a knowledge check, then tasks that a checker grades. This module is **decision trees**, taught as the thing a healthcare machine-learning engineer actually builds first: a shallow, readable model on tabular clinical data, with the leakage and the metric choices written down.

The worked example is an early-warning tree. At hour 6 of an admission, predict whether the patient deteriorates later in the stay from vitals and labs that have already resulted. The admissions are synthetic.

Study time for the module is about **18 hours**: the concept pages, a one-hour knowledge check, and the tasks. The tree itself is the long piece.

## How to study it

1. Read the concept pages from the project home, in order. The lab at `/lab` is the same eight-patient tree, as a table you can turn: first the patients, then the lactate wall, then the age wall, then a patient you slide through the questions. Mark each page read when you could explain it to someone else.
2. Take the knowledge check. Sixteen questions, pass at 13. You can retake it. The module keeps your best score, in this browser only.
3. Do the tasks from 0 to 10. Each one has a contract, a starter, and an auto review. The sample input in the brief is public. The checker also runs cases you do not see.
4. Write the ward note: which columns you refused, where the threshold came from, and one way the tree fails on a real ward.

Progress and drafts live in `localStorage` on this origin. Clearing site data resets the module. Nothing is uploaded.

Try the tasks before you open `curriculum/reference_solution.py`. That file is the answer key the checkers were written against. Reading it first turns the module into a transcription exercise.

## Run it locally

You need Node.js 20 or newer and Python 3.11 or newer (the curriculum tests use the standard library only).

```bash
npm install
npm run dev
```

The dev server listens on [http://127.0.0.1:3457](http://127.0.0.1:3457).

```bash
npm run lint          # ESLint
npx tsc --noEmit      # TypeScript
npm run test:curriculum
npm run build
npm start             # production server, same port
```

The first time you press **Run checks**, the browser downloads Pyodide (about 10 MB) from jsDelivr and caches it. Later runs reuse that cache. Checks do not need a Python process on the server.

## What the checker actually does

Each task page owns a Web Worker (`public/pyodide-worker.js`) running Pyodide 0.29. Your editor text is executed in that worker, then `public/grader/harness.py` runs the matching file in `public/grader/tests/`. The worker returns JSON: a status, any traceback, captured stdout, and one line per check.

A task passes only when every check passes. A later failing run removes the pass. A timeout does not: the worker is killed and restarted, and the previous pass stays until a completed run says otherwise.

Task 10 prepends the drafts you saved for earlier tasks, so `train_early_warning` can call the tree, the split, and the metrics you wrote. The checker does not trust a number you print. It walks `model.root`, refits the official split itself, and scores cohort A (seed 7, shown) and cohort B (seed 11, not shown) against a sensitivity of at least 0.75 and a specificity of at least 0.50. Hard-coding rows will not pass.

There is no scikit-learn in the grader. Importing it fails the check on purpose.

## The contract, short version

These are the rules the pages, the starters, and the checkers share. The concept pages derive them; this is the index.

**Impurity.** Gini is \(1 - \sum p_k^2\). Entropy is in bits, and \(0 \log 0 = 0\). An empty node is 0.

**Gain.** Parent impurity minus the size-weighted impurity of the two children. An empty parent or an empty child is gain 0. The criterion is `gini` or `entropy`.

**Numeric splits.** Sort the column. A cut exists only between adjacent values that differ, and the threshold is their midpoint. `value <= threshold` goes left. If two cuts tie within `1e-12`, the lower feature index wins, then the lower threshold. No positive gain returns `(nan, 0.0)`.

**The tree.** Root depth is 0. Stop when depth is at least `max_depth`, when either child would have fewer than `min_samples_leaf` rows, or when the gain is not strictly positive and at least `min_impurity_decrease`. A tied majority predicts the smaller label. `classes_` is sorted. XOR never splits, because every cut has gain 0.

**Paths.** Depth-first, left then right: `if lactate <= 1.80 AND age > 64.50 then 1 (p=1.00, n=2)`. Thresholds and probabilities print with two decimals.

**Regression.** Variance divides by \(n\), not \(n-1\). The same midpoint and tie rules apply.

**Leakage at hour 6.** A column is illegal, in this order, when it is the label, an identifier, a measurement from after hour 6, a name that leaks the outcome (`discharge`, `death`, `mortal`, `expired`, `icu_transfer`, `future_`, `day2`, `outcome`, `los_`), or when its hour is unknown. Hour 6 itself is legal. The first reason wins.

**Patient split.** Date a patient by their earliest timestamp. Sort by time, then by id. Keep every row of a patient together, in the original order. The test fraction is in `(0, 1)`, and there must be at least two patients.

**Clinical metrics.** A probability at or above the threshold is a positive call. Sensitivity, specificity, PPV, NPV, F1, and Brier score. A rate whose denominator is 0 is 0. `threshold_for_sensitivity` returns the highest threshold that still meets the target sensitivity, or 0 if none does.

**Early warning.** Fit only `age`, `sex`, `hr`, `sbp`, `rr`, `temp`, `spo2`, `lactate`, `creatinine`, `wbc`, `diabetes`, and `heart_failure`. The depth cap is 4. The leaf size is at least 10. The threshold is chosen on the training probabilities for class 1, at a sensitivity target of 0.80. Patients are split in time, with a test fraction of 0.25, and the tree is fit on the training side only.

## Repository map

| Path | What it is |
| --- | --- |
| `app/` | Next.js routes: the project, concept pages, the quiz, each task, the ward note |
| `components/` | The shell, the article renderer, the editor, the quiz, the task workspace |
| `lib/content/` | The concept prose, the quiz, the task briefs, and the starters |
| `lib/progress.ts` | Browser-local progress |
| `lib/python-checker.ts` | The worker client and its timeout |
| `public/grader/` | The harness and the checkers the browser loads |
| `public/data/` | Synthetic cohort A and cohort B |
| `curriculum/reference_solution.py` | The answer key. Do this last |
| `curriculum/cohort.py` | The generator for the two cohorts |
| `curriculum/figures.py` | The numbers drawn on the concept pages |
| `curriculum/test_solution.py` | Runs the answer key through every checker |
| `data/figures.json` | Frozen output of `python3 -m curriculum.figures` |

## Adding the next module

This repository is one module on purpose. A later module (forests, then boosting) should follow the same shape rather than grow a platform:

1. Add concept pages and a quiz under `lib/content/`.
2. Add starters, task briefs, and a checker file per task.
3. Extend `curriculum/reference_solution.py` and `curriculum/test_solution.py` so the new checkers pass against the answer key before any UI work.
4. Point a new route group at that content. Keep grading in the browser. Do not add a server that executes student code.

Forests and boosting are the natural next two modules. A single tree is the right first one: you can read every split, and the failure modes (a site column, a discharge disposition, a threshold chosen on the test set) are the same failure modes the later models hide.

## Data

Both cohorts are generated by `curriculum/cohort.py` and checked in. Seed 7 is cohort A. Seed 11 is cohort B. Do not regenerate them casually: other seeds can fall under the early-warning bar, and the concept-page figures are locked to the teaching tree in `curriculum/figures.py`.

The prevalence is enriched, about two in five admissions, so a shallow tree has a cut you can see. A real ward is rarer. The metrics page shows what that does to positive predictive value.

Regenerating, if you have changed the generator and you mean to:

```bash
python3 -m curriculum.cohort
python3 -m curriculum.figures
python3 -m unittest curriculum.test_solution
```

## Privacy

Use synthetic rows, or a dataset you already have a right to use. A real chart extract needs an IRB or the equivalent approval, a data-use agreement, and a machine that is allowed to hold it. This app has no account, no database, and no place to upload a file. Student code runs in the browser, not on the server.

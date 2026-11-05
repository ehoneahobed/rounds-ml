/**
 * Bench math for the concept pages.
 *
 * These match the module contracts: Gini is \(1 - \sum p^2\), entropy is in
 * bits with \(0 \log 0 = 0\), and a rate whose denominator is 0 is defined as 0.
 */

export type Counts = {
  positive: number;
  negative: number;
};

export type Rates = {
  sensitivity: number;
  specificity: number;
  ppv: number;
  npv: number;
  accuracy: number;
  prevalence: number;
  total: number;
};

function isCount(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

/**
 * True when the two children are a real split of the parent.
 * Positive and negative counts each have to add up. A gain computed from
 * any other counts is not a split the tree could have made.
 */
export function countsPartition(parent: Counts, left: Counts, right: Counts): boolean {
  if (![parent, left, right].every((counts) => isCount(counts.positive) && isCount(counts.negative))) return false;
  return parent.positive === left.positive + right.positive && parent.negative === left.negative + right.negative;
}

/** Gini impurity of a two-class node. Returns null when the counts are not usable. */
export function giniFromCounts(counts: Counts): number | null {
  if (!isCount(counts.positive) || !isCount(counts.negative)) return null;
  const total = counts.positive + counts.negative;
  if (total === 0) return 0;
  const positive = counts.positive / total;
  const negative = counts.negative / total;
  return 1 - (positive * positive + negative * negative);
}

/** Base-2 entropy of a two-class node. Returns null when the counts are not usable. */
export function entropyFromCounts(counts: Counts): number | null {
  if (!isCount(counts.positive) || !isCount(counts.negative)) return null;
  const total = counts.positive + counts.negative;
  if (total === 0) return 0;
  const term = (count: number): number => {
    if (count === 0) return 0;
    const proportion = count / total;
    return -proportion * Math.log2(proportion);
  };
  return term(counts.positive) + term(counts.negative);
}

/**
 * Size-weighted Gini gain. Null when any node is unusable.
 * An empty child is not a split, so the gain is 0 when a child has no rows
 * and the parent has rows.
 */
export function giniGain(parent: Counts, left: Counts, right: Counts): number | null {
  const parentGini = giniFromCounts(parent);
  const leftGini = giniFromCounts(left);
  const rightGini = giniFromCounts(right);
  if (parentGini === null || leftGini === null || rightGini === null) return null;
  const leftN = left.positive + left.negative;
  const rightN = right.positive + right.negative;
  const total = leftN + rightN;
  if (leftN === 0 || rightN === 0) return 0;
  return parentGini - (leftN / total) * leftGini - (rightN / total) * rightGini;
}

/** Confusion-matrix rates. Null when any count is not a non-negative integer. */
export function ratesFromCounts(tp: number, fp: number, tn: number, fn: number): Rates | null {
  if (![tp, fp, tn, fn].every(isCount)) return null;
  const total = tp + fp + tn + fn;
  const ratio = (numerator: number, denominator: number): number =>
    denominator === 0 ? 0 : numerator / denominator;
  return {
    sensitivity: ratio(tp, tp + fn),
    specificity: ratio(tn, tn + fp),
    ppv: ratio(tp, tp + fp),
    npv: ratio(tn, tn + fn),
    accuracy: ratio(tp + tn, total),
    prevalence: ratio(tp + fn, total),
    total,
  };
}

/** Fixed-point display for bench readouts. */
export function formatStat(value: number): string {
  return value.toFixed(3);
}

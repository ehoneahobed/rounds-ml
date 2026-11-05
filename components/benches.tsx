"use client";

import { useState } from "react";
import { countsPartition, entropyFromCounts, formatStat, giniFromCounts, giniGain, ratesFromCounts, type Counts } from "@/lib/stats";

/** Edit class counts and see Gini, entropy, and a weighted gain. */
export function ImpurityBench() {
  const [parentPos, setParentPos] = useState(4);
  const [parentNeg, setParentNeg] = useState(6);
  const [leftPos, setLeftPos] = useState(1);
  const [leftNeg, setLeftNeg] = useState(5);
  const [rightPos, setRightPos] = useState(3);
  const [rightNeg, setRightNeg] = useState(1);

  const parent: Counts = { positive: parentPos, negative: parentNeg };
  const left: Counts = { positive: leftPos, negative: leftNeg };
  const right: Counts = { positive: rightPos, negative: rightNeg };
  const parentGini = giniFromCounts(parent);
  const parentEntropy = entropyFromCounts(parent);
  const gain = giniGain(parent, left, right);
  const partition = countsPartition(parent, left, right);

  return (
    <section className="my-6 border border-line bg-white/40 p-4" aria-label="Impurity bench">
      <h3 className="font-serif text-xl text-ink">Impurity bench</h3>
      <p className="mt-1 text-sm text-muted">
        The page&apos;s worked split is already filled in. Change a count and the gain moves. Counts have to be non-negative integers.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <CountPair label="Parent" positive={parentPos} negative={parentNeg} onPositive={setParentPos} onNegative={setParentNeg} />
        <CountPair label="Left child" positive={leftPos} negative={leftNeg} onPositive={setLeftPos} onNegative={setLeftNeg} />
        <CountPair label="Right child" positive={rightPos} negative={rightNeg} onPositive={setRightPos} onNegative={setRightNeg} />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Readout label="Parent Gini" value={parentGini} />
        <Readout label="Parent entropy" value={parentEntropy} />
        <Readout label="Gini gain" value={gain} />
      </dl>
      {partition ? null : (
        <p className="mt-3 text-sm text-rust">
          These counts are not a split of the parent. The children have to add up, class by class, or the gain is not one the tree could have made.
        </p>
      )}
    </section>
  );
}

function CountPair({
  label,
  positive,
  negative,
  onPositive,
  onNegative,
}: {
  label: string;
  positive: number;
  negative: number;
  onPositive: (value: number) => void;
  onNegative: (value: number) => void;
}) {
  return (
    <fieldset className="border border-line p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</legend>
      <CountField label="Positive" value={positive} onChange={onPositive} />
      <CountField label="Negative" value={negative} onChange={onNegative} />
    </fieldset>
  );
}

function CountField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="mt-2 flex items-center justify-between gap-3 text-sm">
      {label}
      <input
        className="w-20 border border-line bg-paper px-2 py-1 text-right font-mono"
        inputMode="numeric"
        value={Number.isNaN(value) ? "" : String(value)}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function Readout({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="border border-line bg-paper px-3 py-2">
      <dt className="text-xs uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-lg">{value === null ? "—" : formatStat(value)}</dd>
    </div>
  );
}

/** Confusion-matrix bench. Accuracy sits next to sensitivity on purpose. */
export function ConfusionBench() {
  const [tp, setTp] = useState(40);
  const [fp, setFp] = useState(30);
  const [tn, setTn] = useState(120);
  const [fn, setFn] = useState(10);
  const rates = ratesFromCounts(tp, fp, tn, fn);

  return (
    <section className="my-6 border border-line bg-white/40 p-4" aria-label="Confusion matrix bench">
      <h3 className="font-serif text-xl text-ink">Confusion bench</h3>
      <p className="mt-1 text-sm text-muted">
        Start from the page&apos;s 200-patient example. Then try a rare event: prevalence near 0.02 with sensitivity and specificity still near 0.80. Watch the positive predictive value, not the accuracy.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CountOnly label="True positive" value={tp} onChange={setTp} />
        <CountOnly label="False positive" value={fp} onChange={setFp} />
        <CountOnly label="True negative" value={tn} onChange={setTn} />
        <CountOnly label="False negative" value={fn} onChange={setFn} />
      </div>
      {rates === null ? (
        <p className="mt-3 text-sm text-rust">Enter non-negative whole numbers.</p>
      ) : (
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <Readout label="Sensitivity" value={rates.sensitivity} />
          <Readout label="Specificity" value={rates.specificity} />
          <Readout label="PPV" value={rates.ppv} />
          <Readout label="NPV" value={rates.npv} />
          <Readout label="Accuracy" value={rates.accuracy} />
          <Readout label="Prevalence" value={rates.prevalence} />
        </dl>
      )}
    </section>
  );
}

function CountOnly({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm">
      <span className="text-xs uppercase tracking-[0.12em] text-muted">{label}</span>
      <input
        className="mt-1 w-full border border-line bg-paper px-2 py-1 font-mono"
        inputMode="numeric"
        value={Number.isNaN(value) ? "" : String(value)}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

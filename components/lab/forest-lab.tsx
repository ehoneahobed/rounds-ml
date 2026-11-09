"use client";

import { useMemo, useState } from "react";
import { LabBack } from "@/components/lab/lab-back";

type TreeVote = {
  id: number;
  vote: 0 | 1;
  probability: number;
};

const BASE_TREES: TreeVote[] = [
  { id: 1, vote: 0, probability: 0.25 },
  { id: 2, vote: 1, probability: 0.7 },
  { id: 3, vote: 1, probability: 0.55 },
  { id: 4, vote: 0, probability: 0.4 },
  { id: 5, vote: 1, probability: 0.65 },
];

/**
 * Interactive forest vote: choose how many shallow trees participate, read majority and mean probability.
 */
export function ForestLab() {
  const [treeCount, setTreeCount] = useState(3);
  const active = useMemo(() => BASE_TREES.slice(0, treeCount), [treeCount]);
  const ones = active.filter((tree) => tree.vote === 1).length;
  const zeros = active.length - ones;
  const majority: 0 | 1 = ones > zeros ? 1 : ones < zeros ? 0 : 0;
  const meanProbability = active.reduce((sum, tree) => sum + tree.probability, 0) / active.length;

  return (
    <div className="ml-[calc(50%-50vw)] w-screen px-3 sm:px-4">
      <div className="mx-auto grid min-h-[calc(100vh-9.5rem)] max-w-[88rem] overflow-hidden border border-[#243140] bg-[#101820] lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative min-h-[28rem] space-y-4 bg-[#101820] p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#c8c1b4]">Teaching row · new patient</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((tree) => (
              <div key={tree.id} className="border border-[#3a4a5c] bg-[#16202b] px-4 py-4 text-[#f3efe6]">
                <p className="font-mono text-xs text-[#e2b340]">Tree {tree.id}</p>
                <p className="mt-2 font-serif text-3xl">{tree.vote}</p>
                <p className="mt-1 font-mono text-sm text-[#d9d2c5]">p₁ = {tree.probability.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border border-[#e2b340]/40 bg-[#16202b] px-4 py-4 text-[#f3efe6]">
            <p className="font-mono text-xs text-[#e2b340]">Forest</p>
            <p className="mt-2 font-serif text-2xl">
              Majority vote {majority} · mean p₁ {meanProbability.toFixed(2)}
            </p>
            <p className="mt-2 text-sm text-[#d9d2c5]">
              {ones} tree{ones === 1 ? "" : "s"} vote 1 · {zeros} vote 0. Near 0.5 the vote and the mean can disagree.
            </p>
          </div>
        </div>
        <aside className="flex max-h-[calc(100vh-9.5rem)] flex-col overflow-y-auto border-t border-[#243140] bg-[#f4f0e8] text-ink lg:border-t-0 lg:border-l">
          <div className="border-b border-line px-4 py-4">
            <LabBack />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-gold">Forest lab</p>
            <h1 className="mt-1 font-serif text-2xl tracking-tight">Many trees, one answer</h1>
            <p className="mt-2 text-sm leading-relaxed">
              Each card is a shallow tree on a different bootstrap draw of the teaching rows. Add trees and watch the majority vote and the mean probability move.
            </p>
          </div>
          <div className="space-y-5 px-4 py-4">
            <label className="block text-sm">
              <span className="flex justify-between gap-3">
                <span>Trees in the vote</span>
                <span className="font-mono text-xs">{treeCount}</span>
              </span>
              <input
                className="mt-1 w-full"
                type="range"
                min={1}
                max={5}
                step={1}
                value={treeCount}
                onChange={(event) => setTreeCount(Number(event.target.value))}
              />
            </label>
            <section aria-live="polite">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Readout</h2>
              <p className="mt-2 font-mono text-sm">majority = {majority}</p>
              <p className="mt-1 font-mono text-sm">mean p₁ = {meanProbability.toFixed(3)}</p>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}

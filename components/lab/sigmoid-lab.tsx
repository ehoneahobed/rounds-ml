"use client";

import { useMemo, useState } from "react";
import { LabBack } from "@/components/lab/lab-back";

/**
 * Interactive sigmoid: drag a linear score, read the probability, move a threshold.
 */
export function SigmoidLab() {
  const [score, setScore] = useState(0);
  const [threshold, setThreshold] = useState(0.5);
  const probability = useMemo(() => 1 / (1 + Math.exp(-score)), [score]);
  const alarm = probability >= threshold;

  const curve = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= 40; i += 1) {
      const x = -6 + (12 * i) / 40;
      points.push({ x, y: 1 / (1 + Math.exp(-x)) });
    }
    return points;
  }, []);

  return (
    <div className="ml-[calc(50%-50vw)] w-screen px-3 sm:px-4">
      <div className="mx-auto grid min-h-[calc(100vh-9.5rem)] max-w-[88rem] overflow-hidden border border-[#243140] bg-[#101820] lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative min-h-[28rem] bg-[#101820] p-4">
          <SigmoidPlot curve={curve} score={score} probability={probability} threshold={threshold} />
          <p className="pointer-events-none absolute bottom-3 left-3 right-3 text-center font-mono text-[11px] text-[#c8c1b4]">
            Score across · probability up · gold line is the threshold
          </p>
        </div>
        <aside className="flex max-h-[calc(100vh-9.5rem)] flex-col overflow-y-auto border-t border-[#243140] bg-[#f4f0e8] text-ink lg:border-t-0 lg:border-l">
          <div className="border-b border-line px-4 py-4">
            <LabBack />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-gold">Sigmoid lab</p>
            <h1 className="mt-1 font-serif text-2xl tracking-tight">Score to probability</h1>
            <p className="mt-2 text-sm leading-relaxed">
              Logistic regression keeps a linear score, then pushes it through the S-curve. Move the score and the threshold. The alarm fires when the probability is at least the threshold.
            </p>
          </div>
          <div className="space-y-5 px-4 py-4">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Controls</h2>
              <Slider label="Score z" min={-6} max={6} step={0.1} value={score} onChange={setScore} />
              <Slider label="Threshold t" min={0} max={1} step={0.01} value={threshold} onChange={setThreshold} />
            </section>
            <section aria-live="polite">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Readout</h2>
              <p className="mt-2 font-mono text-sm">σ(z) = {probability.toFixed(3)}</p>
              <p className="mt-1 font-mono text-sm">t = {threshold.toFixed(2)}</p>
              <p className="mt-3 text-sm leading-relaxed">
                {alarm
                  ? "Probability is at or above the threshold → alarm on."
                  : "Probability is below the threshold → alarm off."}
              </p>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SigmoidPlot({
  curve,
  score,
  probability,
  threshold,
}: {
  curve: { x: number; y: number }[];
  score: number;
  probability: number;
  threshold: number;
}) {
  const width = 640;
  const height = 420;
  const pad = 36;
  const xMin = -6;
  const xMax = 6;
  const yMin = 0;
  const yMax = 1;
  const sx = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (width - 2 * pad);
  const sy = (y: number) => height - pad - ((y - yMin) / (yMax - yMin)) * (height - 2 * pad);
  const path = curve.map((point, index) => `${index === 0 ? "M" : "L"} ${sx(point.x)} ${sy(point.y)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Sigmoid curve">
      <line x1={pad} y1={sy(0)} x2={width - pad} y2={sy(0)} stroke="#3a4a5c" />
      <line x1={sx(0)} y1={pad} x2={sx(0)} y2={height - pad} stroke="#3a4a5c" />
      <path d={path} fill="none" stroke="#e2b340" strokeWidth={2.5} />
      <line x1={pad} y1={sy(threshold)} x2={width - pad} y2={sy(threshold)} stroke="#e2b340" strokeDasharray="6 6" />
      <circle cx={sx(score)} cy={sy(probability)} r={7} fill="#f3efe6" stroke="#e2b340" strokeWidth={2} />
      <text x={sx(score) + 10} y={sy(probability) - 10} fill="#f3efe6" fontSize={12} fontFamily="ui-monospace, monospace">
        ({score.toFixed(1)}, {probability.toFixed(2)})
      </text>
    </svg>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mt-3 block text-sm">
      <span className="flex justify-between gap-3">
        <span>{label}</span>
        <span className="font-mono text-xs">{value.toFixed(2)}</span>
      </span>
      <input
        className="mt-1 w-full"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

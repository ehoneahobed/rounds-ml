"use client";

import { useMemo, useState } from "react";
import figures from "@/data/linear_regression_figures.json";
import { LabBack } from "@/components/lab/lab-back";
import { Button } from "@/components/ui/button";

const rows = figures.univariate.rows;
const bestSlope = figures.univariate.slope;
const bestIntercept = figures.univariate.intercept;

/**
 * Interactive teaching line: six lactate × length-of-stay points, with sliders
 * for slope and intercept and drawn residual sticks.
 */
export function LineLab() {
  const [slope, setSlope] = useState(0.5);
  const [intercept, setIntercept] = useState(3);
  const points = useMemo(
    () =>
      rows.map((row) => {
        const pred = intercept + slope * row.lactate;
        return { ...row, pred, residual: row.los - pred };
      }),
    [slope, intercept],
  );
  const mse = points.reduce((sum, point) => sum + point.residual * point.residual, 0) / points.length;

  return (
    <div className="ml-[calc(50%-50vw)] w-screen px-3 sm:px-4">
      <div className="mx-auto grid min-h-[calc(100vh-9.5rem)] max-w-[88rem] overflow-hidden border border-[#243140] bg-[#101820] lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative min-h-[28rem] bg-[#101820] p-4">
          <ScatterPlot points={points} slope={slope} intercept={intercept} />
          <p className="pointer-events-none absolute bottom-3 left-3 right-3 text-center font-mono text-[11px] text-[#c8c1b4]">
            Feature x across · label y up · gold sticks are residuals
          </p>
        </div>
        <aside className="flex max-h-[calc(100vh-9.5rem)] flex-col overflow-y-auto border-t border-[#243140] bg-[#f4f0e8] text-ink lg:border-t-0 lg:border-l">
          <div className="border-b border-line px-4 py-4">
            <LabBack />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-gold">Line lab</p>
            <h1 className="mt-1 font-serif text-2xl tracking-tight">Six rows, one line</h1>
            <p className="mt-2 text-sm leading-relaxed">
              Each point is one training row. Move the slope and intercept. The gold sticks are residuals: truth minus prediction. The teaching table fits exactly when the slope is 2 and the intercept is 1.
            </p>
          </div>
          <div className="space-y-5 px-4 py-4">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">The line</h2>
              <Slider label="Slope" min={-1} max={4} step={0.1} value={slope} onChange={setSlope} />
              <Slider label="Intercept" min={-2} max={8} step={0.1} value={intercept} onChange={setIntercept} />
              <Button type="button" size="sm" className="mt-3" onClick={() => { setSlope(bestSlope); setIntercept(bestIntercept); }}>
                Snap to best fit
              </Button>
            </section>
            <section aria-live="polite">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Readout</h2>
              <p className="mt-2 font-mono text-sm">
                ŷ = {intercept.toFixed(2)} + {slope.toFixed(2)} × x
              </p>
              <p className="mt-1 font-mono text-sm">MSE = {mse.toFixed(4)}</p>
              <ol className="mt-3 space-y-1 font-mono text-xs leading-relaxed">
                {points.map((point) => (
                  <li key={point.patient}>
                    {point.patient}: y={point.los.toFixed(1)}, ŷ={point.pred.toFixed(2)}, e={point.residual.toFixed(2)}
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ScatterPlot({
  points,
  slope,
  intercept,
}: {
  points: Array<{ patient: string; lactate: number; los: number; pred: number }>;
  slope: number;
  intercept: number;
}) {
  const width = 640;
  const height = 420;
  const pad = { left: 48, right: 20, top: 20, bottom: 44 };
  const xMin = 0.5;
  const xMax = 3.1;
  const yMin = 1.5;
  const yMax = 7.5;
  const sx = (value: number) => pad.left + ((value - xMin) / (xMax - xMin)) * (width - pad.left - pad.right);
  const sy = (value: number) => pad.top + ((yMax - value) / (yMax - yMin)) * (height - pad.top - pad.bottom);
  const x0 = xMin;
  const x1 = xMax;
  const y0 = intercept + slope * x0;
  const y1 = intercept + slope * x1;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Feature against label with a fitted line">
      <rect x="0" y="0" width={width} height={height} fill="#101820" />
      <line x1={sx(x0)} y1={sy(y0)} x2={sx(x1)} y2={sy(y1)} stroke="#e2b340" strokeWidth="2.5" />
      {points.map((point) => (
        <g key={point.patient}>
          <line x1={sx(point.lactate)} y1={sy(point.los)} x2={sx(point.lactate)} y2={sy(point.pred)} stroke="#e2b340" strokeOpacity="0.55" strokeWidth="2" />
          <circle cx={sx(point.lactate)} cy={sy(point.los)} r="7" fill="#2f9d78" stroke="#f4f0e8" strokeWidth="1.5" />
        </g>
      ))}
      <text x={width / 2} y={height - 12} textAnchor="middle" fill="#c8c1b4" fontSize="13">
        feature x
      </text>
      <text x="16" y={height / 2} textAnchor="middle" fill="#c8c1b4" fontSize="13" transform={`rotate(-90 16 ${height / 2})`}>
        label y
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
    <label className="mt-2 block text-sm">
      <span className="flex justify-between font-mono text-xs">
        <span>{label}</span>
        <span>{value.toFixed(1)}</span>
      </span>
      <input
        className="mt-1 w-full accent-green"
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

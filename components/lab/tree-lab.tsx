"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AGE_CUT,
  AGE_MAX,
  AGE_MIN,
  LACTATE_CUT,
  LACTATE_MAX,
  LACTATE_MIN,
  missions,
  teachingAdmissions,
  walkPatient,
  type Mission,
} from "@/lib/lab/teaching-tree";

const LabCanvas = dynamic(() => import("@/components/lab/lab-scene").then((mod) => mod.LabCanvas), {
  ssr: false,
  loading: () => <p className="grid h-full place-items-center text-sm text-[#c8c1b4]">Starting the lab…</p>,
});

const rows = teachingAdmissions();

/**
 * The 3D bench for the teaching tree.
 * Missions reveal one cut at a time. Sliders and clicks walk a patient through the questions.
 */
export function TreeLab() {
  const [missionIndex, setMissionIndex] = useState(0);
  const [walls, setWalls] = useState({ lactate: false, age: false, regions: "none" as Mission["regions"] });
  const [lactate, setLactate] = useState(2.7);
  const [age, setAge] = useState(50);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const mission = missions[missionIndex] ?? missions[0];
  const usingSlider = mission.id === "walk" && selectedIndex === null;
  const focus = selectedIndex === null ? { lactate, age } : rows[selectedIndex];
  const walk = selectedIndex !== null || usingSlider ? walkPatient(focus.lactate, focus.age) : null;
  const showProbe = usingSlider;

  function openMission(index: number) {
    const next = missions[index];
    if (!next) return;
    setMissionIndex(index);
    setWalls({ lactate: next.lactateWall, age: next.ageWall, regions: next.regions });
    setSelectedIndex(null);
  }

  return (
    <div className="ml-[calc(50%-50vw)] w-screen px-3 sm:px-4">
      <div className="mx-auto grid min-h-[calc(100vh-9.5rem)] max-w-[88rem] overflow-hidden border border-[#243140] bg-[#101820] lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative min-h-[28rem]">
          <LabCanvas
            rows={rows}
            showLactateWall={walls.lactate}
            showAgeWall={walls.age}
            regions={walls.regions}
            probe={showProbe ? { lactate, age } : null}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
          <p className="pointer-events-none absolute bottom-3 left-3 right-3 text-center font-mono text-[11px] text-[#c8c1b4]">
            Drag to turn · Scroll to zoom · Right-drag to move
          </p>
          <div className="pointer-events-none absolute left-3 top-3 flex gap-3 text-xs text-[#e7e1d4]">
            <span className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 rounded-full bg-[#2f9d78]" /> label 0</span>
            <span className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 rounded-full bg-[#c4564a]" /> label 1</span>
            {showProbe ? <span className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 rounded-full bg-[#e2b340]" /> new patient</span> : null}
          </div>
        </div>
        <aside className="flex max-h-[calc(100vh-9.5rem)] flex-col overflow-y-auto border-t border-[#243140] bg-[#f4f0e8] text-ink lg:border-t-0 lg:border-l">
          <div className="border-b border-line px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              Mission {missionIndex + 1} of {missions.length}
            </p>
            <h1 className="mt-1 font-serif text-2xl tracking-tight">{mission.title}</h1>
            <p className="mt-2 text-sm leading-relaxed">{mission.body}</p>
            <div className="mt-3 flex gap-2">
              <Button type="button" size="sm" variant="outline" disabled={missionIndex === 0} onClick={() => openMission(missionIndex - 1)}>
                Previous
              </Button>
              <Button type="button" size="sm" disabled={missionIndex === missions.length - 1} onClick={() => openMission(missionIndex + 1)}>
                Next
              </Button>
            </div>
          </div>
          <div className="space-y-5 px-4 py-4">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Missions</h2>
              <ol className="mt-2 space-y-1">
                {missions.map((item, index) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${index === missionIndex ? "bg-green-soft font-semibold text-green" : "hover:bg-secondary"}`}
                      onClick={() => openMission(index)}
                    >
                      {index + 1}. {item.title}
                    </button>
                  </li>
                ))}
              </ol>
            </section>
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Explore</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <Toggle pressed={walls.lactate} label={`Lactate wall ${LACTATE_CUT.toFixed(2)}`} onClick={() => setWalls((current) => ({ ...current, lactate: !current.lactate, regions: current.regions === "none" && !current.lactate ? "first" : current.regions }))} />
                <Toggle pressed={walls.age} label={`Age wall ${AGE_CUT.toFixed(2)}`} onClick={() => setWalls((current) => ({ ...current, age: !current.age, regions: !current.age ? "both" : current.regions === "both" ? "first" : current.regions }))} />
              </div>
            </section>
            {mission.id === "walk" ? (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">New patient</h2>
                <Slider label="Lactate" min={LACTATE_MIN + 0.4} max={LACTATE_MAX - 0.4} step={0.1} value={lactate} onChange={(value) => { setSelectedIndex(null); setLactate(value); }} />
                <Slider label="Age" min={AGE_MIN + 5} max={AGE_MAX - 5} step={1} value={age} onChange={(value) => { setSelectedIndex(null); setAge(value); }} />
              </section>
            ) : null}
            <section aria-live="polite">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {selectedIndex === null ? (usingSlider ? "The patient on the sliders" : "A patient") : `Training patient ${selectedIndex + 1}`}
              </h2>
              {walk ? (
                <>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <Readout label="Lactate" value={focus.lactate.toFixed(2)} />
                    <Readout label="Age" value={focus.age.toFixed(0)} />
                  </dl>
                  <ol className="mt-3 space-y-2 text-sm leading-relaxed">
                    {walk.steps.map((step) => (
                      <li key={step.question}>
                        <span className="font-mono text-xs">{step.question}</span>
                        <span className="mt-0.5 block text-muted">{step.taken === "left" ? "Goes left." : "Goes right."} {step.detail}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-3 border border-line bg-white/70 px-3 py-2 font-mono text-xs leading-relaxed">
                    Predict {walk.prediction}. {walk.rule}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-muted">Click a sphere. The panel will ask the tree&apos;s questions about that patient.</p>
              )}
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Toggle({ pressed, label, onClick }: { pressed: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${pressed ? "border-green bg-green text-white" : "border-line bg-white/60"}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function Slider({ label, min, max, step, value, onChange }: { label: string; min: number; max: number; step: number; value: number; onChange: (value: number) => void }) {
  return (
    <label className="mt-2 block text-sm">
      <span className="flex justify-between font-mono text-xs">
        <span>{label}</span>
        <span>{Number.isInteger(step) ? value.toFixed(0) : value.toFixed(1)}</span>
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

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-white/70 px-3 py-2">
      <dt className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}

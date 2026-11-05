"use client";

import { useState } from "react";
import figures from "@/data/figures.json";
import { ConfusionBench, ImpurityBench } from "@/components/benches";
import { Formula } from "@/components/formula";
import { LabCard } from "@/components/lab/lab-card";
import { PartitionFigure } from "@/components/partition-figure";
import { RichText } from "@/components/rich-text";
import type { Block } from "@/lib/content/types";

/** Render authored blocks. Interactive pieces are the benches and the reveal. */
export function BlockView({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-read">
      {blocks.map((block, index) => (
        <BlockItem key={index} block={block} />
      ))}
    </div>
  );
}

function BlockItem({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return (
        <p>
          <RichText text={block.text} />
        </p>
      );
    case "h2":
      return <h2 className="mt-10 font-serif text-3xl tracking-tight text-ink">{block.text}</h2>;
    case "h3":
      return <h3 className="mt-8 font-serif text-2xl text-ink">{block.text}</h3>;
    case "ul":
      return (
        <ul className="my-4 list-disc space-y-2 pl-5">
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="my-4 list-decimal space-y-2 pl-5">
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ol>
      );
    case "math":
      return <Formula latex={block.latex} display />;
    case "code":
      return (
        <figure className="my-4">
          <pre className="overflow-x-auto bg-navy p-4 font-mono text-[13px] leading-relaxed text-[#e7e1d4]">{block.code}</pre>
          {block.caption ? <figcaption className="mt-1 text-sm text-muted">{block.caption}</figcaption> : null}
        </figure>
      );
    case "terminal":
      return <pre className="my-4 overflow-x-auto border border-line bg-[#241f1a] p-4 font-mono text-[13px] leading-relaxed text-[#f3efe6]">{block.text}</pre>;
    case "table":
      return <DataTable caption={block.caption} headers={block.headers} rows={block.rows} />;
    case "callout":
      return <Callout tone={block.tone} title={block.title} text={block.text} />;
    case "reveal":
      return <Reveal title={block.title} prompt={block.prompt} answer={block.answer} />;
    case "bench":
      return block.which === "impurity" ? <ImpurityBench /> : <ConfusionBench />;
    case "searchTable":
      return <SearchTable />;
    case "countedTable":
      return <CountedTable />;
    case "partition":
      return <PartitionFigure />;
    case "lab":
      return <LabCard />;
    case "paths":
      return (
        <pre className="my-4 overflow-x-auto border border-line bg-navy p-4 font-mono text-[13px] leading-relaxed text-[#e7e1d4]">
          {figures.trace.paths.join("\n")}
        </pre>
      );
    default: {
      const unreachable: never = block;
      return unreachable;
    }
  }
}

function DataTable({ caption, headers, rows }: { caption?: string; headers: string[]; rows: string[][] }) {
  return (
    <figure className="my-5 max-w-full">
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
          <thead className="bg-secondary/70">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-3 py-2 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join("|")} className="border-t border-line">
                {row.map((cell, index) => (
                  <td key={`${cell}-${index}`} className="px-3 py-2 font-mono text-[13px]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? <figcaption className="mt-2 text-sm text-muted">{caption}</figcaption> : null}
    </figure>
  );
}

function Callout({ tone, title, text }: { tone: "note" | "warn" | "practice"; title: string; text: string }) {
  const styles = {
    note: "border-green bg-green-soft",
    warn: "border-rust bg-rust-soft",
    practice: "border-gold bg-[#f6f0e2]",
  }[tone];
  return (
    <aside className={`my-6 border-l-4 px-4 py-3 ${styles}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em]">{title}</p>
      <p className="mt-1">
        <RichText text={text} />
      </p>
    </aside>
  );
}

function Reveal({ title, prompt, answer }: { title: string; prompt: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <aside className="my-6 border border-line bg-white/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">{title}</p>
      <p className="mt-2">
        <RichText text={prompt} />
      </p>
      <button
        type="button"
        className="mt-3 text-sm font-semibold text-green underline decoration-green/40 underline-offset-4"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {open ? "Hide the result" : "Show the result"}
      </button>
      {open ? (
        <p className="mt-3 border-t border-line pt-3">
          <RichText text={answer} />
        </p>
      ) : null}
    </aside>
  );
}

function CountedTable() {
  const counted = figures.counted;
  return (
    <DataTable
      caption="Ten patients, four of whom deteriorated. Left: 1 of 6. Right: 3 of 4. Gini gain is 49/300."
      headers={["Node", "Rows", "Positive", "Gini", "Entropy (bits)"]}
      rows={[
        ["Parent", String(counted.parent.n), String(counted.parent.positive), counted.parent.gini.toFixed(4), counted.parent.entropy.toFixed(4)],
        ["Left", String(counted.left.n), String(counted.left.positive), counted.left.gini.toFixed(4), counted.left.entropy.toFixed(4)],
        ["Right", String(counted.right.n), String(counted.right.positive), counted.right.gini.toFixed(4), counted.right.entropy.toFixed(4)],
      ]}
    />
  );
}

function SearchTable() {
  const search = figures.search;
  return (
    <figure className="my-5">
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <caption className="border-b border-line bg-secondary/70 px-3 py-2 text-left font-sans">
            Parent Gini {search.parentGini.toFixed(4)}. The starred row is the cut this module keeps.
          </caption>
          <thead>
            <tr className="border-b border-line">
              {["Threshold", "Left + / n", "Right + / n", "Gain"].map((header) => (
                <th key={header} className="px-3 py-2 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {search.candidates.map((row) => (
              <tr key={row.threshold} className={row.best ? "bg-green-soft" : "border-t border-line"}>
                <td className="px-3 py-2 font-mono">
                  {row.threshold.toFixed(2)}
                  {row.best ? " ★" : ""}
                </td>
                <td className="px-3 py-2 font-mono">
                  {row.leftPositive} / {row.leftN}
                </td>
                <td className="px-3 py-2 font-mono">
                  {row.rightPositive} / {row.rightN}
                </td>
                <td className="px-3 py-2 font-mono">{row.gain.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

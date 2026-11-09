"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModule } from "@/lib/module-context";
import { moduleHref, type LabKind } from "@/lib/modules";

const LAB_COPY: Record<Exclude<LabKind, null>, { eyebrow: string; title: string; body: string }> = {
  line: {
    eyebrow: "Line lab",
    title: "Move the teaching line",
    body: "Six teaching rows on a scatter plot. Drag the slope and intercept, watch the residuals change, then snap to the best fit.",
  },
  sigmoid: {
    eyebrow: "Sigmoid lab",
    title: "Score to probability",
    body: "Drag a linear score along the S-curve, then move the threshold and see when the same probability becomes an alarm.",
  },
  tree: {
    eyebrow: "3D lab",
    title: "See the teaching tree",
    body: "A tree diagram of the eight patients. Open the first question, then the second, then walk a new patient down the branches.",
  },
  forest: {
    eyebrow: "Forest lab",
    title: "Many trees, one vote",
    body: "Watch shallow trees disagree on a teaching row, then see the majority vote and the mean probability settle.",
  },
};

/** A door into the module lab, used on the project home and early concept pages. */
export function LabCard() {
  const module = useModule();
  const pathname = usePathname() || moduleHref(module, "/");
  if (!module.lab) return null;

  const href = `${moduleHref(module, "/lab")}?from=${encodeURIComponent(pathname)}`;
  const copy = LAB_COPY[module.lab];

  return (
    <Link href={href} className="my-6 block border border-navy bg-navy px-4 py-4 text-[#f3efe6] hover:bg-[#1b2736]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e2b340]">{copy.eyebrow}</p>
      <p className="mt-1 font-serif text-2xl tracking-tight">{copy.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-[#d9d2c5]">{copy.body}</p>
    </Link>
  );
}

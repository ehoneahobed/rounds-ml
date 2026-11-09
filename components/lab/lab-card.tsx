"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModule } from "@/lib/module-context";
import { moduleHref } from "@/lib/modules";

/** A door into the module lab, used on the project home and early concept pages. */
export function LabCard() {
  const module = useModule();
  const pathname = usePathname() || moduleHref(module, "/");
  const isLine = module.id === "linear-regression";
  const href = `${moduleHref(module, "/lab")}?from=${encodeURIComponent(pathname)}`;

  return (
    <Link href={href} className="my-6 block border border-navy bg-navy px-4 py-4 text-[#f3efe6] hover:bg-[#1b2736]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e2b340]">{isLine ? "Line lab" : "3D lab"}</p>
      <p className="mt-1 font-serif text-2xl tracking-tight">{isLine ? "Move the teaching line" : "See the teaching tree"}</p>
      <p className="mt-1 text-sm leading-relaxed text-[#d9d2c5]">
        {isLine
          ? "Six patients on a scatter plot. Drag the slope and intercept, watch the residuals change, then snap to the best fit."
          : "A tree diagram of the eight patients. Open the first question, then the second, then walk a new patient down the branches."}
      </p>
    </Link>
  );
}

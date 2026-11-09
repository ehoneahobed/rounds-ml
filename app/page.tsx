import type { Metadata } from "next";
import Link from "next/link";
import { MODULES, moduleHref } from "@/lib/modules";

export const metadata: Metadata = {
  title: "Rounds",
};

/** Site home: pick a module to study. */
export default function HomePage() {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Clinical ML study</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">Rounds</h1>
      <p className="mt-3 text-lg leading-relaxed">
        Choose a module. Each one is its own project: concept pages, a knowledge check, auto-graded tasks in the browser, and a ward note. Progress stays here, separately for each module.
      </p>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {MODULES.map((module) => (
          <li key={module.id}>
            <Link href={moduleHref(module, "/")} className="block py-6 hover:bg-secondary/40">
              <p className="font-mono text-xs text-muted">{module.code}</p>
              <p className="mt-1 font-serif text-3xl tracking-tight">{module.title}</p>
              <p className="mt-2 text-base leading-relaxed text-muted">{module.summary}</p>
              <p className="mt-3 text-sm font-semibold text-green">Open module →</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

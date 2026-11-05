import type { ReactNode } from "react";
import Link from "next/link";
import { ProgressPill } from "@/components/progress-pill";

/** Site frame: name, module, and the three places work happens. */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="no-print border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
          <Link href="/" className="font-serif text-2xl tracking-tight text-ink">
            Rounds
          </Link>
          <p className="text-sm text-muted">Module 01 · Decision trees</p>
          <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold" aria-label="Module">
            <Link href="/" className="hover:text-green">
              Project
            </Link>
            <Link href="/lab" className="hover:text-green">
              Lab
            </Link>
            <Link href="/quiz" className="hover:text-green">
              Knowledge check
            </Link>
            <Link href="/note" className="hover:text-green">
              Ward note
            </Link>
          </nav>
          <div className="ml-auto">
            <ProgressPill />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="no-print border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted">
          Synthetic admissions. Checks run in your browser.
        </p>
      </footer>
    </>
  );
}

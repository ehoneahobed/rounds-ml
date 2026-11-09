"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProgressPill } from "@/components/progress-pill";
import { moduleFromPath, moduleHref } from "@/lib/modules";
import { ModuleProvider } from "@/lib/module-context";

/** Site frame: name, active module when one is open, and the places work happens. */
export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const module = moduleFromPath(pathname);
  const onHome = pathname === "/" || pathname === "/modules";

  return (
    <ModuleProvider module={module}>
      <header className="no-print border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
          <Link href="/" className="font-serif text-2xl tracking-tight text-ink">
            Rounds
          </Link>
          {module ? (
            <>
              <p className="text-sm text-muted">
                Module {module.code.replace("0x", "")} · {module.title}
              </p>
              <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold" aria-label="Module">
                <Link href={moduleHref(module, "/")} className="hover:text-green">
                  Project
                </Link>
                {module.lab ? (
                  <Link href={moduleHref(module, "/lab")} className="hover:text-green">
                    Lab
                  </Link>
                ) : null}
                <Link href={moduleHref(module, "/quiz")} className="hover:text-green">
                  Knowledge check
                </Link>
                {module.hasWardNote ? (
                  <Link href={moduleHref(module, "/note")} className="hover:text-green">
                    Ward note
                  </Link>
                ) : null}
                <Link href="/" className="text-muted hover:text-green">
                  All modules
                </Link>
              </nav>
              <div className="ml-auto">
                <ProgressPill />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">{onHome ? "Choose a module" : "Study modules"}</p>
          )}
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="no-print border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted">
          Synthetic practice data. Checks run in your browser.
        </p>
      </footer>
    </ModuleProvider>
  );
}

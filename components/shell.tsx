"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModuleSidebar } from "@/components/module-sidebar";
import { ProgressPill } from "@/components/progress-pill";
import { moduleFromPath } from "@/lib/modules";
import { ModuleProvider } from "@/lib/module-context";

const SIDEBAR_KEY = "rounds-sidebar-collapsed";

/** Site frame: calm home header, or module layout with a collapsible left nav. */
export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const module = moduleFromPath(pathname);
  const onHome = pathname === "/" || pathname === "/modules";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(SIDEBAR_KEY) === "1");
    } catch {
      setCollapsed(false);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      } catch {
        // Private mode should not block navigation.
      }
      return next;
    });
  }

  return (
    <ModuleProvider module={module}>
      {module ? (
        <div className="flex min-h-full flex-1 flex-col">
          <header className="no-print sticky top-0 z-20 border-b border-line bg-paper">
            <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
              <button
                type="button"
                className="rounded-md border border-line px-2.5 py-1.5 text-sm font-semibold hover:bg-secondary/60 md:hidden"
                aria-expanded={mobileOpen}
                aria-controls="module-sidebar"
                onClick={() => setMobileOpen((open) => !open)}
              >
                Menu
              </button>
              <button
                type="button"
                className="hidden rounded-md border border-line px-2.5 py-1.5 text-sm font-semibold hover:bg-secondary/60 md:inline-flex"
                aria-pressed={collapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={toggleCollapsed}
              >
                {ready && collapsed ? "»" : "«"}
              </button>
              <Link href="/" className="font-serif text-2xl tracking-tight text-ink">
                Rounds
              </Link>
              <span className="text-muted" aria-hidden>
                /
              </span>
              <Link href="/" className="text-sm font-semibold text-green hover:underline">
                All modules
              </Link>
              <p className="hidden min-w-0 truncate text-sm text-muted lg:block">
                Module {module.code.replace("0x", "")} · {module.title}
              </p>
              <div className="ml-auto">
                <ProgressPill />
              </div>
            </div>
          </header>

          <div className="flex min-h-0 flex-1">
            <ModuleSidebar
              module={module}
              collapsed={collapsed}
              mobileOpen={mobileOpen}
              onCloseMobile={() => setMobileOpen(false)}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-8">{children}</main>
              <footer className="no-print border-t border-line">
                <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted">
                  Synthetic practice data. Checks run in your browser.
                </p>
              </footer>
            </div>
          </div>
        </div>
      ) : (
        <>
          <header className="no-print border-b border-line bg-paper">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
              <Link href="/" className="font-serif text-2xl tracking-tight text-ink">
                Rounds
              </Link>
              <p className="text-sm text-muted">{onHome ? "Choose a module" : "Study modules"}</p>
            </div>
          </header>
          <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-8">{children}</main>
          <footer className="no-print border-t border-line">
            <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted">
              Synthetic practice data. Checks run in your browser.
            </p>
          </footer>
        </>
      )}
    </ModuleProvider>
  );
}

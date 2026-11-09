"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { contentFor } from "@/lib/module-content";
import { moduleHref, type ModuleMeta } from "@/lib/modules";
import { useStudyProgress, wardNoteComplete } from "@/lib/progress";

type ModuleSidebarProps = {
  module: ModuleMeta;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

/** Collapsible module navigation: overview, concepts, check, tasks, lab, note. */
export function ModuleSidebar({ module, collapsed, mobileOpen, onCloseMobile }: ModuleSidebarProps) {
  const pathname = usePathname() || "/";
  const content = contentFor(module);
  const progress = useStudyProgress();
  const read = new Set(progress.conceptsRead);
  const passed = new Set(progress.tasksPassed);
  const noteDone = wardNoteComplete(progress.wardNote);

  const overviewHref = moduleHref(module, "/");
  const quizHref = moduleHref(module, "/quiz");
  const noteHref = moduleHref(module, "/note");
  const labHref = moduleHref(module, "/lab");

  // On mobile the drawer always shows full labels; desktop respects collapse.
  const compact = collapsed && !mobileOpen;
  const desktopWidth = compact ? "md:w-14" : "md:w-64";
  const mobileTranslate = mobileOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/30 no-print md:hidden"
          aria-label="Close navigation"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        id="module-sidebar"
        className={`no-print fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-paper transition-[width,transform] duration-200 md:static md:z-0 md:translate-x-0 ${desktopWidth} ${mobileTranslate}`}
        aria-label="Module"
      >
        <div className={`border-b border-line px-3 py-4 ${compact ? "md:px-2" : ""}`}>
          {!compact ? (
            <>
              <p className="font-mono text-[11px] text-muted">{module.code}</p>
              <p className="mt-1 font-serif text-xl leading-tight tracking-tight">{module.title}</p>
            </>
          ) : (
            <p className="text-center font-mono text-[11px] text-muted" title={module.title}>
              {module.code.replace("0x", "")}
            </p>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 text-sm">
          <NavLink
            href={overviewHref}
            active={pathname === overviewHref}
            compact={compact}
            onNavigate={onCloseMobile}
            short="O"
            title="Overview"
          >
            Overview
          </NavLink>

          <NavGroup label="Concepts" compact={compact}>
            {content.concepts.map((concept) => (
              <NavLink
                key={concept.slug}
                href={moduleHref(module, `/concepts/${concept.slug}`)}
                active={pathname === moduleHref(module, `/concepts/${concept.slug}`)}
                compact={compact}
                onNavigate={onCloseMobile}
                mark={read.has(concept.slug) ? "done" : "todo"}
                short={concept.number}
                title={concept.title}
              >
                {concept.title}
              </NavLink>
            ))}
          </NavGroup>

          <NavLink
            href={quizHref}
            active={pathname === quizHref}
            compact={compact}
            onNavigate={onCloseMobile}
            mark={progress.quizPassed ? "done" : "todo"}
            short="Q"
            title="Knowledge check"
          >
            Knowledge check
          </NavLink>

          {content.tasks.length > 0 ? (
            <NavGroup label="Tasks" compact={compact}>
              {content.tasks.map((task) => (
                <NavLink
                  key={task.slug}
                  href={moduleHref(module, `/tasks/${task.slug}`)}
                  active={pathname === moduleHref(module, `/tasks/${task.slug}`)}
                  compact={compact}
                  onNavigate={onCloseMobile}
                  mark={passed.has(task.slug) ? "done" : "todo"}
                  short={String(task.number)}
                  title={task.title}
                >
                  {task.title}
                </NavLink>
              ))}
            </NavGroup>
          ) : null}

          {module.hasWardNote ? (
            <NavLink
              href={noteHref}
              active={pathname === noteHref}
              compact={compact}
              onNavigate={onCloseMobile}
              mark={noteDone ? "done" : "todo"}
              short="N"
              title="Ward note"
            >
              Ward note
            </NavLink>
          ) : null}

          {module.lab ? (
            <NavLink
              href={labHref}
              active={pathname.startsWith(labHref)}
              compact={compact}
              onNavigate={onCloseMobile}
              short="L"
              title={
                module.lab === "line"
                  ? "Line lab"
                  : module.lab === "sigmoid"
                    ? "Sigmoid lab"
                    : module.lab === "forest"
                      ? "Forest lab"
                      : "Tree lab"
              }
            >
              {module.lab === "line"
                ? "Line lab"
                : module.lab === "sigmoid"
                  ? "Sigmoid lab"
                  : module.lab === "forest"
                    ? "Forest lab"
                    : "Tree lab"}
            </NavLink>
          ) : null}
        </nav>

        <div className="border-t border-line px-2 py-3">
          <NavLink href="/" active={false} compact={compact} onNavigate={onCloseMobile} short="↑" title="All modules">
            All modules
          </NavLink>
        </div>
      </aside>
    </>
  );
}

function NavGroup({ label, compact, children }: { label: string; compact: boolean; children: ReactNode }) {
  return (
    <div className="mt-4">
      {!compact ? (
        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      ) : (
        <p className="sr-only">{label}</p>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function NavLink({
  href,
  active,
  compact,
  children,
  onNavigate,
  mark,
  short,
  title,
}: {
  href: string;
  active: boolean;
  compact: boolean;
  children: ReactNode;
  onNavigate: () => void;
  mark?: "done" | "todo";
  short: string;
  title: string;
}) {
  return (
    <Link
      href={href}
      title={title}
      onClick={onNavigate}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 font-semibold transition-colors ${
        active ? "bg-green-soft text-green" : "text-ink hover:bg-secondary/60"
      } ${compact ? "justify-center md:px-1" : ""}`}
    >
      {mark && !compact ? (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${mark === "done" ? "bg-green" : "bg-line"}`} aria-hidden />
      ) : null}
      <span className={compact ? "font-mono text-xs" : "min-w-0 truncate"}>{compact ? short : children}</span>
    </Link>
  );
}

"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ModuleMeta } from "@/lib/modules";

const ModuleContext = createContext<ModuleMeta | null>(null);

/** Provide the active study module to client components under a module route. */
export function ModuleProvider({ module, children }: { module: ModuleMeta | null; children: ReactNode }) {
  return <ModuleContext.Provider value={module}>{children}</ModuleContext.Provider>;
}

/** The module for the current route. Throws outside a module page. */
export function useModule(): ModuleMeta {
  const module = useContext(ModuleContext);
  if (!module) {
    throw new Error("useModule must be used inside a module route.");
  }
  return module;
}

/** The active module, or null on the site home. */
export function useOptionalModule(): ModuleMeta | null {
  return useContext(ModuleContext);
}

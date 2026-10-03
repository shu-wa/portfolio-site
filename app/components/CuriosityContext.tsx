"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type CuriosityMode = "app" | "game" | "system";
type ProjectFilter = CuriosityMode | "all";
const CuriosityContext = createContext<{
  mode: CuriosityMode;
  filter: ProjectFilter;
  selectMode: (mode: CuriosityMode) => void;
  selectFilter: (filter: ProjectFilter) => void;
} | null>(null);

export function CuriosityProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<CuriosityMode>("app");
  const [filter, setFilter] = useState<ProjectFilter>("all");
  function selectMode(next: CuriosityMode) { setMode(next); setFilter(next); }
  function selectFilter(next: ProjectFilter) { setFilter(next); if (next !== "all") setMode(next); }
  return <CuriosityContext.Provider value={{ mode, filter, selectMode, selectFilter }}>{children}</CuriosityContext.Provider>;
}

export function useCuriosity() {
  const value = useContext(CuriosityContext);
  if (!value) throw new Error("CuriosityProvider is required");
  return value;
}

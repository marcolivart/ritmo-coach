import { createContext, useContext, type ReactNode } from "react";
import type { AppData } from "./useAppState";

const AppContext = createContext<AppData | null>(null);

export function AppDataProvider({ value, children }: { value: AppData; children: ReactNode }) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Acceso al estado global desde pestañas y sheets. */
export function useAppData(): AppData {
  const data = useContext(AppContext);
  if (!data) throw new Error("useAppData debe usarse dentro de <AppDataProvider>");
  return data;
}

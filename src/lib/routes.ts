export type Tab = "today" | "food" | "training" | "progress" | "profile";

// Orden real de las pestañas en la barra inferior.
// Se usa también para calcular la dirección del slide (izquierda/derecha).
export const tabOrder: Tab[] = ["today", "food", "training", "progress", "profile"];

export const tabRoutes: Record<Tab, string> = {
  today: "/hoy",
  food: "/comida",
  training: "/entreno",
  progress: "/progreso",
  profile: "/perfil",
};

const routeTabs: Record<string, Tab> = Object.fromEntries(
  Object.entries(tabRoutes).map(([tab, path]) => [path, tab as Tab]),
) as Record<string, Tab>;

export function tabFromPath(pathname: string): Tab | null {
  return routeTabs[pathname] ?? null;
}

export function tabIndex(tab: Tab): number {
  return tabOrder.indexOf(tab);
}

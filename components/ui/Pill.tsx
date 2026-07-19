import { ReactNode } from "react";

export type PillTone = "light" | "green" | "soft" | "orange" | "lime" | "danger" | "ink";

/** Etiqueta redondeada. Única implementación de pill de la app. */
export default function Pill({ tone = "green", children }: { tone?: PillTone; children: ReactNode }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

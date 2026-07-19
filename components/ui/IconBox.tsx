import { ReactNode } from "react";

export type IconBoxSize = "sm" | "md" | "lg";
export type IconBoxTone = "default" | "ink" | "lime" | "soft" | "danger" | "glass" | "solid";

/** Caja cuadrada de icono. Unifica las 10 variantes ad-hoc del diseño previo. */
export default function IconBox({
  size = "md",
  tone = "default",
  children,
}: {
  size?: IconBoxSize;
  tone?: IconBoxTone;
  children: ReactNode;
}) {
  const classes = ["iconbox"];
  if (size !== "md") classes.push(size);
  if (tone !== "default") classes.push(`tone-${tone}`);
  return <div className={classes.join(" ")} aria-hidden="true">{children}</div>;
}

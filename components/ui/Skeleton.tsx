export type SkeletonVariant = "card" | "hero" | "row" | "text";

/** Placeholder de carga con shimmer. */
export default function Skeleton({ variant = "card" }: { variant?: SkeletonVariant }) {
  return <div className={`skeleton ${variant}`} aria-hidden="true" />;
}

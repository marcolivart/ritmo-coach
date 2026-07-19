import { useEffect, useState } from "react";

export interface RingDatum {
  /** Progreso de 0 a 1. Valores fuera de rango se recortan. */
  value: number;
  color: string;
  label: string;
  detail: string;
}

interface ActivityRingsProps {
  rings: RingDatum[];
  size?: number;
  showLegend?: boolean;
}

const STROKE_WIDTH = 11;
const GAP = 5;

export default function ActivityRings({ rings, size = 132, showLegend = true }: ActivityRingsProps) {
  const center = size / 2;
  // Primer paint con el anillo vacío; el siguiente frame aplica el valor real
  // y la transición CSS de stroke-dashoffset lo "llena" al montar.
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="activity-rings">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Progreso de hoy">
        {rings.map((ring, index) => {
          const radius = center - STROKE_WIDTH / 2 - index * (STROKE_WIDTH + GAP);
          const circumference = 2 * Math.PI * radius;
          const clamped = Math.max(0, Math.min(1, ring.value));
          const dashOffset = filled ? circumference * (1 - clamped) : circumference;
          return (
            <g key={ring.label}>
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgba(22,27,23,.08)"
                strokeWidth={STROKE_WIDTH}
              />
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${center} ${center})`}
              />
            </g>
          );
        })}
      </svg>
      {showLegend && (
        <ul className="activity-rings-legend">
          {rings.map((ring) => (
            <li key={ring.label}>
              <span className="activity-rings-dot" style={{ background: ring.color }} aria-hidden="true" />
              <span className="activity-rings-label">{ring.label}</span>
              <span className="activity-rings-detail">{ring.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

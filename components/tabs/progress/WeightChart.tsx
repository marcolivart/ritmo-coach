import type { WeightLog } from "../../../src/types";
import { shortDateLabel } from "../../../src/lib/dates";

const W = 320;
const H = 132;
const PAD = { top: 18, right: 12, bottom: 20, left: 12 };

interface WeightChartProps {
  logs: WeightLog[];
  targetWeightKg: number;
}

/** Evolución del peso como línea suavizada con área, sobre tarjeta oscura.
 *  Escala real calculada con los pesos del usuario y su objetivo; la línea
 *  discontinua marca el objetivo. */
export default function WeightChart({ logs, targetWeightKg }: WeightChartProps) {
  const shown = logs.slice(-6);
  if (!shown.length) return null;

  const weights = shown.map((log) => log.weight_kg);
  const min = Math.min(...weights, targetWeightKg) - 0.4;
  const max = Math.max(...weights, targetWeightKg) + 0.4;
  const range = Math.max(0.1, max - min);
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const x = (index: number) => shown.length === 1
    ? PAD.left + plotW / 2
    : PAD.left + (index / (shown.length - 1)) * plotW;
  const y = (weightKg: number) => PAD.top + (1 - (weightKg - min) / range) * plotH;

  const points = shown.map((log, index) => ({ px: x(index), py: y(log.weight_kg), log }));
  const last = points[points.length - 1];

  // Curva suavizada: cúbicas con puntos de control en los medios de cada tramo.
  let linePath = `M ${points[0].px} ${points[0].py}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const current = points[i];
    const midX = (prev.px + current.px) / 2;
    linePath += ` C ${midX} ${prev.py}, ${midX} ${current.py}, ${current.px} ${current.py}`;
  }
  const areaPath = `${linePath} L ${last.px} ${H - PAD.bottom} L ${points[0].px} ${H - PAD.bottom} Z`;
  const goalY = y(targetWeightKg);

  const first = shown[0];
  const ariaLabel = shown.length === 1
    ? `Peso registrado: ${last.log.weight_kg} kg`
    : `Evolución del peso: de ${first.weight_kg} a ${last.log.weight_kg} kg. Objetivo ${targetWeightKg} kg.`;

  return (
    <svg className="weight-line-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
      <defs>
        <linearGradient id="weight-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--lime)" stopOpacity="0.34" />
          <stop offset="100%" stopColor="var(--lime)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Línea de objetivo */}
      <line x1={PAD.left} x2={W - PAD.right} y1={goalY} y2={goalY} className="chart-goal" />
      <text x={W - PAD.right} y={goalY - 5} textAnchor="end" className="chart-goal-label">{targetWeightKg} kg</text>

      {shown.length > 1 && <path d={areaPath} fill="url(#weight-area)" />}
      {shown.length > 1 && <path d={linePath} className="chart-line" />}

      {points.map((point, index) => (
        <circle
          key={point.log.measured_at}
          cx={point.px}
          cy={point.py}
          r={index === points.length - 1 ? 5 : 3.2}
          className={index === points.length - 1 ? "chart-dot latest" : "chart-dot"}
        />
      ))}

      {/* Valor del último punto */}
      <text
        x={Math.min(last.px, W - PAD.right - 4)}
        y={last.py - 11}
        textAnchor={last.px > W - 60 ? "end" : "middle"}
        className="chart-value"
      >
        {last.log.weight_kg.toFixed(1)}
      </text>

      {/* Fechas: primera y última */}
      <text x={points[0].px} y={H - 4} textAnchor={shown.length === 1 ? "middle" : "start"} className="chart-date">
        {shortDateLabel(first.measured_at)}
      </text>
      {shown.length > 1 && (
        <text x={last.px} y={H - 4} textAnchor="end" className="chart-date">
          {shortDateLabel(last.log.measured_at)}
        </text>
      )}
    </svg>
  );
}

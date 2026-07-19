import type { WeightLog } from "../../../src/types";
import { shortDateLabel } from "../../../src/lib/dates";

const CHART_PLOT_HEIGHT = 118; // alto útil de las barras dentro de .weight-chart
const BAR_MIN = 22;

interface WeightChartProps {
  logs: WeightLog[];
  targetWeightKg: number;
}

/** Evolución del peso con escala real: el dominio se calcula con los pesos
 *  del usuario y su objetivo (antes había un baseline de 97 kg hardcodeado
 *  y etiquetas S1-S6 inventadas). */
export default function WeightChart({ logs, targetWeightKg }: WeightChartProps) {
  const shown = logs.slice(-6);
  if (!shown.length) return null;

  const weights = shown.map((log) => log.weight_kg);
  const min = Math.min(...weights, targetWeightKg) - 0.5;
  const max = Math.max(...weights, targetWeightKg) + 0.5;
  const range = Math.max(0.1, max - min);
  const heightFor = (weightKg: number) => BAR_MIN + ((weightKg - min) / range) * (CHART_PLOT_HEIGHT - BAR_MIN);
  const goalBottom = 24 + heightFor(targetWeightKg);

  return (
    <div className="weight-chart" role="img" aria-label={`Evolución del peso: de ${shown[0].weight_kg} a ${shown[shown.length - 1].weight_kg} kg`}>
      <div className="chart-goal-line" style={{ bottom: goalBottom }}>
        <span>{targetWeightKg} kg</span>
      </div>
      {shown.map((log, index) => {
        const isLatest = index === shown.length - 1;
        return (
          <div
            className={`chart-bar ${isLatest ? "latest" : ""}`}
            key={log.measured_at}
            style={{ height: `${heightFor(log.weight_kg)}px` }}
          >
            {isLatest && <em>{log.weight_kg.toFixed(1)}</em>}
            <span>{shortDateLabel(log.measured_at)}</span>
          </div>
        );
      })}
    </div>
  );
}

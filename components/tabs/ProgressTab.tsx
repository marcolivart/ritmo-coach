import { Check, Dumbbell, Flame, Plus, Scale } from "lucide-react";
import Pill from "../ui/Pill";
import Skeleton from "../ui/Skeleton";
import WeightChart from "./progress/WeightChart";
import { useAppData } from "../../src/state/AppContext";

export default function ProgressTab() {
  const app = useAppData();
  const {
    profile, currentWeight, totalWeightChangeKg, weightLogs, weeklyWeightDeltaKg,
    weeklyAdherencePercent, workoutDaysThisWeek, workoutDaysLast6Weeks,
    strengthTrend, weighInStreak, initialLoading,
  } = app;

  if (initialLoading) {
    return (
      <>
        <div className="page-header"><h1 className="page-title">Progreso</h1></div>
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="row" />
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="meal-kicker">Últimas 6 semanas</div>
          <h1 className="page-title">Progreso</h1>
        </div>
        <button className="icon-button pressable" onClick={() => app.setWeightSheetOpen(true)} aria-label="Registrar peso">
          <Plus size={21} />
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{weightLogs.length ? `${totalWeightChangeKg > 0 ? "+" : ""}${totalWeightChangeKg.toFixed(1)} kg` : "—"}</div>
          <div className="stat-label">Desde el inicio</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{weeklyAdherencePercent === null ? "—" : `${weeklyAdherencePercent}%`}</div>
          <div className="stat-label">Adherencia semanal</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{workoutDaysLast6Weeks}</div>
          <div className="stat-label">Días entrenados (6 sem.)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{strengthTrend === null ? "—" : `${strengthTrend > 0 ? "+" : ""}${strengthTrend}%`}</div>
          <div className="stat-label">Fuerza estimada</div>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Evolución del peso</h2>
        {weeklyWeightDeltaKg !== null && (
          <Pill tone={weeklyWeightDeltaKg <= 0 ? "green" : "soft"}>
            {weeklyWeightDeltaKg <= 0 ? "Buen ritmo" : "Sube esta semana"}
          </Pill>
        )}
      </div>
      <div className="card">
        <div className="chart-head">
          <div>
            <div className="meal-kicker">Peso actual</div>
            <div className="chart-current">{currentWeight.toFixed(1)} kg</div>
          </div>
          {weeklyWeightDeltaKg !== null && (
            <div className={`chart-delta ${weeklyWeightDeltaKg <= 0 ? "down" : "up"}`}>
              {weeklyWeightDeltaKg > 0 ? "+" : ""}{weeklyWeightDeltaKg.toFixed(1)} kg
            </div>
          )}
        </div>
        {weightLogs.length ? (
          <WeightChart logs={weightLogs} targetWeightKg={profile.target_weight_kg} />
        ) : (
          <p className="empty-note">Aún no hay pesajes registrados. Se irán mostrando aquí cada semana.</p>
        )}
      </div>

      <div className="section-header"><h2 className="section-title">Lectura semanal</h2></div>
      <div className="card">
        <div className="meal-row">
          <div className="meal-icon"><Scale size={21} /></div>
          <div className="meal-copy">
            <div className="meal-name">{weeklyWeightDeltaKg === null ? "Sin suficiente historial de peso" : weeklyWeightDeltaKg <= 0 ? "Peso bajando o estable" : "Peso al alza esta semana"}</div>
            <div className="meal-meta">{weeklyWeightDeltaKg === null ? "Registra tu peso un par de semanas para ver la tendencia." : `${weeklyWeightDeltaKg > 0 ? "+" : ""}${weeklyWeightDeltaKg.toFixed(1)} kg frente a hace 7 días.`}</div>
          </div>
          {weeklyWeightDeltaKg !== null && <Check size={19} color={weeklyWeightDeltaKg <= 0 ? "var(--green)" : "var(--muted)"} aria-hidden="true" />}
        </div>
        <div className="meal-row">
          <div className="meal-icon"><Dumbbell size={21} /></div>
          <div className="meal-copy">
            <div className="meal-name">{workoutDaysThisWeek}/{profile.training_days} días entrenados esta semana</div>
            <div className="meal-meta">{weeklyAdherencePercent !== null && weeklyAdherencePercent >= 100 ? "Objetivo semanal cumplido." : "Basado en series y sesiones guardadas en la app."}</div>
          </div>
          <Check size={19} color={weeklyAdherencePercent !== null && weeklyAdherencePercent >= 100 ? "var(--green)" : "var(--muted)"} aria-hidden="true" />
        </div>
        <div className="meal-row">
          <div className="meal-icon"><Flame size={21} /></div>
          <div className="meal-copy">
            <div className="meal-name">{weighInStreak ? `${weighInStreak} semanas seguidas pesándote` : "Aún sin racha de pesajes"}</div>
            <div className="meal-meta">Pésate cada semana el mismo día para mantenerla.</div>
          </div>
        </div>
      </div>
    </>
  );
}

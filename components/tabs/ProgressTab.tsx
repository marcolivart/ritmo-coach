import { Dumbbell, Flame, Plus, Scale, TrendingDown, TrendingUp } from "lucide-react";
import IconBox from "../ui/IconBox";
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
        <Skeleton variant="hero" />
        <Skeleton variant="card" />
        <Skeleton variant="row" />
      </>
    );
  }

  const trendingDown = weeklyWeightDeltaKg !== null && weeklyWeightDeltaKg <= 0;

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

      {/* HÉROE: la historia principal — tu peso y hacia dónde va */}
      <div className="card card-dark progress-hero">
        <div className="weight-card-top">
          <span className="progress-hero-eyebrow">Tu peso</span>
          {weeklyWeightDeltaKg !== null && (
            <span className={`hero-goal-trend ${trendingDown ? "down" : "up"}`}>
              {trendingDown ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              {weeklyWeightDeltaKg > 0 ? "+" : ""}{weeklyWeightDeltaKg.toFixed(1)} kg / semana
            </span>
          )}
        </div>
        <div className="progress-hero-number">{currentWeight.toFixed(1)}<small>kg</small></div>
        {weightLogs.length ? (
          <WeightChart logs={weightLogs} targetWeightKg={profile.target_weight_kg} />
        ) : (
          <p className="progress-hero-empty">Aún no hay pesajes. Registra el primero y aquí verás tu curva hacia los {profile.target_weight_kg} kg.</p>
        )}
      </div>

      {/* MÉTRICAS con contexto */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-top">
            <IconBox size="sm" tone="soft"><Scale size={18} /></IconBox>
          </div>
          <div className="stat-value">{weightLogs.length ? `${totalWeightChangeKg > 0 ? "+" : ""}${totalWeightChangeKg.toFixed(1)} kg` : "—"}</div>
          <div className="stat-label">Desde el inicio</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <IconBox size="sm" tone="lime"><Flame size={18} /></IconBox>
            {weeklyAdherencePercent !== null && weeklyAdherencePercent >= 100 && <Pill tone="green">✓</Pill>}
          </div>
          <div className="stat-value">{weeklyAdherencePercent === null ? "—" : `${weeklyAdherencePercent}%`}</div>
          <div className="stat-label">Adherencia semanal</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <IconBox size="sm"><Dumbbell size={18} /></IconBox>
          </div>
          <div className="stat-value">{workoutDaysLast6Weeks}</div>
          <div className="stat-label">Días entrenados · 6 sem.</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <IconBox size="sm" tone="ink"><TrendingUp size={18} /></IconBox>
          </div>
          <div className="stat-value">{strengthTrend === null ? "—" : `${strengthTrend > 0 ? "+" : ""}${strengthTrend}%`}</div>
          <div className="stat-label">Fuerza estimada</div>
        </div>
      </div>

      {/* LECTURA SEMANAL con veredicto claro */}
      <div className="section-header"><h2 className="section-title">Lectura semanal</h2></div>
      <div className="card">
        <div className="meal-row">
          <IconBox><Scale size={20} /></IconBox>
          <div className="meal-copy">
            <div className="meal-name">{weeklyWeightDeltaKg === null ? "Sin suficiente historial de peso" : trendingDown ? "Peso bajando o estable" : "Peso al alza esta semana"}</div>
            <div className="meal-meta">{weeklyWeightDeltaKg === null ? "Registra tu peso un par de semanas para ver la tendencia." : `${weeklyWeightDeltaKg > 0 ? "+" : ""}${weeklyWeightDeltaKg.toFixed(1)} kg frente a hace 7 días.`}</div>
          </div>
          {weeklyWeightDeltaKg === null ? <Pill tone="soft">—</Pill> : trendingDown ? <Pill tone="green">Buen ritmo</Pill> : <Pill tone="orange">Vigilar</Pill>}
        </div>
        <div className="meal-row">
          <IconBox><Dumbbell size={20} /></IconBox>
          <div className="meal-copy">
            <div className="meal-name">{workoutDaysThisWeek}/{profile.training_days} días entrenados esta semana</div>
            <div className="meal-meta">{weeklyAdherencePercent !== null && weeklyAdherencePercent >= 100 ? "Objetivo semanal cumplido." : "Basado en series y sesiones guardadas en la app."}</div>
          </div>
          {weeklyAdherencePercent !== null && weeklyAdherencePercent >= 100 ? <Pill tone="green">Cumplido</Pill> : <Pill tone="soft">En curso</Pill>}
        </div>
        <div className="meal-row">
          <IconBox><Flame size={20} /></IconBox>
          <div className="meal-copy">
            <div className="meal-name">{weighInStreak ? `${weighInStreak} ${weighInStreak === 1 ? "semana seguida" : "semanas seguidas"} pesándote` : "Aún sin racha de pesajes"}</div>
            <div className="meal-meta">Pésate cada semana el mismo día para mantenerla.</div>
          </div>
          {weighInStreak ? <Pill tone="lime">{weighInStreak} sem</Pill> : <Pill tone="soft">Empieza</Pill>}
        </div>
      </div>
    </>
  );
}

import { ChevronRight, Clock3, Sparkles, TrendingDown, TrendingUp, TriangleAlert, Utensils } from "lucide-react";
import ActivityRings from "../today/ActivityRings";
import CountUp from "../ui/CountUp";
import Skeleton from "../ui/Skeleton";
import { useAppData } from "../../src/state/AppContext";
import { weekdayMon0 } from "../../src/lib/dates";

function currentTimeHHMM(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function TodayTab() {
  const app = useAppData();
  const {
    profile, currentWeight, startWeightKg, weeklyWeightDeltaKg, weightProgressPercent,
    totalWeightChangeKg, weightLogs, weighInStreak, workoutDaysThisWeek,
    todayWorkout, todayIsRestDay, setsCompletedToday, todayTotalSets,
    estimatedCalories, estimatedProtein, personalizedWeek, schedule, coach,
    initialLoading,
  } = app;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";
  const kgToGoal = Math.abs(currentWeight - profile.target_weight_kg);
  const goalDirection = profile.target_weight_kg < startWeightKg ? "perder" : profile.target_weight_kg > startWeightKg ? "ganar" : "mantener";

  if (initialLoading) {
    return (
      <>
        <h1 className="hero-title">{greeting}.</h1>
        <Skeleton variant="hero" />
        <Skeleton variant="card" />
        <Skeleton variant="row" />
        <Skeleton variant="row" />
      </>
    );
  }

  // Próxima comida real según los horarios habituales del perfil.
  const todayPlan = personalizedWeek[weekdayMon0()];
  const nowHHMM = currentTimeHHMM();
  const upcomingMeal = todayPlan.meals.find((meal) => (schedule[meal.type] ?? "23:59") >= nowHHMM);
  const shownMeal = upcomingMeal ?? todayPlan.meals[todayPlan.meals.length - 1];
  const mealTimeLabel = upcomingMeal
    ? `${shownMeal.type}${schedule[shownMeal.type] ? ` · ${schedule[shownMeal.type]}` : ""}`
    : `${shownMeal.type} · última de hoy`;

  const workoutRing = Math.min(1, todayTotalSets > 0 ? setsCompletedToday / todayTotalSets : 0);
  const workoutMeta = todayIsRestDay
    ? "Hoy es descanso · toca este próximo"
    : setsCompletedToday === 0
      ? "Aún no has empezado"
      : setsCompletedToday >= todayTotalSets
        ? "¡Completado! 💪"
        : `${setsCompletedToday}/${todayTotalSets} series hechas`;

  return (
    <>
      <h1 className="hero-title">{greeting},<br />{profile.name}.</h1>
      <p className="hero-subtitle">
        {goalDirection === "mantener"
          ? "Hoy toca sostener el ritmo."
          : kgToGoal < 0.1
            ? "Has llegado a tu objetivo. Toca consolidarlo."
            : `Te faltan ${kgToGoal.toFixed(1)} kg para tu objetivo. Vamos a por hoy.`}
      </p>

      {/* HÉROE: progreso hacia el objetivo — el dato que importa cada día */}
      <button className="hero-goal pressable" onClick={() => app.setWeightSheetOpen(true)}>
        <div className="hero-goal-head">
          <span className="hero-goal-eyebrow">Tu peso</span>
          {weeklyWeightDeltaKg !== null && (
            <span className={`hero-goal-trend ${weeklyWeightDeltaKg <= 0 ? "down" : "up"}`}>
              {weeklyWeightDeltaKg <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              {weeklyWeightDeltaKg > 0 ? "+" : ""}{weeklyWeightDeltaKg.toFixed(1)} kg / semana
            </span>
          )}
        </div>
        <div className="hero-goal-number"><CountUp value={currentWeight} decimals={1} /><small>kg</small></div>
        <div className="hero-goal-bar">
          <div className="hero-goal-bar-fill" style={{ width: `${Math.max(4, weightProgressPercent)}%` }} />
        </div>
        <div className="hero-goal-foot">
          <span>{startWeightKg.toFixed(1)} kg</span>
          {weightProgressPercent > 0 && <span className="hero-goal-foot-pct">{weightProgressPercent}% del camino</span>}
          <span>{profile.target_weight_kg} kg</span>
        </div>
      </button>

      {/* FOCO DE HOY: el entreno del día con su anillo */}
      <button className="today-focus pressable" onClick={() => app.handleTabChange("training")}>
        <ActivityRings rings={[{ value: workoutRing, color: "var(--green)", label: "Entreno", detail: "" }]} size={72} showLegend={false} />
        <div className="today-focus-copy">
          <span className="today-focus-eyebrow">{todayIsRestDay ? "Próximo entreno" : "Entreno de hoy"}</span>
          <span className="today-focus-title">{todayWorkout.name}</span>
          <span className="today-focus-meta">{workoutMeta}</span>
        </div>
        <ChevronRight size={20} className="today-focus-arrow" />
      </button>

      {/* MÉTRICAS */}
      <div className="metric-strip">
        <div className="metric">
          <span className="metric-value">
            {weightLogs.length ? <>{totalWeightChangeKg > 0 ? "+" : ""}<CountUp value={totalWeightChangeKg} decimals={1} /></> : "—"}
          </span>
          <span className="metric-unit">kg</span>
          <span className="metric-label">desde el inicio</span>
        </div>
        <div className="metric-divider" />
        <div className="metric">
          <span className="metric-value"><CountUp value={workoutDaysThisWeek} /></span>
          <span className="metric-unit">/{profile.training_days}</span>
          <span className="metric-label">entrenos semana</span>
        </div>
        <div className="metric-divider" />
        <div className="metric">
          <span className="metric-value">{weighInStreak ? <CountUp value={weighInStreak} /> : "—"}</span>
          <span className="metric-unit">{weighInStreak ? "sem" : ""}</span>
          <span className="metric-label">racha pesaje</span>
        </div>
      </div>

      {/* PLAN DE HOY */}
      <div className="section-header">
        <h2 className="section-title">Tu plan de hoy</h2>
        <button className="text-button pressable" onClick={() => app.goToFood("week")}>Ver semana</button>
      </div>

      <button className="plan-card plan-card-food pressable" onClick={() => app.goToFood("week")}>
        <div className="plan-card-icon"><Utensils size={20} /></div>
        <div className="plan-card-body">
          <div className="plan-card-title">Comida</div>
          <div className="plan-card-meta">{estimatedCalories.toLocaleString("es-ES")} kcal · {estimatedProtein} g proteína · {profile.meal_count} comidas</div>
        </div>
        <ChevronRight size={18} className="plan-card-arrow" />
      </button>

      <button className="plan-card plan-card-next pressable" onClick={() => app.setMealSheet({ meal: shownMeal, day: todayPlan })}>
        <div className="plan-card-icon"><Clock3 size={20} /></div>
        <div className="plan-card-body">
          <div className="plan-card-title">{mealTimeLabel}</div>
          <div className="plan-card-meta">{shownMeal.name} · {shownMeal.calories} kcal</div>
        </div>
        <ChevronRight size={18} className="plan-card-arrow" />
      </button>

      {/* MENSAJE DEL COACH — generado con tus datos reales, cambia cada día */}
      <div className={`coach-note ${coach.tone === "warn" ? "tone-warn" : ""}`}>
        <div className="coach-note-icon">{coach.tone === "warn" ? <TriangleAlert size={19} /> : <Sparkles size={19} />}</div>
        <div>
          <div className="coach-note-title">{coach.title}</div>
          <div className="coach-note-text">{coach.text}</div>
        </div>
      </div>
    </>
  );
}

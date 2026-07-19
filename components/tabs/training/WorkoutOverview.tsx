import { Bike, ChevronRight, Dumbbell, Flame, Footprints, MoreHorizontal, Play, Sparkles } from "lucide-react";
import Pill from "../../ui/Pill";
import { useAppData } from "../../../src/state/AppContext";
import { addDaysISO, mondayISO, weekdayMon0 } from "../../../src/lib/dates";
import { isCardioWorkout, weekdayShortNames, workoutById, type Workout } from "../../../src/lib/workouts";

const SHORT_DAY_NAMES: Record<string, string> = {
  Lun: "Lunes", Mar: "Martes", Mié: "Miércoles", Jue: "Jueves", Vie: "Viernes", Sáb: "Sábado", Dom: "Domingo",
};

function workoutIcon(workout: Workout) {
  if (!isCardioWorkout(workout)) return <Dumbbell size={20} />;
  if (workout.modality === "Running") return <Footprints size={20} />;
  if (workout.modality === "Bici") return <Bike size={20} />;
  return <Footprints size={20} />;
}

export default function WorkoutOverview() {
  const app = useAppData();
  const {
    activeWorkout, activeStrength, weekPlan, todayWorkout, todayIsRestDay,
    latestByExercise, strengthTrend, recentExerciseSets,
  } = app;
  const todayWeekday = weekdayMon0();
  const cardio = isCardioWorkout(activeWorkout) ? activeWorkout : null;
  const isTodayWorkout = activeWorkout.id === todayWorkout.id && !todayIsRestDay;

  const heroMeta = cardio
    ? `${cardio.blocks.length} bloques · ${cardio.durationMin} min · ${cardio.modality}`
    : `${activeStrength!.exercises.length} ejercicios · ${activeStrength!.exercises.length * 3} series · ~${Math.round(activeStrength!.exercises.length * 9)} min`;

  const monday = mondayISO();
  const upcoming = weekPlan.filter(({ weekday }) => weekday >= todayWeekday);
  const shownPlan = upcoming.length > 0 ? upcoming : weekPlan;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="meal-kicker">Plan de {weekPlan.length} {weekPlan.length === 1 ? "día" : "días"} a la semana</div>
          <h1 className="page-title">Entrenamiento</h1>
        </div>
        <button className="icon-button pressable" onClick={() => app.setWorkoutOptionsOpen(true)} aria-label="Opciones de entrenamiento">
          <MoreHorizontal size={21} />
        </button>
      </div>

      <div className="card card-dark workout-hero">
        <div>
          <div className="weight-card-top">
            <Pill tone="light">{workoutIcon(activeWorkout)} {isTodayWorkout ? "Hoy · " : ""}{activeWorkout.name}</Pill>
            <Flame size={22} aria-hidden="true" />
          </div>
          <h2 className="workout-title">{activeWorkout.summary}</h2>
          <div className="workout-meta">{heroMeta}</div>
        </div>
        <div className="workout-actions">
          <button className="primary-button lime pressable" onClick={() => {
            if (activeStrength) app.startExercise(0);
            app.setTrainingView("guide");
          }}>
            <Play size={17} fill="currentColor" /> {cardio ? "Ver sesión" : "Empezar"}
          </button>
        </div>
      </div>

      {cardio ? (
        <>
          <div className="section-header"><h2 className="section-title">Sesión de {cardio.name.toLowerCase()}</h2></div>
          <div className="card">
            {cardio.blocks.map((block) => (
              <div className="cardio-block" key={block.phase}>
                <div className="cardio-minutes">{block.minutes}′</div>
                <div className="cardio-phase">
                  <div className="cardio-phase-name">{block.phase}</div>
                  <div className="cardio-phase-detail">{block.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="section-header">
            <h2 className="section-title">Ejercicios de {activeWorkout.name}</h2>
            <Pill tone="green">Progresión activa</Pill>
          </div>
          <div className="card">
            {activeStrength!.exercises.map((exercise, index) => {
              const history = latestByExercise[exercise.name];
              const lastLabel = history ? `${history.weightKg ?? "—"} kg × ${history.reps ?? "—"}` : exercise.previous;
              return (
                <button
                  className={`exercise-row pressable ${index === app.activeExercise ? "active" : ""}`}
                  key={exercise.name}
                  onClick={() => { app.startExercise(index); app.setTrainingView("guide"); }}
                >
                  <div className="exercise-number">{index + 1}</div>
                  <div className="exercise-copy">
                    <div className="exercise-name">{exercise.name}</div>
                    <div className="exercise-detail">{exercise.detail} · {lastLabel}</div>
                  </div>
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="section-header"><h2 className="section-title">La app ha aprendido</h2></div>
      <div className="card card-lime">
        <div className="learn-row">
          <div className="iconbox tone-ink"><Sparkles size={21} /></div>
          {strengthTrend === null ? (
            <div>
              <div className="learn-title">Aún reuniendo datos</div>
              <div className="learn-text">Registra unas cuantas series más para ver aquí tu progreso real de fuerza.</div>
            </div>
          ) : (
            <div>
              <div className="learn-title">
                {strengthTrend > 0 ? `Tu fuerza estimada sube un ${strengthTrend}%` : strengthTrend < 0 ? `Tu fuerza estimada baja un ${Math.abs(strengthTrend)}%` : "Tu fuerza estimada se mantiene"}
              </div>
              <div className="learn-text">Comparando tus series más recientes con las primeras que registraste.</div>
            </div>
          )}
        </div>
      </div>

      <div className="section-header"><h2 className="section-title">Tu semana</h2></div>
      <div className="card">
        {shownPlan.length === 0 ? (
          <div className="empty-state">
            <div className="meal-name">Sin días de entreno configurados</div>
            <div className="meal-meta">Ajusta tus días de entreno en Perfil.</div>
          </div>
        ) : shownPlan.map(({ weekday, workoutId }) => {
          const workout = workoutById(workoutId);
          if (!workout) return null;
          const dateISO = addDaysISO(monday, weekday);
          const isToday = weekday === todayWeekday;
          const doneThatDay = recentExerciseSets.some((set) => set.performed_at.slice(0, 10) === dateISO);
          return (
            <button className="setting-row pressable" key={weekday} onClick={() => app.selectWorkout(workoutId)}>
              <div className="setting-icon">{workoutIcon(workout)}</div>
              <div className="setting-copy">
                <div className="setting-name">{SHORT_DAY_NAMES[weekdayShortNames[weekday]] ?? weekdayShortNames[weekday]} · {workout.name}</div>
                <div className="setting-value">
                  {isToday ? "Hoy · " : ""}
                  {isCardioWorkout(workout) ? `${workout.durationMin} min de ${workout.modality.toLowerCase()}` : `${workout.exercises.length} ejercicios`}
                </div>
              </div>
              {doneThatDay ? <Pill tone="green">Listo</Pill> : <ChevronRight size={17} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </>
  );
}

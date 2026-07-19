import { Check, ChevronRight, Plus, RefreshCw, Target, TimerReset, X } from "lucide-react";
import Pill from "../../ui/Pill";
import { useAppData } from "../../../src/state/AppContext";

export default function ExerciseGuide() {
  const app = useAppData();
  const { activeStrength, activeExercise, currentExercise, isSwapped, setData, restSecondsLeft, latestByExercise, showToast } = app;
  if (!activeStrength || !currentExercise) return null;

  const exercise = currentExercise;
  const history = latestByExercise[exercise.name];
  const lastTimeLabel = history ? `${history.weightKg ?? "—"} kg × ${history.reps ?? "—"}` : exercise.previous;
  const restLabel = restSecondsLeft !== null
    ? `${String(Math.floor(restSecondsLeft / 60)).padStart(2, "0")}:${String(restSecondsLeft % 60).padStart(2, "0")}`
    : exercise.rest;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="meal-kicker">Ejercicio {activeExercise + 1} de {activeStrength.exercises.length}</div>
          <h1 className="page-title guide-title">{exercise.name}</h1>
        </div>
        <button className="icon-button pressable" onClick={() => app.setTrainingView("overview")} aria-label="Volver a la rutina">
          <X size={20} />
        </button>
      </div>

      {exercise.videoUrl ? (
        <>
          <div className="guide-video">
            <video
              key={exercise.videoUrl}
              className="exercise-video"
              src={exercise.videoUrl}
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onError={() => showToast("No se ha podido cargar el vídeo. Comprueba la conexión.")}
            />
          </div>
          <div className="video-credit">
            Vídeo: <a href={exercise.videoSource} target="_blank" rel="noreferrer">{exercise.videoAuthor}</a> · {exercise.videoLicense}
          </div>
        </>
      ) : (
        <div className="card video-fallback">
          {isSwapped
            ? "Sin vídeo para esta alternativa — sigue el mismo objetivo de series y descanso."
            : "Vídeo no disponible todavía para este ejercicio. La técnica de abajo te guía paso a paso."}
        </div>
      )}

      <div className="card card-green">
        <Pill tone="light"><Target size={13} /> Objetivo de hoy</Pill>
        <div className="guide-target">{exercise.target}</div>
        <div className="guide-target-meta">Descanso: {exercise.rest} · Última vez: {lastTimeLabel}</div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Registra tus series</h2>
        <Pill tone="soft"><TimerReset size={13} /> {restLabel}</Pill>
      </div>
      <div className="card">
        <div className="set-grid">
          <div className="set-head">SERIE</div><div className="set-head">KG</div><div className="set-head">REPS</div><div />
          {setData.map((set, index) => (
            <div key={index} style={{ display: "contents" }}>
              <div className="set-index">{index + 1}</div>
              <input
                className="set-input"
                inputMode="decimal"
                value={set.kg}
                onChange={(event) => app.updateSet(index, "kg", event.target.value)}
                aria-label={`Kilos de la serie ${index + 1}`}
              />
              <input
                className="set-input"
                inputMode="numeric"
                value={set.reps}
                onChange={(event) => app.updateSet(index, "reps", event.target.value)}
                aria-label={`Repeticiones de la serie ${index + 1}`}
              />
              <button
                className={`set-check pressable ${set.done ? "done" : ""}`}
                onClick={() => void app.toggleSetDone(index)}
                aria-label={set.done ? `Desmarcar serie ${index + 1}` : `Marcar serie ${index + 1} como hecha`}
                aria-pressed={set.done}
              >
                {set.done ? <Check size={18} /> : <Plus size={18} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="section-header"><h2 className="section-title">Cómo hacerlo</h2></div>
      <div className="card">
        <ul className="tip-list">
          {exercise.technique.map((tip, index) => <li key={tip}>{index === 0 ? <strong>{tip}</strong> : tip}</li>)}
        </ul>
      </div>

      <div className="section-header"><h2 className="section-title">Evita estos errores</h2></div>
      <div className="card">
        {exercise.mistakes.map((mistake) => (
          <div className="meal-row" key={mistake.title}>
            <div className="meal-icon danger"><X size={20} /></div>
            <div className="meal-copy">
              <div className="meal-name">{mistake.title}</div>
              <div className="meal-meta">{mistake.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="guide-actions">
        <button className="secondary-button pressable" onClick={app.toggleExerciseSwap}>
          <RefreshCw size={17} /> {isSwapped ? "Usar original" : "Máquina ocupada"}
        </button>
        <button className="primary-button green pressable" onClick={() => {
          if (activeExercise < activeStrength.exercises.length - 1) {
            app.startExercise(activeExercise + 1);
          } else {
            app.setTrainingView("overview");
            showToast("Entrenamiento completado");
          }
        }}>
          Siguiente <ChevronRight size={17} />
        </button>
      </div>
    </>
  );
}

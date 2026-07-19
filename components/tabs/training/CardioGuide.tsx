import { Check, Play, Target, X } from "lucide-react";
import Pill from "../../ui/Pill";
import { useAppData } from "../../../src/state/AppContext";
import { isCardioWorkout } from "../../../src/lib/workouts";

export default function CardioGuide() {
  const app = useAppData();
  const workout = app.activeWorkout;
  if (!isCardioWorkout(workout)) return null;
  const done = app.cardioDoneToday(workout);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="meal-kicker">{workout.modality} · {workout.durationMin} min</div>
          <h1 className="page-title guide-title">{workout.name}</h1>
        </div>
        <button className="icon-button pressable" onClick={() => app.setTrainingView("overview")} aria-label="Volver al plan">
          <X size={20} />
        </button>
      </div>

      <div className="card card-green">
        <Pill tone="light"><Target size={13} /> Objetivo de hoy</Pill>
        <div className="guide-target">{workout.durationMin} minutos</div>
        <div className="guide-target-meta">{workout.summary}</div>
      </div>

      <div className="section-header"><h2 className="section-title">La sesión, por bloques</h2></div>
      <div className="card">
        {workout.blocks.map((block) => (
          <div className="cardio-block" key={block.phase}>
            <div className="cardio-minutes">{block.minutes}′</div>
            <div className="cardio-phase">
              <div className="cardio-phase-name">{block.phase}</div>
              <div className="cardio-phase-detail">{block.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-header"><h2 className="section-title">Consejos</h2></div>
      <div className="card">
        <ul className="tip-list">
          <li><strong>El ritmo correcto es el que puedes mantener.</strong> Si terminas reventado, la próxima vez sal más suave.</li>
          <li>Hidrátate antes de salir; en sesiones de menos de una hora no necesitas nada más.</li>
          <li>Registra la sesión al terminar: cuenta para tu adherencia semanal igual que un día de pesas.</li>
        </ul>
      </div>

      <button
        className={`primary-button full pressable ${done ? "" : "green"}`}
        style={{ marginTop: 15 }}
        onClick={() => void app.toggleCardioDone(workout)}
      >
        {done ? <><Check size={18} /> Hecha hoy · toca para deshacer</> : <><Play size={18} fill="currentColor" /> Marcar sesión como hecha</>}
      </button>
    </>
  );
}

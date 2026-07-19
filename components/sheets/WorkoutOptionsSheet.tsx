import { Bike, Check, Dumbbell, Footprints, Home, Settings2, SlidersHorizontal } from "lucide-react";
import BottomSheet from "../ui/BottomSheet";
import Pill from "../ui/Pill";
import SettingRow from "../ui/SettingRow";
import { useAppData } from "../../src/state/AppContext";
import { isCardioWorkout, workouts, type Workout } from "../../src/lib/workouts";

function iconFor(workout: Workout) {
  if (!isCardioWorkout(workout)) return workout.kind === "home" ? <Home size={20} /> : <Dumbbell size={20} />;
  return workout.modality === "Bici" ? <Bike size={20} /> : <Footprints size={20} />;
}

function detailFor(workout: Workout): string {
  return isCardioWorkout(workout)
    ? `${workout.durationMin} min de ${workout.modality.toLowerCase()}`
    : `${workout.exercises.length} ejercicios · ${workout.kind === "home" ? "sin material" : "gimnasio"}`;
}

/** Menú del botón "···" de Entreno: cambiar la rutina activa o ajustar el plan. */
export default function WorkoutOptionsSheet() {
  const app = useAppData();
  const { workoutOptionsOpen, activeWorkout } = app;

  return (
    <BottomSheet open={workoutOptionsOpen} onClose={() => app.setWorkoutOptionsOpen(false)} label="Opciones de entrenamiento">
      <Pill tone="green"><SlidersHorizontal size={13} /> Rutinas</Pill>
      <h2 className="sheet-title">Cambiar rutina</h2>
      <p className="sheet-subtitle">Elige qué entrenar ahora. Tu plan semanal no cambia: es solo para hoy.</p>

      <div className="card">
        {workouts.map((workout) => (
          <SettingRow
            key={workout.id}
            icon={iconFor(workout)}
            name={workout.name}
            value={detailFor(workout)}
            trailing={workout.id === activeWorkout.id ? <Check size={18} color="var(--green)" aria-hidden="true" /> : undefined}
            onClick={() => {
              app.selectWorkout(workout.id);
              app.setTrainingView("overview");
              app.setWorkoutOptionsOpen(false);
            }}
          />
        ))}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <SettingRow
          icon={<Settings2 size={20} />}
          name="Ajustar mi plan semanal"
          value="Días de entreno y tipos de ejercicio"
          onClick={() => {
            app.setWorkoutOptionsOpen(false);
            app.setProfileSheetOpen(true);
          }}
        />
      </div>
    </BottomSheet>
  );
}

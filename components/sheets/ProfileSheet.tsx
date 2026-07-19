import { useEffect, useState } from "react";
import { Check, Settings2 } from "lucide-react";
import BottomSheet from "../ui/BottomSheet";
import Pill from "../ui/Pill";
import { useAppData } from "../../src/state/AppContext";
import type { Profile } from "../../src/types";

const EXERCISE_TYPE_OPTIONS = ["Gimnasio", "Running", "Caminar", "Casa", "Bici"];
const WEEKDAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/** Edición COMPLETA del perfil: todos los campos que recoge el onboarding
 *  se pueden cambiar aquí (antes faltaban sexo, nacimiento, actividad,
 *  tipos de ejercicio y número de comidas). */
export default function ProfileSheet() {
  const app = useAppData();
  const { profileSheetOpen, profile } = app;
  const [draft, setDraft] = useState<Profile>(profile);

  useEffect(() => {
    if (profileSheetOpen) setDraft(profile);
  }, [profileSheetOpen, profile]);

  const patch = (partial: Partial<Profile>) => setDraft((prev) => ({ ...prev, ...partial }));

  const toggleExerciseType = (type: string) => {
    patch({
      exercise_types: draft.exercise_types.includes(type)
        ? draft.exercise_types.filter((item) => item !== type)
        : [...draft.exercise_types, type],
    });
  };

  const save = async () => {
    if (!draft.name.trim() || draft.exercise_types.length === 0) {
      app.showToast("Completa el nombre y al menos un tipo de ejercicio");
      return;
    }
    const ok = await app.saveProfilePatch({ ...draft, name: draft.name.trim() });
    if (ok) {
      app.setProfileSheetOpen(false);
      app.showToast("Perfil actualizado");
    }
  };

  return (
    <BottomSheet open={profileSheetOpen} onClose={() => app.setProfileSheetOpen(false)} label="Editar perfil">
      <Pill tone="green"><Settings2 size={13} /> Datos del plan</Pill>
      <h2 className="sheet-title">Editar perfil</h2>
      <p className="sheet-subtitle">Los cambios recalculan la estimación energética, el menú y el plan de entrenamiento.</p>

      <div className="form-grid two">
        <label className="auth-field"><span>Nombre</span><div><input value={draft.name} onChange={(event) => patch({ name: event.target.value })} /></div></label>
        <label className="auth-field"><span>Sexo</span><div>
          <select value={draft.sex} onChange={(event) => patch({ sex: event.target.value as Profile["sex"] })}>
            <option value="male">Hombre</option>
            <option value="female">Mujer</option>
            <option value="other">Prefiero no decirlo</option>
          </select>
        </div></label>
        <label className="auth-field"><span>Fecha de nacimiento</span><div><input type="date" value={draft.birth_date ?? ""} onChange={(event) => patch({ birth_date: event.target.value || null })} /></div></label>
        <label className="auth-field"><span>Altura (cm)</span><div><input type="number" value={draft.height_cm} onChange={(event) => patch({ height_cm: Number(event.target.value) })} /></div></label>
        <label className="auth-field"><span>Peso objetivo</span><div><input type="number" step="0.1" value={draft.target_weight_kg} onChange={(event) => patch({ target_weight_kg: Number(event.target.value) })} /></div></label>
        <label className="auth-field"><span>Objetivo</span><div>
          <select value={draft.goal} onChange={(event) => patch({ goal: event.target.value as Profile["goal"] })}>
            <option value="lose">Perder peso</option>
            <option value="maintain">Mantener</option>
            <option value="gain">Ganar músculo</option>
          </select>
        </div></label>
        <label className="auth-field"><span>Nivel de actividad</span><div>
          <select value={draft.activity_level} onChange={(event) => patch({ activity_level: event.target.value as Profile["activity_level"] })}>
            <option value="sedentary">Sedentaria</option>
            <option value="light">Ligera</option>
            <option value="moderate">Moderada</option>
            <option value="high">Alta</option>
          </select>
        </div></label>
        <label className="auth-field"><span>Días de entreno</span><div><input type="number" min="0" max="7" value={draft.training_days} onChange={(event) => patch({ training_days: Number(event.target.value) })} /></div></label>
        <label className="auth-field"><span>Comidas al día</span><div>
          <select value={draft.meal_count} onChange={(event) => patch({ meal_count: Number(event.target.value) })}>
            <option value={3}>3 comidas</option>
            <option value={4}>4 comidas</option>
            <option value={5}>5 comidas</option>
          </select>
        </div></label>
        <label className="auth-field"><span>Día de pesaje</span><div>
          <select value={draft.weighing_day} onChange={(event) => patch({ weighing_day: Number(event.target.value) })}>
            {WEEKDAY_NAMES.map((day, index) => <option value={index} key={day}>{day}</option>)}
          </select>
        </div></label>
      </div>

      <div className="food-category-title">Tipo de ejercicio</div>
      <div className="tag-list" style={{ marginBottom: 18 }}>
        {EXERCISE_TYPE_OPTIONS.map((type) => {
          const active = draft.exercise_types.includes(type);
          return (
            <button
              key={type}
              className={`food-tag pressable ${active ? "favorite" : ""}`}
              onClick={() => toggleExerciseType(type)}
              aria-pressed={active}
            >
              {active && <Check size={14} />} {type}
            </button>
          );
        })}
      </div>

      <button className="primary-button green full pressable" onClick={() => void save()}>
        <Check size={18} /> Guardar cambios
      </button>
    </BottomSheet>
  );
}

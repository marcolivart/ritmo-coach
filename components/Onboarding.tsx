import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Dumbbell, Scale, Sparkles, Target, Utensils, Zap } from "lucide-react";
import type { ActivityLevel, Goal, Profile } from "../src/types";
import { saveProfile } from "../src/lib/database";

type Props = {
  userId: string;
  initialName: string;
  existingProfile?: Profile | null;
  onComplete: (profile: Profile) => void;
};

const exerciseOptions = ["Gimnasio", "Running", "Caminar", "Entrenamiento en casa", "Bicicleta"];
const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function Onboarding({ userId, initialName, existingProfile, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Profile>(() => existingProfile ?? ({
    id: userId,
    name: initialName || "Usuario",
    sex: "male",
    birth_date: "1996-01-01",
    height_cm: 175,
    current_weight_kg: 75,
    target_weight_kg: 70,
    goal: "lose",
    weighing_day: 0,
    activity_level: "moderate",
    exercise_types: ["Gimnasio"],
    training_days: 3,
    meal_count: 4,
    onboarding_completed: false,
  }));

  const progress = ((step + 1) / 5) * 100;
  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(form.name.trim() && form.goal);
    if (step === 1) return form.height_cm >= 120 && form.current_weight_kg >= 35 && form.target_weight_kg >= 35;
    if (step === 2) return Boolean(form.activity_level && form.training_days >= 0);
    if (step === 3) return form.exercise_types.length > 0;
    return true;
  }, [form, step]);

  const toggleExercise = (value: string) => {
    setForm((current) => ({
      ...current,
      exercise_types: current.exercise_types.includes(value)
        ? current.exercise_types.filter((item) => item !== value)
        : [...current.exercise_types, value],
    }));
  };

  const finish = async () => {
    setLoading(true);
    setError("");
    try {
      const saved = await saveProfile({ ...form, onboarding_completed: true });
      onComplete(saved);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se ha podido guardar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-stage">
      <section className="onboarding-shell">
        <header className="onboarding-header">
          <div className="auth-brand"><span><Zap size={22} /></span> ritmo</div>
          <div className="onboarding-progress"><i style={{ width: `${progress}%` }} /></div>
          <div className="onboarding-counter">Paso {step + 1} de 5</div>
        </header>

        <main className="onboarding-main">
          {step === 0 && (
            <div className="onboarding-panel">
              <span className="onboarding-icon"><Target size={25} /></span>
              <h1>¿Qué quieres conseguir?</h1>
              <p>Este objetivo decidirá cómo se calculan las cantidades de comida y la progresión semanal.</p>
              <label className="auth-field"><span>¿Cómo te llamamos?</span><div><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div></label>
              <div className="choice-grid">
                {([[
                  "lose", "Perder peso", "Déficit moderado y seguimiento semanal",
                ], ["maintain", "Mantenerme", "Estabilidad, energía y hábitos"], ["gain", "Ganar músculo", "Superávit moderado y fuerza"]] as [Goal, string, string][]).map(([value, title, copy]) => (
                  <button key={value} className={`choice-card ${form.goal === value ? "active" : ""}`} onClick={() => setForm({ ...form, goal: value })}><strong>{title}</strong><span>{copy}</span>{form.goal === value && <Check size={18} />}</button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="onboarding-panel">
              <span className="onboarding-icon"><Scale size={25} /></span>
              <h1>Tu punto de partida</h1>
              <p>Usaremos estos datos para estimar las porciones. Podrás cambiarlos después.</p>
              <div className="form-grid two">
                <label className="auth-field"><span>Altura (cm)</span><div><input type="number" inputMode="numeric" value={form.height_cm} onChange={(event) => setForm({ ...form, height_cm: Number(event.target.value) })} /></div></label>
                <label className="auth-field"><span>Peso actual (kg)</span><div><input type="number" step="0.1" inputMode="decimal" value={form.current_weight_kg} onChange={(event) => setForm({ ...form, current_weight_kg: Number(event.target.value) })} /></div></label>
                <label className="auth-field"><span>Peso objetivo (kg)</span><div><input type="number" step="0.1" inputMode="decimal" value={form.target_weight_kg} onChange={(event) => setForm({ ...form, target_weight_kg: Number(event.target.value) })} /></div></label>
                <label className="auth-field"><span>Fecha de nacimiento</span><div><input type="date" value={form.birth_date ?? ""} onChange={(event) => setForm({ ...form, birth_date: event.target.value })} /></div></label>
              </div>
              <label className="auth-field"><span>Sexo usado para la estimación energética</span><div><select value={form.sex} onChange={(event) => setForm({ ...form, sex: event.target.value as Profile["sex"] })}><option value="male">Hombre</option><option value="female">Mujer</option><option value="other">Prefiero una estimación neutra</option></select></div></label>
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-panel">
              <span className="onboarding-icon"><Sparkles size={25} /></span>
              <h1>Tu vida real</h1>
              <p>No queremos un plan perfecto sobre el papel, sino uno que encaje en tu semana.</p>
              <div className="choice-grid">
                {([[
                  "sedentary", "Poco movimiento",
                ], ["light", "Actividad ligera"], ["moderate", "Actividad moderada"], ["high", "Actividad alta"]] as [ActivityLevel, string][]).map(([value, title]) => (
                  <button key={value} className={`choice-card compact ${form.activity_level === value ? "active" : ""}`} onClick={() => setForm({ ...form, activity_level: value })}><strong>{title}</strong>{form.activity_level === value && <Check size={18} />}</button>
                ))}
              </div>
              <div className="form-grid two">
                <label className="auth-field"><span>Días de entrenamiento</span><div><input type="number" min="0" max="7" value={form.training_days} onChange={(event) => setForm({ ...form, training_days: Number(event.target.value) })} /></div></label>
                <label className="auth-field"><span>Comidas al día</span><div><select value={form.meal_count} onChange={(event) => setForm({ ...form, meal_count: Number(event.target.value) })}><option value={3}>3 comidas</option><option value={4}>4 comidas</option><option value={5}>5 comidas</option></select></div></label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="onboarding-panel">
              <span className="onboarding-icon"><Dumbbell size={25} /></span>
              <h1>¿Cómo quieres moverte?</h1>
              <p>Puedes combinar modalidades. El apartado de gimnasio incluirá vídeo, técnica, series, kilos y repeticiones.</p>
              <div className="exercise-choice-grid">
                {exerciseOptions.map((option) => <button key={option} className={`exercise-choice ${form.exercise_types.includes(option) ? "active" : ""}`} onClick={() => toggleExercise(option)}>{option}{form.exercise_types.includes(option) && <Check size={17} />}</button>)}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="onboarding-panel">
              <span className="onboarding-icon"><CalendarDays size={25} /></span>
              <h1>El día que manda</h1>
              <p>Una vez por semana registrarás el peso. Ese dato desbloqueará la adaptación del siguiente plan.</p>
              <div className="weekday-grid">{weekdays.map((day, index) => <button key={day} className={form.weighing_day === index ? "active" : ""} onClick={() => setForm({ ...form, weighing_day: index })}>{day.slice(0, 3)}{form.weighing_day === index && <Check size={16} />}</button>)}</div>
              <div className="onboarding-summary"><Utensils size={22} /><div><strong>La primera semana quedará preparada al terminar</strong><span>Menú de lunes a domingo, alternativas, lista de compra y entrenamiento.</span></div></div>
              {error && <div className="form-alert error">{error}</div>}
            </div>
          )}
        </main>

        <footer className="onboarding-actions">
          <button className="secondary-button" disabled={step === 0 || loading} onClick={() => setStep((value) => Math.max(0, value - 1))}><ArrowLeft size={18} /> Atrás</button>
          {step < 4 ? <button className="primary-button green" disabled={!canContinue} onClick={() => setStep((value) => value + 1)}>Continuar <ArrowRight size={18} /></button> : <button className="primary-button green" disabled={loading} onClick={finish}>{loading ? "Guardando…" : "Crear mi plan"} {!loading && <Check size={18} />}</button>}
        </footer>
      </section>
    </div>
  );
}

export interface ExerciseSetRecord {
  performed_at: string;
  weight_kg: number | null;
  repetitions: number | null;
  exercise_name: string;
}

/** Lunes ISO de hace N semanas (0 = lunes de esta semana). */
export function weeksAgoMondayISO(weeksAgo: number, today = new Date()): string {
  const monday = mondayISOInternal(today);
  const d = new Date(`${monday}T12:00:00`);
  d.setDate(d.getDate() - weeksAgo * 7);
  return mondayISOInternal(d);
}

function mondayISOInternal(date: Date): string {
  const copy = new Date(date);
  const day = copy.getDay();
  const distance = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + distance);
  return copy.toISOString().slice(0, 10);
}

/** 1RM estimado con la fórmula de Epley: peso × (1 + reps/30). */
export function estimatedOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 0) return weightKg;
  return weightKg * (1 + reps / 30);
}

/** Días distintos (fecha) con al menos una serie registrada. */
export function distinctTrainingDays(sets: ExerciseSetRecord[]): number {
  return new Set(sets.map((set) => set.performed_at.slice(0, 10))).size;
}

/** Último peso/reps registrado por nombre de ejercicio, para mostrar
 *  "última vez" real en vez de un valor fijo en los datos del ejercicio. */
export function latestSetsByExercise(
  sets: ExerciseSetRecord[],
): Record<string, { weightKg: number | null; reps: number | null; date: string }> {
  const result: Record<string, { weightKg: number | null; reps: number | null; date: string }> = {};
  for (const set of [...sets].sort((a, b) => a.performed_at.localeCompare(b.performed_at))) {
    result[set.exercise_name] = { weightKg: set.weight_kg, reps: set.repetitions, date: set.performed_at };
  }
  return result;
}

/** % de cambio en fuerza estimada comparando la primera mitad cronológica de
 *  series (con peso y reps válidos) frente a la segunda mitad. Devuelve
 *  `null` si no hay datos suficientes para que la comparación signifique algo
 *  (menos de 4 series válidas) — mejor no mostrar nada que inventar un %. */
export function strengthTrendPercent(sets: ExerciseSetRecord[]): number | null {
  const valid = sets
    .filter((set): set is ExerciseSetRecord & { weight_kg: number; repetitions: number } =>
      set.weight_kg != null && set.repetitions != null && set.repetitions > 0)
    .map((set) => ({ date: set.performed_at, oneRM: estimatedOneRepMax(set.weight_kg, set.repetitions) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (valid.length < 4) return null;

  const mid = Math.floor(valid.length / 2);
  const average = (items: { oneRM: number }[]) => items.reduce((sum, item) => sum + item.oneRM, 0) / items.length;
  const earlyAvg = average(valid.slice(0, mid));
  const recentAvg = average(valid.slice(mid));
  if (earlyAvg <= 0) return null;

  return Math.round(((recentAvg - earlyAvg) / earlyAvg) * 100);
}

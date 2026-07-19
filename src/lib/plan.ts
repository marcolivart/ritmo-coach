import type { Profile } from "../types";
import { weekdayMon0 } from "./dates";
import { isCardioWorkout, workouts, type CardioWorkout, type StrengthWorkout } from "./workouts";

/** Reparto de días de entreno en la semana. weekday: 0 = lunes … 6 = domingo. */
const TRAINING_DAY_PATTERNS: Record<number, number[]> = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export type PlannedDay = { weekday: number; workoutId: string };

function strengthPoolFor(exerciseTypes: string[]): StrengthWorkout[] {
  const gym = workouts.filter((w): w is StrengthWorkout => w.kind === "gym");
  const home = workouts.filter((w): w is StrengthWorkout => w.kind === "home");
  const hasGym = exerciseTypes.includes("Gimnasio");
  const hasHome = exerciseTypes.includes("Casa");
  if (hasGym && hasHome) return [...gym, ...home];
  if (hasGym) return gym;
  if (hasHome) return home;
  return [];
}

function cardioPoolFor(exerciseTypes: string[]): CardioWorkout[] {
  const wantsModality = (modality: CardioWorkout["modality"]) => {
    if (modality === "Running") return exerciseTypes.includes("Running");
    if (modality === "Caminar") return exerciseTypes.includes("Caminar");
    return exerciseTypes.includes("Bici") || exerciseTypes.includes("Bicicleta");
  };
  return workouts.filter(isCardioWorkout).filter((w) => wantsModality(w.modality));
}

/** Plan semanal determinista según días y tipos de ejercicio del perfil.
 *  Mezcla fuerza y cardio (~1 día de cardio por cada 3 de entreno, en los
 *  huecos centrales); si solo hay un tipo, rota su propio pool. */
export function buildWeeklyPlan(profile: Profile): PlannedDay[] {
  const clamped = Math.max(0, Math.min(7, Math.round(profile.training_days)));
  const weekdays = TRAINING_DAY_PATTERNS[clamped] ?? [];
  if (!weekdays.length) return [];

  let strength = strengthPoolFor(profile.exercise_types);
  const cardio = cardioPoolFor(profile.exercise_types);
  // Perfil sin tipos válidos (p. ej. datos antiguos): fuerza de gimnasio.
  if (!strength.length && !cardio.length) {
    strength = workouts.filter((w): w is StrengthWorkout => w.kind === "gym");
  }

  const days = weekdays.length;
  let cardioCount = 0;
  if (cardio.length) {
    if (!strength.length) cardioCount = days;
    else if (days >= 2) cardioCount = Math.min(days - 1, Math.max(1, Math.round(days / 3)));
  }
  // Huecos de cardio repartidos por el centro de la semana:
  // p. ej. 3 días → [fuerza, cardio, fuerza]; 5 días → cardio en los huecos 1 y 3.
  const cardioSlots = new Set<number>();
  for (let i = 1; i <= cardioCount; i += 1) {
    let slot = Math.max(0, Math.min(days - 1, Math.floor((i * days) / (cardioCount + 1))));
    while (cardioSlots.has(slot) && slot < days - 1) slot += 1;
    cardioSlots.add(slot);
  }

  let strengthIndex = 0;
  let cardioIndex = 0;
  return weekdays.map((weekday, index) => {
    const useCardio = cardio.length > 0 && (strength.length === 0 || cardioSlots.has(index));
    if (useCardio) {
      const workout = cardio[cardioIndex % cardio.length];
      cardioIndex += 1;
      return { weekday, workoutId: workout.id };
    }
    const workout = strength[strengthIndex % strength.length];
    strengthIndex += 1;
    return { weekday, workoutId: workout.id };
  });
}

/** Workout programado para hoy, o el primero del plan si hoy es descanso. */
export function todayPlannedWorkoutId(profile: Profile): { workoutId: string; isRestDay: boolean } {
  const plan = buildWeeklyPlan(profile);
  if (!plan.length) return { workoutId: workouts[0].id, isRestDay: true };
  const today = weekdayMon0();
  const slot = plan.find((item) => item.weekday === today);
  if (slot) return { workoutId: slot.workoutId, isRestDay: false };
  const next = plan.find((item) => item.weekday > today) ?? plan[0];
  return { workoutId: next.workoutId, isRestDay: true };
}

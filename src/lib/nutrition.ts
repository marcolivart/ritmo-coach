import type { Profile } from "../types";
import { mondayISO } from "./dates";

// Re-export para los consumidores existentes; la implementación vive en dates.ts.
export { mondayISO };

function getAge(birthDate: string | null): number {
  if (!birthDate) return 30;
  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) age -= 1;
  return Math.max(18, Math.min(age, 90));
}

export function estimateDailyCalories(profile: Profile): number {
  const age = getAge(profile.birth_date);
  const sexConstant = profile.sex === "male" ? 5 : profile.sex === "female" ? -161 : -78;
  const bmr = 10 * profile.current_weight_kg + 6.25 * profile.height_cm - 5 * age + sexConstant;
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, high: 1.725 } as const;
  const maintenance = bmr * multipliers[profile.activity_level];
  const adjustment = profile.goal === "lose" ? -350 : profile.goal === "gain" ? 250 : 0;
  return Math.round(Math.max(1300, Math.min(4500, maintenance + adjustment)) / 25) * 25;
}

/** Objetivo diario de proteína en gramos, según peso corporal y objetivo.
 *  Rango estándar de referencia: 1.6-2.2 g/kg en déficit o superávit,
 *  1.2-1.6 g/kg en mantenimiento. */
export function estimateDailyProtein(profile: Profile): number {
  const gramsPerKg = profile.goal === "maintain" ? 1.4 : 1.9;
  return Math.round((profile.current_weight_kg * gramsPerKg) / 5) * 5;
}

export function formatWeighingDay(day: number): string {
  return ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][day] ?? "Domingo";
}

/** Reparto real de macros: la proteína es la calculada, la grasa se fija en
 *  ~27,5% de las kcal y los carbohidratos completan el resto. Sustituye al
 *  antiguo split fijo 220 g/62 g escalado, que no respondía a nada. */
export function macroSplit(calories: number, proteinG: number): { carbsG: number; fatG: number } {
  const fatG = Math.round((calories * 0.275) / 9 / 5) * 5;
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4 / 5) * 5);
  return { carbsG, fatG };
}

/** ¿Toca pesarse? Sí cuando no hay registro esta semana Y además ya hemos
 *  llegado al día de pesaje configurado (o han pasado 7+ días desde el último
 *  registro, para no dejar escapar semanas enteras). `weighingDay` usa la
 *  codificación de getDay(): 0 = domingo … 6 = sábado. */
export function isWeightDue(
  logs: { measured_at: string }[],
  weighingDay: number,
  today = new Date(),
): boolean {
  if (!logs.length) return true;
  const latest = logs[logs.length - 1].measured_at;
  const monday = mondayISO(today);
  if (latest >= monday) return false; // ya hay pesaje esta semana
  const gapDays = (today.getTime() - new Date(`${latest}T12:00:00`).getTime()) / 86400000;
  if (gapDays >= 7) return true;
  // Día de pesaje de esta semana en índice lunes-0.
  const weighingDayMon0 = (weighingDay + 6) % 7;
  const todayMon0 = (today.getDay() + 6) % 7;
  return todayMon0 >= weighingDayMon0;
}

/** Semanas consecutivas (lunes a domingo) con al menos un registro de peso,
 *  contando hacia atrás desde la semana más reciente con datos. */
export function weighInStreakWeeks(logs: { measured_at: string }[], today = new Date()): number {
  if (!logs.length) return 0;
  const weeksWithLog = new Set(logs.map((log) => mondayISO(new Date(`${log.measured_at}T12:00:00`))));
  let cursor = new Date(`${mondayISO(today)}T12:00:00`);
  // Si esta semana aún no tiene pesaje, la racha se cuenta desde la semana anterior.
  if (!weeksWithLog.has(mondayISO(cursor))) cursor.setDate(cursor.getDate() - 7);
  let streak = 0;
  while (weeksWithLog.has(mondayISO(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

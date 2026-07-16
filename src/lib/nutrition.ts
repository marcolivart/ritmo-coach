import type { Profile } from "../types";

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

export function mondayISO(date = new Date()): string {
  const copy = new Date(date);
  const day = copy.getDay();
  const distance = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + distance);
  return copy.toISOString().slice(0, 10);
}

export function formatWeighingDay(day: number): string {
  return ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][day] ?? "Domingo";
}

/** Días que faltan hasta el próximo día de pesaje configurado (0 = hoy). */
export function daysUntilWeighIn(weighingDay: number, today = new Date()): number {
  const current = today.getDay();
  return (weighingDay - current + 7) % 7;
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

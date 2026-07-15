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

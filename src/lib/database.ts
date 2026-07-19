import { supabase } from "./supabase";
import { localDayRange } from "./dates";
import type {
  DatabaseExcludedMeal,
  DatabaseGroceryItem,
  DatabaseMealCompletion,
  FoodPreference,
  FoodPreferenceType,
  Profile,
  WeightLog,
} from "../types";

function client() {
  if (!supabase) throw new Error("Supabase no está configurado");
  return supabase;
}

type DbError = { message: string; hint?: string | null; code?: string };

function raise(error: DbError | null) {
  if (error) throw new Error(error.hint ? `${error.message}: ${error.hint}` : error.message);
}

/** La migración v2 (supabase/migration-v2.sql) añade índices, columnas y una
 *  RPC. El cliente debe funcionar ANTES de que Marc la ejecute, así que las
 *  rutas que dependen de ella detectan estos códigos y usan un fallback. */
const MISSING_FUNCTION_CODES = new Set(["PGRST202", "42883"]);
const MISSING_CONFLICT_TARGET_CODE = "42P10";
export const MISSING_COLUMN_CODES = new Set(["PGRST204", "42703"]);

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await client().from("profiles").select("*").eq("id", userId).maybeSingle();
  raise(error);
  return data as Profile | null;
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  const payload = { ...profile, updated_at: new Date().toISOString() };
  const attempt = await client().from("profiles").upsert(payload, { onConflict: "id" }).select().single();
  if (!attempt.error) return attempt.data as Profile;
  // Pre-migración: la columna `schedule` aún no existe. Se guarda el resto y
  // los horarios se conservan solo en memoria para esta sesión.
  if (MISSING_COLUMN_CODES.has(attempt.error.code ?? "") && payload.schedule !== undefined) {
    const { schedule, ...withoutSchedule } = payload;
    const retry = await client().from("profiles").upsert(withoutSchedule, { onConflict: "id" }).select().single();
    raise(retry.error);
    return { ...(retry.data as Profile), schedule };
  }
  raise(attempt.error);
  throw new Error("unreachable");
}

export async function getFoodPreferences(userId: string): Promise<FoodPreference[]> {
  const { data, error } = await client()
    .from("food_preferences")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  raise(error);
  return (data ?? []) as FoodPreference[];
}

export async function addFoodPreference(
  userId: string,
  foodName: string,
  restrictionType: FoodPreferenceType,
): Promise<FoodPreference> {
  const { data, error } = await client()
    .from("food_preferences")
    .upsert(
      { user_id: userId, food_name: foodName.trim(), restriction_type: restrictionType },
      { onConflict: "user_id,food_name,restriction_type", ignoreDuplicates: false },
    )
    .select()
    .single();
  raise(error);
  return data as FoodPreference;
}

export async function removeFoodPreference(id: number): Promise<void> {
  const { error } = await client().from("food_preferences").delete().eq("id", id);
  raise(error);
}

export async function getWeightLogs(userId: string): Promise<WeightLog[]> {
  const { data, error } = await client()
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .order("measured_at", { ascending: true });
  raise(error);
  return (data ?? []) as WeightLog[];
}

export async function saveWeightLog(userId: string, weightKg: number, measuredAt: string): Promise<WeightLog> {
  const { data, error } = await client()
    .from("weight_logs")
    .upsert(
      { user_id: userId, weight_kg: weightKg, measured_at: measuredAt },
      { onConflict: "user_id,measured_at" },
    )
    .select()
    .single();
  raise(error);
  return data as WeightLog;
}

export async function getGroceries(userId: string, weekStart: string): Promise<DatabaseGroceryItem[]> {
  const { data, error } = await client()
    .from("grocery_items")
    .select("*")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .order("id", { ascending: true });
  raise(error);
  return (data ?? []) as DatabaseGroceryItem[];
}

export async function seedGroceries(
  userId: string,
  weekStart: string,
  groceries: Array<{ category: string; name: string; amount: string; checked: boolean }>,
): Promise<DatabaseGroceryItem[]> {
  const rows = groceries.map((item) => ({ ...item, user_id: userId, week_start: weekStart }));
  // Índice nuevo (migración v2): la categoría forma parte de la unicidad.
  const attempt = await client()
    .from("grocery_items")
    .upsert(rows, { onConflict: "user_id,week_start,category,name" })
    .select();
  if (!attempt.error) return (attempt.data ?? []) as DatabaseGroceryItem[];
  if (attempt.error.code !== MISSING_CONFLICT_TARGET_CODE) raise(attempt.error);
  // Pre-migración: constraint legacy sin categoría.
  const { data, error } = await client()
    .from("grocery_items")
    .upsert(rows, { onConflict: "user_id,week_start,name" })
    .select();
  raise(error);
  return (data ?? []) as DatabaseGroceryItem[];
}

export async function setGroceryChecked(id: number, checked: boolean): Promise<void> {
  const { error } = await client().from("grocery_items").update({ checked }).eq("id", id);
  raise(error);
}

export async function getExcludedMeals(userId: string): Promise<DatabaseExcludedMeal[]> {
  const { data, error } = await client()
    .from("excluded_meals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  raise(error);
  return (data ?? []) as DatabaseExcludedMeal[];
}

export async function addExcludedMeal(userId: string, mealKey: string): Promise<DatabaseExcludedMeal> {
  const { data, error } = await client()
    .from("excluded_meals")
    .upsert({ user_id: userId, meal_key: mealKey }, { onConflict: "user_id,meal_key", ignoreDuplicates: false })
    .select()
    .single();
  raise(error);
  return data as DatabaseExcludedMeal;
}

export async function removeExcludedMeal(id: number): Promise<void> {
  const { error } = await client().from("excluded_meals").delete().eq("id", id);
  raise(error);
}

export async function getMealCompletions(userId: string, fromDateISO: string, toDateISO: string): Promise<DatabaseMealCompletion[]> {
  const { data, error } = await client()
    .from("meal_completions")
    .select("*")
    .eq("user_id", userId)
    .gte("completed_date", fromDateISO)
    .lte("completed_date", toDateISO);
  raise(error);
  return (data ?? []) as DatabaseMealCompletion[];
}

export async function addMealCompletion(userId: string, completedDate: string, mealType: string): Promise<DatabaseMealCompletion> {
  const { data, error } = await client()
    .from("meal_completions")
    .upsert(
      { user_id: userId, completed_date: completedDate, meal_type: mealType },
      { onConflict: "user_id,completed_date,meal_type", ignoreDuplicates: false },
    )
    .select()
    .single();
  raise(error);
  return data as DatabaseMealCompletion;
}

export async function removeMealCompletion(userId: string, completedDate: string, mealType: string): Promise<void> {
  const { error } = await client()
    .from("meal_completions")
    .delete()
    .eq("user_id", userId)
    .eq("completed_date", completedDate)
    .eq("meal_type", mealType);
  raise(error);
}

export async function saveExerciseSet(input: {
  userId: string;
  workoutName: string;
  exerciseName: string;
  setNumber: number;
  weightKg: number | null;
  repetitions: number | null;
}): Promise<void> {
  const { error } = await client().from("exercise_sets").insert({
    user_id: input.userId,
    workout_name: input.workoutName,
    exercise_name: input.exerciseName,
    set_number: input.setNumber,
    weight_kg: input.weightKg,
    repetitions: input.repetitions,
  });
  raise(error);
}

/** Borra las filas de una serie concreta registrada hoy (día local). Se usa
 *  al desmarcar una serie en la guía: sin esto, marcar → desmarcar → marcar
 *  duplicaba filas e inflaba la adherencia y la fuerza estimada. */
export async function deleteExerciseSetsForDay(
  userId: string,
  exerciseName: string,
  setNumber: number,
  dayISO: string,
): Promise<void> {
  const [start, end] = localDayRange(dayISO);
  const { error } = await client()
    .from("exercise_sets")
    .delete()
    .eq("user_id", userId)
    .eq("exercise_name", exerciseName)
    .eq("set_number", setNumber)
    .gte("performed_at", start)
    .lte("performed_at", end);
  raise(error);
}

/** Sets de entreno registrados entre dos fechas (ISO), usados para los
 *  widgets de "Hoy" y las estadísticas reales de "Progreso". */
export async function getExerciseSetsInRange(
  userId: string,
  fromISO: string,
  toISO: string,
): Promise<{ performed_at: string; weight_kg: number | null; repetitions: number | null; exercise_name: string; set_number: number | null }[]> {
  const { data, error } = await client()
    .from("exercise_sets")
    .select("performed_at, weight_kg, repetitions, exercise_name, set_number")
    .eq("user_id", userId)
    .gte("performed_at", fromISO)
    .lte("performed_at", toISO);
  raise(error);
  return (data ?? []) as { performed_at: string; weight_kg: number | null; repetitions: number | null; exercise_name: string; set_number: number | null }[];
}

/** Borra todo el historial (peso, entrenos, preferencias, lista de la compra)
 *  y reinicia el perfil a los valores por defecto, como si el usuario
 *  volviera a registrarse. Acción irreversible. */
export async function resetUserData(userId: string): Promise<Profile> {
  // Preferimos la RPC transaccional de la migración v2 (todo o nada).
  const rpc = await client().rpc("reset_user_data");
  if (!rpc.error) return rpc.data as Profile;
  if (!MISSING_FUNCTION_CODES.has(rpc.error.code ?? "")) raise(rpc.error);

  // Pre-migración: borrado secuencial (no atómico, pero funcional).
  const tables = ["weight_logs", "exercise_sets", "food_preferences", "grocery_items", "excluded_meals", "meal_completions"] as const;
  for (const table of tables) {
    const { error } = await client().from(table).delete().eq("user_id", userId);
    raise(error);
  }

  const { data, error } = await client()
    .from("profiles")
    .update({
      name: "Usuario",
      sex: "other",
      birth_date: null,
      height_cm: 170,
      current_weight_kg: 70,
      target_weight_kg: 70,
      goal: "maintain",
      weighing_day: 0,
      activity_level: "moderate",
      exercise_types: ["Gimnasio"],
      training_days: 3,
      meal_count: 4,
      onboarding_completed: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();
  raise(error);
  return data as Profile;
}

import { supabase } from "./supabase";
import type {
  DatabaseGroceryItem,
  FoodPreference,
  FoodPreferenceType,
  Profile,
  WeightLog,
} from "../types";

function client() {
  if (!supabase) throw new Error("Supabase no está configurado");
  return supabase;
}

function raise(error: { message: string; hint?: string | null } | null) {
  if (error) throw new Error(error.hint ? `${error.message}: ${error.hint}` : error.message);
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await client().from("profiles").select("*").eq("id", userId).maybeSingle();
  raise(error);
  return data as Profile | null;
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  const { data, error } = await client()
    .from("profiles")
    .upsert({ ...profile, updated_at: new Date().toISOString() }, { onConflict: "id" })
    .select()
    .single();
  raise(error);
  return data as Profile;
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

/** Sets de entreno registrados entre dos fechas (ISO), usados para los
 *  widgets de "Hoy" y las estadísticas reales de "Progreso". */
export async function getExerciseSetsInRange(
  userId: string,
  fromISO: string,
  toISO: string,
): Promise<{ performed_at: string; weight_kg: number | null; repetitions: number | null }[]> {
  const { data, error } = await client()
    .from("exercise_sets")
    .select("performed_at, weight_kg, repetitions")
    .eq("user_id", userId)
    .gte("performed_at", fromISO)
    .lte("performed_at", toISO);
  raise(error);
  return (data ?? []) as { performed_at: string; weight_kg: number | null; repetitions: number | null }[];
}

/** Borra todo el historial (peso, entrenos, preferencias, lista de la compra)
 *  y reinicia el perfil a los valores por defecto, como si el usuario
 *  volviera a registrarse. Acción irreversible. */
export async function resetUserData(userId: string): Promise<Profile> {
  const tables = ["weight_logs", "exercise_sets", "food_preferences", "grocery_items"] as const;
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

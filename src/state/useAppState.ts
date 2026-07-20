import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Tab } from "../lib/routes";
import { DEFAULT_SCHEDULE, type FoodPreference, type Profile, type WeightLog } from "../types";
import type { DatabaseExcludedMeal } from "../types";
import {
  addExcludedMeal,
  addFoodPreference as addFoodPreferenceRecord,
  addMealCompletion,
  deleteExerciseSetsForDay,
  getExcludedMeals,
  getExerciseSetsInRange,
  getFoodPreferences,
  getGroceries,
  getMealCompletions,
  getWeightLogs,
  removeExcludedMeal,
  removeFoodPreference,
  removeMealCompletion,
  resetUserData,
  saveExerciseSet,
  saveProfile,
  saveWeightLog,
  seedGroceries,
  setGroceryChecked,
} from "../lib/database";
import { addDaysISO, mondayISO, todayISO, weekdayMon0, weeksAgoMondayISO, weekRangeLabel } from "../lib/dates";
import { buildGroceryListFromWeek, type GroceryItem } from "../lib/groceries";
import { applyMealCount, calculateDailyTotals, mealKey, personalizeRollingWeek, personalizeWeek, week, type DayPlan, type Meal } from "../lib/menu";
import { estimateDailyCalories, estimateDailyProtein, formatWeighingDay, isWeightDue, macroSplit, weighInStreakWeeks } from "../lib/nutrition";
import { exportWeekPDF } from "../lib/pdf";
import { buildWeeklyPlan, todayPlannedWorkoutId, type PlannedDay } from "../lib/plan";
import { distinctTrainingDays, latestSetsByExercise, strengthTrendPercent, type ExerciseSetRecord } from "../lib/stats";
import { coachMessage, type CoachMessage } from "../lib/coach";
import {
  buildAlternativeExercise,
  isCardioWorkout,
  parseRestSeconds,
  workoutById,
  workouts,
  type CardioWorkout,
  type StrengthWorkout,
  type Workout,
  type WorkoutExercise,
} from "../lib/workouts";

export type PreferenceType = "blocked" | "favorite" | "allergy";
export type SetRow = { kg: string; reps: string; done: boolean };
export type MealSheetPayload = { meal: Meal; day: DayPlan };
export type FoodView = "week" | "shopping" | "preferences";
export type TrainingView = "overview" | "guide";

export type AppStateInput = {
  userId?: string;
  profile?: Profile | null;
  onProfileChange?: (profile: Profile) => void;
  onLogout?: () => void | Promise<void>;
};

const DEMO_PROFILE: Profile = {
  id: "demo", name: "Marc", sex: "male", birth_date: "2002-01-01", height_cm: 179,
  current_weight_kg: 93, target_weight_kg: 80, goal: "lose", weighing_day: 0,
  activity_level: "moderate", exercise_types: ["Gimnasio", "Running"], training_days: 3,
  meal_count: 4, schedule: DEFAULT_SCHEDULE, onboarding_completed: true,
};

const DEMO_STORAGE_KEY = "ritmo-prototype";

type DemoSnapshot = {
  profile?: Profile;
  currentWeight?: number; // legado, se conserva por compatibilidad al leer
  weightLogs?: WeightLog[];
  blockedFoods?: string[];
  favoriteFoods?: string[];
  allergies?: string[];
  groceries?: GroceryItem[];
  excludedMealKeys?: string[];
  completions?: string[];
};

function readDemoSnapshot(): DemoSnapshot {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemoSnapshot) : {};
  } catch {
    return {};
  }
}

/** Estado completo de la aplicación. Un único hook compositor: las cinco
 *  pestañas comparten ~80 % del estado y solo hay una montada a la vez, así
 *  que un contexto único es más simple y suficientemente barato. */
export function useAppState({ userId, profile, onProfileChange, onLogout }: AppStateInput) {
  // ---------- Perfil (única fuente de verdad del peso actual) ----------
  const demoSnapshotRef = useRef<DemoSnapshot | null>(null);
  if (demoSnapshotRef.current === null) {
    demoSnapshotRef.current = userId ? {} : readDemoSnapshot();
  }
  const demoSeed = demoSnapshotRef.current;
  const [demoProfile, setDemoProfile] = useState<Profile>(() => ({
    ...DEMO_PROFILE,
    ...(demoSeed.profile ?? {}),
    ...(demoSeed.currentWeight ? { current_weight_kg: demoSeed.currentWeight } : {}),
  }));
  const effectiveProfile = userId && profile ? profile : demoProfile;
  const currentWeight = effectiveProfile.current_weight_kg;
  const schedule = effectiveProfile.schedule ?? DEFAULT_SCHEDULE;

  // ---------- Navegación ----------
  const [tab, setTab] = useState<Tab>("today");
  const [foodView, setFoodView] = useState<FoodView>("week");
  const [trainingView, setTrainingView] = useState<TrainingView>("overview");
  // Offset dentro de la ventana móvil de Comida: 0 = hoy … 6 = dentro de 6 días.
  const [selectedDay, setSelectedDay] = useState(0);

  const handleTabChange = useCallback((next: Tab) => {
    setTab(next);
    if (next === "training") setTrainingView("overview");
  }, []);

  const goToFood = useCallback((view: FoodView) => {
    setTab("food");
    setFoodView(view);
    if (view === "week") setSelectedDay(0);
  }, []);

  // ---------- Estado base ----------
  const [syncing, setSyncing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(Boolean(userId));
  const [toast, setToast] = useState("");
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(() => demoSeed.weightLogs ?? []);
  const [preferenceRecords, setPreferenceRecords] = useState<FoodPreference[]>([]);
  const [blockedFoods, setBlockedFoods] = useState<string[]>(() => demoSeed.blockedFoods ?? (userId ? [] : ["Brócoli", "Champiñones", "Queso azul"]));
  const [favoriteFoods, setFavoriteFoods] = useState<string[]>(() => demoSeed.favoriteFoods ?? (userId ? [] : ["Pollo", "Arroz", "Patata", "Pasta"]));
  const [allergies, setAllergies] = useState<string[]>(() => demoSeed.allergies ?? []);
  const [excludedMealKeys, setExcludedMealKeys] = useState<Set<string>>(() => new Set(demoSeed.excludedMealKeys ?? []));
  const [excludedMealRecords, setExcludedMealRecords] = useState<DatabaseExcludedMeal[]>([]);
  const [completions, setCompletions] = useState<Set<string>>(() => new Set(demoSeed.completions ?? []));
  const [groceries, setGroceries] = useState<GroceryItem[]>(() => demoSeed.groceries ?? []);
  const [recentExerciseSets, setRecentExerciseSets] = useState<ExerciseSetRecord[]>([]);

  // ---------- Sheets ----------
  const [weightSheetOpen, setWeightSheetOpen] = useState(false);
  const [mealSheet, setMealSheet] = useState<MealSheetPayload | null>(null);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [scheduleSheetOpen, setScheduleSheetOpen] = useState(false);
  const [workoutOptionsOpen, setWorkoutOptionsOpen] = useState(false);
  const [resetSheetOpen, setResetSheetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const showToast = useCallback((message: string) => setToast(message), []);
  const toastError = useCallback((caught: unknown, fallback: string) => {
    setToast(caught instanceof Error ? caught.message : fallback);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  // ---------- Derivados de comida ----------
  const avoidFoods = useMemo(() => [...blockedFoods, ...allergies], [blockedFoods, allergies]);
  const personalizedWeek = useMemo(
    () => personalizeWeek(effectiveProfile, excludedMealKeys, avoidFoods, favoriteFoods),
    [effectiveProfile, excludedMealKeys, avoidFoods, favoriteFoods],
  );
  // Ventana móvil hacia delante (hoy + 6 días) para el selector de Comida.
  const rollingWeek = useMemo(
    () => personalizeRollingWeek(effectiveProfile, excludedMealKeys, avoidFoods, favoriteFoods),
    [effectiveProfile, excludedMealKeys, avoidFoods, favoriteFoods],
  );
  const estimatedCalories = estimateDailyCalories(effectiveProfile);
  const estimatedProtein = estimateDailyProtein(effectiveProfile);
  const macros = useMemo(() => macroSplit(estimatedCalories, estimatedProtein), [estimatedCalories, estimatedProtein]);

  const visibleGroceries = useMemo(() => {
    const avoidLower = avoidFoods.map((food) => food.toLowerCase());
    if (!avoidLower.length) return groceries;
    return groceries.filter((item) => !avoidLower.some((food) => item.name.toLowerCase().includes(food)));
  }, [groceries, avoidFoods]);

  /** % de comidas marcadas como hechas esta semana natural (Lun→hoy), sobre
   *  las comidas ya planificadas hasta hoy (los días futuros de la semana no
   *  cuentan: aún no han tenido ocasión de completarse). Es el indicador de
   *  adherencia a la comida — el que faltaba en Progreso, centrado siempre en
   *  entreno pese a que la comida es el foco real de la app. */
  const weeklyFoodAdherencePercent = useMemo(() => {
    const monday = mondayISO();
    const today = todayISO();
    const plannedSoFar = personalizedWeek
      .filter((day) => day.dateISO <= today)
      .reduce((sum, day) => sum + day.meals.length, 0);
    if (plannedSoFar === 0) return null;
    const doneSoFar = Array.from(completions)
      .filter((key) => key.slice(0, 10) >= monday && key.slice(0, 10) <= today)
      .length;
    return Math.round(Math.min(1, doneSoFar / plannedSoFar) * 100);
  }, [personalizedWeek, completions]);

  // ---------- Carga inicial ----------
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setSyncing(true);
    setInitialLoading(true);
    const weekStart = mondayISO();
    const weekEnd = addDaysISO(weekStart, 6);
    const rangeStart = weeksAgoMondayISO(5); // 6 semanas completas, incluida la actual
    Promise.all([
      getFoodPreferences(userId),
      getWeightLogs(userId),
      getGroceries(userId, weekStart),
      getExerciseSetsInRange(userId, `${rangeStart}T00:00:00`, `${todayISO()}T23:59:59`),
      getExcludedMeals(userId),
      getMealCompletions(userId, weekStart, weekEnd),
    ])
      .then(async ([preferences, logs, remoteGroceries, exerciseSets, excludedMeals, mealCompletions]) => {
        if (cancelled) return;
        setPreferenceRecords(preferences);
        const blockedNames = preferences.filter((item) => item.restriction_type === "blocked").map((item) => item.food_name);
        const allergyNames = preferences.filter((item) => item.restriction_type === "allergy").map((item) => item.food_name);
        const favoriteNames = preferences.filter((item) => item.restriction_type === "favorite").map((item) => item.food_name);
        setBlockedFoods(blockedNames);
        setFavoriteFoods(favoriteNames);
        setAllergies(allergyNames);
        setWeightLogs(logs);
        setRecentExerciseSets(exerciseSets);
        setExcludedMealRecords(excludedMeals);
        const excludedKeysSet = new Set(excludedMeals.map((item) => item.meal_key));
        setExcludedMealKeys(excludedKeysSet);
        setCompletions(new Set(mealCompletions.map((item) => `${item.completed_date}-${item.meal_type}`)));

        const personalized = personalizeWeek(effectiveProfile, excludedKeysSet, [...blockedNames, ...allergyNames], favoriteNames);
        const groceryItems = buildGroceryListFromWeek(personalized, [...blockedNames, ...allergyNames])
          .map(({ category, name, amount, checked }) => ({ category, name, amount, checked }));
        const dedupedItems = Array.from(new Map(groceryItems.map((g) => [`${g.category}::${g.name}`, g])).values());
        const items = remoteGroceries.length ? remoteGroceries : await seedGroceries(userId, weekStart, dedupedItems);
        if (cancelled) return;
        setGroceries(items.map((item) => ({ id: String(item.id), category: item.category, name: item.name, amount: item.amount, checked: item.checked })));
        if (isWeightDue(logs, effectiveProfile.weighing_day)) setWeightSheetOpen(true);
      })
      .catch((caught) => {
        if (!cancelled) toastError(caught, "No se han podido sincronizar los datos");
      })
      .finally(() => {
        if (!cancelled) {
          setSyncing(false);
          setInitialLoading(false);
        }
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Demo sin lista de compra guardada: generarla del menú personalizado.
  useEffect(() => {
    if (userId || groceries.length) return;
    setGroceries(buildGroceryListFromWeek(personalizedWeek, avoidFoods));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Persistencia del modo demo.
  useEffect(() => {
    if (userId) return;
    try {
      const snapshot: DemoSnapshot = {
        profile: demoProfile,
        weightLogs,
        blockedFoods,
        favoriteFoods,
        allergies,
        groceries,
        excludedMealKeys: Array.from(excludedMealKeys),
        completions: Array.from(completions),
      };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(snapshot));
    } catch { /* Algunos entornos bloquean localStorage. */ }
  }, [userId, demoProfile, weightLogs, blockedFoods, favoriteFoods, allergies, groceries, excludedMealKeys, completions]);

  // ---------- Perfil ----------
  const saveProfilePatch = useCallback(async (patch: Partial<Profile>) => {
    const next = { ...effectiveProfile, ...patch };
    try {
      setSyncing(true);
      if (userId) {
        const saved = await saveProfile({ ...next, onboarding_completed: true });
        onProfileChange?.(saved);
        if (patch.schedule && saved.schedule === undefined) {
          setToast("Horarios guardados solo en esta sesión: ejecuta migration-v2.sql en Supabase");
        }
      } else {
        setDemoProfile(next);
      }
      return true;
    } catch (caught) {
      toastError(caught, "No se ha podido actualizar el perfil");
      return false;
    } finally {
      setSyncing(false);
    }
  }, [effectiveProfile, userId, onProfileChange, toastError]);

  // ---------- Peso ----------
  const weightDue = useMemo(() => isWeightDue(weightLogs, effectiveProfile.weighing_day), [weightLogs, effectiveProfile.weighing_day]);
  const startWeightKg = weightLogs.length ? weightLogs[0].weight_kg : currentWeight;
  const totalWeightChangeKg = weightLogs.length ? currentWeight - startWeightKg : 0;

  const weeklyWeightDeltaKg = useMemo(() => {
    if (weightLogs.length < 2) return null;
    const weekAgoISO = addDaysISO(todayISO(), -7);
    const priorLog = [...weightLogs].reverse().find((log) => log.measured_at <= weekAgoISO);
    if (!priorLog) return null;
    return currentWeight - priorLog.weight_kg;
  }, [weightLogs, currentWeight]);

  const weightProgressPercent = useMemo(() => {
    const totalDistance = effectiveProfile.target_weight_kg - startWeightKg;
    if (Math.abs(totalDistance) < 0.1) return 100;
    const ratio = (currentWeight - startWeightKg) / totalDistance;
    return Math.round(Math.max(0, Math.min(1, ratio)) * 100);
  }, [currentWeight, startWeightKg, effectiveProfile.target_weight_kg]);

  const weighInStreak = useMemo(() => weighInStreakWeeks(weightLogs), [weightLogs]);

  const saveWeight = useCallback(async (raw: string) => {
    const parsed = Number(raw.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 35 || parsed > 300) {
      setToast("Introduce un peso válido");
      return false;
    }
    const today = todayISO();
    try {
      setSyncing(true);
      if (userId) {
        const savedLog = await saveWeightLog(userId, parsed, today);
        const savedProfile = await saveProfile({ ...effectiveProfile, current_weight_kg: parsed });
        setWeightLogs((logs) => [...logs.filter((item) => item.measured_at !== today), savedLog]
          .sort((a, b) => a.measured_at.localeCompare(b.measured_at)));
        onProfileChange?.(savedProfile);
      } else {
        setDemoProfile((prev) => ({ ...prev, current_weight_kg: parsed }));
        setWeightLogs((logs) => [
          ...logs.filter((item) => item.measured_at !== today),
          { id: Date.now(), user_id: "demo", weight_kg: parsed, measured_at: today },
        ].sort((a, b) => a.measured_at.localeCompare(b.measured_at)));
      }
      setWeightSheetOpen(false);
      setToast("Peso guardado. Plan semanal actualizado");
      return true;
    } catch (caught) {
      toastError(caught, "No se ha podido guardar el peso");
      return false;
    } finally {
      setSyncing(false);
    }
  }, [userId, effectiveProfile, onProfileChange, toastError]);

  // ---------- Preferencias de comida ----------
  const addPreference = useCallback(async (raw: string, type: PreferenceType) => {
    const clean = raw.trim();
    if (!clean) return;
    const target = type === "blocked" ? blockedFoods : type === "favorite" ? favoriteFoods : allergies;
    if (target.some((food) => food.toLowerCase() === clean.toLowerCase())) {
      setToast("Ese alimento ya está registrado");
      return;
    }
    try {
      setSyncing(true);
      let record: FoodPreference | null = null;
      if (userId) record = await addFoodPreferenceRecord(userId, clean, type);
      if (record) setPreferenceRecords((items) => [...items.filter((item) => item.id !== record!.id), record!]);
      if (type === "blocked") { setBlockedFoods((foods) => [...foods, clean]); setToast(`${clean} no aparecerá en tu dieta`); }
      if (type === "favorite") { setFavoriteFoods((foods) => [...foods, clean]); setToast(`${clean} añadido a favoritos`); }
      if (type === "allergy") { setAllergies((foods) => [...foods, clean]); setToast(`${clean} fuera del plan: restricción crítica`); }
    } catch (caught) {
      toastError(caught, "No se ha podido guardar");
    } finally {
      setSyncing(false);
    }
  }, [blockedFoods, favoriteFoods, allergies, userId, toastError]);

  const deletePreference = useCallback(async (food: string, type: PreferenceType) => {
    try {
      setSyncing(true);
      const record = preferenceRecords.find((item) => item.food_name === food && item.restriction_type === type);
      if (userId && record) await removeFoodPreference(record.id);
      setPreferenceRecords((items) => items.filter((item) => item.id !== record?.id));
      if (type === "blocked") setBlockedFoods((foods) => foods.filter((item) => item !== food));
      if (type === "favorite") setFavoriteFoods((foods) => foods.filter((item) => item !== food));
      if (type === "allergy") setAllergies((foods) => foods.filter((item) => item !== food));
    } catch (caught) {
      toastError(caught, "No se ha podido eliminar");
    } finally {
      setSyncing(false);
    }
  }, [preferenceRecords, userId, toastError]);

  // ---------- Menú ----------
  const excludeMeal = useCallback(async (day: { short: string }, meal: { type: string }) => {
    const key = mealKey(day, meal);
    if (excludedMealKeys.has(key)) return;
    setExcludedMealKeys((keys) => new Set(keys).add(key));
    try {
      if (userId) {
        const record = await addExcludedMeal(userId, key);
        setExcludedMealRecords((items) => [...items, record]);
      }
    } catch (caught) {
      setExcludedMealKeys((keys) => { const next = new Set(keys); next.delete(key); return next; });
      toastError(caught, "No se ha podido excluir la comida");
    }
  }, [excludedMealKeys, userId, toastError]);

  const removeExcludedMealKey = useCallback(async (key: string) => {
    setExcludedMealKeys((keys) => { const next = new Set(keys); next.delete(key); return next; });
    try {
      const record = excludedMealRecords.find((item) => item.meal_key === key);
      if (userId && record) await removeExcludedMeal(record.id);
      setExcludedMealRecords((items) => items.filter((item) => item.meal_key !== key));
    } catch (caught) {
      setExcludedMealKeys((keys) => new Set(keys).add(key));
      toastError(caught, "No se ha podido recuperar la comida");
    }
  }, [excludedMealRecords, userId, toastError]);

  /** Claves del día tras aplicar meal_count (las que gobiernan "regenerar"). */
  const dayMealKeys = useCallback((dayIndex: number): string[] => {
    const baseDay = week[dayIndex];
    if (!baseDay) return [];
    return applyMealCount(baseDay.meals, effectiveProfile.meal_count, dayIndex).map((meal) => mealKey(baseDay, meal));
  }, [effectiveProfile.meal_count]);

  const isDayRegenerated = useCallback((dayIndex: number): boolean => {
    const keys = dayMealKeys(dayIndex);
    return keys.length > 0 && keys.every((key) => excludedMealKeys.has(key));
  }, [dayMealKeys, excludedMealKeys]);

  /** "Regenerar" es un conmutador honesto: alterna entre el menú base y el
   *  alternativo del día completo (cada plato tiene una única alternativa). */
  const regenerateDay = useCallback(async (dayIndex: number) => {
    const baseDay = week[dayIndex];
    if (!baseDay) return;
    const keys = dayMealKeys(dayIndex);
    if (isDayRegenerated(dayIndex)) {
      await Promise.all(keys.map((key) => removeExcludedMealKey(key)));
      setToast("Menú base restaurado");
    } else {
      const meals = applyMealCount(baseDay.meals, effectiveProfile.meal_count, dayIndex);
      await Promise.all(meals.map((meal) => excludeMeal(baseDay, meal)));
      setToast("Día cambiado al menú alternativo");
    }
  }, [dayMealKeys, isDayRegenerated, removeExcludedMealKey, excludeMeal, effectiveProfile.meal_count]);

  const toggleMealDone = useCallback(async (dateISO: string, type: string) => {
    const key = `${dateISO}-${type}`;
    const wasDone = completions.has(key);
    setCompletions((keys) => {
      const next = new Set(keys);
      if (wasDone) next.delete(key); else next.add(key);
      return next;
    });
    try {
      if (userId) {
        if (wasDone) await removeMealCompletion(userId, dateISO, type);
        else await addMealCompletion(userId, dateISO, type);
      }
      setToast(wasDone ? "Comida desmarcada" : "Comida marcada como realizada");
    } catch (caught) {
      setCompletions((keys) => {
        const next = new Set(keys);
        if (wasDone) next.add(key); else next.delete(key);
        return next;
      });
      toastError(caught, "No se ha podido guardar");
    }
  }, [completions, userId, toastError]);

  const toggleGrocery = useCallback(async (id: string) => {
    const item = groceries.find((value) => value.id === id);
    if (!item) return;
    const checked = !item.checked;
    setGroceries((items) => items.map((value) => (value.id === id ? { ...value, checked } : value)));
    if (userId && Number.isFinite(Number(id))) {
      try {
        await setGroceryChecked(Number(id), checked);
      } catch (caught) {
        setGroceries((items) => items.map((value) => (value.id === id ? { ...value, checked: !checked } : value)));
        toastError(caught, "No se ha podido sincronizar la compra");
      }
    }
  }, [groceries, userId, toastError]);

  // ---------- Entreno ----------
  const weekPlan: PlannedDay[] = useMemo(() => buildWeeklyPlan(effectiveProfile), [effectiveProfile]);
  const todayPlan = useMemo(() => todayPlannedWorkoutId(effectiveProfile), [effectiveProfile]);
  const todayWorkout: Workout = workoutById(todayPlan.workoutId) ?? workouts[0];

  const [activeWorkoutId, setActiveWorkoutId] = useState<string>(() => todayPlan.workoutId);
  const [activeExercise, setActiveExercise] = useState(0);
  const [swappedExercises, setSwappedExercises] = useState<Set<string>>(new Set());
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [setData, setSetData] = useState<SetRow[]>([
    { kg: "", reps: "12", done: false },
    { kg: "", reps: "10", done: false },
    { kg: "", reps: "", done: false },
  ]);

  const activeWorkout: Workout = workoutById(activeWorkoutId) ?? workouts[0];
  const activeStrength: StrengthWorkout | null = isCardioWorkout(activeWorkout) ? null : activeWorkout;
  const baseExercise: WorkoutExercise | null = activeStrength
    ? activeStrength.exercises[activeExercise] ?? activeStrength.exercises[0]
    : null;
  const swapKey = baseExercise ? `${activeWorkout.id}::${baseExercise.name}` : "";
  const isSwapped = Boolean(swapKey && swappedExercises.has(swapKey));
  const currentExercise: WorkoutExercise | null = baseExercise
    ? (isSwapped ? buildAlternativeExercise(baseExercise) : baseExercise)
    : null;

  useEffect(() => {
    if (restSecondsLeft === null || restSecondsLeft <= 0) {
      if (restSecondsLeft === 0) setRestSecondsLeft(null);
      return;
    }
    const timeout = window.setTimeout(() => setRestSecondsLeft((s) => (s && s > 0 ? s - 1 : null)), 1000);
    return () => window.clearTimeout(timeout);
  }, [restSecondsLeft]);

  const weekExerciseSets = useMemo(() => {
    const weekStart = mondayISO();
    return recentExerciseSets.filter((set) => set.performed_at.slice(0, 10) >= weekStart);
  }, [recentExerciseSets]);
  const latestByExercise = useMemo(() => latestSetsByExercise(recentExerciseSets), [recentExerciseSets]);
  const strengthTrend = useMemo(() => strengthTrendPercent(recentExerciseSets), [recentExerciseSets]);
  const workoutDaysThisWeek = useMemo(() => distinctTrainingDays(weekExerciseSets), [weekExerciseSets]);
  const workoutDaysLast6Weeks = useMemo(() => distinctTrainingDays(recentExerciseSets), [recentExerciseSets]);
  const weeklyAdherencePercent = effectiveProfile.training_days > 0
    ? Math.round(Math.min(1, workoutDaysThisWeek / effectiveProfile.training_days) * 100)
    : null;

  const setsCompletedToday = useMemo(() => {
    const today = todayISO();
    return weekExerciseSets.filter((set) => set.performed_at.slice(0, 10) === today).length;
  }, [weekExerciseSets]);
  const todayTotalSets = isCardioWorkout(todayWorkout) ? 1 : todayWorkout.exercises.length * 3;

  const cardioDoneToday = useCallback((workout: CardioWorkout) => {
    const today = todayISO();
    return recentExerciseSets.some((set) => set.exercise_name === workout.name && set.performed_at.slice(0, 10) === today);
  }, [recentExerciseSets]);

  const startExercise = useCallback((index: number) => {
    if (!activeStrength) return;
    setActiveExercise(index);
    setRestSecondsLeft(null);
    const exercise = activeStrength.exercises[index];
    const history = latestByExercise[exercise.name];
    const startingKg = history?.weightKg != null ? String(history.weightKg) : exercise.initialKg;
    setSetData([
      { kg: startingKg, reps: "12", done: false },
      { kg: startingKg, reps: "10", done: false },
      { kg: startingKg, reps: "", done: false },
    ]);
  }, [activeStrength, latestByExercise]);

  const selectWorkout = useCallback((workoutId: string) => {
    setActiveWorkoutId(workoutId);
    setActiveExercise(0);
    setSetData([
      { kg: "", reps: "12", done: false },
      { kg: "", reps: "10", done: false },
      { kg: "", reps: "", done: false },
    ]);
  }, []);

  const updateSet = useCallback((index: number, field: "kg" | "reps", value: string) => {
    setSetData((sets) => sets.map((set, i) => (i === index ? { ...set, [field]: value } : set)));
  }, []);

  const toggleExerciseSwap = useCallback(() => {
    if (!swapKey) return;
    setSwappedExercises((keys) => {
      const next = new Set(keys);
      if (next.has(swapKey)) next.delete(swapKey); else next.add(swapKey);
      return next;
    });
  }, [swapKey]);

  const toggleSetDone = useCallback(async (index: number) => {
    if (!currentExercise) return;
    const target = setData[index];
    const nextDone = !target.done;
    setSetData((sets) => sets.map((set, i) => (i === index ? { ...set, done: nextDone } : set)));
    if (nextDone) setRestSecondsLeft(parseRestSeconds(currentExercise.rest));
    if (!userId) return;

    if (nextDone) {
      try {
        await saveExerciseSet({
          userId,
          workoutName: activeWorkout.name,
          exerciseName: currentExercise.name,
          setNumber: index + 1,
          weightKg: Number(target.kg) || null,
          repetitions: Number(target.reps) || null,
        });
        setRecentExerciseSets((sets) => [...sets, {
          performed_at: new Date().toISOString(),
          weight_kg: Number(target.kg) || null,
          repetitions: Number(target.reps) || null,
          exercise_name: currentExercise.name,
          set_number: index + 1,
        }]);
        setToast(`Serie ${index + 1} guardada`);
      } catch (caught) {
        setSetData((sets) => sets.map((set, i) => (i === index ? { ...set, done: false } : set)));
        toastError(caught, "No se ha podido guardar la serie");
      }
    } else {
      // Desmarcar borra la fila en BD; sin esto, marcar→desmarcar→marcar
      // duplicaba series e inflaba adherencia y fuerza estimada.
      try {
        const today = todayISO();
        await deleteExerciseSetsForDay(userId, currentExercise.name, index + 1, today);
        setRecentExerciseSets((sets) => sets.filter((set) =>
          !(set.exercise_name === currentExercise.name
            && set.performed_at.slice(0, 10) === today
            && (set.set_number == null || set.set_number === index + 1))));
      } catch (caught) {
        setSetData((sets) => sets.map((set, i) => (i === index ? { ...set, done: true } : set)));
        toastError(caught, "No se ha podido deshacer la serie");
      }
    }
  }, [currentExercise, setData, userId, activeWorkout.name, toastError]);

  const toggleCardioDone = useCallback(async (workout: CardioWorkout) => {
    const done = cardioDoneToday(workout);
    const today = todayISO();
    if (!userId) {
      // En demo se refleja solo en memoria.
      setRecentExerciseSets((sets) => done
        ? sets.filter((set) => !(set.exercise_name === workout.name && set.performed_at.slice(0, 10) === today))
        : [...sets, { performed_at: new Date().toISOString(), weight_kg: null, repetitions: workout.durationMin, exercise_name: workout.name, set_number: 1 }]);
      setToast(done ? "Sesión desmarcada" : "Sesión de cardio registrada");
      return;
    }
    try {
      setSyncing(true);
      if (done) {
        await deleteExerciseSetsForDay(userId, workout.name, 1, today);
        setRecentExerciseSets((sets) => sets.filter((set) => !(set.exercise_name === workout.name && set.performed_at.slice(0, 10) === today)));
        setToast("Sesión desmarcada");
      } else {
        await saveExerciseSet({ userId, workoutName: workout.name, exerciseName: workout.name, setNumber: 1, weightKg: null, repetitions: workout.durationMin });
        setRecentExerciseSets((sets) => [...sets, { performed_at: new Date().toISOString(), weight_kg: null, repetitions: workout.durationMin, exercise_name: workout.name, set_number: 1 }]);
        setToast(`${workout.name} registrado: ${workout.durationMin} min`);
      }
    } catch (caught) {
      toastError(caught, "No se ha podido guardar la sesión");
    } finally {
      setSyncing(false);
    }
  }, [cardioDoneToday, userId, toastError]);

  // ---------- Reset ----------
  const handleResetData = useCallback(async () => {
    if (!userId) {
      setToast("El modo demo no guarda datos en la nube; borra el almacenamiento local del navegador para reiniciar");
      setResetSheetOpen(false);
      return;
    }
    setResetting(true);
    try {
      const resetProfile = await resetUserData(userId);
      setResetSheetOpen(false);
      onProfileChange?.(resetProfile);
    } catch (caught) {
      toastError(caught, "No se han podido reiniciar los datos");
    } finally {
      setResetting(false);
    }
  }, [userId, onProfileChange, toastError]);

  // ---------- PDF ----------
  const exportPDF = useCallback(() => {
    if (userId && weightDue) {
      setWeightSheetOpen(true);
      setToast("Registra el pesaje semanal antes de generar el nuevo PDF");
      return;
    }
    const opened = exportWeekPDF({
      week: personalizedWeek,
      groceries: visibleGroceries,
      blockedFoods,
      allergies,
      currentWeightKg: currentWeight,
      targetWeightKg: effectiveProfile.target_weight_kg,
      dailyCalories: estimatedCalories,
      weighingDayLabel: formatWeighingDay(effectiveProfile.weighing_day),
      weekLabel: weekRangeLabel(),
    });
    setToast(opened ? "Documento preparado para guardar como PDF" : "Permite ventanas emergentes para generar el PDF");
  }, [userId, weightDue, personalizedWeek, visibleGroceries, blockedFoods, allergies, currentWeight, effectiveProfile, estimatedCalories]);

  // ---------- Coach ----------
  const todayIndex = weekdayMon0();
  const todayDayPlan = personalizedWeek[todayIndex];
  const mealsDoneToday = useMemo(
    () => todayDayPlan.meals.filter((meal) => completions.has(`${todayDayPlan.dateISO}-${meal.type}`)).length,
    [todayDayPlan, completions],
  );

  const coach: CoachMessage = useMemo(() => coachMessage({
    todayISO: todayISO(),
    weekdayMon0: todayIndex,
    userSeed: effectiveProfile.id,
    goal: effectiveProfile.goal,
    userName: effectiveProfile.name,
    kgToGoal: Math.abs(currentWeight - effectiveProfile.target_weight_kg),
    weeklyDeltaKg: weeklyWeightDeltaKg,
    weighInStreak,
    isWeighDayToday: new Date().getDay() === effectiveProfile.weighing_day,
    weightDue,
    workoutDaysThisWeek,
    trainingDaysTarget: effectiveProfile.training_days,
    strengthTrendPct: strengthTrend,
    todayWorkoutName: todayWorkout.name,
    todayIsRestDay: todayPlan.isRestDay,
    setsCompletedToday,
    todayTotalSets,
    mealsDoneToday,
    mealsPlannedToday: todayDayPlan.meals.length,
    weeklyFoodAdherencePercent,
    hourOfDay: new Date().getHours(),
    targetCalories: estimatedCalories,
  }), [
    todayIndex, effectiveProfile, currentWeight, weeklyWeightDeltaKg, weighInStreak, weightDue,
    workoutDaysThisWeek, strengthTrend, todayWorkout.name, todayPlan.isRestDay,
    setsCompletedToday, todayTotalSets, mealsDoneToday, todayDayPlan.meals.length, estimatedCalories,
    weeklyFoodAdherencePercent,
  ]);

  return {
    // navegación
    tab,
    handleTabChange,
    foodView,
    setFoodView,
    trainingView,
    setTrainingView,
    selectedDay,
    setSelectedDay,
    goToFood,

    // identidad y entorno
    userId,
    profile: effectiveProfile,
    schedule,
    syncing,
    initialLoading,
    onLogout,
    saveProfilePatch,

    // toast
    toast,
    showToast,

    // peso
    weightLogs,
    currentWeight,
    startWeightKg,
    totalWeightChangeKg,
    weeklyWeightDeltaKg,
    weightProgressPercent,
    weighInStreak,
    weightDue,
    saveWeight,

    // comida
    blockedFoods,
    favoriteFoods,
    allergies,
    addPreference,
    deletePreference,
    personalizedWeek,
    rollingWeek,
    calculateDailyTotals,
    estimatedCalories,
    estimatedProtein,
    macros,
    excludedMealKeys,
    excludeMeal,
    removeExcludedMealKey,
    regenerateDay,
    isDayRegenerated,
    completions,
    toggleMealDone,
    weeklyFoodAdherencePercent,
    groceries: visibleGroceries,
    toggleGrocery,
    exportPDF,

    // entreno
    weekPlan,
    todayWorkout,
    todayIsRestDay: todayPlan.isRestDay,
    activeWorkout,
    activeStrength,
    activeExercise,
    baseExercise,
    currentExercise,
    isSwapped,
    setData,
    updateSet,
    toggleSetDone,
    toggleExerciseSwap,
    startExercise,
    selectWorkout,
    restSecondsLeft,
    recentExerciseSets,
    latestByExercise,
    strengthTrend,
    workoutDaysThisWeek,
    workoutDaysLast6Weeks,
    weeklyAdherencePercent,
    setsCompletedToday,
    todayTotalSets,
    cardioDoneToday,
    toggleCardioDone,

    // sheets
    weightSheetOpen, setWeightSheetOpen,
    mealSheet, setMealSheet,
    profileSheetOpen, setProfileSheetOpen,
    scheduleSheetOpen, setScheduleSheetOpen,
    workoutOptionsOpen, setWorkoutOptionsOpen,
    resetSheetOpen, setResetSheetOpen,
    resetting,
    handleResetData,

    // coach
    coach,
  };
}

export type AppData = ReturnType<typeof useAppState>;

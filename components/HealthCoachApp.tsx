"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "./layout/AppLayout";
import {
  Apple,
  BadgeCheck,
  Ban,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  FileDown,
  Flame,
  Gauge,
  Heart,
  Cloud,
  LogOut,
  Info,
  ListChecks,
  Minus,
  MoreHorizontal,
  PackageCheck,
  Play,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Settings2,
  ShoppingBasket,
  Sparkles,
  Target,
  TimerReset,
  Trash2,
  Utensils,
  Wheat,
  X,
  Zap,
} from "lucide-react";
import type { FoodPreference, Profile, WeightLog } from "../src/types";
import {
  addFoodPreference as addFoodPreferenceRecord,
  getFoodPreferences,
  getGroceries,
  getWeightLogs,
  removeFoodPreference,
  saveExerciseSet,
  saveProfile,
  saveWeightLog,
  seedGroceries,
  setGroceryChecked,
} from "../src/lib/database";
import { estimateDailyCalories, formatWeighingDay, mondayISO } from "../src/lib/nutrition";

import type { Tab } from "../src/lib/routes";
type FoodView = "week" | "shopping" | "preferences";
type TrainingView = "overview" | "guide";

type Meal = {
  type: string;
  name: string;
  calories: number;
  protein: number;
  ingredients: string[];
  alternative: string;
};

type DayPlan = {
  short: string;
  date: number;
  meals: Meal[];
};

type GroceryItem = {
  id: string;
  category: string;
  name: string;
  amount: string;
  checked: boolean;
};

type WorkoutExercise = {
  name: string;
  detail: string;
  muscle: string;
  previous: string;
  initialKg: string;
  target: string;
  rest: string;
  videoUrl: string;
  videoSource: string;
  videoAuthor: string;
  videoLicense: string;
  technique: string[];
  mistakes: { title: string; detail: string }[];
};

const week: DayPlan[] = [
  {
    short: "Lun",
    date: 14,
    meals: [
      { type: "Desayuno", name: "Tostadas de pavo y tomate", calories: 430, protein: 29, ingredients: ["70 g pan integral", "90 g pavo", "120 g tomate", "8 g aceite de oliva"], alternative: "60 g de avena, 250 ml de leche y 1 plátano" },
      { type: "Comida", name: "Arroz con pollo y verduras", calories: 685, protein: 52, ingredients: ["95 g arroz en crudo", "180 g pollo", "220 g verduras", "10 g aceite de oliva"], alternative: "100 g pasta en crudo y 180 g pavo" },
      { type: "Merienda", name: "Yogur, plátano y avena", calories: 285, protein: 17, ingredients: ["200 g yogur alto en proteína", "1 plátano", "20 g avena"], alternative: "200 g queso fresco batido y 1 manzana" },
      { type: "Cena", name: "Merluza con patata al horno", calories: 565, protein: 46, ingredients: ["210 g merluza", "320 g patata", "150 g ensalada", "10 g aceite de oliva"], alternative: "190 g salmón y 250 g patata" },
    ],
  },
  {
    short: "Mar",
    date: 15,
    meals: [
      { type: "Desayuno", name: "Avena cremosa con plátano", calories: 445, protein: 24, ingredients: ["65 g avena", "250 ml leche", "1 plátano", "15 g crema de cacahuete"], alternative: "70 g pan integral, 2 huevos y fruta" },
      { type: "Comida", name: "Pasta boloñesa ligera", calories: 710, protein: 48, ingredients: ["105 g pasta en crudo", "160 g ternera magra", "150 g tomate triturado", "8 g aceite"], alternative: "95 g arroz y 180 g pollo" },
      { type: "Merienda", name: "Bocadillo rápido de pavo", calories: 300, protein: 23, ingredients: ["70 g pan", "90 g pavo", "tomate"], alternative: "Yogur proteico, fruta y 15 g de nueces" },
      { type: "Cena", name: "Tortilla y ensalada completa", calories: 510, protein: 40, ingredients: ["3 huevos", "180 g claras", "200 g ensalada", "60 g pan"], alternative: "200 g pollo, verduras y 50 g pan" },
    ],
  },
  {
    short: "Mié",
    date: 16,
    meals: [
      { type: "Desayuno", name: "Tostada de huevos revueltos", calories: 425, protein: 30, ingredients: ["70 g pan integral", "2 huevos", "120 g claras", "1 naranja"], alternative: "Avena con yogur y fruta" },
      { type: "Comida", name: "Patata, pavo y verduras", calories: 660, protein: 51, ingredients: ["380 g patata", "190 g pavo", "220 g verduras", "10 g aceite"], alternative: "95 g arroz y 180 g pollo" },
      { type: "Merienda", name: "Queso fresco y manzana", calories: 260, protein: 22, ingredients: ["250 g queso fresco batido", "1 manzana", "10 g miel"], alternative: "Yogur alto en proteína y plátano" },
      { type: "Cena", name: "Salmón, arroz y calabacín", calories: 625, protein: 41, ingredients: ["185 g salmón", "65 g arroz en crudo", "220 g calabacín"], alternative: "210 g merluza, 300 g patata y verduras" },
    ],
  },
  {
    short: "Jue",
    date: 17,
    meals: [
      { type: "Desayuno", name: "Yogur bowl de avena y fruta", calories: 420, protein: 27, ingredients: ["250 g yogur", "55 g avena", "150 g fruta", "10 g miel"], alternative: "Tostadas de pavo y tomate" },
      { type: "Comida", name: "Burrito bowl de pollo", calories: 705, protein: 54, ingredients: ["90 g arroz", "180 g pollo", "100 g maíz", "150 g verduras", "1 tortilla pequeña"], alternative: "Pasta con pavo y tomate" },
      { type: "Merienda", name: "Batido de plátano", calories: 290, protein: 24, ingredients: ["250 ml leche", "1 plátano", "25 g proteína", "10 g avena"], alternative: "Yogur proteico con fruta" },
      { type: "Cena", name: "Hamburguesa casera completa", calories: 570, protein: 45, ingredients: ["180 g ternera magra", "80 g pan", "tomate y lechuga", "220 g patata"], alternative: "200 g pollo con patata y ensalada" },
    ],
  },
  {
    short: "Vie",
    date: 18,
    meals: [
      { type: "Desayuno", name: "Sándwich caliente de pavo", calories: 435, protein: 32, ingredients: ["90 g pan", "100 g pavo", "30 g queso", "1 fruta"], alternative: "Avena con plátano" },
      { type: "Comida", name: "Arroz mediterráneo con atún", calories: 670, protein: 47, ingredients: ["95 g arroz", "160 g atún natural", "200 g verduras", "10 g aceite"], alternative: "180 g pollo si se bloquea el atún" },
      { type: "Merienda", name: "Yogur con fruta y cereal", calories: 275, protein: 18, ingredients: ["200 g yogur", "1 fruta", "25 g cereal"], alternative: "Bocadillo pequeño de pavo" },
      { type: "Cena", name: "Pizza casera proteica", calories: 615, protein: 50, ingredients: ["1 base integral", "150 g pollo", "80 g mozzarella ligera", "tomate"], alternative: "Tortilla con pan y ensalada" },
    ],
  },
  {
    short: "Sáb",
    date: 19,
    meals: [
      { type: "Desayuno", name: "Tortitas de avena", calories: 465, protein: 30, ingredients: ["65 g avena", "2 huevos", "120 g claras", "1 plátano"], alternative: "Tostadas con pavo" },
      { type: "Comida", name: "Pasta con pollo y pesto ligero", calories: 725, protein: 52, ingredients: ["105 g pasta", "180 g pollo", "20 g pesto", "150 g tomate"], alternative: "Arroz con pavo" },
      { type: "Merienda", name: "Merienda flexible medida", calories: 310, protein: 20, ingredients: ["1 yogur", "1 fruta", "30 g chocolate 85%"], alternative: "Bocadillo de pavo" },
      { type: "Cena", name: "Cena social controlada", calories: 610, protein: 38, ingredients: ["1 plato principal proteico", "1 ración de carbohidrato", "verduras", "agua o bebida zero"], alternative: "Hamburguesa casera con patata" },
    ],
  },
  {
    short: "Dom",
    date: 20,
    meals: [
      { type: "Desayuno", name: "Desayuno favorito equilibrado", calories: 440, protein: 27, ingredients: ["70 g pan", "2 huevos", "80 g pavo", "1 fruta"], alternative: "Avena con yogur" },
      { type: "Comida", name: "Paella de pollo medida", calories: 720, protein: 49, ingredients: ["105 g arroz", "180 g pollo", "200 g verduras", "10 g aceite"], alternative: "Pasta boloñesa ligera" },
      { type: "Merienda", name: "Yogur y fruta", calories: 245, protein: 18, ingredients: ["200 g yogur", "1 fruta", "10 g miel"], alternative: "Queso fresco batido" },
      { type: "Cena", name: "Crema de verduras y tortilla", calories: 535, protein: 41, ingredients: ["350 g crema de verduras", "3 huevos", "120 g claras", "60 g pan"], alternative: "Merluza con patata" },
    ],
  },
];

const initialGroceries: GroceryItem[] = [
  { id: "g1", category: "Proteínas", name: "Pechuga de pollo", amount: "1,25 kg", checked: false },
  { id: "g2", category: "Proteínas", name: "Pavo", amount: "850 g", checked: false },
  { id: "g3", category: "Proteínas", name: "Merluza", amount: "420 g", checked: false },
  { id: "g4", category: "Proteínas", name: "Salmón", amount: "370 g", checked: false },
  { id: "g5", category: "Proteínas", name: "Huevos", amount: "18 unidades", checked: true },
  { id: "g6", category: "Carbohidratos", name: "Arroz", amount: "720 g", checked: false },
  { id: "g7", category: "Carbohidratos", name: "Pasta", amount: "520 g", checked: false },
  { id: "g8", category: "Carbohidratos", name: "Patatas", amount: "2,4 kg", checked: false },
  { id: "g9", category: "Carbohidratos", name: "Pan integral", amount: "2 paquetes", checked: true },
  { id: "g10", category: "Fruta y verdura", name: "Plátanos", amount: "8 unidades", checked: false },
  { id: "g11", category: "Fruta y verdura", name: "Verdura variada", amount: "2,2 kg", checked: false },
  { id: "g12", category: "Fruta y verdura", name: "Tomate", amount: "1,2 kg", checked: false },
  { id: "g13", category: "Lácteos", name: "Yogur alto en proteína", amount: "12 unidades", checked: false },
  { id: "g14", category: "Lácteos", name: "Leche", amount: "2 litros", checked: false },
];

const exercises: WorkoutExercise[] = [
  {
    name: "Press de pecho en máquina", detail: "3 series · 8–12 rep", muscle: "Pecho", previous: "25 kg", initialKg: "25", target: "3 × 8–12 repeticiones", rest: "90 s",
    videoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/70/Muscle_Strengthening_at_the_Gym_-_Chest_Press.webm",
    videoSource: "https://commons.wikimedia.org/wiki/File:Muscle_Strengthening_at_the_Gym_-_Chest_Press.webm", videoAuthor: "Centers for Disease Control and Prevention", videoLicense: "Dominio público",
    technique: ["Ajusta el asiento para que las asas queden a la altura media del pecho.", "Mantén la espalda completamente apoyada y los hombros bajos.", "Empuja de forma controlada sin bloquear los codos.", "Regresa lentamente hasta notar el estiramiento del pecho."],
    mistakes: [{ title: "Separar la espalda del respaldo", detail: "Reduce el peso antes de compensar con el cuerpo." }, { title: "Mover el peso demasiado rápido", detail: "Controla la vuelta durante unos dos segundos." }],
  },
  {
    name: "Remo inclinado con barra", detail: "3 series · 8–12 rep", muscle: "Espalda", previous: "30 kg", initialKg: "30", target: "3 × 8–12 repeticiones", rest: "90 s",
    videoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Bent-over_row_-_exercise_demonstration_video.webm",
    videoSource: "https://commons.wikimedia.org/wiki/File:Bent-over_row_-_exercise_demonstration_video.webm", videoAuthor: "FitnessScape", videoLicense: "CC BY 3.0",
    technique: ["Inclina el torso manteniendo la espalda neutra.", "Sujeta la barra ligeramente más abierta que los hombros.", "Lleva los codos hacia atrás y acerca la barra al abdomen.", "Baja la barra sin perder la posición del tronco."],
    mistakes: [{ title: "Redondear la espalda", detail: "Reduce la carga y mantén el abdomen activo." }, { title: "Usar impulso", detail: "Evita levantarte con cada repetición." }],
  },
  {
    name: "Press de hombros", detail: "3 series · 8–10 rep", muscle: "Hombros", previous: "17,5 kg", initialKg: "17.5", target: "3 × 8–10 repeticiones", rest: "90 s",
    videoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/69/Shoulder_press_-_exercise_demonstration_video.webm",
    videoSource: "https://commons.wikimedia.org/wiki/File:Shoulder_press_-_exercise_demonstration_video.webm", videoAuthor: "FitnessScape", videoLicense: "CC BY 3.0",
    technique: ["Coloca las manos algo más abiertas que los hombros.", "Aprieta abdomen y glúteos antes de empujar.", "Sube el peso sobre la cabeza con una trayectoria estable.", "Baja hasta una posición cómoda sin perder el control."],
    mistakes: [{ title: "Arquear demasiado la zona lumbar", detail: "Baja el peso y mantén el abdomen firme." }, { title: "Cerrar los codos", detail: "Mantén antebrazos alineados bajo la carga." }],
  },
  {
    name: "Sentadilla con barra", detail: "3 series · 8–10 rep", muscle: "Piernas", previous: "35 kg", initialKg: "35", target: "3 × 8–10 repeticiones", rest: "120 s",
    videoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm",
    videoSource: "https://commons.wikimedia.org/wiki/File:Squat_-_exercise_demonstration_video.webm", videoAuthor: "FitnessScape", videoLicense: "CC BY 3.0",
    technique: ["Coloca los pies aproximadamente a la anchura de los hombros.", "Respira y crea tensión antes de iniciar la bajada.", "Flexiona cadera y rodillas manteniendo los pies apoyados.", "Empuja el suelo para volver a la posición inicial."],
    mistakes: [{ title: "Talones levantados", detail: "Reduce la profundidad o revisa la movilidad del tobillo." }, { title: "Rodillas colapsando hacia dentro", detail: "Mantén las rodillas alineadas con los pies." }],
  },
  {
    name: "Peso muerto", detail: "3 series · 6–8 rep", muscle: "Cadena posterior", previous: "45 kg", initialKg: "45", target: "3 × 6–8 repeticiones", rest: "120 s",
    videoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/62/Deadlift_-_exercise_demonstration_video.webm",
    videoSource: "https://commons.wikimedia.org/wiki/File:Deadlift_-_exercise_demonstration_video.webm", videoAuthor: "FitnessScape", videoLicense: "CC BY 3.0",
    technique: ["Sitúa la barra cerca de las espinillas.", "Agarra la barra y fija la espalda en posición neutra.", "Empuja el suelo y mantén la barra cerca del cuerpo.", "Termina erguido sin echar el tronco hacia atrás."],
    mistakes: [{ title: "Separar la barra del cuerpo", detail: "Mantén la carga pegada a las piernas durante el recorrido." }, { title: "Tirar solo con la espalda", detail: "Inicia el movimiento empujando con las piernas." }],
  },
  {
    name: "Dominadas asistidas", detail: "3 series · 6–10 rep", muscle: "Espalda", previous: "40 kg asistencia", initialKg: "40", target: "3 × 6–10 repeticiones", rest: "90 s",
    videoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Pull-ups_-_exercise_demonstration_video.webm",
    videoSource: "https://commons.wikimedia.org/wiki/File:Pull-ups_-_exercise_demonstration_video.webm", videoAuthor: "FitnessScape", videoLicense: "CC BY 3.0",
    technique: ["Agarra la barra con los hombros alejados de las orejas.", "Inicia el movimiento llevando los codos hacia abajo.", "Sube sin balancearte hasta acercar el pecho a la barra.", "Desciende de forma controlada hasta extender los brazos."],
    mistakes: [{ title: "Balancear el cuerpo", detail: "Aumenta la asistencia y controla cada repetición." }, { title: "Encoger los hombros", detail: "Mantén los hombros bajos al iniciar el tirón." }],
  },
];

const mealIcon = (type: string) => {
  if (type === "Desayuno") return <Wheat size={21} />;
  if (type === "Merienda") return <Apple size={21} />;
  return <Utensils size={21} />;
};

function calculateDailyTotals(day: DayPlan) {
  return day.meals.reduce(
    (total, meal) => ({ calories: total.calories + meal.calories, protein: total.protein + meal.protein }),
    { calories: 0, protein: 0 },
  );
}

type HealthCoachAppProps = {
  userId?: string;
  profile?: Profile | null;
  demoMode?: boolean;
  onProfileChange?: (profile: Profile) => void;
  onLogout?: () => void | Promise<void>;
};

const demoProfile: Profile = {
  id: "demo", name: "Marc", sex: "male", birth_date: "2002-01-01", height_cm: 179,
  current_weight_kg: 93, target_weight_kg: 80, goal: "lose", weighing_day: 0,
  activity_level: "moderate", exercise_types: ["Gimnasio", "Running"], training_days: 3,
  meal_count: 4, onboarding_completed: true,
};

function scaleIngredient(value: string, factor: number) {
  return value.replace(/^(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i, (_match, raw, unit) => {
    const amount = Number(String(raw).replace(",", "."));
    const rounded = Math.max(5, Math.round((amount * factor) / 5) * 5);
    return `${rounded} ${unit}`;
  });
}

function personalizeWeek(profile: Profile): DayPlan[] {
  const target = estimateDailyCalories(profile);
  const monday = new Date(`${mondayISO()}T12:00:00`);
  return week.map((day, dayIndex) => {
    const baseTotal = calculateDailyTotals(day).calories;
    const factor = Math.max(.72, Math.min(1.35, target / baseTotal));
    const date = new Date(monday);
    date.setDate(monday.getDate() + dayIndex);
    return {
      ...day,
      date: date.getDate(),
      meals: day.meals.map((meal) => ({
        ...meal,
        calories: Math.round(meal.calories * factor),
        protein: Math.round(meal.protein * Math.min(1.18, Math.max(.88, factor))),
        ingredients: meal.ingredients.map((ingredient) => scaleIngredient(ingredient, factor)),
      })),
    };
  });
}

function personalizeGroceries(profile: Profile): GroceryItem[] {
  const factor = Math.max(.72, Math.min(1.35, estimateDailyCalories(profile) / 2000));
  return initialGroceries.map((item) => ({
    ...item,
    amount: item.amount.replace(/(\d+(?:[.,]\d+)?)\s*(kg|g|litros?)/i, (_match, raw, unit) => {
      const value = Number(String(raw).replace(",", "."));
      const scaled = unit.toLowerCase() === "g" ? Math.round((value * factor) / 10) * 10 : Math.round(value * factor * 10) / 10;
      return `${String(scaled).replace(".", ",")} ${unit}`;
    }),
  }));
}

function isWeeklyWeightDue(logs: WeightLog[]): boolean {
  if (!logs.length) return true;
  const latest = new Date(`${logs[logs.length - 1].measured_at}T12:00:00`).getTime();
  return Date.now() - latest >= 7 * 24 * 60 * 60 * 1000;
}

export default function HealthCoachApp({ userId, profile, demoMode = false, onProfileChange, onLogout }: HealthCoachAppProps) {
  const [tab, setTab] = useState<Tab>("today");
  const [foodView, setFoodView] = useState<FoodView>("week");
  const [trainingView, setTrainingView] = useState<TrainingView>("overview");
  const [selectedDay, setSelectedDay] = useState(0);
  const [weightModal, setWeightModal] = useState(false);
  const [mealModal, setMealModal] = useState<Meal | null>(null);
  const effectiveProfile = profile ?? demoProfile;
  const [newWeight, setNewWeight] = useState(String(effectiveProfile.current_weight_kg));
  const [currentWeight, setCurrentWeight] = useState(effectiveProfile.current_weight_kg);
  const [blockedFoods, setBlockedFoods] = useState(demoMode ? ["Brócoli", "Champiñones", "Queso azul"] : []);
  const [favoriteFoods, setFavoriteFoods] = useState(demoMode ? ["Pollo", "Arroz", "Patata", "Pasta"] : []);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [preferenceRecords, setPreferenceRecords] = useState<FoodPreference[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [foodInput, setFoodInput] = useState("");
  const [favoriteInput, setFavoriteInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");
  const [groceries, setGroceries] = useState(() => personalizeGroceries(effectiveProfile));
  const [syncing, setSyncing] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [profileDraft, setProfileDraft] = useState<Profile>(effectiveProfile);
  const [toast, setToast] = useState("");
  const [activeExercise, setActiveExercise] = useState(0);
  const [setData, setSetData] = useState([
    { kg: "25", reps: "12", done: false },
    { kg: "25", reps: "11", done: false },
    { kg: "25", reps: "", done: false },
  ]);

  useEffect(() => {
    setCurrentWeight(effectiveProfile.current_weight_kg);
    setNewWeight(String(effectiveProfile.current_weight_kg));
    setProfileDraft(effectiveProfile);
  }, [effectiveProfile.current_weight_kg, effectiveProfile.id]);

  useEffect(() => {
    if (userId) {
      setSyncing(true);
      const weekStart = mondayISO();
      Promise.all([getFoodPreferences(userId), getWeightLogs(userId), getGroceries(userId, weekStart)])
        .then(async ([preferences, logs, remoteGroceries]) => {
          setPreferenceRecords(preferences);
          setBlockedFoods(preferences.filter((item) => item.restriction_type === "blocked").map((item) => item.food_name));
          setFavoriteFoods(preferences.filter((item) => item.restriction_type === "favorite").map((item) => item.food_name));
          setAllergies(preferences.filter((item) => item.restriction_type === "allergy").map((item) => item.food_name));
          setWeightLogs(logs);
          const items = remoteGroceries.length ? remoteGroceries : await seedGroceries(userId, weekStart, personalizeGroceries(effectiveProfile).map(({ category, name, amount, checked }) => ({ category, name, amount, checked })));
          setGroceries(items.map((item) => ({ id: String(item.id), category: item.category, name: item.name, amount: item.amount, checked: item.checked })));
          if (isWeeklyWeightDue(logs)) setWeightModal(true);
        })
        .catch((caught) => setToast(caught instanceof Error ? caught.message : "No se han podido sincronizar los datos"))
        .finally(() => setSyncing(false));
      return;
    }

    try {
      const saved = localStorage.getItem("ritmo-prototype");
      if (!saved) return;
      const data = JSON.parse(saved) as { currentWeight?: number; blockedFoods?: string[]; favoriteFoods?: string[]; allergies?: string[]; groceries?: GroceryItem[] };
      if (data.currentWeight) setCurrentWeight(data.currentWeight);
      if (data.blockedFoods) setBlockedFoods(data.blockedFoods);
      if (data.favoriteFoods) setFavoriteFoods(data.favoriteFoods);
      if (data.allergies) setAllergies(data.allergies);
      if (data.groceries) setGroceries(data.groceries);
    } catch { /* El modo demo sigue funcionando. */ }
  }, [userId]);

  useEffect(() => {
    if (userId) return;
    try {
      localStorage.setItem("ritmo-prototype", JSON.stringify({ currentWeight, blockedFoods, favoriteFoods, allergies, groceries }));
    } catch { /* Algunos entornos bloquean localStorage. */ }
  }, [userId, currentWeight, blockedFoods, favoriteFoods, allergies, groceries]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const currentProfile = useMemo(() => ({ ...effectiveProfile, current_weight_kg: currentWeight }), [effectiveProfile, currentWeight]);
  const personalizedWeek = useMemo(() => personalizeWeek(currentProfile), [currentProfile]);
  const selectedPlan = personalizedWeek[selectedDay];
  const totals = useMemo(() => calculateDailyTotals(selectedPlan), [selectedPlan]);
  const estimatedCalories = estimateDailyCalories(currentProfile);
  const weightDue = isWeeklyWeightDue(weightLogs);
  const checkedGroceries = groceries.filter((item) => item.checked).length;

  const saveWeight = async () => {
    const parsed = Number(newWeight.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 35 || parsed > 300) { setToast("Introduce un peso válido"); return; }
    try {
      setSyncing(true);
      if (userId) {
        const today = new Date().toISOString().slice(0, 10);
        const savedLog = await saveWeightLog(userId, parsed, today);
        const savedProfile = await saveProfile({ ...currentProfile, current_weight_kg: parsed });
        setWeightLogs((logs) => [...logs.filter((item) => item.measured_at !== today), savedLog].sort((a, b) => a.measured_at.localeCompare(b.measured_at)));
        onProfileChange?.(savedProfile);
      }
      setCurrentWeight(parsed); setWeightModal(false); setToast("Peso guardado. Plan semanal actualizado");
    } catch (caught) { setToast(caught instanceof Error ? caught.message : "No se ha podido guardar el peso"); }
    finally { setSyncing(false); }
  };

  const addPreference = async (raw: string, type: "blocked" | "favorite" | "allergy") => {
    const clean = raw.trim();
    if (!clean) return;
    const target = type === "blocked" ? blockedFoods : type === "favorite" ? favoriteFoods : allergies;
    if (target.some((food) => food.toLowerCase() === clean.toLowerCase())) { setToast("Ese alimento ya está registrado"); return; }
    try {
      setSyncing(true);
      let record: FoodPreference | null = null;
      if (userId) record = await addFoodPreferenceRecord(userId, clean, type);
      if (record) setPreferenceRecords((items) => [...items.filter((item) => item.id !== record!.id), record!]);
      if (type === "blocked") { setBlockedFoods((foods) => [...foods, clean]); setFoodInput(""); setToast(`${clean} no aparecerá en tu dieta`); }
      if (type === "favorite") { setFavoriteFoods((foods) => [...foods, clean]); setFavoriteInput(""); setToast(`${clean} añadido a favoritos`); }
      if (type === "allergy") { setAllergies((foods) => [...foods, clean]); setAllergyInput(""); setToast(`${clean} marcado como restricción crítica`); }
    } catch (caught) { setToast(caught instanceof Error ? caught.message : "No se ha podido guardar"); }
    finally { setSyncing(false); }
  };

  const addBlockedFood = () => void addPreference(foodInput, "blocked");

  const deletePreference = async (food: string, type: "blocked" | "favorite" | "allergy") => {
    try {
      setSyncing(true);
      const record = preferenceRecords.find((item) => item.food_name === food && item.restriction_type === type);
      if (userId && record) await removeFoodPreference(record.id);
      setPreferenceRecords((items) => items.filter((item) => item.id !== record?.id));
      if (type === "blocked") setBlockedFoods((foods) => foods.filter((item) => item !== food));
      if (type === "favorite") setFavoriteFoods((foods) => foods.filter((item) => item !== food));
      if (type === "allergy") setAllergies((foods) => foods.filter((item) => item !== food));
    } catch (caught) { setToast(caught instanceof Error ? caught.message : "No se ha podido eliminar"); }
    finally { setSyncing(false); }
  };

  const toggleGrocery = async (id: string) => {
    const item = groceries.find((value) => value.id === id);
    if (!item) return;
    const checked = !item.checked;
    setGroceries((items) => items.map((value) => (value.id === id ? { ...value, checked } : value)));
    if (userId && Number.isFinite(Number(id))) {
      try { await setGroceryChecked(Number(id), checked); }
      catch (caught) { setGroceries((items) => items.map((value) => (value.id === id ? { ...value, checked: !checked } : value))); setToast(caught instanceof Error ? caught.message : "No se ha podido sincronizar la compra"); }
    }
  };

  const updateSet = (index: number, field: "kg" | "reps", value: string) => {
    setSetData((sets) => sets.map((set, i) => (i === index ? { ...set, [field]: value } : set)));
  };

  const toggleSetDone = async (index: number) => {
    const nextDone = !setData[index].done;
    setSetData((sets) => sets.map((set, i) => (i === index ? { ...set, done: nextDone } : set)));
    if (userId && nextDone) {
      try {
        await saveExerciseSet({ userId, workoutName: "Torso A", exerciseName: exercises[activeExercise].name, setNumber: index + 1, weightKg: Number(setData[index].kg) || null, repetitions: Number(setData[index].reps) || null });
        setToast(`Serie ${index + 1} sincronizada`);
      } catch (caught) { setToast(caught instanceof Error ? caught.message : "No se ha podido guardar la serie"); }
    }
  };

  const startExercise = (index: number) => {
    setActiveExercise(index);
    setTrainingView("guide");
    setSetData([
      { kg: exercises[index].initialKg, reps: "12", done: false },
      { kg: exercises[index].initialKg, reps: "10", done: false },
      { kg: exercises[index].initialKg, reps: "", done: false },
    ]);
  };

  const saveProfileEditor = async () => {
    try {
      setSyncing(true);
      const saved = userId ? await saveProfile({ ...profileDraft, current_weight_kg: currentWeight, onboarding_completed: true }) : profileDraft;
      onProfileChange?.(saved);
      setProfileModal(false);
      setToast("Perfil actualizado");
    } catch (caught) { setToast(caught instanceof Error ? caught.message : "No se ha podido actualizar el perfil"); }
    finally { setSyncing(false); }
  };

  const exportPDF = () => {
    if (userId && weightDue) { setWeightModal(true); setToast("Registra el pesaje semanal antes de generar el nuevo PDF"); return; }
    const daysHtml = personalizedWeek.map((day) => {
      const meals = day.meals.map((meal) => `
        <section class="meal">
          <h3>${meal.type}: ${meal.name}</h3>
          <p>${meal.ingredients.join(" · ")}</p>
          <p class="alt"><strong>Alternativa:</strong> ${meal.alternative}</p>
        </section>`).join("");
      return `<article class="day"><h2>${day.short.toUpperCase()} ${day.date}</h2>${meals}</article>`;
    }).join("");

    const groceryHtml = Array.from(new Set(groceries.map((item) => item.category))).map((category) => `
      <section class="grocery-category"><h2>${category}</h2>${groceries.filter((item) => item.category === category).map((item) => `<div class="grocery"><span>□ ${item.name}</span><strong>${item.amount}</strong></div>`).join("")}</section>
    `).join("");

    const printable = window.open("", "_blank", "width=900,height=1100");
    if (!printable) {
      setToast("Permite ventanas emergentes para generar el PDF");
      return;
    }

    printable.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Ritmo · Plan semanal</title>
      <style>
        @page { size: A4; margin: 16mm; }
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #161b17; margin: 0; }
        header { background: #161b17; color: white; padding: 22px; border-radius: 16px; margin-bottom: 20px; }
        header h1 { margin: 0 0 6px; font-size: 27px; }
        header p { margin: 0; opacity: .75; }
        .summary { background: #edf6ee; border-radius: 14px; padding: 14px 18px; margin-bottom: 18px; line-height: 1.65; font-size: 13px; }
        .day { break-inside: avoid; margin-bottom: 18px; }
        .day > h2, .grocery-category > h2 { background: #daf2e2; padding: 7px 10px; border-radius: 7px; font-size: 14px; margin: 0 0 9px; }
        .meal { margin: 0 0 10px; break-inside: avoid; }
        .meal h3 { font-size: 12px; margin: 0 0 3px; }
        .meal p { font-size: 10.5px; margin: 2px 0; line-height: 1.45; }
        .alt { color: #516157; }
        .page-break { break-before: page; }
        .grocery-category { margin-bottom: 15px; break-inside: avoid; }
        .grocery { display: flex; justify-content: space-between; border-bottom: 1px solid #e7e9e5; padding: 6px 2px; font-size: 11px; }
        .blocked { margin-top: 22px; background: #feecec; padding: 13px; border-radius: 10px; font-size: 11px; }
        .print-note { color: #68736b; font-size: 10px; margin-top: 20px; }
      </style></head><body>
      <header><h1>RITMO · PLAN SEMANAL</h1><p>Tu alimentación y entrenamiento cambian contigo.</p></header>
      <div class="summary"><strong>Semana:</strong> ${personalizedWeek[0].date}–${personalizedWeek[6].date}<br><strong>Peso actual:</strong> ${currentWeight.toFixed(1)} kg · <strong>Objetivo:</strong> ${currentProfile.target_weight_kg} kg<br><strong>Plan estimado:</strong> ${estimatedCalories} kcal/día<br><strong>Pesaje oficial:</strong> ${formatWeighingDay(currentProfile.weighing_day)} por la mañana</div>
      ${daysHtml}
      <div class="page-break"></div>
      <h1>Lista de la compra</h1>${groceryHtml}
      <div class="blocked"><strong>Alimentos excluidos:</strong> ${blockedFoods.join(" · ")}</div>
      <p class="print-note">En iPhone o navegador: selecciona Imprimir → Guardar como PDF.</p>
      <script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script>
      </body></html>`);
    printable.document.close();
    setToast("Documento preparado para guardar como PDF");
  };

  const renderToday = () => (
    <>
      <div className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><Zap size={22} strokeWidth={2.8} /></div>
          <div className="brand-name">ritmo</div>
        </div>
        <div className="topbar-actions">{syncing && <span className="sync-chip"><Cloud size={13} /> Guardando</span>}<div className="avatar">{currentProfile.name.slice(0, 1).toUpperCase()}</div></div>
      </div>

      <h1 className="hero-title">Buenos días, {currentProfile.name}.<br />Hoy toca avanzar.</h1>
      <p className="hero-subtitle">Tu plan está adaptado a tu objetivo, tu último peso y el entrenamiento de esta semana.</p>

      <button className="card card-dark action-card" style={{ width: "100%", minHeight: 188 }} onClick={() => setWeightModal(true)}>
        <div className="weight-card-top">
          <span className="pill pill-light"><Scale size={14} /> Pesaje semanal</span>
          <ChevronRight size={19} />
        </div>
        <div>
          <div className="weight-number">{currentWeight.toFixed(1)} <small>kg</small></div>
          <div className="weight-delta">−0,6 kg esta semana · vas al ritmo correcto</div>
          <div className="progress-track"><div className="progress-fill" style={{ width: "31%" }} /></div>
          <div className="progress-labels"><span>Inicio {weightLogs[0]?.weight_kg?.toFixed(1) ?? currentProfile.current_weight_kg} kg</span><span>Objetivo {currentProfile.target_weight_kg} kg</span></div>
        </div>
      </button>

      <div className="section-header">
        <h2 className="section-title">Tu día</h2>
        <button className="text-button" onClick={() => { setTab("food"); setFoodView("week"); }}>Ver semana</button>
      </div>

      <div className="action-grid">
        <button className="card card-green action-card" onClick={() => { setTab("food"); setSelectedDay(0); setFoodView("week"); }}>
          <div className="action-icon"><Utensils size={21} /></div>
          <div>
            <div className="action-title">{estimatedCalories.toLocaleString("es-ES")} kcal</div>
            <div className="action-subtitle">4 comidas medidas y preparadas para hoy</div>
          </div>
        </button>
        <button className="card card-lime action-card" onClick={() => setTab("training")}>
          <div className="action-icon"><Dumbbell size={21} /></div>
          <div>
            <div className="action-title">Torso A</div>
            <div className="action-subtitle">6 ejercicios · 55 minutos</div>
          </div>
        </button>
      </div>

      <div className="section-header">
        <h2 className="section-title">Siguiente comida</h2>
        <span className="pill pill-soft"><Clock3 size={13} /> 13:30</span>
      </div>
      <div className="card">
        <div className="meal-row" style={{ borderBottom: 0, padding: 0 }}>
          <div className="meal-icon"><Utensils size={22} /></div>
          <div className="meal-copy">
            <div className="meal-kicker">Comida</div>
            <div className="meal-name">Arroz con pollo y verduras</div>
            <div className="meal-meta">685 kcal · 52 g proteína · 25 min</div>
          </div>
          <button className="chevron-button" onClick={() => setMealModal(week[0].meals[1])}><ChevronRight size={17} /></button>
        </div>
      </div>

      <div className="section-header"><h2 className="section-title">Mensaje de tu entrenador</h2></div>
      <div className="card">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div className="meal-icon" style={{ background: "var(--lime)", color: "var(--ink)" }}><Sparkles size={21} /></div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 820, marginBottom: 5 }}>Esta semana no tocamos cantidades</div>
            <div style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.5 }}>Has bajado a un ritmo sostenible y completaste los dos entrenamientos. Mantén el plan y busca una repetición más en el press.</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderFood = () => (
    <>
      <div className="page-header">
        <div>
          <div className="meal-kicker">Semana 14–20 julio</div>
          <h1 className="page-title">Comida</h1>
        </div>
        <button className="icon-button" onClick={exportPDF} aria-label="Descargar PDF"><FileDown size={21} /></button>
      </div>

      <div className="card" style={{ padding: 6, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5, marginBottom: 17 }}>
        {(["week", "shopping", "preferences"] as FoodView[]).map((view) => (
          <button
            key={view}
            onClick={() => setFoodView(view)}
            style={{ border: 0, borderRadius: 18, padding: "10px 5px", background: foodView === view ? "var(--ink)" : "transparent", color: foodView === view ? "white" : "var(--muted)", fontWeight: 800, fontSize: 11, cursor: "pointer" }}
          >
            {view === "week" ? "Mi semana" : view === "shopping" ? "Compra" : "Preferencias"}
          </button>
        ))}
      </div>

      {foodView === "week" && (
        <>
          <div className="day-strip">
            {personalizedWeek.map((day, index) => (
              <button key={day.short} className={`day-chip ${selectedDay === index ? "active" : ""}`} onClick={() => setSelectedDay(index)}>
                <span>{day.short}</span><strong>{day.date}</strong>
              </button>
            ))}
          </div>

          <div className="card card-green">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="pill pill-light"><Target size={13} /> Pérdida progresiva</div>
                <div style={{ fontSize: 28, fontWeight: 870, letterSpacing: -1, marginTop: 15 }}>{totals.calories} kcal</div>
                <div style={{ opacity: .72, fontSize: 12, marginTop: 2 }}>Plan estimado para {currentWeight.toFixed(1)} kg</div>
              </div>
              <Gauge size={32} style={{ opacity: .65 }} />
            </div>
            <div className="macro-grid">
              <div className="macro"><div className="macro-value">{totals.protein} g</div><div className="macro-label">Proteína</div></div>
              <div className="macro"><div className="macro-value">220 g</div><div className="macro-label">Carbohidratos</div></div>
              <div className="macro"><div className="macro-value">62 g</div><div className="macro-label">Grasas</div></div>
            </div>
          </div>

          <div className="section-header">
            <h2 className="section-title">Menú del {selectedPlan.short.toLowerCase()}</h2>
            <button className="text-button" onClick={() => setToast("Día regenerado respetando tus bloqueos")}>Regenerar</button>
          </div>
          <div className="card">
            {selectedPlan.meals.map((meal) => (
              <div className="meal-row" key={`${selectedPlan.short}-${meal.type}`}>
                <div className="meal-icon">{mealIcon(meal.type)}</div>
                <div className="meal-copy">
                  <div className="meal-kicker">{meal.type}</div>
                  <div className="meal-name">{meal.name}</div>
                  <div className="meal-meta">{meal.calories} kcal · {meal.protein} g proteína</div>
                </div>
                <button className="chevron-button" onClick={() => setMealModal(meal)}><ChevronRight size={17} /></button>
              </div>
            ))}
          </div>

          <button className="primary-button full" style={{ marginTop: 14 }} onClick={exportPDF}><FileDown size={18} /> Descargar semana en PDF</button>
        </>
      )}

      {foodView === "shopping" && (
        <>
          <div className="card card-dark">
            <div className="weight-card-top">
              <span className="pill pill-light"><ShoppingBasket size={14} /> Lista automática</span>
              <PackageCheck size={22} />
            </div>
            <div style={{ fontSize: 31, fontWeight: 870, letterSpacing: -1.1, marginTop: 19, position: "relative", zIndex: 1 }}>{checkedGroceries}/{groceries.length}</div>
            <div style={{ fontSize: 12, opacity: .68, marginTop: 3, position: "relative", zIndex: 1 }}>productos ya están en tu cesta</div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${(checkedGroceries / groceries.length) * 100}%` }} /></div>
          </div>

          {Array.from(new Set(groceries.map((item) => item.category))).map((category) => (
            <div key={category}>
              <div className="section-header"><h2 className="section-title">{category}</h2></div>
              <div className="card">
                {groceries.filter((item) => item.category === category).map((item) => (
                  <div key={item.id} className={`grocery-row ${item.checked ? "done" : ""}`} onClick={() => toggleGrocery(item.id)}>
                    <div className={`checkbox ${item.checked ? "checked" : ""}`}>{item.checked && <Check size={15} />}</div>
                    <div className="grocery-main"><div className="grocery-name">{item.name}</div><div className="grocery-amount">{item.amount}</div></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {foodView === "preferences" && (
        <>
          <div className="card card-lime">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div className="pill" style={{ background: "rgba(22,27,23,.09)" }}><Ban size={13} /> Regla absoluta</div>
                <h2 style={{ fontSize: 22, lineHeight: 1.1, letterSpacing: -.7, margin: "14px 0 7px" }}>Lo que bloquees no aparecerá nunca.</h2>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, opacity: .72 }}>Ni en recetas, alternativas o futuras semanas.</p>
              </div>
              <Apple size={34} style={{ opacity: .62, flex: "0 0 auto" }} />
            </div>
          </div>

          <div className="section-header"><h2 className="section-title">Nunca incluir</h2><span className="pill pill-orange">{blockedFoods.length} bloqueados</span></div>
          <div className="card">
            <div className="tag-list">
              {blockedFoods.map((food) => (
                <button key={food} className="food-tag blocked" onClick={() => void deletePreference(food, "blocked")}>
                  <Ban size={14} /> {food} <X size={13} />
                </button>
              ))}
            </div>
            <div className="input-row">
              <input className="text-input" value={foodInput} onChange={(event) => setFoodInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addBlockedFood()} placeholder="Buscar o escribir alimento" />
              <button className="primary-button" onClick={addBlockedFood}><Plus size={18} /></button>
            </div>
          </div>

          <div className="section-header"><h2 className="section-title">Tus favoritos</h2></div>
          <div className="card">
            <div className="tag-list">
              {favoriteFoods.map((food) => (
                <button key={food} className="food-tag favorite" onClick={() => void deletePreference(food, "favorite")}>
                  <Heart size={14} fill="currentColor" /> {food} <X size={13} />
                </button>
              ))}
            </div>
            <div className="input-row">
              <input className="text-input" value={favoriteInput} onChange={(event) => setFavoriteInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void addPreference(favoriteInput, "favorite")} placeholder="Añadir alimento favorito" />
              <button className="primary-button" onClick={() => void addPreference(favoriteInput, "favorite")}><Plus size={18} /></button>
            </div>
          </div>

          <div className="section-header"><h2 className="section-title">Restricciones críticas</h2></div>
          <div className="card">
            <div className="setting-row" style={{ display: "block" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <div className="setting-icon"><BadgeCheck size={20} /></div>
                <div className="setting-copy"><div className="setting-name">Alergias e intolerancias</div><div className="setting-value">{allergies.length ? `${allergies.length} restricciones críticas` : "Sin alergias registradas"}</div></div>
              </div>
              {allergies.length > 0 && <div className="tag-list" style={{ marginTop: 12 }}>{allergies.map((food) => <button key={food} className="food-tag blocked" onClick={() => void deletePreference(food, "allergy")}><BadgeCheck size={14} /> {food} <X size={13} /></button>)}</div>}
              <div className="input-row"><input className="text-input" value={allergyInput} onChange={(event) => setAllergyInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void addPreference(allergyInput, "allergy")} placeholder="Añadir alergia o intolerancia" /><button className="primary-button" onClick={() => void addPreference(allergyInput, "allergy")}><Plus size={18} /></button></div>
            </div>
            <div className="setting-row">
              <div className="setting-icon"><Info size={20} /></div>
              <div className="setting-copy"><div className="setting-name">Validación automática</div><div className="setting-value">Activa antes de generar cada plan</div></div>
              <Check size={17} color="var(--green)" />
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderTraining = () => {
    const exercise = exercises[activeExercise];
    if (trainingView === "guide") {
      return (
        <>
          <div className="page-header">
            <div>
              <div className="meal-kicker">Ejercicio {activeExercise + 1} de {exercises.length}</div>
              <h1 className="page-title" style={{ fontSize: 24 }}>{exercise.name}</h1>
            </div>
            <button className="icon-button" onClick={() => setTrainingView("overview")}><X size={20} /></button>
          </div>

          <div className="guide-video">
            <video
              key={exercise.videoUrl}
              className="exercise-video"
              src={exercise.videoUrl}
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onError={() => setToast("No se ha podido cargar el vídeo. Comprueba la conexión.")}
            />
          </div>
          <div className="video-credit">
            Vídeo: <a href={exercise.videoSource} target="_blank" rel="noreferrer">{exercise.videoAuthor}</a> · {exercise.videoLicense}
          </div>

          <div className="card card-green">
            <span className="pill pill-light"><Target size={13} /> Objetivo de hoy</span>
            <div style={{ fontSize: 25, fontWeight: 870, letterSpacing: -.8, marginTop: 14 }}>{exercise.target}</div>
            <div style={{ opacity: .72, fontSize: 12, marginTop: 4 }}>Descanso: {exercise.rest} · Última vez: {exercise.previous}</div>
          </div>

          <div className="section-header"><h2 className="section-title">Registra tus series</h2><span className="pill pill-soft"><TimerReset size={13} /> 01:30</span></div>
          <div className="card">
            <div className="set-grid">
              <div className="set-head">SERIE</div><div className="set-head">KG</div><div className="set-head">REPS</div><div />
              {setData.map((set, index) => (
                <div key={index} style={{ display: "contents" }}>
                  <div className="set-index">{index + 1}</div>
                  <input className="set-input" inputMode="decimal" value={set.kg} onChange={(event) => updateSet(index, "kg", event.target.value)} />
                  <input className="set-input" inputMode="numeric" value={set.reps} onChange={(event) => updateSet(index, "reps", event.target.value)} />
                  <button className={`set-check ${set.done ? "done" : ""}`} onClick={() => toggleSetDone(index)}>{set.done ? <Check size={18} /> : <Plus size={18} />}</button>
                </div>
              ))}
            </div>
          </div>

          <div className="section-header"><h2 className="section-title">Cómo hacerlo</h2></div>
          <div className="card">
            <ul className="tip-list">
              {exercise.technique.map((tip, index) => <li key={tip}>{index === 0 ? <strong>{tip}</strong> : tip}</li>)}
            </ul>
          </div>

          <div className="section-header"><h2 className="section-title">Evita estos errores</h2></div>
          <div className="card">
            {exercise.mistakes.map((mistake) => (
              <div className="meal-row" key={mistake.title}><div className="meal-icon" style={{ color: "var(--red)", background: "#feecec" }}><X size={20} /></div><div className="meal-copy"><div className="meal-name">{mistake.title}</div><div className="meal-meta">{mistake.detail}</div></div></div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 9, marginTop: 15 }}>
            <button className="secondary-button" style={{ flex: 1 }} onClick={() => setToast("Ejercicio sustituido por press con mancuernas")}><RefreshCw size={17} /> Ocupada</button>
            <button className="primary-button green" style={{ flex: 1 }} onClick={() => {
              if (activeExercise < exercises.length - 1) startExercise(activeExercise + 1);
              else { setTrainingView("overview"); setToast("Entrenamiento completado · +120 XP"); }
            }}>Siguiente <ChevronRight size={17} /></button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="page-header">
          <div><div className="meal-kicker">Plan híbrido · 3 días</div><h1 className="page-title">Entrenamiento</h1></div>
          <button className="icon-button"><MoreHorizontal size={21} /></button>
        </div>

        <div className="card card-dark workout-hero">
          <div>
            <div className="weight-card-top"><span className="pill pill-light"><Dumbbell size={14} /> Hoy · Torso A</span><Flame size={22} /></div>
            <h2 className="workout-title">Construye fuerza.<br />Sin improvisar.</h2>
            <div className="workout-meta">6 ejercicios · 18 series · 55 min</div>
          </div>
          <div className="workout-actions">
            <button className="primary-button" style={{ background: "var(--lime)", color: "var(--ink)" }} onClick={() => startExercise(0)}><Play size={17} fill="currentColor" /> Empezar</button>
            <button className="secondary-button" style={{ background: "rgba(255,255,255,.12)", color: "white", borderColor: "rgba(255,255,255,.12)" }} onClick={() => setToast("Rutina adaptada a 35 minutos")}><Clock3 size={17} /> Adaptar</button>
          </div>
        </div>

        <div className="section-header"><h2 className="section-title">Rutina de hoy</h2><span className="pill pill-green">Progresión activa</span></div>
        <div className="card">
          {exercises.map((exercise, index) => (
            <div className={`exercise-row ${index === 0 ? "active" : ""}`} key={exercise.name} onClick={() => startExercise(index)} style={{ cursor: "pointer" }}>
              <div className="exercise-number">{index + 1}</div>
              <div className="exercise-copy"><div className="exercise-name">{exercise.name}</div><div className="exercise-detail">{exercise.detail} · {exercise.previous}</div></div>
              <ChevronRight size={17} />
            </div>
          ))}
        </div>

        <div className="section-header"><h2 className="section-title">La app ha aprendido</h2></div>
        <div className="card card-lime">
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div className="action-icon"><Sparkles size={21} /></div>
            <div><div style={{ fontWeight: 850, fontSize: 15, marginBottom: 5 }}>Sube a 27,5 kg en press</div><div style={{ fontSize: 12, opacity: .7, lineHeight: 1.45 }}>Completaste 12 repeticiones en las tres series durante dos sesiones seguidas.</div></div>
          </div>
        </div>

        <div className="section-header"><h2 className="section-title">Tu semana</h2></div>
        <div className="card">
          <div className="setting-row"><div className="setting-icon"><Dumbbell size={20} /></div><div className="setting-copy"><div className="setting-name">Lunes · Torso A</div><div className="setting-value">Hoy · 48 min</div></div><span className="pill pill-green">Listo</span></div>
          <div className="setting-row"><div className="setting-icon"><Dumbbell size={20} /></div><div className="setting-copy"><div className="setting-name">Miércoles · Pierna</div><div className="setting-value">6 ejercicios · 52 min</div></div><ChevronRight size={17} /></div>
          <div className="setting-row"><div className="setting-icon"><Flame size={20} /></div><div className="setting-copy"><div className="setting-name">Sábado · Carrera suave</div><div className="setting-value">35 minutos · ritmo cómodo</div></div><ChevronRight size={17} /></div>
        </div>
      </>
    );
  };

  const renderProgress = () => (
    <>
      <div className="page-header"><div><div className="meal-kicker">Últimas 6 semanas</div><h1 className="page-title">Progreso</h1></div><button className="icon-button" onClick={() => setWeightModal(true)}><Plus size={21} /></button></div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-value">−4,6 kg</div><div className="stat-label">Desde el inicio</div></div>
        <div className="stat-card"><div className="stat-value">86%</div><div className="stat-label">Adherencia semanal</div></div>
        <div className="stat-card"><div className="stat-value">8</div><div className="stat-label">Entrenos completados</div></div>
        <div className="stat-card"><div className="stat-value">+18%</div><div className="stat-label">Fuerza estimada</div></div>
      </div>

      <div className="section-header"><h2 className="section-title">Evolución del peso</h2><span className="pill pill-green">Buen ritmo</span></div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><div><div className="meal-kicker">Peso actual</div><div style={{ fontSize: 29, fontWeight: 870, letterSpacing: -1 }}>{currentWeight.toFixed(1)} kg</div></div><div style={{ color: "var(--green)", fontWeight: 800, fontSize: 12 }}>−0,6 kg</div></div>
        <div className="weight-chart">
          {(weightLogs.length ? weightLogs.slice(-6).map((item) => item.weight_kg) : [96.9, 96.1, 95.3, 94.5, 93.6, currentWeight]).map((value, index) => {
            const height = 45 + (97 - value) * 14;
            return <div className="chart-bar" key={index} style={{ height: `${height}px` }}><span>S{index + 1}</span></div>;
          })}
        </div>
      </div>

      <div className="section-header"><h2 className="section-title">Lectura semanal</h2></div>
      <div className="card">
        <div className="meal-row"><div className="meal-icon"><Scale size={21} /></div><div className="meal-copy"><div className="meal-name">Pérdida dentro del objetivo</div><div className="meal-meta">No cambiaremos tus cantidades esta semana.</div></div><Check size={19} color="var(--green)" /></div>
        <div className="meal-row"><div className="meal-icon"><Utensils size={21} /></div><div className="meal-copy"><div className="meal-name">Hambre bien controlada</div><div className="meal-meta">Valoración media: 2 de 5.</div></div><Check size={19} color="var(--green)" /></div>
        <div className="meal-row"><div className="meal-icon"><Dumbbell size={21} /></div><div className="meal-copy"><div className="meal-name">Progresión en 4 ejercicios</div><div className="meal-meta">Subiremos carga en dos movimientos.</div></div><ChevronRight size={17} /></div>
      </div>
    </>
  );

  const renderProfile = () => (
    <>
      <div className="page-header"><div><div className="meal-kicker">Tu configuración</div><h1 className="page-title">Perfil</h1></div><button className="icon-button" onClick={() => setProfileModal(true)}><Settings2 size={21} /></button></div>

      <div className="card card-green" style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div className="avatar" style={{ width: 58, height: 58, fontSize: 20 }}>{currentProfile.name.slice(0, 1).toUpperCase()}</div>
        <div><div style={{ fontSize: 21, fontWeight: 860, letterSpacing: -.6 }}>{currentProfile.name}</div><div style={{ fontSize: 12, opacity: .72, marginTop: 3 }}>Objetivo: {currentProfile.goal === "lose" ? "perder peso" : currentProfile.goal === "gain" ? "ganar músculo" : "mantener el peso"}</div></div>
      </div>

      <div className="section-header"><h2 className="section-title">Datos del plan</h2></div>
      <div className="card">
        <div className="setting-row"><div className="setting-icon"><Scale size={20} /></div><div className="setting-copy"><div className="setting-name">Peso y objetivo</div><div className="setting-value">{currentWeight.toFixed(1)} kg → {currentProfile.target_weight_kg} kg</div></div><ChevronRight size={17} /></div>
        <div className="setting-row"><div className="setting-icon"><Target size={20} /></div><div className="setting-copy"><div className="setting-name">Altura y actividad</div><div className="setting-value">{currentProfile.height_cm} cm · actividad {currentProfile.activity_level}</div></div><ChevronRight size={17} /></div>
        <div className="setting-row"><div className="setting-icon"><CalendarDays size={20} /></div><div className="setting-copy"><div className="setting-name">Día de pesaje</div><div className="setting-value">{formatWeighingDay(currentProfile.weighing_day)} por la mañana</div></div><ChevronRight size={17} /></div>
      </div>

      <div className="section-header"><h2 className="section-title">Preferencias</h2></div>
      <div className="card">
        <div className="setting-row" onClick={() => { setTab("food"); setFoodView("preferences"); }} style={{ cursor: "pointer" }}><div className="setting-icon"><Ban size={20} /></div><div className="setting-copy"><div className="setting-name">Alimentos bloqueados</div><div className="setting-value">{blockedFoods.length} alimentos nunca aparecerán</div></div><ChevronRight size={17} /></div>
        <div className="setting-row"><div className="setting-icon"><Dumbbell size={20} /></div><div className="setting-copy"><div className="setting-name">Tipo de ejercicio</div><div className="setting-value">{currentProfile.exercise_types.join(" + ")} · {currentProfile.training_days} días</div></div><ChevronRight size={17} /></div>
        <div className="setting-row"><div className="setting-icon"><Clock3 size={20} /></div><div className="setting-copy"><div className="setting-name">Horarios habituales</div><div className="setting-value">Comida 13:30 · Entreno 19:00</div></div><ChevronRight size={17} /></div>
      </div>

      <div className="section-header"><h2 className="section-title">Tu sistema</h2></div>
      <div className="card">
        <div className="setting-row"><div className="setting-icon"><Sparkles size={20} /></div><div className="setting-copy"><div className="setting-name">Personalización activa</div><div className="setting-value">Aprende de pesos, cambios y cumplimiento</div></div><Check size={18} color="var(--green)" /></div>
        <div className="setting-row"><div className="setting-icon"><FileDown size={20} /></div><div className="setting-copy"><div className="setting-name">Plan semanal en PDF</div><div className="setting-value">Menús, alternativas y compra</div></div><button className="text-button" onClick={exportPDF}>Generar</button></div>
        {userId && <div className="setting-row"><div className="setting-icon"><Cloud size={20} /></div><div className="setting-copy"><div className="setting-name">Sincronización</div><div className="setting-value">{syncing ? "Guardando cambios…" : "Datos sincronizados con Supabase"}</div></div><Check size={18} color="var(--green)" /></div>}
        {onLogout && <button className="logout-button" onClick={() => void onLogout()}><LogOut size={18} /> Cerrar sesión</button>}
      </div>
    </>
  );

  const tabTitles: Record<Tab, string> = {
    today: "Hoy",
    food: "Comida",
    training: "Entreno",
    progress: "Progreso",
    profile: "Perfil",
  };

  const handleTabChange = useCallback((newTab: Tab) => {
    setTab(newTab);
    if (newTab === "training") setTrainingView("overview");
  }, []);

  return (
    <AppLayout title={tabTitles[tab]} tab={tab} onTabChange={handleTabChange}>
      <>
        {tab === "today" && renderToday()}
        {tab === "food" && renderFood()}
        {tab === "training" && renderTraining()}
        {tab === "progress" && renderProgress()}
        {tab === "profile" && renderProfile()}

        {weightModal && (
          <div className="modal-backdrop" onClick={() => setWeightModal(false)}>
            <div className="modal-sheet" onClick={(event) => event.stopPropagation()}>
              <div className="sheet-handle" />
              <span className="pill pill-green"><CalendarDays size={13} /> Pesaje oficial · domingo</span>
              <h2 className="modal-title" style={{ marginTop: 13 }}>¿Cuánto pesas hoy?</h2>
              <p className="modal-subtitle">Intenta pesarte al levantarte, antes de desayunar y en condiciones parecidas cada semana.</p>
              <div className="weight-input-wrap"><input className="weight-input" value={newWeight} inputMode="decimal" onChange={(event) => setNewWeight(event.target.value)} /><span className="weight-unit">kg</span></div>
              <div className="card" style={{ marginBottom: 14 }}>
                <div className="meal-row" style={{ padding: 0, border: 0 }}><div className="meal-icon"><Sparkles size={20} /></div><div className="meal-copy"><div className="meal-name">La app ajustará tu semana</div><div className="meal-meta">Usará la tendencia, no reaccionará de forma brusca a un solo dato.</div></div></div>
              </div>
              <button className="primary-button green full" onClick={saveWeight}><Check size={18} /> Guardar y adaptar mi plan</button>
            </div>
          </div>
        )}

        {mealModal && (
          <div className="modal-backdrop" onClick={() => setMealModal(null)}>
            <div className="modal-sheet" onClick={(event) => event.stopPropagation()}>
              <div className="sheet-handle" />
              <span className="pill pill-green"><Utensils size={13} /> {mealModal.type}</span>
              <h2 className="modal-title" style={{ marginTop: 13 }}>{mealModal.name}</h2>
              <p className="modal-subtitle">{mealModal.calories} kcal · {mealModal.protein} g de proteína · cantidades calculadas para tu objetivo.</p>
              <div className="card">
                <div className="food-category-title">Ingredientes</div>
                {mealModal.ingredients.map((ingredient) => (
                  <div className="grocery-row" key={ingredient}><div className="checkbox checked"><Check size={14} /></div><div className="grocery-name">{ingredient}</div></div>
                ))}
              </div>
              <div className="section-header"><h3 className="section-title">Alternativa equivalente</h3></div>
              <div className="card card-lime"><div style={{ fontSize: 14, fontWeight: 830 }}>{mealModal.alternative}</div><div style={{ fontSize: 11, opacity: .7, marginTop: 5 }}>Ajustada para mantener aproximadamente energía y proteína.</div></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginTop: 14 }}>
                <button className="secondary-button" onClick={() => { setToast("Receta marcada para no repetir"); setMealModal(null); }}><Ban size={17} /> No repetir</button>
                <button className="primary-button green" onClick={() => { setToast("Comida marcada como realizada"); setMealModal(null); }}><Check size={17} /> Hecho</button>
              </div>
            </div>
          </div>
        )}

        {profileModal && (
          <div className="modal-backdrop" onClick={() => setProfileModal(false)}>
            <div className="modal-sheet" onClick={(event) => event.stopPropagation()}>
              <div className="sheet-handle" />
              <span className="pill pill-green"><Settings2 size={13} /> Datos del plan</span>
              <h2 className="modal-title" style={{ marginTop: 13 }}>Editar perfil</h2>
              <p className="modal-subtitle">Los cambios recalculan la estimación energética y las cantidades de la semana.</p>
              <div className="form-grid two">
                <label className="auth-field"><span>Nombre</span><div><input value={profileDraft.name} onChange={(event) => setProfileDraft({ ...profileDraft, name: event.target.value })} /></div></label>
                <label className="auth-field"><span>Altura (cm)</span><div><input type="number" value={profileDraft.height_cm} onChange={(event) => setProfileDraft({ ...profileDraft, height_cm: Number(event.target.value) })} /></div></label>
                <label className="auth-field"><span>Peso objetivo</span><div><input type="number" step="0.1" value={profileDraft.target_weight_kg} onChange={(event) => setProfileDraft({ ...profileDraft, target_weight_kg: Number(event.target.value) })} /></div></label>
                <label className="auth-field"><span>Días de entreno</span><div><input type="number" min="0" max="7" value={profileDraft.training_days} onChange={(event) => setProfileDraft({ ...profileDraft, training_days: Number(event.target.value) })} /></div></label>
                <label className="auth-field"><span>Objetivo</span><div><select value={profileDraft.goal} onChange={(event) => setProfileDraft({ ...profileDraft, goal: event.target.value as Profile["goal"] })}><option value="lose">Perder peso</option><option value="maintain">Mantener</option><option value="gain">Ganar músculo</option></select></div></label>
                <label className="auth-field"><span>Día de pesaje</span><div><select value={profileDraft.weighing_day} onChange={(event) => setProfileDraft({ ...profileDraft, weighing_day: Number(event.target.value) })}>{["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((day, index) => <option value={index} key={day}>{day}</option>)}</select></div></label>
              </div>
              <button className="primary-button green full" onClick={() => void saveProfileEditor()}><Check size={18} /> Guardar cambios</button>
            </div>
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}
      </>
    </AppLayout>
  );
}

import type { Profile } from "../types";
import { mondayISO, toLocalISO } from "./dates";
import { estimateDailyCalories } from "./nutrition";

export type Meal = {
  type: string;
  name: string;
  calories: number;
  protein: number;
  ingredients: string[];
  alternative: string;
  /** Presente cuando la comida mostrada no es la del menú base. */
  swappedReason?: "excluded" | "avoid" | "favorite";
};

type BaseDayPlan = {
  short: string;
  date: number;
  meals: Meal[];
};

export type DayPlan = BaseDayPlan & { dateISO: string };

export const week: BaseDayPlan[] = [
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

export function scaleIngredient(value: string, factor: number) {
  return value.replace(/^(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i, (_match, raw, unit) => {
    const amount = Number(String(raw).replace(",", "."));
    const rounded = Math.max(5, Math.round((amount * factor) / 5) * 5);
    return `${rounded} ${unit}`;
  });
}

export function calculateDailyTotals(day: { meals: Meal[] }) {
  return day.meals.reduce(
    (total, meal) => ({ calories: total.calories + meal.calories, protein: total.protein + meal.protein }),
    { calories: 0, protein: 0 },
  );
}

export function mealKey(day: { short: string }, meal: { type: string }): string {
  return `${day.short}-${meal.type}`;
}

/** Convierte el texto libre de "alternativa" en una comida completa,
 *  manteniendo aproximadamente la misma energía/proteína (así lo indica
 *  la propia UI) y derivando una lista de ingredientes a partir del texto. */
export function buildAlternativeMeal(meal: Meal): Meal {
  const ingredients = meal.alternative
    .split(/,\s*| y (?=\d)/i)
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    type: meal.type,
    name: meal.alternative,
    calories: meal.calories,
    protein: meal.protein,
    ingredients: ingredients.length ? ingredients : [meal.alternative],
    alternative: meal.name,
  };
}

/** Snacks de media mañana para perfiles de 5 comidas; rotan por día. */
const MID_MORNING_SNACKS: Meal[] = [
  { type: "Media mañana", name: "Yogur proteico con nueces", calories: 250, protein: 20, ingredients: ["200 g yogur alto en proteína", "15 g nueces"], alternative: "200 g queso fresco batido y 1 fruta" },
  { type: "Media mañana", name: "Tostada rápida de pavo", calories: 245, protein: 18, ingredients: ["50 g pan integral", "80 g pavo", "tomate"], alternative: "Yogur proteico y 1 fruta" },
  { type: "Media mañana", name: "Fruta con queso fresco", calories: 240, protein: 19, ingredients: ["250 g queso fresco batido", "1 manzana"], alternative: "Yogur con 20 g de avena" },
  { type: "Media mañana", name: "Batido de leche y avena", calories: 260, protein: 17, ingredients: ["250 ml leche", "25 g avena", "1 plátano"], alternative: "Bocadillo pequeño de pavo" },
];

/** Ajusta el menú base de 4 comidas al `meal_count` del perfil:
 *  3 → sin merienda (el factor de escalado reparte esas kcal en el resto);
 *  5 → añade media mañana rotando el pool de snacks. */
export function applyMealCount(meals: Meal[], mealCount: number, dayIndex: number): Meal[] {
  if (mealCount <= 3) return meals.filter((meal) => meal.type !== "Merienda");
  if (mealCount >= 5) {
    const snack = MID_MORNING_SNACKS[dayIndex % MID_MORNING_SNACKS.length];
    const withSnack = [...meals];
    withSnack.splice(1, 0, snack);
    return withSnack;
  }
  return meals;
}

const textContainsAny = (text: string, foodsLower: string[]) =>
  foodsLower.some((food) => text.toLowerCase().includes(food));

const mealMentions = (meal: Meal, foodsLower: string[]) =>
  textContainsAny(meal.name, foodsLower) || meal.ingredients.some((ingredient) => textContainsAny(ingredient, foodsLower));

/** Personaliza la semana para el perfil:
 *  - `avoidFoods` = bloqueados ∪ alergias. Si una comida los contiene se usa
 *    su alternativa; si la alternativa también, se retiran esas líneas de
 *    ingredientes (las alergias no pueden colarse en el plan).
 *  - `favoriteFoods`: si la alternativa contiene más favoritos que el plato
 *    base, se prefiere la alternativa (marcada con swappedReason "favorite").
 *  - Respeta `meal_count` y escala cantidades al objetivo calórico. */
export function personalizeWeek(
  profile: Profile,
  excludedKeys: Set<string>,
  avoidFoods: string[],
  favoriteFoods: string[] = [],
): DayPlan[] {
  const target = estimateDailyCalories(profile);
  const monday = new Date(`${mondayISO()}T12:00:00`);
  const avoidLower = avoidFoods.map((food) => food.toLowerCase()).filter(Boolean);
  const favoriteLower = favoriteFoods.map((food) => food.toLowerCase()).filter(Boolean);
  const favoriteScore = (meal: Meal) =>
    favoriteLower.filter((food) => textContainsAny(meal.name, [food]) || meal.ingredients.some((i) => textContainsAny(i, [food]))).length;

  return week.map((day, dayIndex) => {
    const dayMeals = applyMealCount(day.meals, profile.meal_count, dayIndex);
    const baseTotal = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const factor = Math.max(.72, Math.min(1.35, target / baseTotal));
    const date = new Date(monday);
    date.setDate(monday.getDate() + dayIndex);
    const dateISO = toLocalISO(date);

    const meals = dayMeals.map((meal) => {
      const key = mealKey(day, meal);
      let sourceMeal = meal;
      let swappedReason: Meal["swappedReason"];

      if (excludedKeys.has(key) || (avoidLower.length > 0 && mealMentions(meal, avoidLower))) {
        sourceMeal = buildAlternativeMeal(meal);
        swappedReason = excludedKeys.has(key) ? "excluded" : "avoid";
      } else if (favoriteLower.length > 0) {
        const alternative = buildAlternativeMeal(meal);
        if (favoriteScore(alternative) > favoriteScore(meal)) {
          sourceMeal = alternative;
          swappedReason = "favorite";
        }
      }

      // Red de seguridad: si la alternativa también menciona un alimento a
      // evitar, esas líneas de ingredientes desaparecen del plan.
      const safeIngredients = avoidLower.length > 0
        ? sourceMeal.ingredients.filter((ingredient) => !textContainsAny(ingredient, avoidLower))
        : sourceMeal.ingredients;

      return {
        ...sourceMeal,
        swappedReason,
        calories: Math.round(sourceMeal.calories * factor),
        protein: Math.round(sourceMeal.protein * Math.min(1.18, Math.max(.88, factor))),
        ingredients: safeIngredients.map((ingredient) => scaleIngredient(ingredient, factor)),
      };
    });

    return { ...day, date: date.getDate(), dateISO, meals };
  });
}

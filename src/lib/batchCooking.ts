import type { DayPlan } from "./menu";

export type BatchCookingTip = {
  ingredient: string;
  tip: string;
  occurrences: { dayShort: string; mealType: string }[];
};

/** Ingredientes que de verdad conviene cocinar de una vez para varios días:
 *  proteínas y carbohidratos que aguantan bien en la nevera (o congelan).
 *  Deliberadamente NO incluye pescado fresco, marisco ni verdura cruda —
 *  pierden calidad de un día para otro y no son un consejo honesto. */
const BATCHABLE: { keywords: string[]; label: string; tip: string }[] = [
  { keywords: ["pollo"], label: "Pollo", tip: "Cocina todo el pollo de una vez (plancha u horno) y repártelo en raciones para estos platos." },
  { keywords: ["pavo"], label: "Pavo", tip: "El pavo se prepara igual de bien de una sola vez; guárdalo en raciones para el resto de la semana." },
  { keywords: ["ternera"], label: "Ternera", tip: "Cocina la ternera de una vez; aguanta perfectamente 2-3 días en la nevera." },
  { keywords: ["arroz"], label: "Arroz", tip: "Cuece todo el arroz junto: se conserva bien 3-4 días y ahorras tiempo cada día." },
  { keywords: ["pasta"], label: "Pasta", tip: "Cuece la pasta de una vez y guárdala aparte de la salsa para que no se pegue." },
  { keywords: ["quinoa"], label: "Quinoa", tip: "La quinoa se cocina de una vez y se conserva varios días sin perder textura." },
  { keywords: ["cuscús", "cuscus"], label: "Cuscús", tip: "El cuscús se hidrata en minutos: prepara de golpe la cantidad de toda la semana." },
  { keywords: ["lentejas"], label: "Lentejas", tip: "Cocina las lentejas de una vez; si te sobran, congelan muy bien en raciones." },
  { keywords: ["garbanzos"], label: "Garbanzos", tip: "Cocina los garbanzos de una vez; también aguantan perfectamente congelados." },
  { keywords: ["alubias"], label: "Alubias", tip: "Cocina las alubias de una vez; se conservan bien 3-4 días en la nevera." },
  { keywords: ["patata"], label: "Patata", tip: "Cuece u hornea toda la patata de golpe y resérvala para el resto de la semana." },
];

/** Detecta qué ingredientes clave se repiten en al menos 2 comidas de la
 *  semana: son los candidatos reales a cocinar por lotes. Ordenados por
 *  número de apariciones (el que más ahorra tiempo, primero). */
export function findBatchCookingTips(week: DayPlan[]): BatchCookingTip[] {
  const tips: BatchCookingTip[] = [];
  for (const batchable of BATCHABLE) {
    const occurrences: BatchCookingTip["occurrences"] = [];
    for (const day of week) {
      for (const meal of day.meals) {
        const mentioned = meal.ingredients.some((ingredient) => {
          const lower = ingredient.toLowerCase();
          return batchable.keywords.some((keyword) => lower.includes(keyword));
        });
        if (mentioned) occurrences.push({ dayShort: day.short, mealType: meal.type });
      }
    }
    if (occurrences.length >= 2) {
      tips.push({ ingredient: batchable.label, tip: batchable.tip, occurrences });
    }
  }
  return tips.sort((a, b) => b.occurrences.length - a.occurrences.length);
}

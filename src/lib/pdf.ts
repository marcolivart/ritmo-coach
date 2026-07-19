import type { GroceryItem } from "./groceries";
import type { DayPlan } from "./menu";

export type WeekPdfInput = {
  week: DayPlan[];
  groceries: GroceryItem[];
  blockedFoods: string[];
  allergies: string[];
  currentWeightKg: number;
  targetWeightKg: number;
  dailyCalories: number;
  weighingDayLabel: string;
  weekLabel: string;
};

/** Abre una ventana imprimible con el plan semanal completo (menú + compra).
 *  Devuelve false si el navegador bloqueó la ventana emergente. */
export function exportWeekPDF(input: WeekPdfInput): boolean {
  const daysHtml = input.week.map((day) => {
    const meals = day.meals.map((meal) => `
        <section class="meal">
          <h3>${meal.type}: ${meal.name}${meal.swappedReason ? " (alternativa)" : ""}</h3>
          <p>${meal.ingredients.join(" · ")}</p>
          <p class="alt"><strong>Alternativa:</strong> ${meal.alternative}</p>
        </section>`).join("");
    return `<article class="day"><h2>${day.short.toUpperCase()} ${day.date}</h2>${meals}</article>`;
  }).join("");

  const categories = Array.from(new Set(input.groceries.map((item) => item.category)));
  const groceryHtml = categories.map((category) => `
      <section class="grocery-category"><h2>${category}</h2>${input.groceries
        .filter((item) => item.category === category)
        .map((item) => `<div class="grocery"><span>□ ${item.name}</span><strong>${item.amount}</strong></div>`)
        .join("")}</section>
    `).join("");

  const avoidHtml = [
    input.blockedFoods.length ? `<strong>Alimentos excluidos:</strong> ${input.blockedFoods.join(" · ")}` : "",
    input.allergies.length ? `<strong>Alergias:</strong> ${input.allergies.join(" · ")}` : "",
  ].filter(Boolean).join("<br>");

  const printable = window.open("", "_blank", "width=900,height=1100");
  if (!printable) return false;

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
        .blocked { margin-top: 22px; background: #feecec; padding: 13px; border-radius: 10px; font-size: 11px; line-height: 1.6; }
        .print-note { color: #68736b; font-size: 10px; margin-top: 20px; }
      </style></head><body>
      <header><h1>RITMO · PLAN SEMANAL</h1><p>Tu alimentación y entrenamiento cambian contigo.</p></header>
      <div class="summary"><strong>${input.weekLabel}</strong><br><strong>Peso actual:</strong> ${input.currentWeightKg.toFixed(1)} kg · <strong>Objetivo:</strong> ${input.targetWeightKg} kg<br><strong>Plan estimado:</strong> ${input.dailyCalories} kcal/día<br><strong>Pesaje oficial:</strong> ${input.weighingDayLabel} por la mañana</div>
      ${daysHtml}
      <div class="page-break"></div>
      <h1>Lista de la compra</h1>${groceryHtml}
      ${avoidHtml ? `<div class="blocked">${avoidHtml}</div>` : ""}
      <p class="print-note">En iPhone o navegador: selecciona Imprimir → Guardar como PDF.</p>
      <script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script>
      </body></html>`);
  printable.document.close();
  return true;
}

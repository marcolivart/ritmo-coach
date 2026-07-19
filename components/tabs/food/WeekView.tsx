import { Apple, Check, ChevronRight, FileDown, Gauge, Heart, Target, Utensils, Wheat } from "lucide-react";
import Pill from "../../ui/Pill";
import { useAppData } from "../../../src/state/AppContext";
import { calculateDailyTotals } from "../../../src/lib/menu";
import { macroSplit } from "../../../src/lib/nutrition";
import { weekdayMon0 } from "../../../src/lib/dates";

const mealIcon = (type: string) => {
  if (type === "Desayuno") return <Wheat size={21} />;
  if (type === "Merienda" || type === "Media mañana") return <Apple size={21} />;
  return <Utensils size={21} />;
};

export default function WeekView() {
  const app = useAppData();
  const { personalizedWeek, selectedDay, profile, currentWeight, completions } = app;
  const selectedPlan = personalizedWeek[selectedDay];
  const totals = calculateDailyTotals(selectedPlan);
  const macros = macroSplit(totals.calories, totals.protein);
  const todayIndex = weekdayMon0();
  const regenerated = app.isDayRegenerated(selectedDay);
  const goalPillLabel = profile.goal === "lose" ? "Pérdida progresiva" : profile.goal === "gain" ? "Ganancia controlada" : "Mantenimiento";

  return (
    <>
      <div className="day-strip">
        {personalizedWeek.map((day, index) => {
          const isToday = index === todayIndex;
          return (
            <button
              key={day.short}
              className={`day-chip pressable ${selectedDay === index ? "active" : ""} ${isToday ? "today" : ""}`}
              onClick={() => app.setSelectedDay(index)}
              aria-label={`${day.short} ${day.date}${isToday ? " (hoy)" : ""}`}
              aria-pressed={selectedDay === index}
            >
              <span>{day.short}</span><strong>{day.date}</strong>
              {isToday && <i className="day-chip-dot" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="card card-green">
        <div className="weight-card-top">
          <div>
            <Pill tone="light"><Target size={13} /> {goalPillLabel}</Pill>
            <div className="card-green-kcal">{totals.calories} kcal</div>
            <div className="card-green-sub">Plan estimado para {currentWeight.toFixed(1)} kg</div>
          </div>
          <Gauge size={32} style={{ opacity: .65 }} />
        </div>
        <div className="macro-grid">
          <div className="macro"><div className="macro-value">{totals.protein} g</div><div className="macro-label">Proteína</div></div>
          <div className="macro"><div className="macro-value">{macros.carbsG} g</div><div className="macro-label">Carbohidratos</div></div>
          <div className="macro"><div className="macro-value">{macros.fatG} g</div><div className="macro-label">Grasas</div></div>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Menú del {selectedPlan.short.toLowerCase()}</h2>
        <button className="text-button pressable" onClick={() => void app.regenerateDay(selectedDay)}>
          {regenerated ? "Volver al menú base" : "Regenerar"}
        </button>
      </div>
      <div className="card">
        {selectedPlan.meals.map((meal) => {
          const done = completions.has(`${selectedPlan.dateISO}-${meal.type}`);
          return (
            <button
              className="meal-row pressable"
              key={`${selectedPlan.short}-${meal.type}`}
              onClick={() => app.setMealSheet({ meal, day: selectedPlan })}
            >
              <div className="meal-icon">{done ? <Check size={21} /> : mealIcon(meal.type)}</div>
              <div className="meal-copy">
                <div className="meal-kicker">
                  {meal.type}
                  {meal.swappedReason === "favorite" && <span className="pill pill-lime" style={{ marginLeft: 8, padding: "2px 7px" }}><Heart size={10} fill="currentColor" /> Por tus favoritos</span>}
                  {(meal.swappedReason === "excluded" || meal.swappedReason === "avoid") && <span className="pill pill-soft" style={{ marginLeft: 8, padding: "2px 7px" }}>Alternativa</span>}
                </div>
                <div className="meal-name">{meal.name}</div>
                <div className="meal-meta">{meal.calories} kcal · {meal.protein} g proteína{done ? " · hecha" : ""}</div>
              </div>
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <button className="primary-button full pressable" style={{ marginTop: 14 }} onClick={app.exportPDF}>
        <FileDown size={18} /> Descargar semana en PDF
      </button>
    </>
  );
}

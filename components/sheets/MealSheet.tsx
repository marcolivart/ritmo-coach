import { Ban, Check, Utensils } from "lucide-react";
import BottomSheet from "../ui/BottomSheet";
import Pill from "../ui/Pill";
import { useAppData } from "../../src/state/AppContext";

export default function MealSheet() {
  const app = useAppData();
  const payload = app.mealSheet;
  const close = () => app.setMealSheet(null);
  const done = payload ? app.completions.has(`${payload.day.dateISO}-${payload.meal.type}`) : false;

  return (
    <BottomSheet open={payload !== null} onClose={close} label={payload ? payload.meal.name : "Comida"}>
      {payload && (
        <>
          <Pill tone="green"><Utensils size={13} /> {payload.meal.type}</Pill>
          <h2 className="sheet-title">{payload.meal.name}</h2>
          <p className="sheet-subtitle">{payload.meal.calories} kcal · {payload.meal.protein} g de proteína · cantidades calculadas para tu objetivo.</p>
          <div className="card">
            <div className="food-category-title">Ingredientes</div>
            {payload.meal.ingredients.length === 0 && (
              <p className="empty-note">Los ingredientes de este plato contenían alimentos que has restringido; usa la alternativa o recupera el plato desde Preferencias.</p>
            )}
            {payload.meal.ingredients.map((ingredient) => (
              <div className="grocery-row" key={ingredient}>
                <div className="ingredient-dot" aria-hidden="true" />
                <div className="grocery-name">{ingredient}</div>
              </div>
            ))}
          </div>
          <div className="section-header"><h3 className="section-title">Alternativa equivalente</h3></div>
          <div className="card card-lime">
            <div className="alt-name">{payload.meal.alternative}</div>
            <div className="alt-note">Ajustada para mantener aproximadamente energía y proteína.</div>
          </div>
          <div className="sheet-actions">
            <button className="secondary-button pressable" onClick={() => { void app.excludeMeal(payload.day, payload.meal); close(); }}>
              <Ban size={17} /> No repetir
            </button>
            <button className="primary-button green pressable" onClick={() => { void app.toggleMealDone(payload.day.dateISO, payload.meal.type); close(); }}>
              <Check size={17} /> {done ? "Deshacer" : "Hecho"}
            </button>
          </div>
        </>
      )}
    </BottomSheet>
  );
}

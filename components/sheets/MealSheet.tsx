import { useEffect, useState } from "react";
import { Ban, Check, MapPin, Utensils } from "lucide-react";
import BottomSheet from "../ui/BottomSheet";
import Pill from "../ui/Pill";
import { useAppData } from "../../src/state/AppContext";
import { matchEatingOut, type MealSlot } from "../../src/lib/eatingOut";

export default function MealSheet() {
  const app = useAppData();
  const payload = app.mealSheet;
  const [eatingOut, setEatingOut] = useState(false);
  const close = () => app.setMealSheet(null);
  const done = payload ? app.completions.has(`${payload.day.dateISO}-${payload.meal.type}`) : false;

  // Al cambiar de comida, volver a la vista de ingredientes.
  useEffect(() => { setEatingOut(false); }, [payload?.meal.name, payload?.day.dateISO]);

  const options = payload ? matchEatingOut(payload.meal.type as MealSlot, payload.meal.calories, payload.meal.protein) : [];

  return (
    <BottomSheet open={payload !== null} onClose={close} label={payload ? payload.meal.name : "Comida"}>
      {payload && (
        <>
          <Pill tone="green"><Utensils size={13} /> {payload.meal.type}</Pill>
          <h2 className="sheet-title">{eatingOut ? "Si comes fuera" : payload.meal.name}</h2>
          <p className="sheet-subtitle">
            {eatingOut
              ? `Objetivo de esta comida: ~${payload.meal.calories} kcal y ${payload.meal.protein} g de proteína. Elige algo parecido y ajusta el resto del día.`
              : `${payload.meal.calories} kcal · ${payload.meal.protein} g de proteína · cantidades calculadas para tu objetivo.`}
          </p>

          {eatingOut ? (
            <>
              {options.map((option) => (
                <div className="card eatout-card" key={option.name}>
                  <div className="eatout-head">
                    <div className="eatout-name">{option.name}</div>
                    <Pill tone="soft">{option.place}</Pill>
                  </div>
                  <div className="eatout-macros">~{option.calories} kcal · {option.protein} g proteína</div>
                  <div className="eatout-tip">{option.tip}</div>
                </div>
              ))}
              <button className="secondary-button full pressable" style={{ marginTop: 14 }} onClick={() => setEatingOut(false)}>
                Volver al plato del plan
              </button>
            </>
          ) : (
            <>
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

              <button className="secondary-button full pressable eatout-trigger" onClick={() => setEatingOut(true)}>
                <MapPin size={17} /> Voy a comer fuera
              </button>

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
        </>
      )}
    </BottomSheet>
  );
}

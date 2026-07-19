import { Check, PackageCheck, ShoppingBasket } from "lucide-react";
import Pill from "../../ui/Pill";
import { useAppData } from "../../../src/state/AppContext";

export default function ShoppingView() {
  const app = useAppData();
  const { groceries } = app;
  const checkedCount = groceries.filter((item) => item.checked).length;
  const categories = Array.from(new Set(groceries.map((item) => item.category)));

  return (
    <>
      <div className="card card-dark">
        <div className="weight-card-top">
          <Pill tone="light"><ShoppingBasket size={14} /> Lista automática</Pill>
          <PackageCheck size={22} aria-hidden="true" />
        </div>
        <div className="shopping-count">{checkedCount}/{groceries.length}</div>
        <div className="shopping-sub">productos ya están en tu cesta</div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${groceries.length ? (checkedCount / groceries.length) * 100 : 0}%` }} />
        </div>
      </div>

      {groceries.length === 0 && (
        <div className="card empty-state">
          <div className="meal-name">Lista vacía</div>
          <div className="meal-meta">La lista se genera con los ingredientes de tu semana. Revisa tus preferencias si has bloqueado demasiados alimentos.</div>
        </div>
      )}

      {categories.map((category) => (
        <div key={category}>
          <div className="section-header"><h2 className="section-title">{category}</h2></div>
          <div className="card">
            {groceries.filter((item) => item.category === category).map((item) => (
              <button
                key={item.id}
                className={`grocery-row pressable ${item.checked ? "done" : ""}`}
                onClick={() => void app.toggleGrocery(item.id)}
                aria-pressed={item.checked}
              >
                <div className={`checkbox ${item.checked ? "checked" : ""}`} aria-hidden="true">{item.checked && <Check size={15} />}</div>
                <div className="grocery-main">
                  <div className="grocery-name">{item.name}</div>
                  <div className="grocery-amount">{item.amount}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

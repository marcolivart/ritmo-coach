import { useMemo, useState } from "react";
import { ChefHat, Check, ChevronDown, PackageCheck, Repeat, ShoppingBasket } from "lucide-react";
import Pill from "../../ui/Pill";
import { useAppData } from "../../../src/state/AppContext";
import { findBatchCookingTips } from "../../../src/lib/batchCooking";

export default function ShoppingView() {
  const app = useAppData();
  const { groceries, personalizedWeek } = app;
  const checkedCount = groceries.filter((item) => item.checked).length;
  const categories = Array.from(new Set(groceries.map((item) => item.category)));
  const batchTips = useMemo(() => findBatchCookingTips(personalizedWeek), [personalizedWeek]);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

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

      {batchTips.length > 0 && (
        <>
          <div className="section-header"><h2 className="section-title">Cocina de una vez</h2></div>
          <div className="card batch-card">
            <p className="batch-intro">Prepara esto el día que compres y ahorras cocinar cada día.</p>
            {batchTips.slice(0, 3).map((tip) => {
              const isOpen = expandedTip === tip.ingredient;
              return (
                <div className="batch-tip" key={tip.ingredient}>
                  <button
                    className="batch-tip-head pressable"
                    onClick={() => setExpandedTip(isOpen ? null : tip.ingredient)}
                    aria-expanded={isOpen}
                  >
                    <div className="setting-icon"><ChefHat size={20} /></div>
                    <div className="setting-copy">
                      <div className="setting-name">{tip.ingredient}</div>
                      <div className="setting-value"><Repeat size={11} /> Se repite en {tip.occurrences.length} platos</div>
                    </div>
                    <ChevronDown size={17} className={`batch-chevron ${isOpen ? "open" : ""}`} aria-hidden="true" />
                  </button>
                  {isOpen && (
                    <div className="batch-tip-body">
                      <p className="batch-tip-text">{tip.tip}</p>
                      <div className="tag-list">
                        {tip.occurrences.map((occ, index) => (
                          <span className="pill pill-soft" key={`${occ.dayShort}-${occ.mealType}-${index}`}>
                            {occ.dayShort} · {occ.mealType}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
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

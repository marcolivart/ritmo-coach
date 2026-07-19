import { useEffect, useState } from "react";
import { CalendarDays, Check, Sparkles } from "lucide-react";
import BottomSheet from "../ui/BottomSheet";
import Pill from "../ui/Pill";
import { useAppData } from "../../src/state/AppContext";
import { formatWeighingDay } from "../../src/lib/nutrition";

export default function WeightSheet() {
  const app = useAppData();
  const { weightSheetOpen, currentWeight, profile } = app;
  const [value, setValue] = useState(String(currentWeight));

  useEffect(() => {
    if (weightSheetOpen) setValue(String(currentWeight));
  }, [weightSheetOpen, currentWeight]);

  return (
    <BottomSheet open={weightSheetOpen} onClose={() => app.setWeightSheetOpen(false)} label="Registrar peso">
      <Pill tone="green"><CalendarDays size={13} /> Pesaje oficial · {formatWeighingDay(profile.weighing_day).toLowerCase()}</Pill>
      <h2 className="sheet-title">¿Cuánto pesas hoy?</h2>
      <p className="sheet-subtitle">Intenta pesarte al levantarte, antes de desayunar y en condiciones parecidas cada semana.</p>
      <div className="weight-input-wrap">
        <input
          className="weight-input"
          value={value}
          inputMode="decimal"
          onChange={(event) => setValue(event.target.value)}
          aria-label="Peso en kilogramos"
        />
        <span className="weight-unit">kg</span>
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="meal-row">
          <div className="meal-icon"><Sparkles size={20} /></div>
          <div className="meal-copy">
            <div className="meal-name">La app ajustará tu semana</div>
            <div className="meal-meta">Usará la tendencia, no reaccionará de forma brusca a un solo dato.</div>
          </div>
        </div>
      </div>
      <button className="primary-button green full pressable" onClick={() => void app.saveWeight(value)}>
        <Check size={18} /> Guardar y adaptar mi plan
      </button>
    </BottomSheet>
  );
}

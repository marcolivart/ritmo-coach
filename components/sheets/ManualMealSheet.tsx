import { useEffect, useState } from "react";
import { Check, PencilLine } from "lucide-react";
import BottomSheet from "../ui/BottomSheet";
import Pill from "../ui/Pill";
import { useAppData } from "../../src/state/AppContext";

const EMPTY = { name: "", calories: "", protein: "", carbs: "", fat: "" };

/** Registro manual de una comida fuera del catálogo (congelados, comida fuera
 *  de casa…). El usuario introduce nombre + los 4 macros a mano; la entrada
 *  suma a los totales del día seleccionado. Sin inventario ni escaneo. */
export default function ManualMealSheet() {
  const app = useAppData();
  const payload = app.manualMealSheet;
  const [draft, setDraft] = useState(EMPTY);
  const close = () => app.setManualMealSheet(null);

  // Al abrir para un día nuevo, empezar en blanco.
  useEffect(() => { if (payload) setDraft(EMPTY); }, [payload?.dateISO]);

  const patch = (partial: Partial<typeof EMPTY>) => setDraft((prev) => ({ ...prev, ...partial }));
  const num = (raw: string) => Number(raw.replace(",", ".")) || 0;

  const save = async () => {
    if (!payload) return;
    const ok = await app.addManualEntry(payload.dateISO, {
      name: draft.name,
      calories: num(draft.calories),
      protein: num(draft.protein),
      carbs: num(draft.carbs),
      fat: num(draft.fat),
    });
    if (ok) close();
  };

  return (
    <BottomSheet open={payload !== null} onClose={close} label="Añadir comida manual">
      {payload && (
        <>
          <Pill tone="green"><PencilLine size={13} /> Entrada manual · {payload.dayLabel}</Pill>
          <h2 className="sheet-title">Registrar una comida</h2>
          <p className="sheet-subtitle">Para algo que no está en tu menú (un congelado, comer fuera…). Introduce sus macros y sumará a los totales del día.</p>

          <label className="auth-field" style={{ marginTop: 6 }}>
            <span>Nombre</span>
            <div><input value={draft.name} placeholder="Pizza congelada, menú del bar…" onChange={(event) => patch({ name: event.target.value })} /></div>
          </label>

          <div className="form-grid two">
            <label className="auth-field"><span>Calorías (kcal)</span><div><input inputMode="numeric" value={draft.calories} placeholder="0" onChange={(event) => patch({ calories: event.target.value })} /></div></label>
            <label className="auth-field"><span>Proteína (g)</span><div><input inputMode="numeric" value={draft.protein} placeholder="0" onChange={(event) => patch({ protein: event.target.value })} /></div></label>
            <label className="auth-field"><span>Carbohidratos (g)</span><div><input inputMode="numeric" value={draft.carbs} placeholder="0" onChange={(event) => patch({ carbs: event.target.value })} /></div></label>
            <label className="auth-field"><span>Grasas (g)</span><div><input inputMode="numeric" value={draft.fat} placeholder="0" onChange={(event) => patch({ fat: event.target.value })} /></div></label>
          </div>

          <button className="primary-button green full pressable" onClick={() => void save()}>
            <Check size={18} /> Añadir al día
          </button>
        </>
      )}
    </BottomSheet>
  );
}

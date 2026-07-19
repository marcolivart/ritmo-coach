import { useEffect, useState } from "react";
import { Check, Clock3 } from "lucide-react";
import BottomSheet from "../ui/BottomSheet";
import Pill from "../ui/Pill";
import { useAppData } from "../../src/state/AppContext";
import { DEFAULT_SCHEDULE, type Schedule } from "../../src/types";

const SCHEDULE_KEYS = Object.keys(DEFAULT_SCHEDULE);

/** Horarios habituales de comidas y entreno. Alimentan la "próxima comida"
 *  de Hoy y el aviso de entreno pendiente del coach. */
export default function ScheduleSheet() {
  const app = useAppData();
  const { scheduleSheetOpen, schedule } = app;
  const [draft, setDraft] = useState<Schedule>({ ...DEFAULT_SCHEDULE, ...schedule });

  useEffect(() => {
    if (scheduleSheetOpen) setDraft({ ...DEFAULT_SCHEDULE, ...schedule });
  }, [scheduleSheetOpen, schedule]);

  const save = async () => {
    const ok = await app.saveProfilePatch({ schedule: draft });
    if (ok) {
      app.setScheduleSheetOpen(false);
      app.showToast("Horarios guardados");
    }
  };

  return (
    <BottomSheet open={scheduleSheetOpen} onClose={() => app.setScheduleSheetOpen(false)} label="Horarios habituales">
      <Pill tone="green"><Clock3 size={13} /> Tu rutina diaria</Pill>
      <h2 className="sheet-title">Horarios habituales</h2>
      <p className="sheet-subtitle">Con esto la pantalla Hoy sabe cuál es tu próxima comida y cuándo recordarte el entreno.</p>

      <div className="form-grid two">
        {SCHEDULE_KEYS.map((key) => (
          <label className="auth-field" key={key}>
            <span>{key}</span>
            <div>
              <input
                type="time"
                value={draft[key] ?? DEFAULT_SCHEDULE[key]}
                onChange={(event) => setDraft((prev) => ({ ...prev, [key]: event.target.value }))}
              />
            </div>
          </label>
        ))}
      </div>

      <button className="primary-button green full pressable" onClick={() => void save()}>
        <Check size={18} /> Guardar horarios
      </button>
    </BottomSheet>
  );
}

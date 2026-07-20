import { Droplets, Minus, Moon, Plus } from "lucide-react";
import { useAppData } from "../../../src/state/AppContext";

function formatLiters(ml: number): string {
  return (ml / 1000).toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

/** Bienestar (agua/sueño): motivación ligera y secundaria — deliberadamente
 *  pequeña para no competir visualmente con la comida ni el entreno. Sin
 *  pasos: no hay API fiable de podómetro en un PWA sin sensores nativos, y
 *  esta app no inventa datos que no puede medir de verdad. */
export default function WellnessRow() {
  const app = useAppData();
  const { wellnessToday, hydrationTargetMl, adjustWater, adjustSleepHours } = app;
  const waterPercent = Math.min(100, Math.round((wellnessToday.water_ml / hydrationTargetMl) * 100));

  return (
    <div className="card wellness-card">
      <div className="wellness-item">
        <div className="wellness-label"><Droplets size={15} /> Agua</div>
        <div className="wellness-actions">
          <button
            className="wellness-step-btn pressable"
            onClick={() => adjustWater(-1)}
            disabled={wellnessToday.water_ml <= 0}
            aria-label="Quitar un vaso de agua"
          >
            <Minus size={14} />
          </button>
          <span className="wellness-value">{formatLiters(wellnessToday.water_ml)} / {formatLiters(hydrationTargetMl)} L</span>
          <button className="wellness-step-btn pressable accent" onClick={() => adjustWater(1)} aria-label="Añadir un vaso de agua">
            <Plus size={14} />
          </button>
        </div>
      </div>
      <div className="stat-progress-track">
        <div className="stat-progress-fill" style={{ width: `${waterPercent}%` }} />
      </div>

      <div className="wellness-item wellness-sleep">
        <div className="wellness-label"><Moon size={15} /> Sueño</div>
        <div className="wellness-actions">
          <button className="wellness-step-btn pressable" onClick={() => adjustSleepHours(-0.5)} aria-label="Restar media hora de sueño">
            <Minus size={14} />
          </button>
          <span className="wellness-value">
            {wellnessToday.sleep_hours === null ? "Sin registrar" : `${wellnessToday.sleep_hours.toLocaleString("es-ES")} h anoche`}
          </span>
          <button className="wellness-step-btn pressable accent" onClick={() => adjustSleepHours(0.5)} aria-label="Sumar media hora de sueño">
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

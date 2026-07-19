import { FileDown } from "lucide-react";
import SegmentedControl from "../ui/SegmentedControl";
import Skeleton from "../ui/Skeleton";
import WeekView from "./food/WeekView";
import ShoppingView from "./food/ShoppingView";
import PreferencesView from "./food/PreferencesView";
import { useAppData } from "../../src/state/AppContext";
import { weekRangeLabel } from "../../src/lib/dates";
import type { FoodView } from "../../src/state/useAppState";

const VIEW_OPTIONS: { value: FoodView; label: string }[] = [
  { value: "week", label: "Mi semana" },
  { value: "shopping", label: "Compra" },
  { value: "preferences", label: "Preferencias" },
];

export default function FoodTab() {
  const app = useAppData();

  return (
    <>
      <div className="page-header">
        <div>
          <div className="meal-kicker">{weekRangeLabel()}</div>
          <h1 className="page-title">Comida</h1>
        </div>
        <button className="icon-button pressable" onClick={app.exportPDF} aria-label="Descargar plan semanal en PDF">
          <FileDown size={21} />
        </button>
      </div>

      <SegmentedControl options={VIEW_OPTIONS} value={app.foodView} onChange={app.setFoodView} label="Vista de comida" />

      {app.initialLoading ? (
        <>
          <Skeleton variant="card" />
          <Skeleton variant="row" />
          <Skeleton variant="row" />
          <Skeleton variant="row" />
        </>
      ) : (
        <>
          {app.foodView === "week" && <WeekView />}
          {app.foodView === "shopping" && <ShoppingView />}
          {app.foodView === "preferences" && <PreferencesView />}
        </>
      )}
    </>
  );
}

import { Trash2 } from "lucide-react";
import BottomSheet from "../ui/BottomSheet";
import Pill from "../ui/Pill";
import { useAppData } from "../../src/state/AppContext";

export default function ResetSheet() {
  const app = useAppData();
  const { resetSheetOpen, resetting } = app;

  return (
    <BottomSheet
      open={resetSheetOpen}
      onClose={() => app.setResetSheetOpen(false)}
      label="Confirmar reinicio de datos"
      dismissible={!resetting}
    >
      <Pill tone="danger"><Trash2 size={13} /> Acción irreversible</Pill>
      <h2 className="sheet-title">¿Reiniciar todos tus datos?</h2>
      <p className="sheet-subtitle">
        Se borrará tu historial de peso, tus series de entreno guardadas, tus preferencias de comida y tu lista de la compra.
        Tu perfil volverá a los valores por defecto y tendrás que volver a hacer el asistente de configuración. No hay vuelta atrás.
      </p>
      <button className="danger-button full pressable" disabled={resetting} onClick={() => void app.handleResetData()}>
        {resetting ? "Borrando…" : "Sí, borrar todo"}
      </button>
      <button className="secondary-button full pressable" style={{ marginTop: 10 }} disabled={resetting} onClick={() => app.setResetSheetOpen(false)}>
        Cancelar
      </button>
    </BottomSheet>
  );
}

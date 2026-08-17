import { Ban, Bell, BellOff, CalendarDays, Check, ChevronRight, Clock3, Cloud, Dumbbell, FileDown, LogOut, Scale, Settings2, Target, Trash2 } from "lucide-react";
import SettingRow from "../ui/SettingRow";
import { useAppData } from "../../src/state/AppContext";
import { formatWeighingDay } from "../../src/lib/nutrition";
import type { PushEnv } from "../../src/lib/push";

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "sedentaria", light: "ligera", moderate: "moderada", high: "alta",
};

const PUSH_TEXT: Record<PushEnv | "loading", string> = {
  loading: "Comprobando…",
  unsupported: "No disponible en este navegador",
  "needs-install": "Instala la app en tu pantalla de inicio primero",
  denied: "Permiso bloqueado en los ajustes del navegador",
  ready: "Aviso del pesaje semanal, a las 9:00",
  subscribed: "Activados · pesaje semanal, 9:00",
};

export default function ProfileTab() {
  const app = useAppData();
  const { profile, currentWeight, blockedFoods, allergies, schedule, syncing, userId, onLogout } = app;
  const chevron = <ChevronRight size={17} aria-hidden="true" />;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="meal-kicker">Tu configuración</div>
          <h1 className="page-title">Perfil</h1>
        </div>
        <button className="icon-button pressable" onClick={() => app.setProfileSheetOpen(true)} aria-label="Editar perfil">
          <Settings2 size={21} />
        </button>
      </div>

      <div className="card card-green profile-hero">
        <div className="avatar profile-avatar" aria-hidden="true">{profile.name.slice(0, 1).toUpperCase()}</div>
        <div>
          <div className="profile-name">{profile.name}</div>
          <div className="profile-goal">Objetivo: {profile.goal === "lose" ? "perder peso" : profile.goal === "gain" ? "ganar músculo" : "mantener el peso"}</div>
        </div>
      </div>

      <div className="section-header"><h2 className="section-title">Datos del plan</h2></div>
      <div className="card">
        <SettingRow icon={<Scale size={20} />} name="Peso y objetivo" value={`${currentWeight.toFixed(1)} kg → ${profile.target_weight_kg} kg`} trailing={chevron} onClick={() => app.setProfileSheetOpen(true)} />
        <SettingRow icon={<Target size={20} />} name="Altura y actividad" value={`${profile.height_cm} cm · actividad ${ACTIVITY_LABELS[profile.activity_level] ?? profile.activity_level}`} trailing={chevron} onClick={() => app.setProfileSheetOpen(true)} />
        <SettingRow icon={<CalendarDays size={20} />} name="Día de pesaje" value={`${formatWeighingDay(profile.weighing_day)} por la mañana`} trailing={chevron} onClick={() => app.setProfileSheetOpen(true)} />
      </div>

      <div className="section-header"><h2 className="section-title">Preferencias</h2></div>
      <div className="card">
        <SettingRow
          icon={<Ban size={20} />}
          name="Alimentos bloqueados"
          value={`${blockedFoods.length} bloqueados · ${allergies.length} alergias`}
          trailing={chevron}
          onClick={() => app.goToFood("preferences")}
        />
        <SettingRow
          icon={<Dumbbell size={20} />}
          name="Tipo de ejercicio"
          value={`${profile.exercise_types.join(" + ")} · ${profile.training_days} días`}
          trailing={chevron}
          onClick={() => app.setProfileSheetOpen(true)}
        />
        <SettingRow
          icon={<Clock3 size={20} />}
          name="Horarios habituales"
          value={`Comida ${schedule["Comida"] ?? "13:30"} · Entreno ${schedule["Entreno"] ?? "19:00"}`}
          trailing={chevron}
          onClick={() => app.setScheduleSheetOpen(true)}
        />
      </div>

      <div className="section-header"><h2 className="section-title">Tu sistema</h2></div>
      <div className="card">
        <SettingRow
          icon={<FileDown size={20} />}
          name="Plan semanal en PDF"
          value="Menús, alternativas y compra"
          trailing={<span className="text-button">Generar</span>}
          onClick={app.exportPDF}
        />
        {userId && (() => {
          const env = app.pushEnv;
          const canToggle = (env === "ready" || env === "subscribed") && !app.pushBusy;
          const action = env === "subscribed" ? "Desactivar" : env === "ready" ? "Activar" : null;
          return (
            <SettingRow
              icon={env === "subscribed" ? <Bell size={20} /> : <BellOff size={20} />}
              name="Recordatorios"
              value={PUSH_TEXT[env]}
              trailing={action ? <span className="text-button">{app.pushBusy ? "…" : action}</span> : undefined}
              onClick={canToggle ? () => void app.togglePushReminders() : undefined}
            />
          );
        })()}
        {userId && (
          <SettingRow
            icon={<Cloud size={20} />}
            name="Sincronización"
            value={syncing ? "Guardando cambios…" : "Datos sincronizados con Supabase"}
            trailing={<Check size={18} color="var(--green)" aria-hidden="true" />}
          />
        )}
        {onLogout && (
          <button className="logout-button pressable" onClick={() => void onLogout()}>
            <LogOut size={18} /> Cerrar sesión
          </button>
        )}
      </div>

      <div className="section-header"><h2 className="section-title">Zona de peligro</h2></div>
      <div className="card danger-card">
        <SettingRow
          icon={<Trash2 size={20} />}
          danger
          name="Reiniciar todos mis datos"
          value="Borra peso, entrenos, preferencias y compra. Vuelves al asistente de configuración."
          trailing={<span className="danger-button">Reiniciar</span>}
          onClick={() => app.setResetSheetOpen(true)}
        />
      </div>
    </>
  );
}

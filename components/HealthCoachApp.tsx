import AppLayout from "./layout/AppLayout";
import Toast from "./ui/Toast";
import TodayTab from "./tabs/TodayTab";
import FoodTab from "./tabs/FoodTab";
import TrainingTab from "./tabs/TrainingTab";
import ProgressTab from "./tabs/ProgressTab";
import ProfileTab from "./tabs/ProfileTab";
import WeightSheet from "./sheets/WeightSheet";
import MealSheet from "./sheets/MealSheet";
import ProfileSheet from "./sheets/ProfileSheet";
import ScheduleSheet from "./sheets/ScheduleSheet";
import WorkoutOptionsSheet from "./sheets/WorkoutOptionsSheet";
import ResetSheet from "./sheets/ResetSheet";
import { AppDataProvider, useAppData } from "../src/state/AppContext";
import { useAppState } from "../src/state/useAppState";
import type { Profile } from "../src/types";
import type { Tab } from "../src/lib/routes";

type HealthCoachAppProps = {
  userId?: string;
  profile?: Profile | null;
  demoMode?: boolean;
  onProfileChange?: (profile: Profile) => void;
  onLogout?: () => void | Promise<void>;
};

const TAB_TITLES: Record<Tab, string> = {
  today: "Hoy",
  food: "Comida",
  training: "Entreno",
  progress: "Progreso",
  profile: "Perfil",
};

/** Los sheets viven SIEMPRE en el prop `overlay` de AppLayout: fuera del
 *  contenedor con la animación de slide, para que su position:absolute no
 *  quede atrapado por el transform. */
function AppOverlays() {
  const app = useAppData();
  return (
    <>
      <WeightSheet />
      <MealSheet />
      <ProfileSheet />
      <ScheduleSheet />
      <WorkoutOptionsSheet />
      <ResetSheet />
      <Toast message={app.toast} />
    </>
  );
}

function AppShell() {
  const app = useAppData();
  return (
    <AppLayout
      title={TAB_TITLES[app.tab]}
      tab={app.tab}
      onTabChange={app.handleTabChange}
      avatarInitial={app.profile.name.slice(0, 1).toUpperCase()}
      syncing={app.syncing}
      overlay={<AppOverlays />}
    >
      {app.tab === "today" && <TodayTab />}
      {app.tab === "food" && <FoodTab />}
      {app.tab === "training" && <TrainingTab />}
      {app.tab === "progress" && <ProgressTab />}
      {app.tab === "profile" && <ProfileTab />}
    </AppLayout>
  );
}

export default function HealthCoachApp({ userId, profile, onProfileChange, onLogout }: HealthCoachAppProps) {
  const app = useAppState({ userId, profile, onProfileChange, onLogout });
  return (
    <AppDataProvider value={app}>
      <AppShell />
    </AppDataProvider>
  );
}

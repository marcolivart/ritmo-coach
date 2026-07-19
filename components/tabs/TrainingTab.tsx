import WorkoutOverview from "./training/WorkoutOverview";
import ExerciseGuide from "./training/ExerciseGuide";
import CardioGuide from "./training/CardioGuide";
import { useAppData } from "../../src/state/AppContext";
import { isCardioWorkout } from "../../src/lib/workouts";

export default function TrainingTab() {
  const app = useAppData();
  if (app.trainingView === "guide") {
    return isCardioWorkout(app.activeWorkout) ? <CardioGuide /> : <ExerciseGuide />;
  }
  return <WorkoutOverview />;
}

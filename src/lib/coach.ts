import type { Goal } from "../types";

/** Motor del coach por reglas. Determinista y sin backend: el mensaje se
 *  calcula con los datos reales del usuario y es estable durante el día
 *  (la variante se elige con un hash de fecha + usuario + regla). */

export type CoachInput = {
  todayISO: string;
  weekdayMon0: number;
  userSeed: string;
  goal: Goal;
  userName: string;
  kgToGoal: number;
  weeklyDeltaKg: number | null;
  weighInStreak: number;
  isWeighDayToday: boolean;
  weightDue: boolean;
  workoutDaysThisWeek: number;
  trainingDaysTarget: number;
  strengthTrendPct: number | null;
  todayWorkoutName: string | null;
  todayIsRestDay: boolean;
  setsCompletedToday: number;
  todayTotalSets: number;
  mealsDoneToday: number;
  mealsPlannedToday: number;
  /** % de comidas de la semana (Lun→hoy) marcadas como hechas, o null sin datos. */
  weeklyFoodAdherencePercent: number | null;
  /** Horas de sueño registradas anoche, o null si no se ha registrado hoy. */
  sleepHoursLastNight: number | null;
  hourOfDay: number;
  targetCalories: number;
};

export type CoachTone = "praise" | "push" | "warn" | "info";
export type CoachMessage = { title: string; text: string; tone: CoachTone };

type Variant = { title: string; text: string };
type Rule = {
  id: string;
  priority: number;
  tone: CoachTone;
  when: (i: CoachInput) => boolean;
  variants: (i: CoachInput) => Variant[];
};

/** Hash FNV-1a de 32 bits — estable, suficiente para elegir variante. */
function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

const delta = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)} kg`;

const RULES: Rule[] = [
  {
    id: "goal-reached",
    priority: 100,
    tone: "praise",
    when: (i) => i.kgToGoal < 0.5 && i.goal !== "maintain",
    variants: () => [
      { title: "Objetivo alcanzado", text: "Estás en tu peso objetivo. Ahora la meta cambia: consolidarlo. Mantén el plan un par de semanas antes de plantearte nada nuevo." },
      { title: "Lo has conseguido", text: "Has llegado al peso que te propusiste. La fase importante empieza ahora: sostenerlo sin obsesionarte con la báscula." },
    ],
  },
  {
    id: "losing-too-fast",
    priority: 90,
    tone: "warn",
    when: (i) => i.goal === "lose" && i.weeklyDeltaKg !== null && i.weeklyDeltaKg < -1.2,
    variants: (i) => [
      { title: "Vas demasiado rápido", text: `${delta(i.weeklyDeltaKg!)} esta semana es más de lo recomendable. No recortes más: prioriza la proteína y duerme bien, o perderás músculo.` },
      { title: "Frena un poco", text: `Bajar ${Math.abs(i.weeklyDeltaKg!).toFixed(1)} kg en una semana es excesivo. Come las cantidades del plan completas; el objetivo es perder grasa, no fuerza.` },
    ],
  },
  {
    id: "weigh-day-today",
    priority: 85,
    tone: "push",
    when: (i) => i.isWeighDayToday && i.weightDue,
    variants: () => [
      { title: "Hoy toca pesaje", text: "Pésate al levantarte, antes de desayunar. Un dato a la semana en las mismas condiciones vale más que siete desordenados." },
      { title: "Día de báscula", text: "Es tu día de pesaje. Regístralo y la app ajustará las cantidades de la semana con la tendencia, no con un solo dato." },
    ],
  },
  {
    id: "weight-up-lose",
    priority: 75,
    tone: "info",
    when: (i) => i.goal === "lose" && i.weeklyDeltaKg !== null && i.weeklyDeltaKg > 0.3,
    variants: (i) => [
      { title: "La báscula sube, calma", text: `${delta(i.weeklyDeltaKg!)} esta semana. Un dato aislado no es tendencia: agua, sal y descanso pesan. Esta semana, entrenos completos y plan sin extras.` },
      { title: "Semana de más, no de menos", text: `Has subido ${i.weeklyDeltaKg!.toFixed(1)} kg respecto a hace 7 días. No recortes por tu cuenta: cumple el plan tal cual y deja que la tendencia hable.` },
    ],
  },
  {
    id: "food-adherence-slipping",
    priority: 72,
    tone: "push",
    // Solo a partir de mitad de semana: antes no hay muestra suficiente para hablar de "esta semana".
    when: (i) => i.weeklyFoodAdherencePercent !== null && i.weeklyFoodAdherencePercent < 50 && i.weekdayMon0 >= 3,
    variants: (i) => [
      { title: "La comida se está quedando atrás", text: `Solo ${i.weeklyFoodAdherencePercent}% de las comidas de esta semana marcadas. No pasa nada por un par de días sueltos: retoma desde la próxima comida, no desde el lunes que viene.` },
      { title: "Recupera el plan de comida", text: `Vas al ${i.weeklyFoodAdherencePercent}% esta semana. El plan funciona si lo sigues, no si es perfecto: marca la próxima comida y sigue desde ahí.` },
    ],
  },
  {
    id: "workout-done-today",
    priority: 70,
    tone: "praise",
    when: (i) => i.todayTotalSets > 0 && i.setsCompletedToday >= i.todayTotalSets,
    variants: () => [
      { title: "Entreno completado", text: "Todas las series de hoy registradas. Lo que toca ahora es simple: comer lo planificado y descansar. El músculo se construye fuera del gimnasio." },
      { title: "Trabajo hecho", text: "Sesión de hoy terminada y guardada. La constancia que estás registrando es exactamente lo que mueve la tendencia." },
    ],
  },
  {
    id: "food-adherence-strong",
    priority: 68,
    tone: "praise",
    when: (i) => i.weeklyFoodAdherencePercent !== null && i.weeklyFoodAdherencePercent >= 85 && i.weekdayMon0 >= 2,
    variants: (i) => [
      { title: "Semana de comida sólida", text: `${i.weeklyFoodAdherencePercent}% de tus comidas marcadas esta semana. Esto es lo que realmente mueve la báscula, más que cualquier entreno suelto.` },
      { title: "Constancia con la comida", text: `Llevas el ${i.weeklyFoodAdherencePercent}% del plan de comida cumplido esta semana. Sigue así: la dieta medida solo funciona si se sigue, y la estás siguiendo.` },
    ],
  },
  {
    id: "adherence-complete",
    priority: 65,
    tone: "praise",
    when: (i) => i.trainingDaysTarget > 0 && i.workoutDaysThisWeek >= i.trainingDaysTarget,
    variants: (i) => [
      { title: "Semana completa", text: `${i.workoutDaysThisWeek}/${i.trainingDaysTarget} días de entreno cumplidos. Si te apetece más, mejor un paseo que otra sesión: recuperar también es entrenar.` },
      { title: "Objetivo semanal cumplido", text: "Ya has entrenado todos los días que te propusiste esta semana. Protege el descanso: ahí se consolida lo que has trabajado." },
    ],
  },
  {
    id: "workout-pending-evening",
    priority: 60,
    tone: "push",
    when: (i) => !i.todayIsRestDay && i.todayWorkoutName !== null && i.setsCompletedToday === 0 && i.hourOfDay >= 17,
    variants: (i) => [
      { title: `${i.todayWorkoutName} sigue pendiente`, text: "Aún estás a tiempo. Una sesión corta y registrada vale infinitamente más que una perfecta que no ocurre." },
      { title: "Hoy tocaba moverse", text: `Tienes ${i.todayWorkoutName} planificado y no hay series registradas. Baja la exigencia si hace falta, pero no lo dejes a cero.` },
    ],
  },
  {
    id: "good-pace",
    priority: 55,
    tone: "praise",
    when: (i) => i.goal === "lose" && i.weeklyDeltaKg !== null && i.weeklyDeltaKg <= -0.2 && i.weeklyDeltaKg >= -1.0,
    variants: (i) => [
      { title: "Esta semana no tocamos cantidades", text: `${delta(i.weeklyDeltaKg!)} en 7 días: ritmo sostenible. Mantén el plan tal cual${i.strengthTrendPct !== null && i.strengthTrendPct > 0 ? " y busca una repetición más en tus básicos" : ""}.` },
      { title: "Ritmo perfecto", text: `Estás bajando ${Math.abs(i.weeklyDeltaKg!).toFixed(1)} kg por semana, justo donde queremos: pierdes grasa sin regalar músculo. No cambies nada.` },
    ],
  },
  {
    id: "strength-up",
    priority: 50,
    tone: "praise",
    when: (i) => i.strengthTrendPct !== null && i.strengthTrendPct >= 3,
    variants: (i) => [
      { title: `Fuerza +${i.strengthTrendPct}%`, text: "Tu fuerza estimada sube comparando tus series recientes con las primeras. Sigue apuntando cada serie: es tu mejor termómetro de progreso." },
      { title: "Más fuerte que hace unas semanas", text: `Un ${i.strengthTrendPct}% más de fuerza estimada. Si algún peso se te queda cómodo en todas las series, sube el siguiente escalón.` },
    ],
  },
  {
    id: "streak-milestone",
    priority: 45,
    tone: "praise",
    when: (i) => [4, 8, 12, 26, 52].includes(i.weighInStreak),
    variants: (i) => [
      { title: `${i.weighInStreak} semanas de racha`, text: "Llevas pesándote cada semana sin fallar. Ese hábito silencioso es el que hace que todo lo demás funcione." },
      { title: "Racha intacta", text: `${i.weighInStreak} semanas seguidas con pesaje. Los datos consistentes son los que permiten ajustar tu plan con criterio.` },
    ],
  },
  {
    id: "low-sleep",
    priority: 42,
    tone: "info",
    when: (i) => i.sleepHoursLastNight !== null && i.sleepHoursLastNight < 6,
    variants: (i) => [
      { title: "Poco descanso anoche", text: `${i.sleepHoursLastNight!.toFixed(1)} h de sueño. Hoy el cuerpo pide menos exigencia: prioriza la proteína y no fuerces el entreno si no toca.` },
      { title: "Dormiste poco", text: "Con menos de 6 horas de sueño el hambre y las ganas de moverte bajan igual. No es fuerza de voluntad, es fisiología: hoy cuida el descanso más que el resto." },
    ],
  },
  {
    id: "monday-plan",
    priority: 40,
    tone: "info",
    when: (i) => i.weekdayMon0 === 0,
    variants: (i) => [
      { title: "Semana nueva, plan claro", text: `Revisa la lista de la compra y deja el primer entreno hecho. Un lunes bien resuelto arrastra a los otros seis días.` },
      { title: "Lunes: se decide ahora", text: `Tu semana está planificada: ${i.targetCalories.toLocaleString("es-ES")} kcal al día y ${i.trainingDaysTarget} entrenos. Hoy solo hay que empezar.` },
    ],
  },
  {
    id: "weekend-social",
    priority: 35,
    tone: "info",
    when: (i) => i.weekdayMon0 === 5,
    variants: () => [
      { title: "Sábado con plan", text: "Tu cena de hoy está pensada para poder salir: proteína + una ración de carbohidrato + agua o bebida zero. Disfruta sin descarrilar." },
      { title: "Social y medido", text: "Si comes fuera hoy, aplica la regla de la cena social: un plato proteico, una guarnición y sin picar del centro. El plan sigue en pie." },
    ],
  },
  {
    id: "meals-on-track",
    priority: 30,
    tone: "praise",
    when: (i) => i.mealsPlannedToday > 0 && i.mealsDoneToday >= Math.min(2, i.mealsPlannedToday) && i.mealsDoneToday >= i.mealsPlannedToday * 0.5,
    variants: (i) => [
      { title: "Día encarrilado", text: `${i.mealsDoneToday} de ${i.mealsPlannedToday} comidas marcadas. Cierra las que faltan tal y como están planificadas y hoy queda redondo.` },
      { title: "Vas cumpliendo", text: "Las comidas marcadas de hoy van según el plan. La adherencia diaria, no la perfección, es lo que mueve la báscula." },
    ],
  },
  {
    id: "fallback",
    priority: 0,
    tone: "info",
    when: () => true,
    variants: (i) => [
      { title: "El plan ya está pensado", text: `Hoy no hay que decidir nada: ${i.targetCalories.toLocaleString("es-ES")} kcal repartidas en tus comidas${i.todayWorkoutName && !i.todayIsRestDay ? ` y ${i.todayWorkoutName} como entreno` : ""}. Solo ejecutar.` },
      { title: "Un día más en la buena dirección", text: "No hace falta motivación todos los días; hace falta que hoy sea razonablemente parecido al plan. Con eso, la tendencia hace el resto." },
      { title: "Constancia sobre intensidad", text: "Semana a semana, la app aprende de tu peso, tus series y tu adherencia. Dale datos: registra lo que hagas hoy." },
      { title: i.todayIsRestDay ? "Día de descanso" : "Hoy también cuenta", text: i.todayIsRestDay ? "Hoy no hay entreno programado. Camina, hidrátate y respeta tus comidas: recuperar es parte del plan." : "Registra tu entreno y marca tus comidas: los días normales bien ejecutados son los que suman." },
    ],
  },
];

export function coachMessage(input: CoachInput): CoachMessage {
  const applicable = RULES.filter((rule) => rule.when(input)).sort((a, b) => b.priority - a.priority);
  const rule = applicable[0];
  const variants = rule.variants(input);
  const index = fnv1a(`${input.todayISO}|${input.userSeed}|${rule.id}`) % variants.length;
  const variant = variants[index];
  return { title: variant.title, text: variant.text, tone: rule.tone };
}

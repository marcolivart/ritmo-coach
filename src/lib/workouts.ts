export type WorkoutExercise = {
  name: string;
  detail: string;
  muscle: string;
  previous: string;
  initialKg: string;
  target: string;
  rest: string;
  videoUrl: string;
  videoSource: string;
  videoAuthor: string;
  videoLicense: string;
  technique: string[];
  mistakes: { title: string; detail: string }[];
  alternative: string;
};

export type Workout = {
  id: string;
  name: string;
  summary: string;
  exercises: WorkoutExercise[];
};

export const workouts: Workout[] = [
  {
    id: "torso-a",
    name: "Torso A",
    summary: "Construye fuerza. Sin improvisar.",
    exercises: [
      {
        name: "Press de pecho en máquina", detail: "3 series · 8–12 rep", muscle: "Pecho", previous: "25 kg", initialKg: "25", target: "3 × 8–12 repeticiones", rest: "90 s",
        videoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/70/Muscle_Strengthening_at_the_Gym_-_Chest_Press.webm",
        videoSource: "https://commons.wikimedia.org/wiki/File:Muscle_Strengthening_at_the_Gym_-_Chest_Press.webm", videoAuthor: "Centers for Disease Control and Prevention", videoLicense: "Dominio público",
        technique: ["Ajusta el asiento para que las asas queden a la altura media del pecho.", "Mantén la espalda completamente apoyada y los hombros bajos.", "Empuja de forma controlada sin bloquear los codos.", "Regresa lentamente hasta notar el estiramiento del pecho."],
        mistakes: [{ title: "Separar la espalda del respaldo", detail: "Reduce el peso antes de compensar con el cuerpo." }, { title: "Mover el peso demasiado rápido", detail: "Controla la vuelta durante unos dos segundos." }],
        alternative: "Flexiones con lastre",
      },
      {
        name: "Remo inclinado con barra", detail: "3 series · 8–12 rep", muscle: "Espalda", previous: "30 kg", initialKg: "30", target: "3 × 8–12 repeticiones", rest: "90 s",
        videoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Bent-over_row_-_exercise_demonstration_video.webm",
        videoSource: "https://commons.wikimedia.org/wiki/File:Bent-over_row_-_exercise_demonstration_video.webm", videoAuthor: "FitnessScape", videoLicense: "CC BY 3.0",
        technique: ["Inclina el torso manteniendo la espalda neutra.", "Sujeta la barra ligeramente más abierta que los hombros.", "Lleva los codos hacia atrás y acerca la barra al abdomen.", "Baja la barra sin perder la posición del tronco."],
        mistakes: [{ title: "Redondear la espalda", detail: "Reduce la carga y mantén el abdomen activo." }, { title: "Usar impulso", detail: "Evita levantarte con cada repetición." }],
        alternative: "Dominadas asistidas",
      },
      {
        name: "Press de hombros", detail: "3 series · 8–10 rep", muscle: "Hombros", previous: "17,5 kg", initialKg: "17.5", target: "3 × 8–10 repeticiones", rest: "90 s",
        videoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/69/Shoulder_press_-_exercise_demonstration_video.webm",
        videoSource: "https://commons.wikimedia.org/wiki/File:Shoulder_press_-_exercise_demonstration_video.webm", videoAuthor: "FitnessScape", videoLicense: "CC BY 3.0",
        technique: ["Coloca las manos algo más abiertas que los hombros.", "Aprieta abdomen y glúteos antes de empujar.", "Sube el peso sobre la cabeza con una trayectoria estable.", "Baja hasta una posición cómoda sin perder el control."],
        mistakes: [{ title: "Arquear demasiado la zona lumbar", detail: "Baja el peso y mantén el abdomen firme." }, { title: "Cerrar los codos", detail: "Mantén antebrazos alineados bajo la carga." }],
        alternative: "Press Arnold con mancuernas",
      },
      {
        name: "Sentadilla con barra", detail: "3 series · 8–10 rep", muscle: "Piernas", previous: "35 kg", initialKg: "35", target: "3 × 8–10 repeticiones", rest: "120 s",
        videoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm",
        videoSource: "https://commons.wikimedia.org/wiki/File:Squat_-_exercise_demonstration_video.webm", videoAuthor: "FitnessScape", videoLicense: "CC BY 3.0",
        technique: ["Coloca los pies aproximadamente a la anchura de los hombros.", "Respira y crea tensión antes de iniciar la bajada.", "Flexiona cadera y rodillas manteniendo los pies apoyados.", "Empuja el suelo para volver a la posición inicial."],
        mistakes: [{ title: "Talones levantados", detail: "Reduce la profundidad o revisa la movilidad del tobillo." }, { title: "Rodillas colapsando hacia dentro", detail: "Mantén las rodillas alineadas con los pies." }],
        alternative: "Prensa de piernas",
      },
      {
        name: "Peso muerto", detail: "3 series · 6–8 rep", muscle: "Cadena posterior", previous: "45 kg", initialKg: "45", target: "3 × 6–8 repeticiones", rest: "120 s",
        videoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/62/Deadlift_-_exercise_demonstration_video.webm",
        videoSource: "https://commons.wikimedia.org/wiki/File:Deadlift_-_exercise_demonstration_video.webm", videoAuthor: "FitnessScape", videoLicense: "CC BY 3.0",
        technique: ["Sitúa la barra cerca de las espinillas.", "Agarra la barra y fija la espalda en posición neutra.", "Empuja el suelo y mantén la barra cerca del cuerpo.", "Termina erguido sin echar el tronco hacia atrás."],
        mistakes: [{ title: "Separar la barra del cuerpo", detail: "Mantén la carga pegada a las piernas durante el recorrido." }, { title: "Tirar solo con la espalda", detail: "Inicia el movimiento empujando con las piernas." }],
        alternative: "Hip thrust con barra",
      },
      {
        name: "Dominadas asistidas", detail: "3 series · 6–10 rep", muscle: "Espalda", previous: "40 kg asistencia", initialKg: "40", target: "3 × 6–10 repeticiones", rest: "90 s",
        videoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Pull-ups_-_exercise_demonstration_video.webm",
        videoSource: "https://commons.wikimedia.org/wiki/File:Pull-ups_-_exercise_demonstration_video.webm", videoAuthor: "FitnessScape", videoLicense: "CC BY 3.0",
        technique: ["Agarra la barra con los hombros alejados de las orejas.", "Inicia el movimiento llevando los codos hacia abajo.", "Sube sin balancearte hasta acercar el pecho a la barra.", "Desciende de forma controlada hasta extender los brazos."],
        mistakes: [{ title: "Balancear el cuerpo", detail: "Aumenta la asistencia y controla cada repetición." }, { title: "Encoger los hombros", detail: "Mantén los hombros bajos al iniciar el tirón." }],
        alternative: "Remo inclinado con barra",
      },
    ],
  },
  {
    id: "pierna",
    name: "Pierna",
    summary: "Empuja fuerte. Aterriza mejor.",
    exercises: [
      {
        name: "Prensa de piernas", detail: "3 series · 10–15 rep", muscle: "Piernas", previous: "70 kg", initialKg: "70", target: "3 × 10–15 repeticiones", rest: "90 s",
        videoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/Muscle_Strengthening_at_the_Gym_-_Seated_Leg_Press.webm",
        videoSource: "https://commons.wikimedia.org/wiki/File:Muscle_Strengthening_at_the_Gym_-_Seated_Leg_Press.webm", videoAuthor: "Centers for Disease Control and Prevention", videoLicense: "Dominio público",
        technique: ["Coloca los pies en la plataforma a la anchura de los hombros.", "Mantén la zona lumbar apoyada en el respaldo durante todo el recorrido.", "Baja hasta que las rodillas formen unos 90°, sin despegar la espalda.", "Empuja sin bloquear las rodillas al extender."],
        mistakes: [{ title: "Despegar la zona lumbar del respaldo", detail: "Reduce el rango de bajada o el peso." }, { title: "Bloquear las rodillas arriba", detail: "Deja una ligera flexión al final del empuje." }],
        alternative: "Sentadilla con barra",
      },
      {
        name: "Curl femoral", detail: "3 series · 10–15 rep", muscle: "Piernas", previous: "20 kg", initialKg: "20", target: "3 × 10–15 repeticiones", rest: "90 s",
        videoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/14/Muscle_Strengthening_at_the_Gym_-_Leg_Curl.webm",
        videoSource: "https://commons.wikimedia.org/wiki/File:Muscle_Strengthening_at_the_Gym_-_Leg_Curl.webm", videoAuthor: "Centers for Disease Control and Prevention", videoLicense: "Dominio público",
        technique: ["Ajusta el rodillo para que quede justo sobre el tendón de Aquiles.", "Mantén la cadera pegada al asiento durante todo el movimiento.", "Flexiona las rodillas llevando el rodillo hacia los glúteos.", "Vuelve de forma controlada sin soltar el peso de golpe."],
        mistakes: [{ title: "Levantar la cadera del asiento", detail: "Baja el peso hasta poder controlar el recorrido completo." }, { title: "Soltar el peso de golpe al volver", detail: "Controla también la fase de bajada, no solo la subida." }],
        alternative: "Peso muerto",
      },
      {
        name: "Zancadas con mancuernas", detail: "3 series · 10–12 rep por pierna", muscle: "Piernas", previous: "12 kg por mano", initialKg: "12", target: "3 × 10–12 repeticiones por pierna", rest: "90 s",
        videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
        technique: ["Da un paso largo al frente manteniendo el torso erguido.", "Baja hasta que ambas rodillas formen unos 90°, sin que la rodilla de atrás toque el suelo con fuerza.", "Empuja con el talón de la pierna delantera para volver a la posición inicial.", "Alterna de pierna o completa todas las repeticiones de un lado antes de cambiar."],
        mistakes: [{ title: "Rodilla delantera por delante de la puntera", detail: "Da un paso más largo para mantener la tibia más vertical." }, { title: "Inclinar el torso hacia delante", detail: "Mantén el pecho arriba y la mirada al frente." }],
        alternative: "Prensa de piernas",
      },
      {
        name: "Elevación de gemelos", detail: "3 series · 12–20 rep", muscle: "Pantorrillas", previous: "30 kg", initialKg: "30", target: "3 × 12–20 repeticiones", rest: "60 s",
        videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
        technique: ["Apoya la punta de los pies en el borde de la plataforma o escalón.", "Baja los talones hasta notar estiramiento en la pantorrilla.", "Sube lo más alto posible apretando la pantorrilla arriba.", "Controla la bajada en vez de dejarte caer."],
        mistakes: [{ title: "Usar rebote en vez de control", detail: "Haz una pausa breve arriba y otra abajo en cada repetición." }, { title: "Rango de movimiento corto", detail: "Baja completamente los talones antes de volver a subir." }],
        alternative: "Curl femoral",
      },
      {
        name: "Hip thrust con barra", detail: "3 series · 8–12 rep", muscle: "Glúteos", previous: "40 kg", initialKg: "40", target: "3 × 8–12 repeticiones", rest: "90 s",
        videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
        technique: ["Apoya la parte alta de la espalda en un banco, con la barra sobre la cadera.", "Coloca los pies a la anchura de los hombros, cerca de los glúteos.", "Empuja con los talones hasta que cadera y hombros queden alineados.", "Aprieta los glúteos arriba antes de bajar de forma controlada."],
        mistakes: [{ title: "Hiperextender la zona lumbar arriba", detail: "Sube hasta la alineación cadera-hombros, no más." }, { title: "Pies demasiado alejados", detail: "Acércalos hasta notar el trabajo en el glúteo, no en el cuádriceps." }],
        alternative: "Peso muerto",
      },
    ],
  },
];

export const weekdayShortNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function parseRestSeconds(rest: string): number {
  const match = rest.match(/(\d+)/);
  return match ? Number(match[1]) : 90;
}

/** Convierte el nombre de "alternativa" en un ejercicio completo para mostrar
 *  cuando el original está ocupado. Mantiene objetivo/descanso/técnica (son
 *  movimientos del mismo patrón), pero sin vídeo propio: mostrar el vídeo del
 *  ejercicio original bajo un nombre distinto sería engañoso. */
export function buildAlternativeExercise(exercise: WorkoutExercise): WorkoutExercise {
  return {
    ...exercise,
    name: exercise.alternative,
    videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
    alternative: exercise.name,
  };
}

/** Reparte los entrenos de la semana según los días de entreno del perfil,
 *  alternando entre los workouts disponibles. weekday: 0 = lunes ... 6 = domingo. */
export function weekdaySlotsForTrainingDays(trainingDays: number): { weekday: number; workoutId: string }[] {
  const patterns: Record<number, number[]> = {
    1: [0],
    2: [0, 3],
    3: [0, 2, 4],
    4: [0, 1, 3, 4],
    5: [0, 1, 2, 3, 4],
    6: [0, 1, 2, 3, 4, 5],
    7: [0, 1, 2, 3, 4, 5, 6],
  };
  const clamped = Math.max(0, Math.min(7, Math.round(trainingDays)));
  const weekdays = patterns[clamped] ?? [];
  return weekdays.map((weekday, index) => ({ weekday, workoutId: workouts[index % workouts.length].id }));
}

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

export type StrengthWorkout = {
  id: string;
  name: string;
  summary: string;
  kind: "gym" | "home";
  exercises: WorkoutExercise[];
};

export type CardioBlock = { phase: string; minutes: number; detail: string };

export type CardioWorkout = {
  id: string;
  name: string;
  summary: string;
  kind: "cardio";
  modality: "Running" | "Caminar" | "Bici";
  durationMin: number;
  blocks: CardioBlock[];
};

export type Workout = StrengthWorkout | CardioWorkout;

export function isCardioWorkout(workout: Workout): workout is CardioWorkout {
  return workout.kind === "cardio";
}

/** IMPORTANTE: los `name` de los ejercicios de torso-a y pierna NO deben
 *  cambiar — el historial de `exercise_sets` se cruza por ese texto. */
export const workouts: Workout[] = [
  {
    id: "torso-a",
    name: "Torso A",
    summary: "Construye fuerza. Sin improvisar.",
    kind: "gym",
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
    kind: "gym",
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
  {
    id: "torso-b",
    name: "Torso B",
    summary: "Otro ángulo. Mismo hambre.",
    kind: "gym",
    exercises: [
      {
        name: "Press inclinado con mancuernas", detail: "3 series · 8–12 rep", muscle: "Pecho", previous: "14 kg por mano", initialKg: "14", target: "3 × 8–12 repeticiones", rest: "90 s",
        videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
        technique: ["Ajusta el banco a unos 30° de inclinación.", "Apoya bien la espalda y los pies antes de empezar.", "Baja las mancuernas de forma controlada hasta la altura del pecho.", "Empuja hacia arriba sin que las mancuernas choquen arriba."],
        mistakes: [{ title: "Inclinar demasiado el banco", detail: "Más de 45° convierte el ejercicio en press de hombro." }, { title: "Rebotar abajo", detail: "Haz una pausa breve en el estiramiento antes de subir." }],
        alternative: "Press de pecho en máquina",
      },
      {
        name: "Jalón al pecho", detail: "3 series · 8–12 rep", muscle: "Espalda", previous: "40 kg", initialKg: "40", target: "3 × 8–12 repeticiones", rest: "90 s",
        videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
        technique: ["Sujeta la barra algo más abierta que los hombros.", "Fija las piernas bajo los rodillos y saca ligeramente el pecho.", "Tira de la barra hacia la parte alta del pecho llevando los codos abajo.", "Sube controlando el peso hasta estirar los brazos."],
        mistakes: [{ title: "Echarse muy atrás", detail: "Un ligero ángulo basta; no conviertas el jalón en un remo." }, { title: "Tirar con los brazos", detail: "Piensa en llevar los codos al bolsillo, no en tirar con las manos." }],
        alternative: "Dominadas asistidas",
      },
      {
        name: "Remo en máquina", detail: "3 series · 10–12 rep", muscle: "Espalda", previous: "35 kg", initialKg: "35", target: "3 × 10–12 repeticiones", rest: "90 s",
        videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
        technique: ["Apoya el pecho en el soporte y agarra las asas.", "Tira llevando los codos hacia atrás, pegados al cuerpo.", "Junta ligeramente las escápulas al final del recorrido.", "Vuelve despacio sin dejar caer el peso."],
        mistakes: [{ title: "Encoger los hombros", detail: "Mantén los hombros lejos de las orejas durante el tirón." }, { title: "Usar impulso con el tronco", detail: "El pecho no debe despegarse del soporte." }],
        alternative: "Remo inclinado con barra",
      },
      {
        name: "Elevaciones laterales", detail: "3 series · 12–15 rep", muscle: "Hombros", previous: "7 kg por mano", initialKg: "7", target: "3 × 12–15 repeticiones", rest: "60 s",
        videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
        technique: ["De pie, mancuernas a los lados con codos ligeramente flexionados.", "Sube los brazos hasta la altura de los hombros, no más.", "Imagina que viertes agua de una jarra al final del recorrido.", "Baja despacio resistiendo el peso."],
        mistakes: [{ title: "Balancear el cuerpo", detail: "Si necesitas impulso, la carga es excesiva." }, { title: "Subir por encima del hombro", detail: "A partir de ahí trabaja el trapecio, no el deltoides." }],
        alternative: "Press de hombros",
      },
      {
        name: "Curl de bíceps con barra", detail: "3 series · 10–12 rep", muscle: "Bíceps", previous: "15 kg", initialKg: "15", target: "3 × 10–12 repeticiones", rest: "60 s",
        videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
        technique: ["Agarra la barra a la anchura de los hombros, codos pegados al torso.", "Sube la barra flexionando solo los codos.", "Aprieta el bíceps arriba un instante.", "Baja de forma controlada hasta estirar del todo."],
        mistakes: [{ title: "Mover los codos hacia delante", detail: "Los codos son una bisagra fija a los lados del cuerpo." }, { title: "Balanceo lumbar", detail: "Apoya la espalda en una pared si te cuesta mantenerte estable." }],
        alternative: "Curl con mancuernas alterno",
      },
      {
        name: "Press francés", detail: "3 series · 10–12 rep", muscle: "Tríceps", previous: "12 kg", initialKg: "12", target: "3 × 10–12 repeticiones", rest: "60 s",
        videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
        technique: ["Túmbate en el banco con la barra sobre la frente, brazos verticales.", "Flexiona solo los codos para bajar la barra hacia la cabeza.", "Mantén los codos apuntando al techo, sin abrirlos.", "Extiende los brazos sin bloquear con violencia."],
        mistakes: [{ title: "Abrir los codos", detail: "Reduce el peso hasta poder mantenerlos paralelos." }, { title: "Convertirlo en press", detail: "El brazo no se mueve: solo el antebrazo baja y sube." }],
        alternative: "Fondos en banco",
      },
    ],
  },
  {
    id: "casa",
    name: "Cuerpo completo en casa",
    summary: "Sin material. Sin excusas.",
    kind: "home",
    exercises: [
      {
        name: "Flexiones", detail: "3 series · 8–15 rep", muscle: "Pecho", previous: "12 rep", initialKg: "0", target: "3 × 8–15 repeticiones", rest: "75 s",
        videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
        technique: ["Manos algo más abiertas que los hombros, cuerpo en línea recta.", "Baja el pecho hasta casi rozar el suelo.", "Aprieta abdomen y glúteos durante todo el movimiento.", "Si no llegas a 8, apoya las rodillas."],
        mistakes: [{ title: "Cadera caída", detail: "Refuerza el abdomen o sube las manos a una superficie elevada." }, { title: "Medio recorrido", detail: "Mejor menos repeticiones completas que muchas a medias." }],
        alternative: "Flexiones inclinadas",
      },
      {
        name: "Sentadilla sin peso", detail: "3 series · 15–20 rep", muscle: "Piernas", previous: "18 rep", initialKg: "0", target: "3 × 15–20 repeticiones", rest: "75 s",
        videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
        technique: ["Pies a la anchura de los hombros, puntas ligeramente abiertas.", "Baja como si te sentaras en una silla, pecho arriba.", "Llega al menos a los 90° de rodilla.", "Empuja el suelo para subir apretando el glúteo."],
        mistakes: [{ title: "Talones que se levantan", detail: "Reparte el peso en todo el pie y baja más despacio." }, { title: "Rodillas hacia dentro", detail: "Empuja las rodillas en la dirección de las punteras." }],
        alternative: "Sentadilla en silla",
      },
      {
        name: "Zancadas alternas", detail: "3 series · 10–12 rep por pierna", muscle: "Piernas", previous: "10 rep", initialKg: "0", target: "3 × 10–12 repeticiones por pierna", rest: "75 s",
        videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
        technique: ["Paso largo al frente con el torso erguido.", "Baja hasta que ambas rodillas formen unos 90°.", "Empuja con el talón delantero para volver.", "Alterna la pierna en cada repetición."],
        mistakes: [{ title: "Paso demasiado corto", detail: "La rodilla delantera no debe pasar de la puntera." }, { title: "Perder el equilibrio", detail: "Mira al frente y baja más despacio." }],
        alternative: "Sentadilla sin peso",
      },
      {
        name: "Remo invertido en mesa", detail: "3 series · 8–12 rep", muscle: "Espalda", previous: "8 rep", initialKg: "0", target: "3 × 8–12 repeticiones", rest: "75 s",
        videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
        technique: ["Túmbate bajo una mesa robusta y agarra el borde.", "Cuerpo en línea recta, talones apoyados.", "Tira del pecho hacia la mesa juntando las escápulas.", "Baja de forma controlada sin tocar el suelo."],
        mistakes: [{ title: "Cadera descolgada", detail: "Aprieta glúteo y abdomen para mantener la línea." }, { title: "Tirón brusco", detail: "Sube en dos segundos, baja en dos segundos." }],
        alternative: "Remo con mochila cargada",
      },
      {
        name: "Plancha", detail: "3 series · 30–60 s", muscle: "Core", previous: "40 s", initialKg: "0", target: "3 × 30–60 segundos", rest: "60 s",
        videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
        technique: ["Antebrazos en el suelo, codos bajo los hombros.", "Cuerpo en línea recta de cabeza a talones.", "Aprieta abdomen y glúteos; respira normal.", "Si pierdes la postura, termina la serie."],
        mistakes: [{ title: "Cadera alta o hundida", detail: "Grábate o mírate en un espejo: línea recta siempre." }, { title: "Aguantar la respiración", detail: "Respiración fluida; la tensión va en el abdomen." }],
        alternative: "Plancha con rodillas apoyadas",
      },
      {
        name: "Puente de glúteo", detail: "3 series · 15–20 rep", muscle: "Glúteos", previous: "16 rep", initialKg: "0", target: "3 × 15–20 repeticiones", rest: "60 s",
        videoUrl: "", videoSource: "", videoAuthor: "", videoLicense: "",
        technique: ["Túmbate boca arriba con las rodillas flexionadas.", "Empuja con los talones y sube la cadera.", "Aprieta el glúteo arriba uno o dos segundos.", "Baja sin apoyar del todo y repite."],
        mistakes: [{ title: "Arquear la lumbar arriba", detail: "Sube hasta alinear cadera y hombros, no más." }, { title: "Empujar con las puntas", detail: "El peso va en los talones para activar el glúteo." }],
        alternative: "Puente a una pierna",
      },
    ],
  },
  {
    id: "cardio-run",
    name: "Rodaje suave",
    summary: "Kilómetros que suman. Sin reventar.",
    kind: "cardio",
    modality: "Running",
    durationMin: 35,
    blocks: [
      { phase: "Calentar", minutes: 5, detail: "Camina rápido o trota muy suave. Articulaciones despiertas." },
      { phase: "Rodar", minutes: 25, detail: "Ritmo conversacional: deberías poder hablar sin ahogarte." },
      { phase: "Soltar", minutes: 5, detail: "Trote muy suave o caminata. Deja que baje el pulso." },
    ],
  },
  {
    id: "cardio-walk",
    name: "Caminata rápida",
    summary: "El cardio que siempre puedes hacer.",
    kind: "cardio",
    modality: "Caminar",
    durationMin: 45,
    blocks: [
      { phase: "Arrancar", minutes: 5, detail: "Paso normal, hombros sueltos." },
      { phase: "Paso ligero", minutes: 35, detail: "Ritmo que te haga respirar más fuerte, sin llegar a correr. Brazos activos." },
      { phase: "Enfriar", minutes: 5, detail: "Paso tranquilo para terminar." },
    ],
  },
  {
    id: "cardio-bike",
    name: "Bici constante",
    summary: "Piernas rodando, cabeza despejada.",
    kind: "cardio",
    modality: "Bici",
    durationMin: 40,
    blocks: [
      { phase: "Calentar", minutes: 5, detail: "Cadencia alegre con poca resistencia." },
      { phase: "Rodar", minutes: 30, detail: "Resistencia media, cadencia constante. Esfuerzo 6 sobre 10." },
      { phase: "Soltar", minutes: 5, detail: "Baja la resistencia y pedalea suave." },
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

export function workoutById(id: string): Workout | undefined {
  return workouts.find((workout) => workout.id === id);
}

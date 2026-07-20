/** Opciones realistas para comer fuera (bar, restaurante, comida rápida
 *  saludable) en contexto español. Se emparejan con el tipo de comida y su
 *  objetivo calórico para que salir a comer no rompa la semana. */
export type MealSlot = "Desayuno" | "Media mañana" | "Comida" | "Merienda" | "Cena";

export type EatingOutOption = {
  name: string;
  place: string;
  calories: number;
  protein: number;
  tip: string;
  /** Momentos del día para los que la opción encaja. */
  slots: MealSlot[];
};

const SNACK: MealSlot[] = ["Desayuno", "Media mañana", "Merienda"];
const MAIN: MealSlot[] = ["Comida", "Cena"];

const OPTIONS: EatingOutOption[] = [
  { name: "Yogur, fruta y café", place: "Cafetería", calories: 300, protein: 15, tip: "Desayuno o merienda fuera; café con leche desnatada.", slots: SNACK },
  { name: "Bocadillo pequeño de jamón", place: "Bar", calories: 350, protein: 20, tip: "Media ración para media mañana o merienda; suma una fruta.", slots: SNACK },
  { name: "Tostada de aguacate y huevo", place: "Cafetería", calories: 430, protein: 22, tip: "Brunch equilibrado; controla el pan extra y las salsas.", slots: ["Desayuno", "Media mañana"] },
  { name: "Revuelto o tortilla con tostada", place: "Bar", calories: 480, protein: 28, tip: "Buen desayuno o cena ligera fuera; pan integral si tienen.", slots: ["Desayuno", "Cena"] },
  { name: "Ensalada de garbanzos y atún", place: "Restaurante", calories: 560, protein: 35, tip: "Opción ligera con proteína; el pan, aparte y según hambre.", slots: MAIN },
  { name: "Tortilla de patata con pan", place: "Bar", calories: 600, protein: 24, tip: "Añade proteína: unas anchoas, jamón o queso.", slots: ["Desayuno", "Comida", "Cena"] },
  { name: "Bocadillo de lomo o pavo a la plancha", place: "Bar", calories: 620, protein: 40, tip: "A la plancha, no rebozado; suma tomate y pimiento.", slots: ["Comida", "Cena", "Desayuno"] },
  { name: "Pollo a la plancha con ensalada y pan", place: "Restaurante", calories: 620, protein: 55, tip: "Pide el pollo a la plancha y aliña tú el aceite.", slots: MAIN },
  { name: "Wrap o durum de pollo", place: "Rápido", calories: 650, protein: 38, tip: "Pollo a la plancha, extra de verdura, salsa ligera aparte.", slots: MAIN },
  { name: "Ensalada César con pollo", place: "Restaurante", calories: 650, protein: 45, tip: "Salsa aparte: usa la mitad. Sin picatostes si puedes.", slots: MAIN },
  { name: "Sushi variado (12-15 piezas)", place: "Japonés", calories: 700, protein: 35, tip: "Prioriza nigiri y sashimi; soja con moderación.", slots: MAIN },
  { name: "Tacos de pollo (3) con guacamole", place: "Mexicano", calories: 700, protein: 38, tip: "Tortilla de maíz mejor que de trigo; nachos con cabeza.", slots: MAIN },
  { name: "Poke bowl de salmón o pollo", place: "Rápido saludable", calories: 700, protein: 42, tip: "Base de arroz, doble proteína, salsa ligera aparte.", slots: MAIN },
  { name: "Pizza (mitad, masa fina) con ensalada", place: "Italiano", calories: 720, protein: 35, tip: "Media pizza + ensalada llena más que la pizza entera.", slots: MAIN },
  { name: "Hamburguesa de ternera con ensalada", place: "Restaurante", calories: 750, protein: 42, tip: "Sin bacon ni salsas extra; cambia las patatas por ensalada.", slots: MAIN },
  { name: "Pasta con tomate y pollo", place: "Italiano", calories: 780, protein: 44, tip: "Mejor tomate que carbonara; ración normal, no XL.", slots: MAIN },
  { name: "Menú del día: legumbre + pescado a la plancha", place: "Restaurante", calories: 780, protein: 50, tip: "Primero de legumbre, segundo a la plancha, fruta de postre.", slots: ["Comida"] },
  { name: "Plato combinado: pechuga, huevo, ensalada y patata", place: "Bar", calories: 780, protein: 55, tip: "Clásico y equilibrado; la patata al horno si puede ser.", slots: MAIN },
];

/** Opciones para comer fuera que encajan con el momento del día, ordenadas por
 *  cercanía al objetivo calórico (con penalización si les falta proteína). Si
 *  no hay suficientes del mismo momento, completa con las más cercanas. */
export function matchEatingOut(slot: MealSlot, targetCalories: number, targetProtein: number, count = 4): EatingOutOption[] {
  const score = (option: EatingOutOption) =>
    Math.abs(option.calories - targetCalories) + Math.max(0, targetProtein - option.protein) * 6;
  const byScore = (a: EatingOutOption, b: EatingOutOption) => score(a) - score(b);

  const fitting = OPTIONS.filter((option) => option.slots.includes(slot)).sort(byScore);
  if (fitting.length >= count) return fitting.slice(0, count);

  const rest = OPTIONS.filter((option) => !option.slots.includes(slot)).sort(byScore);
  return [...fitting, ...rest].slice(0, count);
}

/** Fuente única de fechas de calendario en hora LOCAL.
 *
 *  Regla: nunca usar `toISOString().slice(0, 10)` para obtener un día de
 *  calendario — mezcla el día UTC con la hora local y desplaza fechas cerca
 *  de medianoche (bug histórico repetido en nutrition/stats/menu). */

export function toLocalISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toLocalISO(new Date());
}

/** Índice de día de semana con lunes = 0 … domingo = 6. */
export function weekdayMon0(date = new Date()): number {
  return (date.getDay() + 6) % 7;
}

/** Lunes (ISO local) de la semana de la fecha dada. */
export function mondayISO(date = new Date()): string {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - weekdayMon0(copy));
  return toLocalISO(copy);
}

export function addDaysISO(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalISO(date);
}

/** Lunes ISO de hace N semanas (0 = lunes de esta semana). */
export function weeksAgoMondayISO(weeksAgo: number, today = new Date()): string {
  return addDaysISO(mondayISO(today), -7 * weeksAgo);
}

/** Rango [inicio, fin] del día local como timestamps completos (UTC), para
 *  filtrar columnas `timestamptz` por día de calendario local. */
export function localDayRange(dayISO: string): [string, string] {
  const start = new Date(`${dayISO}T00:00:00`);
  const end = new Date(`${dayISO}T23:59:59.999`);
  return [start.toISOString(), end.toISOString()];
}

const monthLong = (date: Date) => date.toLocaleDateString("es-ES", { month: "long" });
const monthShort = (date: Date) => date.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");

/** "Semana 14–20 julio" o, si cruza de mes, "Semana 28 sep – 4 oct". */
export function weekRangeLabel(mondayIso = mondayISO()): string {
  const start = new Date(`${mondayIso}T12:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  if (start.getMonth() === end.getMonth()) {
    return `Semana ${start.getDate()}–${end.getDate()} ${monthLong(start)}`;
  }
  return `Semana ${start.getDate()} ${monthShort(start)} – ${end.getDate()} ${monthShort(end)}`;
}

/** "12 jul" — etiqueta corta para ejes de gráficos. */
export function shortDateLabel(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return `${date.getDate()} ${monthShort(date)}`;
}

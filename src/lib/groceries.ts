import type { DayPlan } from "./menu";

export type GroceryItem = {
  id: string;
  category: string;
  name: string;
  amount: string;
  checked: boolean;
};

type ParsedIngredient = { name: string; qty: number | null; unit: "g" | "ml" | null };

function parseSingleIngredient(raw: string): ParsedIngredient {
  const match = raw.match(/^(\d+(?:[.,]\d+)?)\s*(g|ml)?\s*(?:de\s+)?(.*)$/i);
  if (!match) return { name: raw.trim(), qty: null, unit: null };
  const [, rawQty, unit, rest] = match;
  const name = rest.trim() || raw.trim();
  return { name, qty: Number(rawQty.replace(",", ".")), unit: (unit?.toLowerCase() as "g" | "ml" | undefined) ?? null };
}

/** Un ingrediente en texto libre puede describir varios productos ("tomate y lechuga"). */
export function parseIngredient(raw: string): ParsedIngredient[] {
  return raw
    .split(/\s+y\s+(?=\d)/i)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(parseSingleIngredient);
}

const CATEGORY_KEYWORDS: [string, string[]][] = [
  ["Lácteos", ["yogur", "leche", "queso", "mozzarella"]],
  ["Proteínas", ["pollo", "pavo", "ternera", "merluza", "salmón", "atún", "huevo", "claras", "proteína", "proteic", "jamón"]],
  ["Carbohidratos", ["arroz", "pasta", "patata", "pan", "avena", "cereal", "tortilla", "base integral"]],
  ["Fruta y verdura", ["tomate", "lechuga", "verdura", "plátano", "manzana", "naranja", "fruta", "calabacín", "maíz", "ensalada"]],
];

function categorize(name: string): string {
  const lower = name.toLowerCase();
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((keyword) => lower.includes(keyword))) return category;
  }
  return "Otros";
}

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

type IngredientGroup = { category: string; name: string; unit: "g" | "ml" | null; totalQty: number; unknownCount: number };

function formatWeight(totalQty: number, unit: "g" | "ml"): string {
  const bigUnit = unit === "g" ? "kg" : "litros";
  if (totalQty >= 1000) {
    const value = Math.round((totalQty / 1000) * 100) / 100;
    return `${String(value).replace(".", ",")} ${bigUnit}`;
  }
  return `${Math.round(totalQty)} ${unit}`;
}

function formatAmount(group: IngredientGroup): string {
  if (group.unit) return formatWeight(group.totalQty, group.unit);
  if (group.totalQty > 0 && group.unknownCount === 0) return `${group.totalQty} uds`;
  if (group.totalQty > 0) return `${group.totalQty}+ uds`;
  return "al gusto";
}

/** Genera la lista de la compra sumando los ingredientes reales de la semana
 *  personalizada, agrupando por nombre+unidad y excluyendo alimentos bloqueados. */
export function buildGroceryListFromWeek(week: DayPlan[], blockedFoods: string[]): GroceryItem[] {
  const blockedLower = blockedFoods.map((food) => food.toLowerCase());
  const groups = new Map<string, IngredientGroup>();

  for (const day of week) {
    for (const meal of day.meals) {
      for (const raw of meal.ingredients) {
        for (const parsed of parseIngredient(raw)) {
          if (!parsed.name || blockedLower.some((food) => parsed.name.toLowerCase().includes(food))) continue;
          const category = categorize(parsed.name);
          const nameKey = parsed.name.toLowerCase();
          const groupKey = `${category}::${nameKey}::${parsed.unit ?? "u"}`;
          const existing = groups.get(groupKey);
          if (existing) {
            if (parsed.qty !== null) existing.totalQty += parsed.qty;
            else existing.unknownCount += 1;
          } else {
            groups.set(groupKey, {
              category,
              name: capitalize(parsed.name),
              unit: parsed.unit,
              totalQty: parsed.qty ?? 0,
              unknownCount: parsed.qty === null ? 1 : 0,
            });
          }
        }
      }
    }
  }

  return Array.from(groups.values())
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
    .map((group, index) => ({
      id: `grocery-${index}`,
      category: group.category,
      name: group.name,
      amount: formatAmount(group),
      checked: false,
    }));
}

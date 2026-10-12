import type { GroceryItem, Quantity, RecipeIngredient } from "./types";

/** Trim + lowercase + collapse whitespace only — no stemming, no plural handling. */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function quantityToText(quantity: Quantity): string {
  return "amount" in quantity ? `${quantity.amount} ${quantity.unit}` : quantity.text;
}

/**
 * Adds a recipe's ingredients to the grocery list. An ingredient whose
 * normalized name already exists in the list is skipped — the existing
 * item's quantity wins, nothing is combined. Free-text quantities ("3
 * dozen" + "2 lb") can't be summed correctly, so merging never attempts it.
 */
export function mergeIngredientsIntoList(
  list: GroceryItem[],
  ingredients: RecipeIngredient[],
): GroceryItem[] {
  const existingNames = new Set(list.map((item) => normalizeName(item.name)));
  const additions: GroceryItem[] = [];

  for (const ingredient of ingredients) {
    const normalized = normalizeName(ingredient.name);
    if (existingNames.has(normalized)) continue;
    existingNames.add(normalized);
    additions.push({
      id: crypto.randomUUID(),
      name: ingredient.name,
      quantityText: quantityToText(ingredient.quantity),
      section: ingredient.section,
      checked: false,
      staple: false,
    });
  }

  return [...list, ...additions];
}

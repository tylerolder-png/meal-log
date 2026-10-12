import type { Recipe } from "./types";

export type NewRecipe = Omit<Recipe, "id" | "isDefault">;

export function addRecipe(list: Recipe[], input: NewRecipe): Recipe[] {
  return [...list, { ...input, id: crypto.randomUUID(), isDefault: false }];
}

export function editRecipe(list: Recipe[], id: string, patch: Partial<NewRecipe>): Recipe[] {
  return list.map((recipe) => (recipe.id === id ? { ...recipe, ...patch } : recipe));
}

export function deleteRecipe(list: Recipe[], id: string): Recipe[] {
  return list.filter((recipe) => recipe.id !== id);
}

/**
 * Re-adds any seed recipe whose id is absent from the current list — i.e.
 * un-deletes defaults the user removed. A default still present, even
 * heavily edited, is left alone: restoring never reverts an in-place edit.
 */
export function restoreDefaults(list: Recipe[], seedRecipes: Recipe[]): Recipe[] {
  const presentIds = new Set(list.map((recipe) => recipe.id));
  const missing = seedRecipes.filter((seed) => !presentIds.has(seed.id));
  return [...list, ...missing];
}

/**
 * Applies validated, imported recipes: a recipe whose id already exists in
 * the list replaces it in place — re-pasting an edited version of a recipe
 * you already have is how you update it. A new id is appended.
 */
export function importRecipes(list: Recipe[], parsed: Recipe[]): Recipe[] {
  let next = list;
  for (const recipe of parsed) {
    next = next.some((r) => r.id === recipe.id)
      ? next.map((r) => (r.id === recipe.id ? recipe : r))
      : [...next, recipe];
  }
  return next;
}

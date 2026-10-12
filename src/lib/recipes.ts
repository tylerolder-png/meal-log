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

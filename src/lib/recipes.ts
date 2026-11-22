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
 *
 * If the pasted batch itself has two recipes sharing an id, the second is
 * not an "update" of the first — there's no earlier-imported version to
 * update, they just happen to collide. Give it a fresh id instead of
 * silently overwriting the first one in the same import.
 */
export function importRecipes(list: Recipe[], parsed: Recipe[]): Recipe[] {
  let next = list;
  const seenInBatch = new Set<string>();
  for (const recipe of parsed) {
    const r = seenInBatch.has(recipe.id) ? { ...recipe, id: crypto.randomUUID() } : recipe;
    seenInBatch.add(recipe.id);
    next = next.some((x) => x.id === r.id) ? next.map((x) => (x.id === r.id ? r : x)) : [...next, r];
  }
  return next;
}

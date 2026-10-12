import { useCallback, useEffect, useState } from "react";
import { SEED_RECIPES } from "../data/seedRecipes";
import * as recipesLib from "../lib/recipes";
import type { NewRecipe } from "../lib/recipes";
import { localStore, type MealLogStore } from "../lib/storage";
import type { Recipe } from "../lib/types";

export function useRecipes(store: MealLogStore = localStore) {
  const [ready, setReady] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await store.loadRecipes();
      if (cancelled) return;
      setRecipes(loaded ?? SEED_RECIPES);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [store]);

  const apply = useCallback(
    (transform: (prev: Recipe[]) => Recipe[]) => {
      setRecipes((prev) => {
        const next = transform(prev);
        void store.saveRecipes(next);
        return next;
      });
    },
    [store],
  );

  const addRecipe = useCallback((input: NewRecipe) => apply((prev) => recipesLib.addRecipe(prev, input)), [apply]);
  const editRecipe = useCallback(
    (id: string, patch: Partial<NewRecipe>) => apply((prev) => recipesLib.editRecipe(prev, id, patch)),
    [apply],
  );
  const deleteRecipe = useCallback((id: string) => apply((prev) => recipesLib.deleteRecipe(prev, id)), [apply]);
  const restoreDefaults = useCallback(
    () => apply((prev) => recipesLib.restoreDefaults(prev, SEED_RECIPES)),
    [apply],
  );
  const importRecipes = useCallback(
    (parsed: Recipe[]) => apply((prev) => recipesLib.importRecipes(prev, parsed)),
    [apply],
  );
  const replaceAll = useCallback((next: Recipe[]) => apply(() => next), [apply]);

  return { ready, recipes, addRecipe, editRecipe, deleteRecipe, restoreDefaults, importRecipes, replaceAll };
}

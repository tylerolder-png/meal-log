import { useCallback, useEffect, useMemo, useState } from "react";
import { SEED_GROCERY_LIST } from "../data/seedGrocery";
import * as groceryList from "../lib/groceryList";
import type { NewGroceryItem } from "../lib/groceryList";
import { mergeIngredientsIntoList } from "../lib/groceryMerge";
import { localStore, type MealLogStore } from "../lib/storage";
import type { GroceryItem, RecipeIngredient } from "../lib/types";

export function useGroceryList(store: MealLogStore = localStore) {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<GroceryItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await store.loadGroceryList();
      if (cancelled) return;
      setItems(loaded ?? SEED_GROCERY_LIST);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [store]);

  const apply = useCallback(
    (transform: (prev: GroceryItem[]) => GroceryItem[]) => {
      setItems((prev) => {
        const next = transform(prev);
        void store.saveGroceryList(next);
        return next;
      });
    },
    [store],
  );

  const addItem = useCallback((input: NewGroceryItem) => apply((prev) => groceryList.addItem(prev, input)), [apply]);
  const editItem = useCallback(
    (id: string, patch: Partial<NewGroceryItem>) => apply((prev) => groceryList.editItem(prev, id, patch)),
    [apply],
  );
  const deleteItem = useCallback((id: string) => apply((prev) => groceryList.deleteItem(prev, id)), [apply]);
  const toggleItem = useCallback((id: string) => apply((prev) => groceryList.toggleItem(prev, id)), [apply]);
  const newTrip = useCallback(() => apply(groceryList.newTrip), [apply]);
  const resetToStaples = useCallback(() => apply(() => groceryList.resetToStaples(SEED_GROCERY_LIST)), [apply]);
  const addIngredients = useCallback(
    (ingredients: RecipeIngredient[]) => apply((prev) => mergeIngredientsIntoList(prev, ingredients)),
    [apply],
  );

  const sorted = useMemo(() => groceryList.sortForDisplay(items), [items]);
  const progress = useMemo(() => groceryList.progressCount(items), [items]);

  return {
    ready,
    items: sorted,
    progress,
    addItem,
    editItem,
    deleteItem,
    toggleItem,
    newTrip,
    resetToStaples,
    addIngredients,
  };
}

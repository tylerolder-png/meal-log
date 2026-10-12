import { describe, expect, it } from "vitest";
import { createMemoryStore } from "../storage";
import type { GroceryItem } from "../types";

describe("createMemoryStore", () => {
  it("returns null before anything is saved", async () => {
    const store = createMemoryStore();
    expect(await store.loadGroceryList()).toBeNull();
    expect(await store.loadRecipes()).toBeNull();
    expect(await store.loadSettings()).toBeNull();
  });

  it("round-trips a saved grocery list", async () => {
    const store = createMemoryStore();
    const items: GroceryItem[] = [
      { id: "1", name: "Eggs", section: "Protein", checked: false, staple: true },
    ];
    await store.saveGroceryList(items);
    expect(await store.loadGroceryList()).toEqual(items);
  });

  it("keeps independent stores from a second instance", async () => {
    const a = createMemoryStore();
    const b = createMemoryStore();
    await a.saveSettings({ lastSectionUsed: "Produce" });
    expect(await b.loadSettings()).toBeNull();
  });
});

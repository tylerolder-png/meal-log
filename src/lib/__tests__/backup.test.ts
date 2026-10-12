import { describe, expect, it } from "vitest";
import { buildBackup, parseBackup } from "../backup";
import type { GroceryItem, Recipe, Settings } from "../types";

const groceryList: GroceryItem[] = [
  { id: "1", name: "Eggs", section: "Protein", checked: false, staple: true },
];
const recipes: Recipe[] = [
  { id: "r1", name: "Test", tags: ["dinner"], servings: 2, ingredients: [], steps: [] },
];
const settings: Settings = { lastSectionUsed: "Protein" };

describe("buildBackup / parseBackup", () => {
  it("round-trips a full backup", () => {
    const backup = buildBackup(groceryList, recipes, settings);
    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed.groceryList).toEqual(groceryList);
    expect(parsed.recipes).toEqual(recipes);
    expect(parsed.settings).toEqual(settings);
  });

  it("rejects invalid JSON", () => {
    expect(() => parseBackup("{not json")).toThrow(/valid JSON/);
  });

  it("rejects an unrecognized version", () => {
    const backup = { ...buildBackup(groceryList, recipes, settings), version: 99 };
    expect(() => parseBackup(JSON.stringify(backup))).toThrow(/version/);
  });

  it("rejects a backup missing recipes", () => {
    const { recipes: _omit, ...rest } = buildBackup(groceryList, recipes, settings);
    expect(() => parseBackup(JSON.stringify(rest))).toThrow(/recipes/);
  });
});

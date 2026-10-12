import { describe, expect, it } from "vitest";
import { addRecipe, deleteRecipe, editRecipe, restoreDefaults } from "../recipes";
import type { Recipe } from "../types";

function recipe(overrides: Partial<Recipe>): Recipe {
  return {
    id: "r1",
    name: "Recipe",
    tags: ["dinner"],
    servings: 2,
    ingredients: [],
    steps: [],
    ...overrides,
  };
}

describe("addRecipe", () => {
  it("assigns a generated id and marks it non-default", () => {
    const [added] = addRecipe([], { name: "Mine", tags: ["snack"], servings: 1, ingredients: [], steps: [] });
    expect(added!.id).toBeTruthy();
    expect(added!.isDefault).toBe(false);
  });
});

describe("editRecipe", () => {
  it("patches only the matching recipe", () => {
    const list = [recipe({ id: "1", name: "A" }), recipe({ id: "2", name: "B" })];
    const result = editRecipe(list, "1", { name: "A2" });
    expect(result.find((r) => r.id === "1")?.name).toBe("A2");
    expect(result.find((r) => r.id === "2")?.name).toBe("B");
  });
});

describe("deleteRecipe", () => {
  it("removes the matching recipe", () => {
    const list = [recipe({ id: "1" }), recipe({ id: "2" })];
    expect(deleteRecipe(list, "1").map((r) => r.id)).toEqual(["2"]);
  });
});

describe("restoreDefaults", () => {
  const seeds = [recipe({ id: "default-a", isDefault: true }), recipe({ id: "default-b", isDefault: true })];

  it("re-adds a deleted default", () => {
    const list = [recipe({ id: "default-a", isDefault: true })];
    const result = restoreDefaults(list, seeds);
    expect(result.map((r) => r.id).sort()).toEqual(["default-a", "default-b"]);
  });

  it("leaves an edited default alone rather than reverting it", () => {
    const edited = recipe({ id: "default-a", isDefault: true, name: "My version" });
    const result = restoreDefaults([edited], seeds);
    expect(result.find((r) => r.id === "default-a")?.name).toBe("My version");
  });

  it("does not touch custom recipes", () => {
    const custom = recipe({ id: "custom-1", isDefault: false, name: "Mine" });
    const result = restoreDefaults([custom], seeds);
    expect(result.find((r) => r.id === "custom-1")).toEqual(custom);
    expect(result).toHaveLength(3);
  });
});

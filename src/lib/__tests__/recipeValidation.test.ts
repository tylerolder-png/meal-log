import { describe, expect, it } from "vitest";
import { parseRecipeImport } from "../recipeValidation";

const valid = {
  id: "test-recipe",
  name: "Test Recipe",
  tags: ["dinner"],
  servings: 2,
  ingredients: [{ name: "Rice", quantity: { amount: 1, unit: "cup" }, section: "Carbs/Bakery" }],
  steps: ["Cook it."],
};

describe("parseRecipeImport", () => {
  it("accepts a single valid recipe object", () => {
    const result = parseRecipeImport(JSON.stringify(valid));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("Test Recipe");
    expect(result[0]!.isDefault).toBe(false);
  });

  it("accepts an array of valid recipes", () => {
    const result = parseRecipeImport(JSON.stringify([valid, { ...valid, id: "test-2", name: "Second" }]));
    expect(result).toHaveLength(2);
  });

  it("accepts a text quantity on an ingredient", () => {
    const withText = { ...valid, ingredients: [{ name: "Salsa", quantity: { text: "to taste" }, section: "Pantry" }] };
    const result = parseRecipeImport(JSON.stringify(withText));
    expect(result[0]!.ingredients[0]!.quantity).toEqual({ text: "to taste" });
  });

  it("accepts an optional group on an ingredient", () => {
    const withGroup = {
      ...valid,
      ingredients: [{ name: "Soy sauce", quantity: { text: "2 tbsp" }, section: "Pantry", group: "Sauce" }],
    };
    const result = parseRecipeImport(JSON.stringify(withGroup));
    expect(result[0]!.ingredients[0]!.group).toBe("Sauce");
  });

  it("leaves group undefined when absent", () => {
    const result = parseRecipeImport(JSON.stringify(valid));
    expect(result[0]!.ingredients[0]!.group).toBeUndefined();
  });

  it("rejects invalid JSON with a readable message", () => {
    expect(() => parseRecipeImport("{not json")).toThrow(/valid JSON/);
  });

  it("rejects an empty array", () => {
    expect(() => parseRecipeImport("[]")).toThrow(/nothing to import/i);
  });

  it("rejects a missing name", () => {
    const { name: _name, ...rest } = valid;
    expect(() => parseRecipeImport(JSON.stringify(rest))).toThrow(/"name"/);
  });

  it("rejects an unknown tag", () => {
    expect(() => parseRecipeImport(JSON.stringify({ ...valid, tags: ["brunch"] }))).toThrow(/"tags"/);
  });

  it("rejects an unknown section on an ingredient, naming the ingredient's index", () => {
    const bad = { ...valid, ingredients: [{ name: "Rice", quantity: { amount: 1, unit: "cup" }, section: "Fridge" }] };
    expect(() => parseRecipeImport(JSON.stringify(bad))).toThrow(/ingredients\[0\]\.section/);
  });

  it("rejects a quantity that is neither amount+unit nor text", () => {
    const bad = { ...valid, ingredients: [{ name: "Rice", quantity: { amount: "a lot" }, section: "Pantry" }] };
    expect(() => parseRecipeImport(JSON.stringify(bad))).toThrow(/quantity/);
  });

  it("rejects non-positive servings", () => {
    expect(() => parseRecipeImport(JSON.stringify({ ...valid, servings: 0 }))).toThrow(/"servings"/);
  });

  it("names which recipe failed when importing an array", () => {
    expect(() => parseRecipeImport(JSON.stringify([valid, { ...valid, name: "" }]))).toThrow(/Recipe 2/);
  });
});

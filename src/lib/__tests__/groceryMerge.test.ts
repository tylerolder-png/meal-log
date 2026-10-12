import { describe, expect, it } from "vitest";
import { mergeIngredientsIntoList, normalizeName, quantityToText } from "../groceryMerge";
import type { GroceryItem, RecipeIngredient } from "../types";

describe("normalizeName", () => {
  it("trims, lowercases, and collapses whitespace", () => {
    expect(normalizeName("  Ground   Turkey 93/7  ")).toBe("ground turkey 93/7");
  });

  it("does not stem or singularize", () => {
    expect(normalizeName("Eggs")).not.toBe(normalizeName("Egg"));
  });
});

describe("quantityToText", () => {
  it("formats an amount+unit quantity", () => {
    expect(quantityToText({ amount: 2, unit: "lb" })).toBe("2 lb");
  });

  it("passes a text quantity through unchanged", () => {
    expect(quantityToText({ text: "to taste" })).toBe("to taste");
  });
});

describe("mergeIngredientsIntoList", () => {
  const ingredients: RecipeIngredient[] = [
    { name: "Ground turkey 93/7", quantity: { amount: 2, unit: "lb" }, section: "Protein" },
    { name: "Taco seasoning", quantity: { text: "1 packet" }, section: "Pantry" },
  ];

  it("adds new ingredients not already on the list", () => {
    const result = mergeIngredientsIntoList([], ingredients);
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.name)).toEqual(["Ground turkey 93/7", "Taco seasoning"]);
    expect(result.every((i) => !i.checked && !i.staple)).toBe(true);
  });

  it("skips an ingredient whose normalized name already exists, keeping the existing item untouched", () => {
    const existing: GroceryItem[] = [
      { id: "1", name: "ground turkey 93/7", section: "Protein", checked: true, staple: true, quantityText: "custom" },
    ];
    const result = mergeIngredientsIntoList(existing, ingredients);
    expect(result).toHaveLength(2);
    const turkey = result.find((i) => i.id === "1");
    expect(turkey).toEqual(existing[0]);
    expect(result.some((i) => i.name === "Taco seasoning")).toBe(true);
  });

  it("does not add the same ingredient twice when it appears twice in the input", () => {
    const duplicated: RecipeIngredient[] = [
      { name: "Rice", quantity: { text: "cooked" }, section: "Carbs/Bakery" },
      { name: "Rice", quantity: { text: "cooked" }, section: "Carbs/Bakery" },
    ];
    expect(mergeIngredientsIntoList([], duplicated)).toHaveLength(1);
  });
});

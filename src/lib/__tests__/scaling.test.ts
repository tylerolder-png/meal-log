import { describe, expect, it } from "vitest";
import { scaleRecipe } from "../scaling";
import type { Recipe } from "../types";

const base: Recipe = {
  id: "r1",
  name: "Test Bowl",
  tags: ["dinner"],
  servings: 2,
  proteinPerServingG: 50,
  ingredients: [
    { name: "Ground beef", quantity: { amount: 1, unit: "lb" }, section: "Protein" },
    { name: "Rice", quantity: { text: "cooked, to serve" }, section: "Carbs/Bakery" },
  ],
  steps: ["Cook it."],
};

describe("scaleRecipe", () => {
  it("scales amount+unit quantities proportionally", () => {
    const result = scaleRecipe(base, 4);
    expect(result.ingredients[0]!.quantity).toEqual({ amount: 2, unit: "lb" });
  });

  it("leaves text quantities unchanged", () => {
    const result = scaleRecipe(base, 4);
    expect(result.ingredients[1]!.quantity).toEqual({ text: "cooked, to serve" });
  });

  it("updates servings to the new value", () => {
    expect(scaleRecipe(base, 3).servings).toBe(3);
  });

  it("does not change proteinPerServingG, since it's already per-serving", () => {
    expect(scaleRecipe(base, 6).proteinPerServingG).toBe(50);
  });

  it("rounds to avoid float noise", () => {
    const result = scaleRecipe(base, 1);
    expect(result.ingredients[0]!.quantity).toEqual({ amount: 0.5, unit: "lb" });
  });

  it("does not mutate the original recipe", () => {
    const original = JSON.parse(JSON.stringify(base));
    scaleRecipe(base, 10);
    expect(base).toEqual(original);
  });
});

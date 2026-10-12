import { describe, expect, it } from "vitest";
import { parseRecipeText } from "../recipeTextParser";

const KOREAN_BEEF = `
Korean Beef Bowl

Serves: 4
Prep time: 10 minutes
Cook time: 15 minutes

Ingredients:

For the sauce:
1/4 cup soy sauce
2 tbsp brown sugar
1 tbsp sesame oil
3 cloves garlic, minced
1 tsp ginger, grated

For the bowl:
1 lb ground beef
2 cups cooked rice
1 green onion, sliced
Sesame seeds for garnish

Instructions:
1. Mix soy sauce, brown sugar, sesame oil, garlic, and ginger in a bowl.
2. Brown the beef in a hot pan, 5-6 minutes.
3. Add the sauce and simmer 2-3 minutes.
4. Serve over rice, top with green onion and sesame seeds.

Notes:
Best served immediately while hot.
`;

describe("parseRecipeText — Korean beef example", () => {
  const result = parseRecipeText(KOREAN_BEEF);

  it("takes the first line as the name", () => {
    expect(result.name).toBe("Korean Beef Bowl");
  });

  it("extracts servings, prep, and cook time from metadata lines", () => {
    expect(result.servings).toBe(4);
    expect(result.prepMinutes).toBe(10);
    expect(result.cookMinutes).toBe(15);
  });

  it("groups ingredients by their 'For the X:' sub-headers", () => {
    const sauceNames = result.ingredients.filter((i) => i.group === "sauce").map((i) => i.name);
    const bowlNames = result.ingredients.filter((i) => i.group === "bowl").map((i) => i.name);
    expect(sauceNames).toEqual(["soy sauce", "brown sugar", "sesame oil", "garlic, minced", "ginger, grated"]);
    expect(bowlNames).toContain("ground beef");
    expect(bowlNames).toContain("cooked rice");
  });

  it("parses fractional and whole-number quantities with units", () => {
    const soySauce = result.ingredients.find((i) => i.name === "soy sauce")!;
    expect(soySauce.quantity).toEqual({ amount: 0.25, unit: "cup" });
    const beef = result.ingredients.find((i) => i.name === "ground beef")!;
    expect(beef.quantity).toEqual({ amount: 1, unit: "lb" });
    const garlic = result.ingredients.find((i) => i.name === "garlic, minced")!;
    expect(garlic.quantity).toEqual({ amount: 3, unit: "cloves" });
  });

  it("falls back to free text for a line with no recognized unit", () => {
    const onion = result.ingredients.find((i) => i.name.includes("green onion"))!;
    expect(onion.quantity).toEqual({ text: "1 green onion, sliced" });
  });

  it("defaults every ingredient's section to Other, for the user to fix", () => {
    expect(result.ingredients.every((i) => i.section === "Other")).toBe(true);
  });

  it("strips numbered-list markers from steps", () => {
    expect(result.steps).toEqual([
      "Mix soy sauce, brown sugar, sesame oil, garlic, and ginger in a bowl.",
      "Brown the beef in a hot pan, 5-6 minutes.",
      "Add the sauce and simmer 2-3 minutes.",
      "Serve over rice, top with green onion and sesame seeds.",
    ]);
  });

  it("captures a trailing Notes section", () => {
    expect(result.notes).toBe("Best served immediately while hot.");
  });

  it("defaults tags to empty, for the user to pick", () => {
    expect(result.tags).toEqual([]);
  });
});

describe("parseRecipeText — edge cases", () => {
  it("returns an empty-but-valid recipe for blank input", () => {
    const result = parseRecipeText("   \n\n  ");
    expect(result).toEqual({ name: "", tags: [], servings: 4, ingredients: [], steps: [] });
  });

  it("defaults servings to 4 when not stated", () => {
    const result = parseRecipeText("Simple Thing\nIngredients:\n1 cup rice\nInstructions:\nCook it.");
    expect(result.servings).toBe(4);
  });

  it("parses a mixed number quantity (whole + fraction)", () => {
    const result = parseRecipeText("Ingredients:\n1 1/2 cups flour");
    expect(result.ingredients[0]!.quantity).toEqual({ amount: 1.5, unit: "cups" });
  });

  it("parses a unicode fraction", () => {
    const result = parseRecipeText("Ingredients:\n½ cup milk");
    expect(result.ingredients[0]!.quantity).toEqual({ amount: 0.5, unit: "cup" });
  });

  it("leaves ingredient group undefined when no sub-header is present", () => {
    const result = parseRecipeText("Ingredients:\n1 cup rice\n2 lb chicken");
    expect(result.ingredients.every((i) => i.group === undefined)).toBe(true);
  });

  it("without any headers, treats remaining lines as a flat ingredient list and produces no steps", () => {
    const result = parseRecipeText("Mystery Dish\n2 cups rice\n1 lb chicken");
    expect(result.name).toBe("Mystery Dish");
    expect(result.ingredients).toHaveLength(2);
    expect(result.steps).toEqual([]);
  });

  it("strips bullet markers from ingredient lines", () => {
    const result = parseRecipeText("Ingredients:\n- 2 cups rice\n* 1 lb chicken");
    expect(result.ingredients.map((i) => i.name)).toEqual(["rice", "chicken"]);
  });
});

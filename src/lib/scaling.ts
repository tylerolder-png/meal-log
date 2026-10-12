import type { Quantity, Recipe, RecipeIngredient } from "./types";

/**
 * Scales a recipe to a new serving count. Only {amount, unit} quantities
 * scale; {text} quantities ("to taste", "cooked, to serve") pass through
 * unchanged — there's no sensible way to scale free text. Rounded to 2
 * decimal places to avoid float noise like 1.3333333333333335.
 *
 * `proteinPerServingG` is per serving, so it does not change when servings
 * does — only the ingredient amounts and the servings count do.
 *
 * Precondition: newServings > 0 (enforce at the UI boundary, e.g. a min=1 input).
 */
export function scaleRecipe(recipe: Recipe, newServings: number): Recipe {
  const factor = newServings / recipe.servings;
  return {
    ...recipe,
    servings: newServings,
    ingredients: recipe.ingredients.map((ingredient) => scaleIngredient(ingredient, factor)),
  };
}

function scaleIngredient(ingredient: RecipeIngredient, factor: number): RecipeIngredient {
  return { ...ingredient, quantity: scaleQuantity(ingredient.quantity, factor) };
}

function scaleQuantity(quantity: Quantity, factor: number): Quantity {
  if ("text" in quantity) return quantity;
  return { amount: Math.round(quantity.amount * factor * 100) / 100, unit: quantity.unit };
}

import { RECIPE_TAGS, SECTION_ORDER, type Recipe, type RecipeIngredient, type RecipeTag, type Section } from "./types";

/**
 * Throws with a message meant to be shown directly to the user — a failed
 * import needs to say what's wrong and where, not fail silently or with a
 * raw parse error.
 */
export function parseRecipeImport(json: string): Recipe[] {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("That text isn't valid JSON.");
  }

  const candidates = Array.isArray(data) ? data : [data];
  if (candidates.length === 0) {
    throw new Error("Found an empty array — nothing to import.");
  }

  return candidates.map((candidate, index) =>
    validateRecipe(candidate, candidates.length === 1 ? "Recipe" : `Recipe ${index + 1}`),
  );
}

function validateRecipe(candidate: unknown, at: string): Recipe {

  if (typeof candidate !== "object" || candidate === null) {
    throw new Error(`${at}: expected an object.`);
  }
  const r = candidate as Record<string, unknown>;

  if (typeof r.id !== "string" || r.id.trim() === "") {
    throw new Error(`${at}: "id" must be a non-empty string.`);
  }
  if (typeof r.name !== "string" || r.name.trim() === "") {
    throw new Error(`${at}: "name" must be a non-empty string.`);
  }
  if (!Array.isArray(r.tags) || !r.tags.every((t) => RECIPE_TAGS.includes(t as RecipeTag))) {
    throw new Error(`${at}: "tags" must be an array using only ${RECIPE_TAGS.join(", ")}.`);
  }
  if (typeof r.servings !== "number" || r.servings <= 0) {
    throw new Error(`${at}: "servings" must be a positive number.`);
  }
  if (!Array.isArray(r.ingredients) || r.ingredients.length === 0) {
    throw new Error(`${at}: "ingredients" must be a non-empty array.`);
  }
  const ingredients = r.ingredients.map((ingredient, i) => validateIngredient(ingredient, at, i));
  if (!Array.isArray(r.steps) || r.steps.length === 0 || !r.steps.every((s) => typeof s === "string")) {
    throw new Error(`${at}: "steps" must be a non-empty array of strings.`);
  }
  if (r.proteinPerServingG !== undefined && typeof r.proteinPerServingG !== "number") {
    throw new Error(`${at}: "proteinPerServingG" must be a number if present.`);
  }
  if (r.prepMinutes !== undefined && typeof r.prepMinutes !== "number") {
    throw new Error(`${at}: "prepMinutes" must be a number if present.`);
  }
  if (r.cookMinutes !== undefined && typeof r.cookMinutes !== "number") {
    throw new Error(`${at}: "cookMinutes" must be a number if present.`);
  }
  if (r.notes !== undefined && typeof r.notes !== "string") {
    throw new Error(`${at}: "notes" must be a string if present.`);
  }

  return {
    id: r.id,
    name: r.name,
    tags: r.tags as Recipe["tags"],
    servings: r.servings,
    ingredients,
    steps: r.steps as string[],
    proteinPerServingG: r.proteinPerServingG as number | undefined,
    prepMinutes: r.prepMinutes as number | undefined,
    cookMinutes: r.cookMinutes as number | undefined,
    notes: r.notes as string | undefined,
    isDefault: false,
  };
}

function validateIngredient(candidate: unknown, recipeLabel: string, index: number): RecipeIngredient {
  const at = `${recipeLabel}: ingredients[${index}]`;
  if (typeof candidate !== "object" || candidate === null) {
    throw new Error(`${at} must be an object.`);
  }
  const i = candidate as Record<string, unknown>;

  if (typeof i.name !== "string" || i.name.trim() === "") {
    throw new Error(`${at}.name must be a non-empty string.`);
  }
  if (!SECTION_ORDER.includes(i.section as Section)) {
    throw new Error(`${at}.section must be one of ${SECTION_ORDER.join(", ")}.`);
  }
  if (typeof i.quantity !== "object" || i.quantity === null) {
    throw new Error(`${at}.quantity must be { amount, unit } or { text }.`);
  }
  const q = i.quantity as Record<string, unknown>;
  const isAmountUnit = typeof q.amount === "number" && typeof q.unit === "string";
  const isText = typeof q.text === "string";
  if (!isAmountUnit && !isText) {
    throw new Error(`${at}.quantity must be { amount: number, unit: string } or { text: string }.`);
  }

  return {
    name: i.name,
    section: i.section as RecipeIngredient["section"],
    quantity: isAmountUnit ? { amount: q.amount as number, unit: q.unit as string } : { text: q.text as string },
  };
}

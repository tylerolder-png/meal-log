export type Section =
  | "Produce"
  | "Protein"
  | "Dairy"
  | "Frozen"
  | "Grab-and-go"
  | "Carbs/Bakery"
  | "Pantry"
  | "Other";

/** Store-walk order. Grocery items and recipe ingredient sections both use this. */
export const SECTION_ORDER: Section[] = [
  "Produce",
  "Protein",
  "Dairy",
  "Frozen",
  "Grab-and-go",
  "Carbs/Bakery",
  "Pantry",
  "Other",
];

export interface GroceryItem {
  id: string;
  name: string;
  /** Free text, e.g. "3 dozen", "2 lb" — not parsed, just displayed. */
  quantityText?: string;
  section: Section;
  checked: boolean;
  /** Included in resetToStaples()'s default set. */
  staple: boolean;
  /** Freeform handling/longevity tip, e.g. "Freeze if not cooking within 2 days". Shown under the quantity, not parsed. */
  storageNote?: string;
}

/** A real number scales with servings; free text doesn't. */
export type Quantity = { amount: number; unit: string } | { text: string };

export interface RecipeIngredient {
  name: string;
  quantity: Quantity;
  /** Authored explicitly rather than guessed from the ingredient name. */
  section: Section;
  /**
   * Prep-step grouping for display (e.g. "Sauce", "Marinade", "Bowl") — not
   * the grocery-store section. A sauce's soy sauce (Pantry) and garlic
   * (Produce) are different sections but the same group. Omit for a flat,
   * ungrouped ingredient list.
   */
  group?: string;
}

export type RecipeTag = "breakfast" | "dinner" | "snack" | "batch-cook";

export const RECIPE_TAGS: RecipeTag[] = ["breakfast", "dinner", "snack", "batch-cook"];

export interface Recipe {
  id: string;
  name: string;
  tags: RecipeTag[];
  servings: number;
  /** Approximate — see "Nutrition numbers" in CLAUDE.md. */
  proteinPerServingG?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  notes?: string;
  /** Marks a seed recipe, for the restoreDefaults() merge rule. */
  isDefault?: boolean;
}

export interface Settings {
  lastSectionUsed: Section;
}

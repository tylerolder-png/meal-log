# CLAUDE.md

Context for Claude Code working in this repo.

## What this is

A grocery list and recipe box, used one-handed at the store and in the
kitchen. No accounts, no backend — everything lives in `localStorage` behind
a single storage seam. Companion to
[The Log](https://github.com/tylerolder-png/lift-log-template); it borrows
that app's engineering conventions (strict TS, plain CSS with tokens, a pure
`lib/` layer, Vitest) without copying its visual identity.

## Stack

Vite + React 19 + TypeScript (strict). Plain CSS with custom properties — no
Tailwind, no CSS-in-JS. Vitest for tests. `oxlint` for linting (already
bundled by the Vite scaffold — no ESLint stack added on top of it).

```
npm run dev        # local server
npm run check      # typecheck + lint + tests — run before declaring anything done
npm run build      # production build
```

## Architecture

```
src/
  lib/                     pure domain logic — no React imports allowed here
    types.ts                shared domain types
    storage.ts              MealLogStore interface + localStorage and in-memory impls, schema versioning
    groceryList.ts          add/edit/delete/toggle, "new trip", "reset to staples", section sort
    groceryMerge.ts         normalizeName() + mergeIngredientsIntoList() — recipe → list dedupe
    scaling.ts              scaleRecipe(recipe, servings) — scales amount+unit quantities only
    recipes.ts              create/edit/delete, restoreDefaults() merge rule
    recipeValidation.ts     hand-rolled JSON validation for pasted recipes (no schema library)
    backup.ts                buildBackup / parseBackup for full export/import
  data/
    seedGrocery.ts           default staples
    seedRecipes.ts           default recipes
  hooks/
    useGroceryList.ts, useRecipes.ts, useSettings.ts   the only places state and persistence connect
  components/                presentational, driven by props
```

**The `lib/` boundary is the important one.** Anything that decides what the
list or a recipe looks like lives there, is pure, and is unit-tested.
Components render what they're given.

## Data model

```ts
export type Section =
  | "Produce" | "Protein" | "Dairy" | "Frozen"
  | "Grab-and-go" | "Carbs/Bakery" | "Pantry" | "Other";

export const SECTION_ORDER: Section[] = [
  "Produce", "Protein", "Dairy", "Frozen",
  "Grab-and-go", "Carbs/Bakery", "Pantry", "Other",
];

export interface GroceryItem {
  id: string;
  name: string;
  quantityText?: string;   // "3 dozen", "2 lb" — free text, not parsed
  section: Section;
  checked: boolean;
  staple: boolean;
}

export type Quantity = { amount: number; unit: string } | { text: string };

export interface RecipeIngredient {
  name: string;
  quantity: Quantity;
  section: Section;         // authored explicitly, not guessed from the name
}

export type RecipeTag = "breakfast" | "dinner" | "snack" | "batch-cook";

export interface Recipe {
  id: string;
  name: string;
  tags: RecipeTag[];
  servings: number;
  proteinPerServingG?: number;   // approximate — see "Nutrition numbers" below
  prepMinutes?: number;
  cookMinutes?: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  notes?: string;
  isDefault?: boolean;      // marks seed recipes for the restore-defaults rule
}

export interface Settings {
  lastSectionUsed: Section;
}
```

See [`RECIPE_FORMAT.md`](./RECIPE_FORMAT.md) for the recipe JSON schema with a
full example — that's the file to hand to an LLM asked to write a new recipe.

## Domain rules that are easy to get wrong

- **Ingredient merge dedupes on `normalizeName()`** (trim + lowercase +
  collapse whitespace — no stemming, no plural-handling). A match means
  **skip**, not merge-quantities: the existing list item's quantity text
  wins, the incoming one is dropped. Don't "improve" this into a quantity
  combiner — free-text quantities ("3 dozen" + "2 lb") can't be combined
  correctly anyway.
- **`scaleRecipe` only rescales `{amount, unit}` quantities.** `{text}`
  quantities (e.g. "cooked, to serve") pass through unchanged at any serving
  count. That's the documented fallback behavior, not a bug to fix.
- **`restoreDefaults()` re-adds any seed recipe whose `id` is absent** from
  the current list. If a default's `id` is still present — even heavily
  edited — restore leaves it alone. Restoring never reverts an in-place edit,
  it only un-deletes. This is what makes "replace a default recipe" safe:
  edit it freely, and "restore defaults" won't undo your edit.
- **`resetToStaples()` replaces the whole list** with the seed staples,
  unchecked. This is different from "New trip," which only unchecks existing
  items and leaves ad-hoc additions in place.
- **Storage is one seam.** Every read/write goes through `storage.ts`'s
  `MealLogStore` interface. Swapping in sync later means implementing that
  interface, not touching a component or hook.

## Nutrition numbers

`proteinPerServingG` values in the seed recipes are computed from USDA
FoodData Central cooked-weight protein density (not raw-weight — ground meat
and poultry lose 20-30% of their mass to water/fat during cooking, which
concentrates protein per 100g), applied to the ingredient quantities in that
recipe. They're estimates for planning, not lab-verified values — if you
import a recipe from Claude chat, ask it to use the same method (cooked
yield, not raw weight) rather than taking a raw-ingredient database number at
face value.

Reference cooked-protein densities used: ground turkey 93/7 ≈ 24g/100g,
ground beef 90/10 ≈ 26g/100g, chicken breast/thigh ≈ 28-31g/100g, salmon ≈
20-23g/100g, Barilla Protein+ ≈ 10g per 2oz dry serving.

## Conventions

- Named exports from `lib/`, default export only for `App`.
- CSS uses BEM-ish `block__element is-state`. Tokens live in `:root` in
  `index.css`; don't hardcode hex values in components.
- Comments explain *why*, not *what*.
- Keep `data/seedRecipes.ts` and `data/seedGrocery.ts` free of logic — they're
  data, not behavior.

## Design direction

Dark ground (`--night`) because this gets read under bright, glary store
lighting, not for style — high contrast matters more here than mood. One
accent (`--accent`, a leaf green), spent in exactly two places: the grocery
progress count and the primary action button. A second accent color is the
fastest way to make this look generic — don't add one.

Same three-font system as the sibling app, for the family resemblance:
Barlow Condensed for the display numerals (progress count, servings number),
IBM Plex Sans for body text, IBM Plex Mono for quantities (tabular
alignment). Bottom tab bar (`<nav role="tablist">`), safe-area padding via
`env(safe-area-inset-bottom)`.

## Known gaps / good next work

- No ingredient-amount combining across recipes added in the same trip (e.g.
  two recipes both calling for ground beef stay as two line items if their
  names don't normalize identically). `groceryMerge.ts` is the seam.
- No barcode/receipt scanning — out of scope, this is a planning list, not an
  inventory tracker.
- PWA installability note: Chrome on iOS cannot install PWAs at all (Apple
  restriction) — installing from an iPhone requires Safari specifically.
- `proteinPerServingG` is an estimate (see "Nutrition numbers" above), not a
  substitute for a food scale and a real nutrition tracker.

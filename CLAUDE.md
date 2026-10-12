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
    recipes.ts              create/edit/delete, restoreDefaults() merge rule, importRecipes() upsert-by-id
    recipeValidation.ts     hand-rolled JSON validation for pasted recipes (no schema library)
    recipeTextParser.ts     heuristic offline parser for a pasted recipe — no AI, no network call
    backup.ts                buildBackup / parseBackup for full export/import
  data/
    seedGrocery.ts           default staples
    seedRecipes.ts           default recipes
  hooks/
    useGroceryList.ts, useRecipes.ts, useSettings.ts, useWakeLock.ts   the only places state and persistence connect
  components/                presentational, driven by props
    PasteRecipePanel.tsx     paste text -> recipeTextParser -> prefills RecipeForm for review
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
  group?: string;           // prep-step display grouping ("Sauce", "Marinade") — NOT the grocery section
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
- **`group` and `section` are different axes, don't conflate them.** `section`
  is where an ingredient lives in the grocery store (drives list sorting and
  merge target); `group` is where it lives in the *recipe* ("Sauce",
  "Marinade", "Bowl") for display only. A sauce's soy sauce (Pantry section)
  and garlic (Produce section) can share one group. `group` is never read by
  `groceryMerge.ts` or `groceryList.ts` — only `RecipeDetail`'s rendering and
  `recipeTextParser.ts`'s "For the X:" sub-header detection touch it.
- **`recipeTextParser.ts` never throws and never saves anything by itself.**
  It always returns a best-effort `NewRecipe`, including an empty one for
  blank input — the caller (`PasteRecipePanel` → `RecipeForm`) always shows
  it for review before `onAdd` is called. Every parsed ingredient's `section`
  defaults to `"Other"`, on purpose — section can't be inferred from text
  alone, and guessing wrong would be worse than an obvious placeholder the
  user has to fix anyway.
- **A staple's `name` in `seedGrocery.ts` and the matching ingredient's
  `name` in `seedRecipes.ts` must be character-identical** (after
  `normalizeName()`'s trim/lowercase/whitespace-collapse). That's what lets
  "add ingredients to list" skip a duplicate instead of adding a second line
  for the same thing. If you rebrand a staple (e.g. swap which brand of
  ground beef it names), update every recipe ingredient that references it
  in the same change, or the dedupe silently stops matching.

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
20-23g/100g, Barilla Protein+ ≈ 10g per 2oz dry serving, jasmine rice cooked
≈ 2.7g/100g (~4g per cooked cup).

## Brand sourcing notes

Some staples/ingredients name a specific brand, screened on request for two
things: (1) **Kroger package size** that actually matches what's bought in
practice, and (2) avoiding companies with heavy partisan political spending
or a bad conduct history, preferring well-regarded ones instead, where a
brand mention is warranted at all. This is a snapshot from research done at
one point in time (political donations and corporate conduct change) — don't
treat it as permanently settled, re-check if it matters to you and time has
passed.

- **Ground turkey → Jennie-O 93/7** (Hormel Foods). Hormel had the steepest
  drop in political donations of any major food company in a recent cycle
  (down ~99%) and has barred corporate giving to dark-money 527 groups since
  2018. Kroger only stocks Jennie-O in 1 lb trays, so "3 lb" means three
  packs, not one — the single-pack alternative, Shady Brook Farms' 3 lb
  family pack, is a Cargill brand, and Cargill funds election-result
  disputers and has a mixed climate-pledge record, so it's skipped here.
  Trade a pack of convenience for that if you'd rather.
- **Ground beef → Private Selection 90/10 Angus** (Kroger's own line, plain
  conventional beef — not organic, not grass-fed). Confirmed as an actual
  3 lb roll at Kroger, and a store brand has no comparable founder/CEO
  political exposure. (An earlier pass here used Simple Truth Organic
  90/10 Grass-Fed, also a real 3 lb Kroger pack, but at the organic/grass-fed
  price premium — swapped out on request to skip that upcharge.)
- **Protein shakes → Premier Protein** (BellRing Brands), **Core Power
  dropped**. Core Power's maker, Fairlife, is Coca-Cola-backed and was sued
  over undercover video of animal abuse at a supplier dairy; Coca-Cola and
  others settled for $21M, and a watchdog group reported further incidents
  through 2023. That's a clear "poor history" case, not a borderline one.
- **Barilla Protein+ — kept, with context.** Barilla's chairman made an
  anti-gay-family remark in 2013 that drew a real boycott call. The company's
  response afterward was substantive, not PR: it hired a Chief Diversity
  Officer, added trans-inclusive health coverage, and has held the Human
  Rights Campaign's top Corporate Equality Index score for 5+ years running.
  Kept as the original spec named it specifically, with this noted rather
  than silently dropped or silently kept.
- **Black beans → Bush's**, Goya avoided by name. Goya's CEO publicly praised
  Trump at the White House and at CPAC, which is the single clearest
  "heavy Republican ties" case in this list. Bush's is a century-old
  family-owned company with no comparable controversy found.
- **Other brand swaps**, same screening, lighter detail: shredded cheese →
  **Tillamook** (farmer cooperative, well-regarded); orange juice →
  **Florida's Natural** (grower-owned cooperative since 1933); teriyaki sauce
  → **Kikkoman** (no controversy found, long-standing category leader);
  tortillas → **Kroger-brand**, Mission/Gruma avoided (labor-misclassification
  lawsuits, a 2026 plant closure criticized for "profit ahead of people," and
  continued Russia operations post-2022 invasion); cream cheese and marinara
  → **Kroger-brand** (no specific concern, just defaulting to the
  no-political-footprint option where no standout alternative emerged);
  beef sticks → **Chomps** (B Corp certified, minority family-owned).
  Items with no brand named (eggs, chicken, salmon, produce, cottage
  cheese, string cheese, bagels, rice, taco seasoning, bulgogi sauce, salsa)
  weren't screened — no strong signal either way turned up, and inventing a
  brand claim without checking it would be worse than naming none.

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
accent (`--accent`, a leaf green), spent deliberately: the progress count,
the primary action button, and a checked item's checkbox fill (a standard,
expected state indicator, not decoration). It isn't sprinkled anywhere else —
section headers, borders, and secondary buttons stay neutral. A second accent
color is the fastest way to make this look generic — don't add one.

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
- `recipeTextParser.ts` is pattern-matching, not understanding. It handles
  recipes with a clear "Ingredients"/"Instructions" structure and "For the
  X:" sub-headers well; it does much worse on prose-style recipes with no
  structure, or ones where steps come before ingredients. The JSON-paste path
  in Settings (ask Claude in chat, paste the JSON) remains the more reliable
  option for messy text — the two are complementary, not a replacement for
  each other.

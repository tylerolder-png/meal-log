# Recipe JSON format

Paste this to an LLM (including Claude in chat) when asking it to write a new
recipe for Meal Log, then paste its output into **Settings → Import recipes**.

## Schema

A single recipe:

```ts
{
  id: string;              // lowercase-kebab-case, unique, e.g. "bulgogi-beef-bowl"
  name: string;
  tags: Array<"breakfast" | "dinner" | "snack" | "batch-cook">;
  servings: number;
  proteinPerServingG?: number;   // see "Nutrition numbers" below
  prepMinutes?: number;
  cookMinutes?: number;
  ingredients: Array<{
    name: string;
    quantity: { amount: number; unit: string } | { text: string };
    section: "Produce" | "Protein" | "Dairy" | "Frozen" |
             "Grab-and-go" | "Carbs/Bakery" | "Pantry" | "Other";
  }>;
  steps: string[];          // short, numbered-by-array-order, imperative
  notes?: string;
}
```

Import also accepts a JSON **array** of recipe objects in this shape, to add
several at once.

Use `{ "amount": number, "unit": string }` whenever a quantity has a real
number (e.g. `{ "amount": 2, "unit": "lb" }`). Fall back to `{ "text": "..." }`
only when there isn't a sensible number (e.g. `{ "text": "to taste" }` or
`{ "text": "cooked, to serve" }`) — text quantities don't scale when servings
change, so prefer a real number whenever one exists.

## Nutrition numbers

If you set `proteinPerServingG`, compute it from **cooked** protein density,
not raw weight — cooking concentrates protein per 100g because the ingredient
loses water (and fat, for meat) as it cooks. Ballpark cooked-protein
densities to use:

| Ingredient | Cooked protein |
|---|---|
| Ground turkey 93/7 | ~24g / 100g |
| Ground beef 90/10 | ~26g / 100g |
| Chicken breast or thigh | ~28-31g / 100g |
| Salmon | ~20-23g / 100g |
| Barilla Protein+ pasta | 10g / 2oz dry serving |
| Black beans (canned) | ~14g / cup drained |
| Greek yogurt (Oikos Pro style) | ~20g / cup |

Treat the result as a planning estimate, not a lab-verified number — say so
if asked, don't present it as precise.

## Brand names

If an ingredient names a brand, use the ones already picked in
`CLAUDE.md`'s "Brand sourcing notes" (e.g. ground beef is "Simple Truth
Organic 90/10 Ground Beef", not a generic "ground beef") — that keeps the
grocery-list dedupe working, since it matches on exact ingredient name. If a
new brand is genuinely needed, the screening criteria are: a real Kroger
package size, and no heavy partisan political spending or notable bad
corporate-conduct history. Don't invent a brand claim without checking it —
an unbranded, generic ingredient name is better than a fabricated one.

## Full example

```json
{
  "id": "bulgogi-beef-bowl",
  "name": "Bulgogi Beef Bowl",
  "tags": ["dinner", "batch-cook"],
  "servings": 4,
  "proteinPerServingG": 68,
  "prepMinutes": 10,
  "cookMinutes": 15,
  "ingredients": [
    { "name": "Simple Truth Organic 90/10 Ground Beef", "quantity": { "amount": 3, "unit": "lb" }, "section": "Protein" },
    { "name": "Bulgogi sauce", "quantity": { "amount": 0.75, "unit": "cup" }, "section": "Pantry" },
    { "name": "Jasmine rice", "quantity": { "text": "cooked, to serve" }, "section": "Carbs/Bakery" },
    { "name": "Spinach", "quantity": { "amount": 14, "unit": "oz" }, "section": "Frozen" },
    { "name": "Edamame", "quantity": { "amount": 1.5, "unit": "cups" }, "section": "Frozen" }
  ],
  "steps": [
    "Brown beef in a hot pan over medium-high, breaking it up, 7-9 min, until no pink remains (internal temp 160°F).",
    "Add bulgogi sauce, simmer 3-4 min until glazed.",
    "Microwave spinach and edamame per package, drain well.",
    "Serve over rice with the vegetables. Fried egg on top, optional."
  ],
  "notes": "Batch: brown the full 3 lb at once, split into 4 containers with rice and vegetables portioned per serving for the week."
}
```

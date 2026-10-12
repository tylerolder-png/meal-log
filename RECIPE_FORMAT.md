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

## Full example

```json
{
  "id": "bulgogi-beef-bowl",
  "name": "Bulgogi Beef Bowl",
  "tags": ["dinner", "batch-cook"],
  "servings": 3,
  "proteinPerServingG": 62,
  "prepMinutes": 10,
  "cookMinutes": 15,
  "ingredients": [
    { "name": "Lean ground beef 90/10", "quantity": { "amount": 2, "unit": "lb" }, "section": "Protein" },
    { "name": "Bulgogi sauce", "quantity": { "amount": 0.5, "unit": "cup" }, "section": "Pantry" },
    { "name": "Jasmine rice", "quantity": { "text": "cooked, to serve" }, "section": "Carbs/Bakery" },
    { "name": "Frozen spinach", "quantity": { "amount": 10, "unit": "oz" }, "section": "Frozen" },
    { "name": "Edamame", "quantity": { "amount": 1, "unit": "cup" }, "section": "Frozen" }
  ],
  "steps": [
    "Brown beef in a hot pan over medium-high, breaking it up, 5-6 min, until no pink remains (internal temp 160°F).",
    "Add bulgogi sauce, simmer 3-4 min until glazed.",
    "Microwave spinach and edamame per package, drain well.",
    "Serve over rice with the vegetables. Fried egg on top, optional."
  ],
  "notes": "Batch: brown the full 2 lb at once, split into 3 containers with rice and vegetables portioned per serving for the week."
}
```

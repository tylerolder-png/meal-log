import type { GroceryItem } from "../lib/types";

/**
 * The default grocery list — every item is a weekly staple, so
 * resetToStaples() and the first-run list are the same set.
 *
 * Brand picks below were screened on request: avoid companies with heavy
 * partisan ties or a bad corporate-conduct history, prefer well-regarded
 * ones, where a brand mention is warranted at all. The research behind each
 * pick is summarized in CLAUDE.md under "Brand sourcing notes" — read that
 * before changing a brand here, since the reasoning (not just the name)
 * is the point.
 *
 * storageNote is an item-specific tip, not a generic warning — if the only
 * thing worth saying is "fridge 1-2 days, then freeze," figure out the more
 * useful, differentiated version of that (portioning, what to do with the
 * leftover part, a real technique) rather than repeating the same line
 * across every raw-meat item with the noun swapped out.
 */
export const SEED_GROCERY_LIST: GroceryItem[] = [
  {
    id: "produce-bananas",
    name: "Bananas",
    quantityText: "5-7",
    section: "Produce",
    checked: false,
    staple: true,
    storageNote: "Going brown? Peel and freeze them — ready for smoothies or banana bread.",
  },
  { id: "produce-apples", name: "Apples or clementines", section: "Produce", checked: false, staple: true },
  { id: "produce-lemon", name: "Lemon", section: "Produce", checked: false, staple: true },

  {
    id: "protein-eggs",
    name: "Eggs",
    quantityText: "3 dozen",
    section: "Protein",
    checked: false,
    staple: true,
    storageNote: "Not sure if one's still good? Drop it in water — sinks and lies flat means fresh.",
  },
  {
    id: "protein-turkey",
    name: "Jennie-O 93/7 Ground Turkey",
    quantityText: "3 lb (3x 1 lb trays)",
    section: "Protein",
    checked: false,
    staple: true,
    storageNote: "Only cooking part of it tonight? Freeze the other trays flat, unopened — they thaw in under an hour.",
  },
  {
    id: "protein-beef",
    name: "Private Selection 90/10 Angus Ground Beef",
    quantityText: "3 lb pack",
    section: "Protein",
    checked: false,
    staple: true,
    storageNote: "Split into meal-size portions before freezing — easier to thaw just what you need, not all 3 lb.",
  },
  {
    id: "protein-chicken",
    name: "Chicken thighs or breast",
    quantityText: "~1.5 lb",
    section: "Protein",
    checked: false,
    staple: true,
    storageNote: "Raw poultry keeps 1-2 days in the fridge — freeze what you won't cook by then.",
  },
  {
    id: "protein-salmon",
    name: "Frozen salmon fillets",
    quantityText: "1 bag",
    section: "Protein",
    checked: false,
    staple: true,
    storageNote: "Thaw overnight in the fridge, not on the counter — safer, and the texture holds up better.",
  },
  {
    id: "protein-rotisserie",
    name: "Rotisserie chicken",
    quantityText: "1",
    section: "Protein",
    checked: false,
    staple: true,
    storageNote: "Don't toss the carcass — simmer it with water and veggie scraps for a free batch of stock.",
  },
  {
    id: "protein-turkey-sausage",
    name: "Turkey sausage links",
    quantityText: "1 package",
    section: "Protein",
    checked: false,
    staple: true,
    storageNote: "Freezing some? Lay them flat on a tray first so they don't fuse into one block in the bag.",
  },

  {
    id: "dairy-yogurt",
    name: "Greek yogurt (Oikos Pro)",
    quantityText: "~7",
    section: "Dairy",
    checked: false,
    staple: true,
    storageNote: "Liquid pooling on top is just whey — stir it back in, it hasn't gone bad.",
  },
  {
    id: "dairy-cottage-cheese",
    name: "Cottage cheese",
    section: "Dairy",
    checked: false,
    staple: true,
    storageNote: "Store the tub upside-down in the fridge once opened — slows spoilage, can add several days.",
  },
  {
    id: "dairy-shredded-cheese",
    name: "Tillamook Shredded Cheese",
    section: "Dairy",
    checked: false,
    staple: true,
    storageNote: "Squeeze the air out of the bag before resealing — less oxygen means slower mold growth.",
  },
  {
    id: "dairy-cream-cheese",
    name: "Kroger Cream Cheese",
    section: "Dairy",
    checked: false,
    staple: true,
    storageNote: "Not going to finish the block? It freezes fine for baking — texture gets grainy for spreading, though.",
  },
  { id: "dairy-oj", name: "Florida's Natural Orange Juice", section: "Dairy", checked: false, staple: true },

  { id: "frozen-broccoli", name: "Broccoli", section: "Frozen", checked: false, staple: true },
  { id: "frozen-spinach", name: "Spinach", section: "Frozen", checked: false, staple: true },
  { id: "frozen-pepper-onion", name: "Pepper/onion blend", section: "Frozen", checked: false, staple: true },
  { id: "frozen-stirfry", name: "Stir-fry vegetable mix", section: "Frozen", checked: false, staple: true },
  { id: "frozen-edamame", name: "Edamame", section: "Frozen", checked: false, staple: true },
  { id: "frozen-green-beans", name: "Green beans", section: "Frozen", checked: false, staple: true },

  { id: "grab-shakes", name: "Premier Protein shakes", section: "Grab-and-go", checked: false, staple: true },
  { id: "grab-jerky", name: "Chomps Beef Sticks", section: "Grab-and-go", checked: false, staple: true },
  { id: "grab-string-cheese", name: "String cheese", section: "Grab-and-go", checked: false, staple: true },

  {
    id: "carbs-bagels",
    name: "Cinnamon raisin bagels",
    section: "Carbs/Bakery",
    checked: false,
    staple: true,
    storageNote: "Won't eat them all in 4-5 days? Freeze the rest — they toast fine straight from frozen.",
  },
  {
    id: "carbs-rice",
    name: "Jasmine rice or microwave rice cups",
    section: "Carbs/Bakery",
    checked: false,
    staple: true,
    storageNote: "Cool cooked rice within an hour before refrigerating — left out too long, it's a real food-poisoning risk.",
  },
  { id: "carbs-protein-pasta", name: "Barilla Protein+ pasta", section: "Carbs/Bakery", checked: false, staple: true },
  {
    id: "carbs-tortillas",
    name: "Kroger Tortillas",
    section: "Carbs/Bakery",
    checked: false,
    staple: true,
    storageNote: "Freeze extras — a damp paper towel and 20 seconds in the microwave brings one back soft.",
  },

  { id: "pantry-black-beans", name: "Bush's Black Beans", quantityText: "2-3 cans", section: "Pantry", checked: false, staple: true },
  { id: "pantry-taco-seasoning", name: "Taco seasoning", section: "Pantry", checked: false, staple: true },
  { id: "pantry-bulgogi", name: "Bulgogi sauce", section: "Pantry", checked: false, staple: true },
  { id: "pantry-teriyaki", name: "Kikkoman Teriyaki Sauce", section: "Pantry", checked: false, staple: true },
  { id: "pantry-marinara", name: "Kroger Marinara", section: "Pantry", checked: false, staple: true },
  { id: "pantry-salsa", name: "Salsa", section: "Pantry", checked: false, staple: true },
];

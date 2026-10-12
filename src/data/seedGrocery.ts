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
 */
export const SEED_GROCERY_LIST: GroceryItem[] = [
  { id: "produce-bananas", name: "Bananas", quantityText: "5-7", section: "Produce", checked: false, staple: true },
  { id: "produce-apples", name: "Apples or clementines", section: "Produce", checked: false, staple: true },
  { id: "produce-lemon", name: "Lemon", section: "Produce", checked: false, staple: true },

  { id: "protein-eggs", name: "Eggs", quantityText: "3 dozen", section: "Protein", checked: false, staple: true },
  {
    id: "protein-turkey",
    name: "Jennie-O 93/7 Ground Turkey",
    quantityText: "3 lb (3x 1 lb trays)",
    section: "Protein",
    checked: false,
    staple: true,
  },
  {
    id: "protein-beef",
    name: "Private Selection 90/10 Angus Ground Beef",
    quantityText: "3 lb pack",
    section: "Protein",
    checked: false,
    staple: true,
  },
  { id: "protein-chicken", name: "Chicken thighs or breast", quantityText: "~1.5 lb", section: "Protein", checked: false, staple: true },
  { id: "protein-salmon", name: "Frozen salmon fillets", quantityText: "1 bag", section: "Protein", checked: false, staple: true },
  { id: "protein-rotisserie", name: "Rotisserie chicken", quantityText: "1", section: "Protein", checked: false, staple: true },
  { id: "protein-turkey-sausage", name: "Turkey sausage links", section: "Protein", checked: false, staple: true },

  { id: "dairy-yogurt", name: "Greek yogurt (Oikos Pro)", quantityText: "~7", section: "Dairy", checked: false, staple: true },
  { id: "dairy-cottage-cheese", name: "Cottage cheese", section: "Dairy", checked: false, staple: true },
  { id: "dairy-shredded-cheese", name: "Tillamook Shredded Cheese", section: "Dairy", checked: false, staple: true },
  { id: "dairy-cream-cheese", name: "Kroger Cream Cheese", section: "Dairy", checked: false, staple: true },
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

  { id: "carbs-bagels", name: "Cinnamon raisin bagels", section: "Carbs/Bakery", checked: false, staple: true },
  { id: "carbs-rice", name: "Jasmine rice or microwave rice cups", section: "Carbs/Bakery", checked: false, staple: true },
  { id: "carbs-protein-pasta", name: "Barilla Protein+ pasta", section: "Carbs/Bakery", checked: false, staple: true },
  { id: "carbs-tortillas", name: "Kroger Tortillas", section: "Carbs/Bakery", checked: false, staple: true },

  { id: "pantry-black-beans", name: "Bush's Black Beans", quantityText: "2-3 cans", section: "Pantry", checked: false, staple: true },
  { id: "pantry-taco-seasoning", name: "Taco seasoning", section: "Pantry", checked: false, staple: true },
  { id: "pantry-bulgogi", name: "Bulgogi sauce", section: "Pantry", checked: false, staple: true },
  { id: "pantry-teriyaki", name: "Kikkoman Teriyaki Sauce", section: "Pantry", checked: false, staple: true },
  { id: "pantry-marinara", name: "Kroger Marinara", section: "Pantry", checked: false, staple: true },
  { id: "pantry-salsa", name: "Salsa", section: "Pantry", checked: false, staple: true },
];

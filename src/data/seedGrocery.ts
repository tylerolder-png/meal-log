import type { GroceryItem } from "../lib/types";

/**
 * The default grocery list — every item is a weekly staple, so
 * resetToStaples() and the first-run list are the same set.
 */
export const SEED_GROCERY_LIST: GroceryItem[] = [
  { id: "produce-bananas", name: "Bananas", quantityText: "5-7", section: "Produce", checked: false, staple: true },
  { id: "produce-apples", name: "Apples or clementines", section: "Produce", checked: false, staple: true },
  { id: "produce-lemon", name: "Lemon", section: "Produce", checked: false, staple: true },

  { id: "protein-eggs", name: "Eggs", quantityText: "3 dozen", section: "Protein", checked: false, staple: true },
  { id: "protein-turkey", name: "Ground turkey 93/7", quantityText: "2 lb", section: "Protein", checked: false, staple: true },
  { id: "protein-beef", name: "Lean ground beef 90/10", quantityText: "2 lb", section: "Protein", checked: false, staple: true },
  { id: "protein-chicken", name: "Chicken thighs or breast", quantityText: "~1.5 lb", section: "Protein", checked: false, staple: true },
  { id: "protein-salmon", name: "Frozen salmon fillets", quantityText: "1 bag", section: "Protein", checked: false, staple: true },
  { id: "protein-rotisserie", name: "Rotisserie chicken", quantityText: "1", section: "Protein", checked: false, staple: true },
  { id: "protein-turkey-sausage", name: "Turkey sausage links", section: "Protein", checked: false, staple: true },

  { id: "dairy-yogurt", name: "Greek yogurt (Oikos Pro)", quantityText: "~7", section: "Dairy", checked: false, staple: true },
  { id: "dairy-cottage-cheese", name: "Cottage cheese", section: "Dairy", checked: false, staple: true },
  { id: "dairy-shredded-cheese", name: "Shredded cheese", section: "Dairy", checked: false, staple: true },
  { id: "dairy-cream-cheese", name: "Cream cheese", section: "Dairy", checked: false, staple: true },
  { id: "dairy-oj", name: "Orange juice", section: "Dairy", checked: false, staple: true },

  { id: "frozen-broccoli", name: "Broccoli", section: "Frozen", checked: false, staple: true },
  { id: "frozen-spinach", name: "Spinach", section: "Frozen", checked: false, staple: true },
  { id: "frozen-pepper-onion", name: "Pepper/onion blend", section: "Frozen", checked: false, staple: true },
  { id: "frozen-stirfry", name: "Stir-fry vegetable mix", section: "Frozen", checked: false, staple: true },
  { id: "frozen-edamame", name: "Edamame", section: "Frozen", checked: false, staple: true },
  { id: "frozen-green-beans", name: "Green beans", section: "Frozen", checked: false, staple: true },

  { id: "grab-shakes", name: "Protein shakes (Core Power or Premier)", section: "Grab-and-go", checked: false, staple: true },
  { id: "grab-jerky", name: "Beef sticks or jerky", section: "Grab-and-go", checked: false, staple: true },
  { id: "grab-string-cheese", name: "String cheese", section: "Grab-and-go", checked: false, staple: true },

  { id: "carbs-bagels", name: "Cinnamon raisin bagels", section: "Carbs/Bakery", checked: false, staple: true },
  { id: "carbs-rice", name: "Jasmine rice or microwave rice cups", section: "Carbs/Bakery", checked: false, staple: true },
  { id: "carbs-protein-pasta", name: "Barilla Protein+ pasta", section: "Carbs/Bakery", checked: false, staple: true },
  { id: "carbs-tortillas", name: "Tortillas", section: "Carbs/Bakery", checked: false, staple: true },

  { id: "pantry-black-beans", name: "Black beans", quantityText: "2-3 cans", section: "Pantry", checked: false, staple: true },
  { id: "pantry-taco-seasoning", name: "Taco seasoning", section: "Pantry", checked: false, staple: true },
  { id: "pantry-bulgogi", name: "Bulgogi sauce", section: "Pantry", checked: false, staple: true },
  { id: "pantry-teriyaki", name: "Teriyaki sauce", section: "Pantry", checked: false, staple: true },
  { id: "pantry-marinara", name: "Marinara", section: "Pantry", checked: false, staple: true },
  { id: "pantry-salsa", name: "Salsa", section: "Pantry", checked: false, staple: true },
];

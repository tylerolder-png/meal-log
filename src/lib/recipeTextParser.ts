import type { NewRecipe } from "./recipes";
import type { RecipeIngredient, Section } from "./types";

/**
 * Heuristic, offline parser for a pasted recipe — no AI, no network call.
 * It never throws and never guesses a grocery `section` (always "Other";
 * section can't be inferred from text alone) — the result is meant to be
 * reviewed and fixed in RecipeForm before saving, not saved unreviewed.
 * Works best on recipes with a clear "Ingredients" block and an
 * "Instructions"/"Directions" block, which covers most recipe sites and
 * most hand-written recipes. Messier text falls back to one ingredient
 * per line as free text and no steps — still useful as a starting point.
 */

const INGREDIENTS_HEADER = /^(ingredients?|you'll need|what you(?:'ll)? need)\s*:?\s*$/i;
const STEPS_HEADER = /^(instructions?|directions?|steps?|method|preparation)\s*:?\s*$/i;
const NOTES_HEADER = /^(notes?|tips?)\s*:?\s*$/i;

const SERVINGS_RE = /\b(?:serves|servings?|yields?)\s*:?\s*(\d+)/i;
const PREP_RE = /\bprep(?:\s*time)?\s*:?\s*(\d+)\s*(?:min|minutes)?/i;
const COOK_RE = /\bcook(?:\s*time)?\s*:?\s*(\d+)\s*(?:min|minutes)?/i;

const UNICODE_FRACTIONS: Record<string, number> = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

const UNIT_WORDS = new Set([
  "lb", "lbs", "pound", "pounds",
  "oz", "ounce", "ounces",
  "g", "gram", "grams", "kg",
  "cup", "cups",
  "tbsp", "tablespoon", "tablespoons",
  "tsp", "teaspoon", "teaspoons",
  "clove", "cloves",
  "can", "cans",
  "packet", "packets",
  "slice", "slices",
  "piece", "pieces",
  "stalk", "stalks",
  "pinch", "pinches",
  "dash", "dashes",
  "bunch", "bunches",
  "sprig", "sprigs",
  "head", "heads",
  "stick", "sticks",
  "whole",
  "ml", "l", "liter", "liters",
]);

export function parseRecipeText(text: string): NewRecipe {
  const nonEmpty = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  if (nonEmpty.length === 0) {
    return { name: "", tags: [], servings: 4, ingredients: [], steps: [] };
  }

  let name = "";
  let startIndex = 0;
  const first = nonEmpty[0]!;
  if (!INGREDIENTS_HEADER.test(first) && !STEPS_HEADER.test(first)) {
    name = first.replace(/^(recipe|title)\s*:\s*/i, "").trim();
    startIndex = 1;
  }

  const servingsMatch = text.match(SERVINGS_RE);
  const prepMatch = text.match(PREP_RE);
  const cookMatch = text.match(COOK_RE);

  let current: "ingredients" | "steps" | "notes" = "ingredients";
  let group: string | undefined;
  const ingredientLines: { text: string; group: string | undefined }[] = [];
  const stepLines: string[] = [];
  const noteLines: string[] = [];

  for (const line of nonEmpty.slice(startIndex)) {
    if (INGREDIENTS_HEADER.test(line)) {
      current = "ingredients";
      group = undefined;
      continue;
    }
    if (STEPS_HEADER.test(line)) {
      current = "steps";
      continue;
    }
    if (NOTES_HEADER.test(line)) {
      current = "notes";
      continue;
    }
    if (SERVINGS_RE.test(line) || PREP_RE.test(line) || COOK_RE.test(line)) continue;

    if (current === "ingredients") {
      if (isGroupHeader(line)) {
        group = groupLabel(line);
        continue;
      }
      ingredientLines.push({ text: line, group });
    } else if (current === "steps") {
      const cleaned = cleanStepLine(line);
      if (cleaned !== "") stepLines.push(cleaned);
    } else {
      noteLines.push(line);
    }
  }

  return {
    name,
    tags: [],
    servings: servingsMatch ? Number(servingsMatch[1]) : 4,
    prepMinutes: prepMatch ? Number(prepMatch[1]) : undefined,
    cookMinutes: cookMatch ? Number(cookMatch[1]) : undefined,
    ingredients: ingredientLines.map(({ text, group }) => parseIngredientLine(text, group)),
    steps: stepLines,
    notes: noteLines.length > 0 ? noteLines.join(" ") : undefined,
  };
}

function isGroupHeader(line: string): boolean {
  return line.endsWith(":") && !/\d/.test(line) && line.length < 40;
}

function groupLabel(line: string): string {
  return line
    .replace(/:$/, "")
    .replace(/^for\s+(the\s+)?/i, "")
    .trim();
}

function cleanStepLine(line: string): string {
  return line.replace(/^(?:step\s*\d+\s*[:.)-]?|\d+[.)]|[-*•])\s*/i, "").trim();
}

function parseIngredientLine(line: string, group: string | undefined): RecipeIngredient {
  const cleaned = line.replace(/^[-*•]\s*/, "").trim();
  const section: Section = "Other";

  const parsed = parseLeadingAmount(cleaned);
  if (parsed) {
    const restTrimmed = parsed.rest.trim();
    const unitMatch = restTrimmed.match(/^([a-zA-Z]+)\.?\s+(.*)$/);
    const unitWord = unitMatch?.[1]?.toLowerCase();
    if (unitMatch && unitWord && UNIT_WORDS.has(unitWord)) {
      const ingredientName = unitMatch[2]!.replace(/^of\s+/i, "").trim();
      if (ingredientName !== "") {
        return { name: ingredientName, quantity: { amount: parsed.amount, unit: unitMatch[1]! }, section, group };
      }
    }
  }

  // No leading number, or no recognized unit after it (e.g. "2 eggs", "Salt
  // and pepper to taste") — keep the whole line as free text rather than
  // guess. Matches the existing convention for bare-count ingredients
  // elsewhere in the seed data (e.g. "1 piece of fruit").
  return { name: cleaned, quantity: { text: cleaned }, section, group };
}

function parseLeadingAmount(line: string): { amount: number; rest: string } | null {
  let m = line.match(/^(\d+)\s+(\d+)\/(\d+)\s+(.*)$/);
  if (m) return { amount: Number(m[1]) + Number(m[2]) / Number(m[3]), rest: m[4]! };

  m = line.match(/^(\d+)\/(\d+)\s+(.*)$/);
  if (m) return { amount: Number(m[1]) / Number(m[2]), rest: m[3]! };

  m = line.match(/^([¼½¾⅓⅔⅛⅜⅝⅞])\s*(.*)$/);
  if (m && m[1]! in UNICODE_FRACTIONS) return { amount: UNICODE_FRACTIONS[m[1]!]!, rest: m[2]! };

  m = line.match(/^(\d+(?:\.\d+)?)\s+(.*)$/);
  if (m) return { amount: Number(m[1]), rest: m[2]! };

  return null;
}

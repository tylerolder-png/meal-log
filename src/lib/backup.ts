import type { GroceryItem, Recipe, Settings } from "./types";

export const BACKUP_VERSION = 1;

export interface Backup {
  version: number;
  exportedAt: string;
  groceryList: GroceryItem[];
  recipes: Recipe[];
  settings: Settings;
}

export function buildBackup(groceryList: GroceryItem[], recipes: Recipe[], settings: Settings): Backup {
  return { version: BACKUP_VERSION, exportedAt: new Date().toISOString(), groceryList, recipes, settings };
}

/**
 * Throws with a message meant to be shown directly to the user — a failed
 * import needs to say what's wrong, not fail silently or with a raw parse
 * error.
 */
export function parseBackup(json: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  if (typeof data !== "object" || data === null) {
    throw new Error("That file doesn't look like a Meal Log backup.");
  }
  const candidate = data as Partial<Backup>;

  if (candidate.version !== BACKUP_VERSION) {
    throw new Error(`Unrecognized backup version (expected ${BACKUP_VERSION}).`);
  }
  if (!Array.isArray(candidate.groceryList)) {
    throw new Error("Backup is missing the grocery list.");
  }
  if (!Array.isArray(candidate.recipes)) {
    throw new Error("Backup is missing recipes.");
  }
  if (typeof candidate.settings !== "object" || candidate.settings === null) {
    throw new Error("Backup is missing settings.");
  }

  return candidate as Backup;
}

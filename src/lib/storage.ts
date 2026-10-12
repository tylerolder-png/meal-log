import type { GroceryItem, Recipe, Settings } from "./types";

const GROCERY_KEY = "meallog:grocery:v1";
const RECIPES_KEY = "meallog:recipes:v1";
const SETTINGS_KEY = "meallog:settings:v1";

interface Versioned<T> {
  version: number;
  data: T;
}

const GROCERY_VERSION = 1;
const RECIPES_VERSION = 1;
const SETTINGS_VERSION = 1;

export interface MealLogStore {
  loadGroceryList(): Promise<GroceryItem[] | null>;
  saveGroceryList(items: GroceryItem[]): Promise<void>;
  loadRecipes(): Promise<Recipe[] | null>;
  saveRecipes(recipes: Recipe[]): Promise<void>;
  loadSettings(): Promise<Settings | null>;
  saveSettings(settings: Settings): Promise<void>;
}

/**
 * Browser-local persistence. Swapping in a server or cross-device sync later
 * means implementing this interface, not touching a component or hook.
 */
export const localStore: MealLogStore = {
  async loadGroceryList() {
    return readVersioned<GroceryItem[]>(GROCERY_KEY, migrateGrocery);
  },
  async saveGroceryList(items) {
    write(GROCERY_KEY, { version: GROCERY_VERSION, data: items });
  },
  async loadRecipes() {
    return readVersioned<Recipe[]>(RECIPES_KEY, migrateRecipes);
  },
  async saveRecipes(recipes) {
    write(RECIPES_KEY, { version: RECIPES_VERSION, data: recipes });
  },
  async loadSettings() {
    return readVersioned<Settings>(SETTINGS_KEY, migrateSettings);
  },
  async saveSettings(settings) {
    write(SETTINGS_KEY, { version: SETTINGS_VERSION, data: settings });
  },
};

/** In-memory store for tests and for environments without localStorage. */
export function createMemoryStore(): MealLogStore {
  let grocery: GroceryItem[] | null = null;
  let recipes: Recipe[] | null = null;
  let settings: Settings | null = null;
  return {
    async loadGroceryList() {
      return grocery;
    },
    async saveGroceryList(items) {
      grocery = items;
    },
    async loadRecipes() {
      return recipes;
    },
    async saveRecipes(next) {
      recipes = next;
    },
    async loadSettings() {
      return settings;
    },
    async saveSettings(next) {
      settings = next;
    },
  };
}

/**
 * Each domain's migrate() is identity at its current version — there's
 * nothing to upgrade from yet. The seam exists so a future version bump is
 * a one-function addition here, not a rework of storage.ts's shape.
 */
function migrateGrocery(version: number, data: unknown): GroceryItem[] {
  if (version === GROCERY_VERSION) return data as GroceryItem[];
  throw new Error(`Unknown grocery list schema version: ${version}`);
}

function migrateRecipes(version: number, data: unknown): Recipe[] {
  if (version === RECIPES_VERSION) return data as Recipe[];
  throw new Error(`Unknown recipes schema version: ${version}`);
}

function migrateSettings(version: number, data: unknown): Settings {
  if (version === SETTINGS_VERSION) return data as Settings;
  throw new Error(`Unknown settings schema version: ${version}`);
}

function readVersioned<T>(key: string, migrate: (version: number, data: unknown) => T): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Versioned<unknown>>;
    if (typeof parsed.version !== "number") return null;
    return migrate(parsed.version, parsed.data);
  } catch {
    return null;
  }
}

function write(key: string, value: Versioned<unknown>): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing or a full quota. Non-fatal: state stays in memory.
  }
}

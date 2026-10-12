import { SECTION_ORDER, type GroceryItem, type Section } from "./types";

export interface NewGroceryItem {
  name: string;
  quantityText?: string;
  section: Section;
  staple?: boolean;
}

export function addItem(list: GroceryItem[], input: NewGroceryItem): GroceryItem[] {
  const item: GroceryItem = {
    id: crypto.randomUUID(),
    name: input.name,
    quantityText: input.quantityText,
    section: input.section,
    checked: false,
    staple: input.staple ?? false,
  };
  return [...list, item];
}

export function editItem(list: GroceryItem[], id: string, patch: Partial<NewGroceryItem>): GroceryItem[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function deleteItem(list: GroceryItem[], id: string): GroceryItem[] {
  return list.filter((item) => item.id !== id);
}

export function toggleItem(list: GroceryItem[], id: string): GroceryItem[] {
  return list.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item));
}

/** Unchecks everything in place; ad-hoc items added for the trip stay in the list. */
export function newTrip(list: GroceryItem[]): GroceryItem[] {
  return list.map((item) => ({ ...item, checked: false }));
}

/**
 * Replaces the whole list with the seed staples, unchecked — discarding any
 * ad-hoc items this trip added. Distinct from newTrip(), which only
 * unchecks what's already there.
 */
export function resetToStaples(seedStaples: GroceryItem[]): GroceryItem[] {
  return seedStaples.map((item) => ({ ...item, checked: false }));
}

export function progressCount(list: GroceryItem[]): { checked: number; total: number } {
  return { checked: list.filter((item) => item.checked).length, total: list.length };
}

/**
 * Store-walk order (SECTION_ORDER), then unchecked before checked within
 * each section — checked items sink to the bottom but don't otherwise
 * reorder. Array.prototype.sort is stable, so relative order within each
 * (section, checked) bucket is preserved from the input.
 */
export function sortForDisplay(list: GroceryItem[]): GroceryItem[] {
  return [...list].sort((a, b) => {
    const sectionDiff = SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section);
    if (sectionDiff !== 0) return sectionDiff;
    return Number(a.checked) - Number(b.checked);
  });
}

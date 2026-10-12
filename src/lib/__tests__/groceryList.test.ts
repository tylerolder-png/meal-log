import { describe, expect, it } from "vitest";
import {
  addItem,
  deleteItem,
  editItem,
  newTrip,
  progressCount,
  resetToStaples,
  sortForDisplay,
  toggleItem,
} from "../groceryList";
import type { GroceryItem } from "../types";

function item(overrides: Partial<GroceryItem>): GroceryItem {
  return {
    id: "x",
    name: "Thing",
    section: "Other",
    checked: false,
    staple: false,
    ...overrides,
  };
}

describe("addItem", () => {
  it("appends a new unchecked item with a generated id", () => {
    const result = addItem([], { name: "Eggs", section: "Protein", quantityText: "1 dozen" });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ name: "Eggs", section: "Protein", checked: false, staple: false });
    expect(result[0]!.id).toBeTruthy();
  });

  it("defaults staple to false when not specified", () => {
    const [added] = addItem([], { name: "Eggs", section: "Protein" });
    expect(added!.staple).toBe(false);
  });

  it("carries a storageNote through when given", () => {
    const [added] = addItem([], { name: "Ground turkey", section: "Protein", storageNote: "Freeze if not cooking within 2 days" });
    expect(added!.storageNote).toBe("Freeze if not cooking within 2 days");
  });
});

describe("editItem", () => {
  it("patches only the matching item", () => {
    const list = [item({ id: "1", name: "Eggs" }), item({ id: "2", name: "Milk" })];
    const result = editItem(list, "1", { name: "Brown eggs" });
    expect(result.find((i) => i.id === "1")?.name).toBe("Brown eggs");
    expect(result.find((i) => i.id === "2")?.name).toBe("Milk");
  });
});

describe("deleteItem", () => {
  it("removes the matching item", () => {
    const list = [item({ id: "1" }), item({ id: "2" })];
    expect(deleteItem(list, "1").map((i) => i.id)).toEqual(["2"]);
  });
});

describe("toggleItem", () => {
  it("flips checked on the matching item only", () => {
    const list = [item({ id: "1", checked: false }), item({ id: "2", checked: false })];
    const result = toggleItem(list, "1");
    expect(result.find((i) => i.id === "1")?.checked).toBe(true);
    expect(result.find((i) => i.id === "2")?.checked).toBe(false);
  });
});

describe("newTrip", () => {
  it("unchecks every item but keeps them all", () => {
    const list = [item({ id: "1", checked: true }), item({ id: "2", checked: true })];
    const result = newTrip(list);
    expect(result).toHaveLength(2);
    expect(result.every((i) => !i.checked)).toBe(true);
  });
});

describe("resetToStaples", () => {
  it("replaces the list with the given staples, unchecked", () => {
    const staples = [item({ id: "s1", staple: true, checked: true })];
    const result = resetToStaples(staples);
    expect(result).toEqual([{ ...staples[0], checked: false }]);
  });
});

describe("progressCount", () => {
  it("counts checked out of total", () => {
    const list = [item({ checked: true }), item({ checked: false }), item({ checked: true })];
    expect(progressCount(list)).toEqual({ checked: 2, total: 3 });
  });
});

describe("sortForDisplay", () => {
  it("orders by SECTION_ORDER, then sinks checked items within a section", () => {
    const list = [
      item({ id: "a", name: "Bananas", section: "Produce", checked: true }),
      item({ id: "b", name: "Eggs", section: "Protein", checked: false }),
      item({ id: "c", name: "Apples", section: "Produce", checked: false }),
    ];
    const result = sortForDisplay(list).map((i) => i.id);
    // Produce comes before Protein; within Produce, unchecked (c) before checked (a).
    expect(result).toEqual(["c", "a", "b"]);
  });

  it("does not mutate the input array", () => {
    const list = [item({ id: "a", section: "Pantry" }), item({ id: "b", section: "Produce" })];
    const copy = [...list];
    sortForDisplay(list);
    expect(list).toEqual(copy);
  });
});

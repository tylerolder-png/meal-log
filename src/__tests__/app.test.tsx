/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "../App";

beforeEach(() => {
  localStorage.clear();
});

describe("adding a recipe's ingredients to the grocery list", () => {
  it("merges into the existing list instead of duplicating staples already on it", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("tab", { name: "Recipes" }));
    await user.click(await screen.findByText("Classic Protein Breakfast"));
    await user.click(await screen.findByText("Add ingredients to grocery list"));

    expect(await screen.findByText(/Added Classic Protein Breakfast's ingredients/)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Grocery" }));

    // The recipe's "Eggs", "Kroger Cream Cheese", and "Florida's Natural
    // Orange Juice" ingredients name-match existing staples exactly — the
    // merge should skip them (dedupe), not add second lines.
    expect(screen.getAllByText("Eggs")).toHaveLength(1);
    expect(screen.getAllByText("Kroger Cream Cheese")).toHaveLength(1);
    expect(screen.getAllByText("Florida's Natural Orange Juice")).toHaveLength(1);
    // "Cinnamon raisin bagels" isn't a staple - this is the one new line the merge should add.
    expect(screen.getByText("Cinnamon raisin bagels")).toBeInTheDocument();
  });
});

describe("checking off a grocery item", () => {
  it("persists through the store across a remount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    const checkbox = await screen.findByRole("checkbox", { name: "Check Eggs" });
    await user.click(checkbox);
    expect(checkbox).toHaveAttribute("aria-checked", "true");

    unmount();
    render(<App />);

    expect(await screen.findByRole("checkbox", { name: "Uncheck Eggs" })).toHaveAttribute("aria-checked", "true");
  });
});

describe("importing recipes via pasted JSON", () => {
  const validRecipe = JSON.stringify({
    id: "test-pasted-recipe",
    name: "Pasted Test Recipe",
    tags: ["snack"],
    servings: 1,
    ingredients: [{ name: "Test Ingredient", quantity: { amount: 1, unit: "whole" }, section: "Other" }],
    steps: ["Do the thing."],
  });

  it("adds a validly-shaped pasted recipe to the recipe list", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("tab", { name: "Settings" }));
    const textarea = await screen.findByPlaceholderText("Paste recipe JSON here");
    await user.click(textarea);
    await user.paste(validRecipe);
    await user.click(screen.getByRole("button", { name: "Preview" }));
    await user.click(await screen.findByRole("button", { name: /Import 1 recipe/ }));

    await user.click(screen.getByRole("tab", { name: "Recipes" }));
    expect(await screen.findByText("Pasted Test Recipe")).toBeInTheDocument();
  });

  it("shows a user-facing error instead of crashing on malformed JSON", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("tab", { name: "Settings" }));
    const textarea = await screen.findByPlaceholderText("Paste recipe JSON here");
    await user.click(textarea);
    await user.paste("{not valid json");
    await user.click(screen.getByRole("button", { name: "Preview" }));

    expect(await screen.findByText(/isn't valid JSON/)).toBeInTheDocument();
    // Still on the settings screen, nothing crashed.
    expect(screen.getByRole("tab", { name: "Settings" })).toHaveAttribute("aria-selected", "true");
  });
});

afterEach(() => {
  localStorage.clear();
});

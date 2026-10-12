import { useState, type FormEvent } from "react";
import type { NewRecipe } from "../lib/recipes";
import { RECIPE_TAGS, SECTION_ORDER, type RecipeIngredient, type RecipeTag, type Section } from "../lib/types";

interface IngredientDraft {
  name: string;
  quantityKind: "amount" | "text";
  amount: string;
  unit: string;
  text: string;
  section: Section;
  group: string;
}

function toDraft(ingredient: RecipeIngredient): IngredientDraft {
  const group = ingredient.group ?? "";
  if ("amount" in ingredient.quantity) {
    return {
      name: ingredient.name,
      quantityKind: "amount",
      amount: String(ingredient.quantity.amount),
      unit: ingredient.quantity.unit,
      text: "",
      section: ingredient.section,
      group,
    };
  }
  return {
    name: ingredient.name,
    quantityKind: "text",
    amount: "",
    unit: "",
    text: ingredient.quantity.text,
    section: ingredient.section,
    group,
  };
}

const EMPTY_INGREDIENT: IngredientDraft = {
  name: "",
  quantityKind: "amount",
  amount: "",
  unit: "",
  text: "",
  section: "Other",
  group: "",
};

interface Props {
  /** A full saved Recipe (editing) or a parser/draft NewRecipe (reviewing a pasted recipe) — both work, id/isDefault are simply ignored. */
  initial?: NewRecipe;
  /** Caller states the heading explicitly — "has initial data" doesn't by itself mean "editing an existing recipe" (a parsed-but-unsaved draft also has initial data). */
  title: string;
  onSave: (input: NewRecipe) => void;
  onCancel: () => void;
}

export function RecipeForm({ initial, title, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [tags, setTags] = useState<Set<RecipeTag>>(new Set(initial?.tags ?? []));
  const [servings, setServings] = useState(String(initial?.servings ?? 2));
  const [proteinPerServingG, setProteinPerServingG] = useState(
    initial?.proteinPerServingG !== undefined ? String(initial.proteinPerServingG) : "",
  );
  const [prepMinutes, setPrepMinutes] = useState(initial?.prepMinutes !== undefined ? String(initial.prepMinutes) : "");
  const [cookMinutes, setCookMinutes] = useState(initial?.cookMinutes !== undefined ? String(initial.cookMinutes) : "");
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(
    initial ? initial.ingredients.map(toDraft) : [{ ...EMPTY_INGREDIENT }],
  );
  const [stepsText, setStepsText] = useState(initial?.steps.join("\n") ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState("");

  function toggleTag(tag: RecipeTag) {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function updateIngredient(index: number, patch: Partial<IngredientDraft>) {
    setIngredients((prev) => prev.map((ing, i) => (i === index ? { ...ing, ...patch } : ing)));
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    const servingsNum = Number(servings);
    const steps = stepsText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s !== "");
    const cleanIngredients = ingredients.filter((ing) => ing.name.trim() !== "");

    if (trimmedName === "") return setError("Name is required.");
    if (!Number.isFinite(servingsNum) || servingsNum <= 0) return setError("Servings must be a positive number.");
    if (cleanIngredients.length === 0) return setError("Add at least one ingredient.");
    if (steps.length === 0) return setError("Add at least one step.");

    for (const ing of cleanIngredients) {
      if (ing.quantityKind === "amount" && (ing.amount.trim() === "" || ing.unit.trim() === "")) {
        return setError(`"${ing.name}" needs both an amount and a unit, or switch it to free text.`);
      }
      if (ing.quantityKind === "text" && ing.text.trim() === "") {
        return setError(`"${ing.name}" needs quantity text.`);
      }
    }

    onSave({
      name: trimmedName,
      tags: [...tags],
      servings: servingsNum,
      proteinPerServingG: proteinPerServingG.trim() === "" ? undefined : Number(proteinPerServingG),
      prepMinutes: prepMinutes.trim() === "" ? undefined : Number(prepMinutes),
      cookMinutes: cookMinutes.trim() === "" ? undefined : Number(cookMinutes),
      ingredients: cleanIngredients.map((ing) => ({
        name: ing.name.trim(),
        section: ing.section,
        quantity:
          ing.quantityKind === "amount"
            ? { amount: Number(ing.amount), unit: ing.unit.trim() }
            : { text: ing.text.trim() },
        group: ing.group.trim() === "" ? undefined : ing.group.trim(),
      })),
      steps,
      notes: notes.trim() === "" ? undefined : notes.trim(),
    });
  }

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <h1 className="recipe-form__title">{title}</h1>

      {error && <p className="recipe-form__error">{error}</p>}

      <label className="recipe-form__field">
        <span>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <div className="recipe-form__tags">
        {RECIPE_TAGS.map((tag) => (
          <label key={tag} className={`tag-chip tag-chip--checkbox ${tags.has(tag) ? "is-on" : ""}`}>
            <input type="checkbox" checked={tags.has(tag)} onChange={() => toggleTag(tag)} />
            {tag}
          </label>
        ))}
      </div>

      <div className="recipe-form__row">
        <label className="recipe-form__field">
          <span>Servings</span>
          <input type="number" min={1} value={servings} onChange={(e) => setServings(e.target.value)} />
        </label>
        <label className="recipe-form__field">
          <span>Protein/serving (g)</span>
          <input
            type="number"
            min={0}
            value={proteinPerServingG}
            onChange={(e) => setProteinPerServingG(e.target.value)}
          />
        </label>
      </div>

      <div className="recipe-form__row">
        <label className="recipe-form__field">
          <span>Prep (min)</span>
          <input type="number" min={0} value={prepMinutes} onChange={(e) => setPrepMinutes(e.target.value)} />
        </label>
        <label className="recipe-form__field">
          <span>Cook (min)</span>
          <input type="number" min={0} value={cookMinutes} onChange={(e) => setCookMinutes(e.target.value)} />
        </label>
      </div>

      <h2 className="recipe-form__section-title">Ingredients</h2>
      {ingredients.map((ing, i) => (
        <div key={i} className="recipe-form__ingredient">
          <input
            className="recipe-form__ingredient-name"
            placeholder="Ingredient name"
            value={ing.name}
            onChange={(e) => updateIngredient(i, { name: e.target.value })}
          />
          <input
            className="recipe-form__ingredient-group"
            placeholder="Group (optional, e.g. Sauce)"
            value={ing.group}
            onChange={(e) => updateIngredient(i, { group: e.target.value })}
          />
          <select
            className="recipe-form__ingredient-section"
            value={ing.section}
            onChange={(e) => updateIngredient(i, { section: e.target.value as Section })}
          >
            {SECTION_ORDER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="recipe-form__quantity">
            <select
              value={ing.quantityKind}
              onChange={(e) => updateIngredient(i, { quantityKind: e.target.value as "amount" | "text" })}
            >
              <option value="amount">Amount</option>
              <option value="text">Free text</option>
            </select>
            {ing.quantityKind === "amount" ? (
              <>
                <input
                  placeholder="Amount"
                  value={ing.amount}
                  onChange={(e) => updateIngredient(i, { amount: e.target.value })}
                />
                <input
                  placeholder="Unit"
                  value={ing.unit}
                  onChange={(e) => updateIngredient(i, { unit: e.target.value })}
                />
              </>
            ) : (
              <input
                placeholder="e.g. to taste"
                value={ing.text}
                onChange={(e) => updateIngredient(i, { text: e.target.value })}
              />
            )}
          </div>
          <button type="button" className="recipe-form__remove-ingredient" onClick={() => removeIngredient(i)}>
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="recipe-form__add-ingredient"
        onClick={() => setIngredients((prev) => [...prev, { ...EMPTY_INGREDIENT }])}
      >
        Add ingredient
      </button>

      <label className="recipe-form__field">
        <span>Steps (one per line)</span>
        <textarea rows={6} value={stepsText} onChange={(e) => setStepsText(e.target.value)} />
      </label>

      <label className="recipe-form__field">
        <span>Notes (optional)</span>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      <div className="recipe-form__actions">
        <button type="submit" className="recipe-form__save">
          Save
        </button>
        <button type="button" className="recipe-form__cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

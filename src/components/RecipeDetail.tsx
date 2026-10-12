import { useMemo, useState } from "react";
import { quantityToText } from "../lib/groceryMerge";
import { scaleRecipe } from "../lib/scaling";
import type { Recipe, RecipeIngredient } from "../lib/types";
import { useWakeLock } from "../hooks/useWakeLock";
import { ServingsScaler } from "./ServingsScaler";

/** Groups ingredients by their optional prep-step `group`, preserving first-seen order. Ungrouped items keep their original (undefined) key, rendered with no heading. */
function groupIngredients(ingredients: RecipeIngredient[]): Map<string | undefined, RecipeIngredient[]> {
  const groups = new Map<string | undefined, RecipeIngredient[]>();
  for (const ingredient of ingredients) {
    const list = groups.get(ingredient.group);
    if (list) list.push(ingredient);
    else groups.set(ingredient.group, [ingredient]);
  }
  return groups;
}

interface Props {
  recipe: Recipe;
  onBack: () => void;
  onAddIngredients: (recipe: Recipe) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function RecipeDetail({ recipe, onBack, onAddIngredients, onEdit, onDelete }: Props) {
  const [viewServings, setViewServings] = useState(recipe.servings);
  const [largeText, setLargeText] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const wakeLock = useWakeLock();

  const scaled = useMemo(() => scaleRecipe(recipe, viewServings), [recipe, viewServings]);
  const ingredientGroups = useMemo(() => groupIngredients(scaled.ingredients), [scaled.ingredients]);

  return (
    <div className={`recipe-detail ${largeText ? "recipe-detail--large-text" : ""}`}>
      <button type="button" className="recipe-detail__back" onClick={onBack}>
        &larr; Recipes
      </button>

      <h1 className="recipe-detail__title">{recipe.name}</h1>

      <div className="recipe-detail__tags">
        {recipe.tags.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
          </span>
        ))}
      </div>

      <div className="recipe-detail__facts">
        {recipe.proteinPerServingG !== undefined && (
          <span className="recipe-detail__fact">~{recipe.proteinPerServingG}g protein/serving</span>
        )}
        {recipe.prepMinutes !== undefined && <span className="recipe-detail__fact">{recipe.prepMinutes} min prep</span>}
        {recipe.cookMinutes !== undefined && <span className="recipe-detail__fact">{recipe.cookMinutes} min cook</span>}
      </div>

      <ServingsScaler servings={viewServings} onChange={setViewServings} />

      <div className="recipe-detail__toggles">
        <button
          type="button"
          className={`recipe-detail__toggle ${largeText ? "is-on" : ""}`}
          onClick={() => setLargeText((v) => !v)}
        >
          Large text
        </button>
        <button
          type="button"
          className={`recipe-detail__toggle ${wakeLock.active ? "is-on" : ""}`}
          onClick={wakeLock.toggle}
          disabled={!wakeLock.supported}
          title={wakeLock.supported ? undefined : "Not supported on this browser"}
        >
          {wakeLock.active ? "Screen staying awake" : "Keep screen awake"}
        </button>
      </div>

      <button type="button" className="recipe-detail__add-to-list" onClick={() => onAddIngredients(scaled)}>
        Add ingredients to grocery list
      </button>

      <section className="recipe-detail__section">
        <h2 className="recipe-detail__section-title">Ingredients</h2>
        {[...ingredientGroups.entries()].map(([group, items]) => (
          <div key={group ?? "_ungrouped"} className="recipe-detail__ingredient-group">
            {group && <h3 className="recipe-detail__group-title">{group}</h3>}
            <ul className="recipe-detail__ingredients">
              {items.map((ingredient, i) => (
                <li key={i} className="recipe-detail__ingredient">
                  <span>{ingredient.name}</span>
                  <span className="recipe-detail__ingredient-qty">{quantityToText(ingredient.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="recipe-detail__section">
        <h2 className="recipe-detail__section-title">Steps</h2>
        <ol className="recipe-detail__steps">
          {recipe.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {recipe.notes && (
        <section className="recipe-detail__section">
          <h2 className="recipe-detail__section-title">Notes</h2>
          <p className="recipe-detail__notes">{recipe.notes}</p>
        </section>
      )}

      <div className="recipe-detail__manage">
        <button type="button" className="recipe-detail__edit" onClick={onEdit}>
          Edit
        </button>
        <button
          type="button"
          className={`recipe-detail__delete ${confirmingDelete ? "is-confirming" : ""}`}
          onClick={() => {
            if (!confirmingDelete) {
              setConfirmingDelete(true);
              window.setTimeout(() => setConfirmingDelete(false), 4000);
              return;
            }
            onDelete();
          }}
        >
          {confirmingDelete ? "Tap again to delete" : "Delete recipe"}
        </button>
      </div>
    </div>
  );
}

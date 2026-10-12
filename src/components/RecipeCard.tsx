import type { Recipe } from "../lib/types";

interface Props {
  recipe: Recipe;
  onOpen: () => void;
}

export function RecipeCard({ recipe, onOpen }: Props) {
  const totalMinutes = (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);

  return (
    <button type="button" className="recipe-card" onClick={onOpen}>
      <span className="recipe-card__name">{recipe.name}</span>
      <span className="recipe-card__meta">
        {recipe.proteinPerServingG !== undefined && (
          <span className="recipe-card__protein">{recipe.proteinPerServingG}g protein</span>
        )}
        {totalMinutes > 0 && <span className="recipe-card__time">{totalMinutes} min</span>}
      </span>
      <span className="recipe-card__tags">
        {recipe.tags.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
          </span>
        ))}
      </span>
    </button>
  );
}

import { useEffect, useState } from "react";
import type { NewRecipe } from "../lib/recipes";
import { RECIPE_TAGS, type Recipe, type RecipeTag } from "../lib/types";
import { RecipeCard } from "./RecipeCard";
import { RecipeDetail } from "./RecipeDetail";
import { RecipeForm } from "./RecipeForm";

type View = { mode: "list" } | { mode: "detail"; id: string } | { mode: "create" } | { mode: "edit"; id: string };

interface Props {
  recipes: Recipe[];
  onAdd: (input: NewRecipe) => void;
  onEdit: (id: string, patch: Partial<NewRecipe>) => void;
  onDelete: (id: string) => void;
  onAddIngredients: (recipe: Recipe) => void;
}

export function RecipesTab({ recipes, onAdd, onEdit, onDelete, onAddIngredients }: Props) {
  const [filter, setFilter] = useState<RecipeTag | "all">("all");
  const [view, setView] = useState<View>({ mode: "list" });

  // A recipe referenced by `view` can vanish out from under it (deleted via
  // another path, or a stale id after a reload). Correct in an effect
  // rather than during render — the render below just falls through to the
  // list for that one frame instead of crashing on an undefined recipe.
  useEffect(() => {
    if ((view.mode === "detail" || view.mode === "edit") && !recipes.some((r) => r.id === view.id)) {
      setView({ mode: "list" });
    }
  }, [view, recipes]);

  const activeRecipe =
    view.mode === "detail" || view.mode === "edit" ? recipes.find((r) => r.id === view.id) : undefined;

  if (view.mode === "create") {
    return (
      <RecipeForm
        onSave={(input) => {
          onAdd(input);
          setView({ mode: "list" });
        }}
        onCancel={() => setView({ mode: "list" })}
      />
    );
  }

  if (view.mode === "edit" && activeRecipe) {
    return (
      <RecipeForm
        initial={activeRecipe}
        onSave={(input) => {
          onEdit(activeRecipe.id, input);
          setView({ mode: "detail", id: activeRecipe.id });
        }}
        onCancel={() => setView({ mode: "detail", id: activeRecipe.id })}
      />
    );
  }

  if (view.mode === "detail" && activeRecipe) {
    return (
      <RecipeDetail
        recipe={activeRecipe}
        onBack={() => setView({ mode: "list" })}
        onAddIngredients={onAddIngredients}
        onEdit={() => setView({ mode: "edit", id: activeRecipe.id })}
        onDelete={() => {
          onDelete(activeRecipe.id);
          setView({ mode: "list" });
        }}
      />
    );
  }

  const filtered = filter === "all" ? recipes : recipes.filter((r) => r.tags.includes(filter));

  return (
    <div className="recipes">
      <header className="recipes__header">
        <h1 className="recipes__title">Recipes</h1>
        <button type="button" className="recipes__new" onClick={() => setView({ mode: "create" })}>
          New recipe
        </button>
      </header>

      <div className="recipes__filters">
        <button
          type="button"
          className={`tag-chip tag-chip--filter ${filter === "all" ? "is-on" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {RECIPE_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`tag-chip tag-chip--filter ${filter === tag ? "is-on" : ""}`}
            onClick={() => setFilter(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="empty">No recipes match that filter.</p>}

      <div className="recipes__list">
        {filtered.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onOpen={() => setView({ mode: "detail", id: recipe.id })} />
        ))}
      </div>
    </div>
  );
}

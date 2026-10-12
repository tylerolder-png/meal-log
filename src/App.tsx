import { useState } from "react";
import { GroceryTab } from "./components/GroceryTab";
import { RecipesTab } from "./components/RecipesTab";
import { TabBar, type Tab } from "./components/TabBar";
import { useGroceryList } from "./hooks/useGroceryList";
import { useRecipes } from "./hooks/useRecipes";
import { useSettings } from "./hooks/useSettings";

/** How long a toast stays up before clearing itself. */
const TOAST_MS = 2600;

export default function App() {
  const grocery = useGroceryList();
  const recipes = useRecipes();
  const { settings, updateSettings } = useSettings();
  const [tab, setTab] = useState<Tab>("grocery");
  const [toast, setToast] = useState("");

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), TOAST_MS);
  }

  if (!grocery.ready || !recipes.ready) {
    return (
      <div className="app">
        <p className="empty">Loading&hellip;</p>
      </div>
    );
  }

  return (
    <div className="app">
      {tab === "grocery" && (
        <GroceryTab
          items={grocery.items}
          progress={grocery.progress}
          lastSectionUsed={settings.lastSectionUsed}
          onToggle={grocery.toggleItem}
          onEdit={grocery.editItem}
          onDelete={grocery.deleteItem}
          onAdd={grocery.addItem}
          onSectionUsed={(section) => updateSettings({ lastSectionUsed: section })}
          onNewTrip={grocery.newTrip}
          onResetToStaples={grocery.resetToStaples}
        />
      )}

      {tab === "recipes" && (
        <RecipesTab
          recipes={recipes.recipes}
          onAdd={recipes.addRecipe}
          onEdit={recipes.editRecipe}
          onDelete={recipes.deleteRecipe}
          onAddIngredients={(recipe) => {
            grocery.addIngredients(recipe.ingredients);
            flash(`Added ${recipe.name}'s ingredients to the list.`);
          }}
        />
      )}

      {tab === "settings" && (
        <div className="recipes">
          <p className="empty">Settings land in the next step.</p>
        </div>
      )}

      <TabBar tab={tab} onChange={setTab} />

      <div className="toast-stack">{toast && <p className="toast" role="status">{toast}</p>}</div>
    </div>
  );
}

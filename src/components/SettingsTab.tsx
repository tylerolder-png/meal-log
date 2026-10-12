import { useState } from "react";
import type { Backup } from "../lib/backup";
import type { GroceryItem, Recipe, Settings } from "../lib/types";
import { BackupPanel } from "./BackupPanel";
import { ImportRecipesPanel } from "./ImportRecipesPanel";

interface Props {
  groceryList: GroceryItem[];
  recipes: Recipe[];
  settings: Settings;
  onImportRecipes: (recipes: Recipe[]) => void;
  onImportBackup: (backup: Backup) => void;
  onRestoreDefaults: () => void;
}

export function SettingsTab({ groceryList, recipes, settings, onImportRecipes, onImportBackup, onRestoreDefaults }: Props) {
  const [restoredStatus, setRestoredStatus] = useState("");

  return (
    <div className="settings">
      <header className="settings__header">
        <h1 className="settings__title">Settings</h1>
      </header>

      <section className="settings-panel">
        <h2 className="settings-panel__title">Default recipes</h2>
        <p className="settings-panel__hint">
          Re-adds any default recipe you deleted. A default you've edited in place is left alone — this never
          reverts an edit.
        </p>
        {restoredStatus && <p className="settings-panel__status">{restoredStatus}</p>}
        <button
          type="button"
          className="settings-panel__btn"
          onClick={() => {
            onRestoreDefaults();
            setRestoredStatus("Default recipes restored.");
          }}
        >
          Restore default recipes
        </button>
      </section>

      <ImportRecipesPanel onImport={onImportRecipes} />
      <BackupPanel groceryList={groceryList} recipes={recipes} settings={settings} onImportBackup={onImportBackup} />
    </div>
  );
}

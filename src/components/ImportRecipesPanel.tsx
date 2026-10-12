import { useState } from "react";
import { parseRecipeImport } from "../lib/recipeValidation";
import type { Recipe } from "../lib/types";

interface Props {
  onImport: (recipes: Recipe[]) => void;
}

/** Paste JSON, validate it, preview before saving. Schema lives in RECIPE_FORMAT.md. */
export function ImportRecipesPanel({ onImport }: Props) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<Recipe[] | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  function handlePreview() {
    setStatus("");
    try {
      const recipes = parseRecipeImport(text);
      setParsed(recipes);
      setError("");
    } catch (err) {
      setParsed(null);
      setError(err instanceof Error ? err.message : "Couldn't parse that.");
    }
  }

  function handleConfirm() {
    if (!parsed) return;
    onImport(parsed);
    setStatus(`Imported ${parsed.length} recipe${parsed.length > 1 ? "s" : ""}.`);
    setText("");
    setParsed(null);
  }

  return (
    <section className="settings-panel">
      <h2 className="settings-panel__title">Import recipes</h2>
      <p className="settings-panel__hint">
        Paste a recipe (or an array of recipes) matching the schema in RECIPE_FORMAT.md.
      </p>
      <textarea
        className="settings-panel__textarea"
        rows={8}
        placeholder="Paste recipe JSON here"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setParsed(null);
          setError("");
        }}
      />
      {error && <p className="settings-panel__error">{error}</p>}
      {status && <p className="settings-panel__status">{status}</p>}

      {parsed ? (
        <>
          <ul className="settings-panel__preview">
            {parsed.map((recipe) => (
              <li key={recipe.id}>{recipe.name}</li>
            ))}
          </ul>
          <div className="settings-panel__actions">
            <button type="button" className="settings-panel__confirm" onClick={handleConfirm}>
              Import {parsed.length} recipe{parsed.length > 1 ? "s" : ""}
            </button>
            <button type="button" className="settings-panel__cancel" onClick={() => setParsed(null)}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <button type="button" className="settings-panel__preview-btn" onClick={handlePreview} disabled={!text.trim()}>
          Preview
        </button>
      )}
    </section>
  );
}

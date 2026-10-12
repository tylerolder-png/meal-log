import { useState } from "react";
import type { NewRecipe } from "../lib/recipes";
import { parseRecipeText } from "../lib/recipeTextParser";

interface Props {
  onParsed: (draft: NewRecipe) => void;
  onCancel: () => void;
}

/** Paste free-form recipe text; a local heuristic parser produces a starting draft to review and fix in the recipe form — never saved unreviewed. */
export function PasteRecipePanel({ onParsed, onCancel }: Props) {
  const [text, setText] = useState("");

  function handleParse() {
    if (text.trim() === "") return;
    onParsed(parseRecipeText(text));
  }

  return (
    <div className="paste-recipe">
      <h1 className="paste-recipe__title">Paste a recipe</h1>
      <p className="paste-recipe__hint">
        Paste recipe text from anywhere. This is read locally — no AI, no network call — so it works
        best when the text has a recognizable "Ingredients" section and an "Instructions" or
        "Directions" section. You'll review and fix anything it misses on the next screen before
        saving.
      </p>
      <textarea
        className="paste-recipe__textarea"
        rows={14}
        placeholder="Paste the full recipe text here"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
      />
      <div className="paste-recipe__actions">
        <button type="button" className="paste-recipe__parse" onClick={handleParse} disabled={text.trim() === ""}>
          Parse recipe
        </button>
        <button type="button" className="paste-recipe__cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

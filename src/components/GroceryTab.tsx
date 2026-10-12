import { useState } from "react";
import { SECTION_ORDER, type GroceryItem, type Section } from "../lib/types";
import { AddItemForm } from "./AddItemForm";
import { GroceryItemRow } from "./GroceryItemRow";

/** Window to tap a confirm button again before the confirm state clears. */
const CONFIRM_MS = 4000;

interface Props {
  items: GroceryItem[];
  progress: { checked: number; total: number };
  lastSectionUsed: Section;
  onToggle: (id: string) => void;
  onEdit: (id: string, patch: { name: string; quantityText?: string; section: Section; storageNote?: string }) => void;
  onDelete: (id: string) => void;
  onAdd: (input: { name: string; quantityText?: string; section: Section }) => void;
  onSectionUsed: (section: Section) => void;
  onNewTrip: () => void;
  onResetToStaples: () => void;
}

export function GroceryTab({
  items,
  progress,
  lastSectionUsed,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
  onSectionUsed,
  onNewTrip,
  onResetToStaples,
}: Props) {
  const [confirming, setConfirming] = useState<"newTrip" | "resetToStaples" | null>(null);

  function handleConfirmable(action: "newTrip" | "resetToStaples", run: () => void) {
    if (confirming !== action) {
      setConfirming(action);
      window.setTimeout(() => setConfirming((current) => (current === action ? null : current)), CONFIRM_MS);
      return;
    }
    run();
    setConfirming(null);
  }

  const bySection = new Map<Section, GroceryItem[]>();
  for (const item of items) {
    const group = bySection.get(item.section);
    if (group) group.push(item);
    else bySection.set(item.section, [item]);
  }

  return (
    <div className="grocery">
      <header className="grocery__header">
        <h1 className="grocery__title">Grocery List</h1>
        <p className="grocery__progress">
          {progress.checked} / {progress.total}
        </p>
      </header>

      <AddItemForm
        lastSectionUsed={lastSectionUsed}
        onAdd={(input) => {
          onAdd(input);
          onSectionUsed(input.section);
        }}
      />

      {items.length === 0 && <p className="empty">Nothing on the list. Add something above.</p>}

      {SECTION_ORDER.filter((section) => bySection.has(section)).map((section) => (
        <section key={section} className="grocery__section">
          <h2 className="grocery__section-title">{section}</h2>
          <ul className="grocery__items">
            {bySection.get(section)!.map((item) => (
              <GroceryItemRow
                key={item.id}
                item={item}
                onToggle={() => onToggle(item.id)}
                onEdit={(patch) => onEdit(item.id, patch)}
                onDelete={() => onDelete(item.id)}
              />
            ))}
          </ul>
        </section>
      ))}

      <div className="trip-actions">
        <button
          type="button"
          className={`trip-actions__btn ${confirming === "newTrip" ? "is-confirming" : ""}`}
          onClick={() => handleConfirmable("newTrip", onNewTrip)}
        >
          {confirming === "newTrip" ? "Tap again to confirm" : "New trip"}
        </button>
        <button
          type="button"
          className={`trip-actions__btn ${confirming === "resetToStaples" ? "is-confirming" : ""}`}
          onClick={() => handleConfirmable("resetToStaples", onResetToStaples)}
        >
          {confirming === "resetToStaples" ? "Tap again to confirm" : "Reset to staples"}
        </button>
      </div>
    </div>
  );
}

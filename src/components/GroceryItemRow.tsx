import { useState, type FormEvent } from "react";
import { SECTION_ORDER, type GroceryItem, type Section } from "../lib/types";
import { CONFIRM_MS } from "./GroceryTab";

interface Props {
  item: GroceryItem;
  onToggle: () => void;
  onEdit: (patch: { name: string; quantityText?: string; section: Section; storageNote?: string }) => void;
  onDelete: () => void;
}

export function GroceryItemRow({ item, onToggle, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantityText, setQuantityText] = useState(item.quantityText ?? "");
  const [section, setSection] = useState<Section>(item.section);
  const [storageNote, setStorageNote] = useState(item.storageNote ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function startEdit() {
    setName(item.name);
    setQuantityText(item.quantityText ?? "");
    setSection(item.section);
    setStorageNote(item.storageNote ?? "");
    setConfirmingDelete(false);
    setEditing(true);
  }

  function save(e: FormEvent) {
    e.preventDefault();
    if (name.trim() === "") return;
    onEdit({
      name: name.trim(),
      quantityText: quantityText.trim() || undefined,
      section,
      storageNote: storageNote.trim() || undefined,
    });
    setEditing(false);
  }

  function handleDeleteClick() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      window.setTimeout(() => setConfirmingDelete(false), CONFIRM_MS);
      return;
    }
    if (navigator.vibrate) navigator.vibrate(15);
    onDelete();
  }

  if (editing) {
    return (
      <li className="grocery-item grocery-item--editing">
        <form className="grocery-item__edit-form" onSubmit={save}>
          <input
            className="grocery-item__edit-name"
            aria-label="Item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <input
            className="grocery-item__edit-qty"
            aria-label="Quantity"
            placeholder="Quantity"
            value={quantityText}
            onChange={(e) => setQuantityText(e.target.value)}
          />
          <select
            className="grocery-item__edit-section"
            aria-label="Section"
            value={section}
            onChange={(e) => setSection(e.target.value as Section)}
          >
            {SECTION_ORDER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            className="grocery-item__edit-storage-note"
            aria-label="Storage tip"
            placeholder="Tip (optional), e.g. freeze extras flat so they thaw faster"
            value={storageNote}
            onChange={(e) => setStorageNote(e.target.value)}
          />
          <div className="grocery-item__edit-actions">
            <button type="submit" className="grocery-item__save">
              Save
            </button>
            <button type="button" className="grocery-item__cancel" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button
              type="button"
              className={`grocery-item__delete ${confirmingDelete ? "is-confirming" : ""}`}
              onClick={handleDeleteClick}
            >
              {confirmingDelete ? "Tap again to confirm" : "Delete"}
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={`grocery-item ${item.checked ? "is-checked" : ""}`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={item.checked}
        aria-label={`${item.checked ? "Uncheck" : "Check"} ${item.name}`}
        className="grocery-item__checkbox"
        onClick={() => {
          if (navigator.vibrate) navigator.vibrate(15);
          onToggle();
        }}
      >
        {item.checked && <span className="grocery-item__check-mark">✓</span>}
      </button>
      <button type="button" className="grocery-item__label" onClick={startEdit}>
        <span className="grocery-item__name">{item.name}</span>
        {item.quantityText && <span className="grocery-item__qty">{item.quantityText}</span>}
        {item.storageNote && (
          <span className="grocery-item__storage-note">
            <span className="grocery-item__storage-note-icon" aria-hidden="true">
              💡
            </span>
            {item.storageNote}
          </span>
        )}
      </button>
    </li>
  );
}

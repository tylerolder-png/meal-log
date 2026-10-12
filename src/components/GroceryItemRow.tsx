import { useState } from "react";
import { SECTION_ORDER, type GroceryItem, type Section } from "../lib/types";

interface Props {
  item: GroceryItem;
  onToggle: () => void;
  onEdit: (patch: { name: string; quantityText?: string; section: Section }) => void;
  onDelete: () => void;
}

export function GroceryItemRow({ item, onToggle, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantityText, setQuantityText] = useState(item.quantityText ?? "");
  const [section, setSection] = useState<Section>(item.section);

  function startEdit() {
    setName(item.name);
    setQuantityText(item.quantityText ?? "");
    setSection(item.section);
    setEditing(true);
  }

  function save() {
    if (name.trim() === "") return;
    onEdit({ name: name.trim(), quantityText: quantityText.trim() || undefined, section });
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="grocery-item grocery-item--editing">
        <input
          className="grocery-item__edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <input
          className="grocery-item__edit-qty"
          placeholder="Quantity"
          value={quantityText}
          onChange={(e) => setQuantityText(e.target.value)}
        />
        <select
          className="grocery-item__edit-section"
          value={section}
          onChange={(e) => setSection(e.target.value as Section)}
        >
          {SECTION_ORDER.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="grocery-item__edit-actions">
          <button type="button" className="grocery-item__save" onClick={save}>
            Save
          </button>
          <button type="button" className="grocery-item__cancel" onClick={() => setEditing(false)}>
            Cancel
          </button>
          <button type="button" className="grocery-item__delete" onClick={onDelete}>
            Delete
          </button>
        </div>
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
        onClick={onToggle}
      >
        {item.checked && <span className="grocery-item__check-mark">✓</span>}
      </button>
      <button type="button" className="grocery-item__label" onClick={startEdit}>
        <span className="grocery-item__name">{item.name}</span>
        {item.quantityText && <span className="grocery-item__qty">{item.quantityText}</span>}
      </button>
    </li>
  );
}

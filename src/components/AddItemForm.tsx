import { useState, type FormEvent } from "react";
import { SECTION_ORDER, type Section } from "../lib/types";

interface Props {
  lastSectionUsed: Section;
  onAdd: (input: { name: string; quantityText?: string; section: Section }) => void;
}

/** Fast add: one text field plus a section picker that remembers the last section used. */
export function AddItemForm({ lastSectionUsed, onAdd }: Props) {
  const [name, setName] = useState("");
  const [quantityText, setQuantityText] = useState("");
  const [section, setSection] = useState<Section>(lastSectionUsed);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim() === "") return;
    onAdd({ name: name.trim(), quantityText: quantityText.trim() || undefined, section });
    setName("");
    setQuantityText("");
  }

  return (
    <form className="add-item" onSubmit={handleSubmit}>
      <input
        className="add-item__name"
        placeholder="Add an item"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="add-item__qty"
        placeholder="Qty (optional)"
        value={quantityText}
        onChange={(e) => setQuantityText(e.target.value)}
      />
      <select className="add-item__section" value={section} onChange={(e) => setSection(e.target.value as Section)}>
        {SECTION_ORDER.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button type="submit" className="add-item__submit">
        Add
      </button>
    </form>
  );
}

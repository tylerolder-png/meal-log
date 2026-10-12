import { useRef, useState } from "react";
import { buildBackup, parseBackup, type Backup } from "../lib/backup";
import type { GroceryItem, Recipe, Settings } from "../lib/types";

interface Props {
  groceryList: GroceryItem[];
  recipes: Recipe[];
  settings: Settings;
  onImportBackup: (backup: Backup) => void;
}

export function BackupPanel({ groceryList, recipes, settings, onImportBackup }: Props) {
  const [status, setStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const backup = buildBackup(groceryList, recipes, settings);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meal-log-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Backup downloaded.");
  }

  async function handleImportFile(file: File) {
    let backup: Backup;
    try {
      backup = parseBackup(await file.text());
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Couldn't read that backup file.");
      return;
    }
    if (!window.confirm("Replace current data with this backup? This can't be undone.")) return;
    onImportBackup(backup);
    setStatus("Backup restored.");
  }

  return (
    <section className="settings-panel">
      <h2 className="settings-panel__title">Backup</h2>
      {status && <p className="settings-panel__status">{status}</p>}
      <div className="settings-panel__actions">
        <button type="button" className="settings-panel__btn" onClick={handleExport}>
          Export all data
        </button>
        <button type="button" className="settings-panel__btn" onClick={() => fileInputRef.current?.click()}>
          Import backup
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="settings-panel__file-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleImportFile(file);
        }}
      />
    </section>
  );
}

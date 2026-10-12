import { GroceryTab } from "./components/GroceryTab";
import { useGroceryList } from "./hooks/useGroceryList";
import { useSettings } from "./hooks/useSettings";

export default function App() {
  const grocery = useGroceryList();
  const { settings, updateSettings } = useSettings();

  if (!grocery.ready) {
    return (
      <div className="app">
        <p className="empty">Loading&hellip;</p>
      </div>
    );
  }

  return (
    <div className="app">
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
    </div>
  );
}

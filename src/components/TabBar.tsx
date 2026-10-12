export type Tab = "grocery" | "recipes" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "grocery", label: "Grocery" },
  { id: "recipes", label: "Recipes" },
  { id: "settings", label: "Settings" },
];

interface Props {
  tab: Tab;
  onChange: (tab: Tab) => void;
}

export function TabBar({ tab, onChange }: Props) {
  return (
    <nav className="dock" role="tablist" aria-label="Sections">
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={tab === t.id}
          className={`dock__tab ${tab === t.id ? "is-on" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

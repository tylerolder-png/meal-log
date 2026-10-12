import { useCallback, useEffect, useState } from "react";
import { localStore, type MealLogStore } from "../lib/storage";
import type { Settings } from "../lib/types";

const DEFAULT_SETTINGS: Settings = { lastSectionUsed: "Produce" };

export function useSettings(store: MealLogStore = localStore) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await store.loadSettings();
      if (cancelled) return;
      if (loaded) setSettings(loaded);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [store]);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        void store.saveSettings(next);
        return next;
      });
    },
    [store],
  );

  return { ready, settings, updateSettings };
}

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Keeps the screen on while cooking. Fails gracefully on browsers without
 * the Wake Lock API (older Safari) — `supported` is false and toggle() is a
 * no-op. The OS can still revoke the lock when the tab goes to background
 * (e.g. switching apps to check a timer); visibilitychange re-acquires it.
 */
export function useWakeLock() {
  const supported = typeof navigator !== "undefined" && "wakeLock" in navigator;
  const [active, setActive] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  const release = useCallback(async () => {
    try {
      await sentinelRef.current?.release();
    } catch {
      // Already released (e.g. by the OS) — nothing to do.
    }
    sentinelRef.current = null;
    setActive(false);
  }, []);

  const acquire = useCallback(async () => {
    if (!supported) return;
    try {
      const sentinel = await navigator.wakeLock.request("screen");
      sentinelRef.current = sentinel;
      setActive(true);
      sentinel.addEventListener("release", () => setActive(false));
    } catch {
      setActive(false);
    }
  }, [supported]);

  useEffect(() => {
    function handleVisibility() {
      if (active && document.visibilityState === "visible" && !sentinelRef.current) {
        void acquire();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [active, acquire]);

  useEffect(
    () => () => {
      void release();
    },
    [release],
  );

  const toggle = useCallback(() => {
    if (active) void release();
    else void acquire();
  }, [active, acquire, release]);

  return { supported, active, toggle };
}

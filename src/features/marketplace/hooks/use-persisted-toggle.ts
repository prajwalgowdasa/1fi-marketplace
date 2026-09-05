"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PersistedToggleState = {
  active: boolean;
  persistenceAvailable: boolean;
  toggle: () => PersistedToggleResult;
};

export type PersistedToggleResult = {
  active: boolean;
  persistenceAvailable: boolean;
};

export type PersistedIdsState = {
  activeIds: ReadonlySet<string>;
  persistenceAvailable: boolean;
  toggle: (itemId: string) => PersistedToggleResult;
};

function parseStoredIds(value: string | null): Set<string> {
  if (value === null) return new Set();

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

export function usePersistedIds(storageKey: string): PersistedIdsState {
  const [storedIds, setStoredIds] = useState<Set<string>>(() => new Set());
  const [persistenceAvailable, setPersistenceAvailable] = useState(true);
  const storedIdsRef = useRef(storedIds);
  const storageStatusRef = useRef<"unhydrated" | "available" | "unavailable">("unhydrated");

  const hydrate = useCallback(() => {
    if (storageStatusRef.current !== "unhydrated") return;

    try {
      const nextStoredIds = parseStoredIds(localStorage.getItem(storageKey));
      storedIdsRef.current = nextStoredIds;
      setStoredIds(nextStoredIds);
      storageStatusRef.current = "available";
      setPersistenceAvailable(true);
    } catch {
      const nextStoredIds = new Set<string>();
      storedIdsRef.current = nextStoredIds;
      setStoredIds(nextStoredIds);
      storageStatusRef.current = "unavailable";
      setPersistenceAvailable(false);
    }
  }, [storageKey]);

  useEffect(() => {
    const timer = window.setTimeout(hydrate, 0);
    return () => window.clearTimeout(timer);
  }, [hydrate]);

  const toggle = useCallback((itemId: string) => {
    const targetActive = !storedIdsRef.current.has(itemId);
    let latestStoredIds = storedIdsRef.current;

    if (storageStatusRef.current !== "unavailable") {
      try {
        latestStoredIds = parseStoredIds(localStorage.getItem(storageKey));
        storageStatusRef.current = "available";
      } catch {
        storageStatusRef.current = "unavailable";
        setPersistenceAvailable(false);
      }
    }

    const nextStoredIds = new Set(latestStoredIds);
    if (targetActive) nextStoredIds.add(itemId);
    else nextStoredIds.delete(itemId);

    storedIdsRef.current = nextStoredIds;
    setStoredIds(nextStoredIds);

    if (storageStatusRef.current === "available") {
      try {
        localStorage.setItem(storageKey, JSON.stringify([...nextStoredIds].sort()));
        setPersistenceAvailable(true);
      } catch {
        storageStatusRef.current = "unavailable";
        setPersistenceAvailable(false);
      }
    }

    return {
      active: targetActive,
      persistenceAvailable: storageStatusRef.current === "available",
    };
  }, [storageKey]);

  return {
    activeIds: storedIds,
    persistenceAvailable,
    toggle,
  };
}

export function usePersistedToggle(storageKey: string, itemId: string): PersistedToggleState {
  const { activeIds, persistenceAvailable, toggle } = usePersistedIds(storageKey);
  const toggleItem = useCallback(() => toggle(itemId), [itemId, toggle]);

  return {
    active: activeIds.has(itemId),
    persistenceAvailable,
    toggle: toggleItem,
  };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PersistedToggleState = {
  active: boolean;
  persistenceAvailable: boolean;
  toggle: () => void;
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

export function usePersistedToggle(storageKey: string, itemId: string): PersistedToggleState {
  const [storedIds, setStoredIds] = useState<Set<string>>(() => new Set());
  const [persistenceAvailable, setPersistenceAvailable] = useState(true);
  const storedIdsRef = useRef(storedIds);

  useEffect(() => {
    try {
      const nextStoredIds = parseStoredIds(localStorage.getItem(storageKey));
      storedIdsRef.current = nextStoredIds;
      setStoredIds(nextStoredIds);
      setPersistenceAvailable(true);
    } catch {
      const nextStoredIds = new Set<string>();
      storedIdsRef.current = nextStoredIds;
      setStoredIds(nextStoredIds);
      setPersistenceAvailable(false);
    }
  }, [storageKey]);

  const toggle = useCallback(() => {
    const nextStoredIds = new Set(storedIdsRef.current);
    if (nextStoredIds.has(itemId)) nextStoredIds.delete(itemId);
    else nextStoredIds.add(itemId);

    storedIdsRef.current = nextStoredIds;
    setStoredIds(nextStoredIds);

    try {
      localStorage.setItem(storageKey, JSON.stringify([...nextStoredIds].sort()));
      setPersistenceAvailable(true);
    } catch {
      setPersistenceAvailable(false);
    }
  }, [itemId, storageKey]);

  return {
    active: storedIds.has(itemId),
    persistenceAvailable,
    toggle,
  };
}

import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, fallback: T): [T, (val: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  });

  const setAndPersist = useCallback(
    (val: T) => {
      setState(val);
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch {
        // quota exceeded or private browsing — silently ignore
      }
    },
    [key],
  );

  return [state, setAndPersist];
}

import { useState } from 'react';
import type { AppState } from '../types';

const STORAGE_KEY = 'zyn_tracker';

export function useZynState() {
  const [state, setStateRaw] = useState<AppState | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.strength == null || !parsed.wakeTime || !parsed.sleepTime) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  });

  const setState = (next: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setStateRaw(next);
  };

  const resetState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStateRaw(null);
  };

  return { state, setState, resetState };
}

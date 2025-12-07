'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'vietnam-3d-map-ui-state';
const FIRST_VISIT_KEY = 'vietnam-3d-map-first-visit';

interface UIState {
  sidebarOpen: boolean;
  legendOpen: boolean;
  controlsOpen: boolean;
}

const defaultState: UIState = {
  sidebarOpen: false,
  legendOpen: false,
  controlsOpen: false,
};

function getStoredState(): UIState | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UIState;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function isFirstVisit(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(FIRST_VISIT_KEY) === null;
}

function markVisited(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FIRST_VISIT_KEY, 'true');
}

function saveState(state: UIState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function useUIState(key: keyof UIState): [boolean, (value: boolean) => void] {
  const [isOpen, setIsOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    const firstVisit = isFirstVisit();

    if (firstVisit) {
      // First visit: close all panels
      markVisited();
      setIsOpen(false);
    } else {
      // Returning visit: restore saved state
      const stored = getStoredState();
      if (stored && key in stored) {
        setIsOpen(stored[key]);
      }
    }

    setInitialized(true);
  }, [key, initialized]);

  const setOpenState = useCallback((value: boolean) => {
    setIsOpen(value);

    // Save to localStorage
    const currentState = getStoredState() || defaultState;
    saveState({ ...currentState, [key]: value });
  }, [key]);

  return [isOpen, setOpenState];
}

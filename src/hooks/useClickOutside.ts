'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Hook to detect clicks outside of a referenced element.
 * Only triggers on mobile/small screens (< 640px).
 */
export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
  enabled: boolean = true,
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Only trigger on mobile/small screens
      if (window.innerWidth >= 640) return;

      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // Use mousedown and touchstart for immediate response
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [callback, enabled]);

  return ref;
}

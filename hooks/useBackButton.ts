'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook that integrates browser back button with modal/popup close behavior.
 * When `isOpen` becomes true, pushes a history state.
 * When the user presses browser back, calls `onClose` instead of navigating away.
 * When closed via UI (X button, backdrop), neutralizes the extra history entry.
 */
export function useBackButton(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  const pushedRef = useRef(false);

  // Keep callback ref current without triggering re-effects
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    // Push a state marker so back button has something to pop
    window.history.pushState({ modalOpen: true }, '');
    pushedRef.current = true;

    const handlePopState = () => {
      if (pushedRef.current) {
        pushedRef.current = false;
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (pushedRef.current) {
        // Modal was closed via UI (X button / backdrop), not back button.
        // Replace the current state to neutralize the pushed modal entry
        // without calling history.back() which triggers popstate and
        // causes Next.js router to attempt a state update.
        pushedRef.current = false;
        try {
          window.history.replaceState(null, '');
        } catch {
          // Silently ignore if history manipulation fails
        }
      }
    };
  }, [isOpen]);
}

import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * Gives focus a place to go when the control that held it is taken out of `container`.
 *
 * A row here disappears when its own button is pressed, or when the peer withdraws what
 * it showed. The browser then drops focus to the top of the page, and a keyboard or
 * screen reader user has to find the way back. It goes to `refuge` instead: something
 * that is always there and that pressing Enter on does nothing to.
 */
export function useFocusRefuge(
  container: RefObject<HTMLElement>,
  refuge: RefObject<HTMLElement>,
): void {
  const lastFocused = useRef<Element | null>(null);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const remember = (event: FocusEvent) => {
      lastFocused.current = event.target as Element;
    };
    const forget = (event: FocusEvent) => {
      const left = event.target as Element;
      // Browsers differ on whether removing an element blurs it. Looked at afterwards,
      // one the user moved away from is still in the document; one that was removed is not.
      queueMicrotask(() => {
        if (lastFocused.current === left && left.isConnected) lastFocused.current = null;
      });
    };
    element.addEventListener('focusin', remember);
    element.addEventListener('focusout', forget);
    return () => {
      element.removeEventListener('focusin', remember);
      element.removeEventListener('focusout', forget);
    };
  }, [container]);

  // After every render: this is when a row can have gone.
  useLayoutEffect(() => {
    const held = lastFocused.current;
    if (!held || held.isConnected) return;
    lastFocused.current = null;
    const active = document.activeElement;
    // Only if focus really was dropped: never taken from where the user has since put it.
    if (!active || active === document.body) refuge.current?.focus();
  });
}

import { useLayoutEffect, useRef, type RefObject } from 'react';

/** Recover only focus lost when a previously focused subtree/control is removed. */
export function useFocusRecovery<T extends HTMLElement>(ref: RefObject<T>, targetId?: string, fallbackId?: string): void {
  const lastFocused = useRef<Element | null>(null);
  const targets = useRef({ targetId, fallbackId });
  targets.current = { targetId, fallbackId };
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !targetId) return;
    const track = (event: FocusEvent) => {
      lastFocused.current = root.contains(event.target as Node) ? event.target as Element : null;
    };
    document.addEventListener('focusin', track);
    return () => document.removeEventListener('focusin', track);
  }, [ref, targetId]);
  useLayoutEffect(() => {
    const root = ref.current;
    return () => {
      if (!root) return;
      const focused = root.contains(document.activeElement) ? document.activeElement : lastFocused.current;
      if (!focused) return;
      queueMicrotask(() => {
        const { targetId, fallbackId } = targets.current;
        if (!targetId) return;
        if (focused.isConnected || (document.activeElement !== document.body && document.activeElement?.isConnected)) return;
        const target = document.getElementById(targetId) ?? (fallbackId ? document.getElementById(fallbackId) : null);
        if (target && !target.closest('[hidden], [inert]')) target.focus();
      });
    };
  });
}

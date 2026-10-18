import { usePreferences } from '../stores/preferencesStore';

/**
 * The count on the installed app's icon: what raised a notification (a channel
 * message set to notify, a file offered) while the client was not focused.
 * Ordinary output never counts. Focusing the client clears it.
 */
let missed = 0;

function supported(): boolean {
  return typeof navigator !== 'undefined' && 'setAppBadge' in navigator && 'clearAppBadge' in navigator;
}

export function noteMissedActivity(): void {
  if (!supported() || document.hasFocus() || !usePreferences.getState().general.appBadge) return;
  missed += 1;
  navigator.setAppBadge(missed).catch(() => {});
}

export function clearMissedActivity(): void {
  missed = 0;
  if (supported()) navigator.clearAppBadge().catch(() => {});
}

/** Clears the badge now if the client is focused or the preference is off, and whenever either becomes so. */
export function watchAppBadge(): () => void {
  const onFocus = () => clearMissedActivity();
  const onVisible = () => { if (document.visibilityState === 'visible' && document.hasFocus()) clearMissedActivity(); };
  window.addEventListener('focus', onFocus);
  document.addEventListener('visibilitychange', onVisible);
  const unsubscribe = usePreferences.subscribe(
    (state) => state.general.appBadge,
    (enabled) => { if (!enabled) clearMissedActivity(); },
  );
  // A badge left from before this page loaded (a reload, a crash) is stale
  // once the player is looking, or no longer wants one.
  if (document.hasFocus() || !usePreferences.getState().general.appBadge) clearMissedActivity();
  return () => {
    window.removeEventListener('focus', onFocus);
    document.removeEventListener('visibilitychange', onVisible);
    unsubscribe();
  };
}

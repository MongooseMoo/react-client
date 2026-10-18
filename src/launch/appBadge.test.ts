import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePreferences } from '../stores/preferencesStore';
import { clearMissedActivity, noteMissedActivity, watchAppBadge } from './appBadge';

const setAppBadge = vi.fn(async (_count?: number) => {});
const clearAppBadge = vi.fn(async () => {});
let focused = false;

beforeEach(() => {
  Object.assign(navigator, { setAppBadge, clearAppBadge });
  vi.spyOn(document, 'hasFocus').mockImplementation(() => focused);
  focused = false;
  usePreferences.setState((state) => ({ general: { ...state.general, appBadge: true } }));
  clearMissedActivity();
  setAppBadge.mockClear();
  clearAppBadge.mockClear();
});

afterEach(() => vi.restoreAllMocks());

describe('app badge', () => {
  it('counts notifications raised while the client is not focused', () => {
    noteMissedActivity();
    noteMissedActivity();
    expect(setAppBadge).toHaveBeenLastCalledWith(2);
  });

  it('ignores notifications raised while the client is focused', () => {
    focused = true;
    noteMissedActivity();
    expect(setAppBadge).not.toHaveBeenCalled();
  });

  it('counts nothing when the player turned it off', () => {
    usePreferences.setState((state) => ({ general: { ...state.general, appBadge: false } }));
    noteMissedActivity();
    expect(setAppBadge).not.toHaveBeenCalled();
  });

  it('clears and starts over when the client gains focus', () => {
    const stop = watchAppBadge();
    noteMissedActivity();
    window.dispatchEvent(new Event('focus'));
    expect(clearAppBadge).toHaveBeenCalledOnce();
    noteMissedActivity();
    expect(setAppBadge).toHaveBeenLastCalledWith(1);
    stop();
  });

  it('clears when the player turns it off', () => {
    const stop = watchAppBadge();
    noteMissedActivity();
    usePreferences.setState((state) => ({ general: { ...state.general, appBadge: false } }));
    expect(clearAppBadge).toHaveBeenCalledOnce();
    stop();
  });

  it('clears a badge left from before the page loaded when it starts focused', () => {
    focused = true;
    const stop = watchAppBadge();
    expect(clearAppBadge).toHaveBeenCalledOnce();
    stop();
  });

  it('clears a badge left from before the page loaded when the player had turned it off', () => {
    usePreferences.setState((state) => ({ general: { ...state.general, appBadge: false } }));
    const stop = watchAppBadge();
    expect(clearAppBadge).toHaveBeenCalledOnce();
    stop();
  });

  it('keeps a badge while the page starts unfocused', () => {
    const stop = watchAppBadge();
    expect(clearAppBadge).not.toHaveBeenCalled();
    stop();
  });
});

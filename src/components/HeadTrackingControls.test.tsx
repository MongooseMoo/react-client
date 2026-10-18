import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { headTracking, useHeadTrackingStore } from '../audio/headTracking';
import { usePreferences } from '../stores/preferencesStore';
import HeadTrackingControls, { headBearingText } from './HeadTrackingControls';

function setPreference(headTracking: boolean): void {
  const { sound, setSound } = usePreferences.getState();
  setSound({ ...sound, headTracking });
}

describe('HeadTrackingControls', () => {
  beforeEach(() => {
    setPreference(false);
    useHeadTrackingStore.setState({ sensor: 'unknown', status: 'off', yawDegrees: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setPreference(false);
  });

  it('is absent without a motion sensor', () => {
    const { container } = render(<HeadTrackingControls />);
    expect(container).toBeEmptyDOMElement();
    act(() => useHeadTrackingStore.setState({ sensor: 'none' }));
    expect(container).toBeEmptyDOMElement();
  });

  it('appears once the sensor is found, and turns on from the checkbox', () => {
    const enable = vi.spyOn(headTracking, 'enable').mockResolvedValue();
    render(<HeadTrackingControls />);
    act(() => useHeadTrackingStore.setState({ sensor: 'available' }));
    expect(screen.getByRole('group', { name: 'Head tracking' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Recenter' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Turn the sound scene with this device' }));
    expect(enable).toHaveBeenCalledOnce();
  });

  it('shows Recenter and the head bearing while tracking', () => {
    const recenter = vi.spyOn(headTracking, 'recenter').mockImplementation(() => {});
    const disable = vi.spyOn(headTracking, 'disable').mockImplementation(() => {});
    setPreference(true);
    useHeadTrackingStore.setState({ sensor: 'available', status: 'tracking', yawDegrees: -32.4 });
    render(<HeadTrackingControls />);
    expect(screen.getByText('Status: Tracking. Head turned 32 degrees left.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Recenter' }));
    expect(recenter).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(disable).toHaveBeenCalledOnce();
  });

  it('offers to ask for motion access again after a refusal', () => {
    useHeadTrackingStore.setState({ sensor: 'needs-permission', status: 'blocked' });
    render(<HeadTrackingControls />);
    expect(screen.getByRole('button', { name: 'Allow motion access' })).toBeInTheDocument();
  });
});

describe('headBearingText', () => {
  it('says the turn in words', () => {
    expect(headBearingText(0.3)).toBe('Facing straight ahead');
    expect(headBearingText(1)).toBe('Head turned 1 degree right');
    expect(headBearingText(90)).toBe('Head turned 90 degrees right');
    expect(headBearingText(-45.6)).toBe('Head turned 46 degrees left');
  });
});

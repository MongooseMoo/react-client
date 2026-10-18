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

  it('is absent while the first check runs', () => {
    const { container } = render(<HeadTrackingControls />);
    expect(container).toBeEmptyDOMElement();
  });

  it('after a timeout, checks again and offers the controls when a sensor turns up', () => {
    vi.useFakeTimers();
    const sink = { setHeadYaw: vi.fn(), setHeadTracking: vi.fn() };
    const detach = headTracking.attach(sink);
    try {
      render(<HeadTrackingControls />);
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(screen.getByRole('group', { name: 'Head tracking' })).toHaveTextContent('No motion sensor found.');
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

      const checkAgain = screen.getByRole('button', { name: 'Check again' });
      checkAgain.focus();
      fireEvent.click(checkAgain);
      expect(screen.getByRole('group', { name: 'Head tracking' })).toHaveTextContent(
        'Checking for a motion sensor.',
      );
      // The button stays while checking, so focus has somewhere to be.
      expect(screen.getByRole('button', { name: 'Check again' })).toHaveFocus();

      act(() => {
        window.dispatchEvent(Object.assign(new Event('deviceorientation'), { alpha: 12, beta: 0, gamma: 0 }));
      });
      const checkbox = screen.getByRole('checkbox', { name: 'Turn the sound scene with this device' });
      expect(checkbox).toHaveFocus();
      expect(screen.queryByRole('button', { name: 'Check again' })).not.toBeInTheDocument();
    } finally {
      detach();
      vi.useRealTimers();
    }
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

  it('says how to resume while paused, with Recenter at hand', () => {
    setPreference(true);
    useHeadTrackingStore.setState({ sensor: 'available', status: 'paused' });
    render(<HeadTrackingControls />);
    expect(
      screen.getByText('Status: Head tracking paused. Recenter to resume, or turn back to where you were facing.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recenter' })).toBeInTheDocument();
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

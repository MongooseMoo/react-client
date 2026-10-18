import type React from 'react';
import { useEffect, useRef } from 'react';

import { headTracking, type HeadTrackingStatus, useHeadTrackingStore } from '../audio/headTracking';
import { usePreferences } from '../stores/preferencesStore';

/** The head bearing in words, e.g. "Head turned 23 degrees right". */
export function headBearingText(yawDegrees: number): string {
  const degrees = Math.round(Math.abs(yawDegrees));
  if (degrees === 0) {
    return 'Facing straight ahead';
  }
  return `Head turned ${degrees} degree${degrees === 1 ? '' : 's'} ${yawDegrees > 0 ? 'right' : 'left'}`;
}

const STATUS_TEXT: Record<HeadTrackingStatus, string> = {
  off: 'Off.',
  waiting: 'Waiting for the motion sensor.',
  tracking: 'Tracking.',
  paused: 'Head tracking paused. Recenter to resume, or turn back to where you were facing.',
  'no-readings': 'No motion readings yet.',
  blocked: 'Motion access was not allowed.',
};

/**
 * Head tracking in the Sounds preferences: the controls where the device has
 * (or may have, once allowed) a motion sensor, or while it is on; "Check
 * again" once a check found none; nothing while the first check runs.
 */
const HeadTrackingControls: React.FC = () => {
  const enabled = usePreferences((state) => state.sound.headTracking);
  const sensor = useHeadTrackingStore((state) => state.sensor);
  const status = useHeadTrackingStore((state) => state.status);
  const yawDegrees = useHeadTrackingStore((state) => state.yawDegrees);
  const checkAgainRef = useRef<HTMLButtonElement>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);
  /** "Check again" had focus when the sensor turned up, so its replacement takes it. */
  const focusCheckbox = useRef(false);

  useEffect(() => {
    if (sensor === 'available' && focusCheckbox.current) {
      focusCheckbox.current = false;
      checkboxRef.current?.focus();
    }
  }, [sensor]);

  if (!enabled && (sensor === 'none' || sensor === 'checking')) {
    return (
      <fieldset className="head-tracking">
        <legend>Head tracking</legend>
        <p>{sensor === 'checking' ? 'Checking for a motion sensor.' : 'No motion sensor found.'}</p>
        <button
          ref={checkAgainRef}
          type="button"
          onClick={() => headTracking.checkSensorAgain()}
          onBlur={() => {
            focusCheckbox.current = false;
          }}
          onFocus={() => {
            focusCheckbox.current = true;
          }}
        >
          Check again
        </button>
      </fieldset>
    );
  }

  if (!enabled && sensor !== 'available' && sensor !== 'needs-permission') {
    return null;
  }

  const askAgain = status === 'blocked' || (enabled && status === 'no-readings' && sensor !== 'available');

  return (
    <fieldset className="head-tracking">
      <legend>Head tracking</legend>
      <label>
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={enabled}
          aria-describedby="head-tracking-help"
          onChange={(event) => {
            if (event.target.checked) {
              // Called straight from the click: iOS asks for motion access only inside a gesture.
              void headTracking.enable();
            } else {
              headTracking.disable();
            }
          }}
        />
        Turn the sound scene with this device
      </label>
      <p id="head-tracking-help" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9em' }}>
        With headphones, hold or wear the device so it turns with your head: sounds stay where they
        are in the world as you turn. Recenter, or Alt+Shift+O, makes the way you face now straight
        ahead. Turn your whole body or the phone to look around; tilting it sideways while it is
        tipped forward also turns the sound a little.
      </p>
      {enabled && (
        <button type="button" onClick={() => headTracking.recenter()}>
          Recenter
        </button>
      )}
      {askAgain && (
        <button type="button" onClick={() => void headTracking.enable()}>
          Allow motion access
        </button>
      )}
      <p>
        Status: {STATUS_TEXT[status]}
        {status === 'tracking' && ` ${headBearingText(yawDegrees)}.`}
      </p>
    </fieldset>
  );
};

export default HeadTrackingControls;

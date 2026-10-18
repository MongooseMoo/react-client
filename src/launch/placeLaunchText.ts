import { announce } from '@react-aria/live-announcer';
import { focusCommandInput } from '../inputFocus';
import { useInputStore } from '../stores/inputStore';
import { usePersonalDataStore } from '../stores/personalDataStore';

/**
 * The launched draft while it still needs keeping. Connecting and signing in
 * clear the command input (it belonged to the previous owner), and a launch
 * usually lands just before both. A launched draft came from outside and
 * belongs to nobody, so it is put back after each such clear, until the player
 * types over it, sends anything, or has signed in.
 */
let kept: string | undefined;
let watching = false;

function watch(): void {
  if (watching) return;
  watching = true;
  usePersonalDataStore.subscribe((state) => {
    if (kept === undefined) return;
    if (useInputStore.getState().text === '') useInputStore.getState().setText(kept);
    if (state.owner) kept = undefined;
  });
  useInputStore.subscribe((state) => {
    if (kept !== undefined && state.text !== '' && state.text !== kept) kept = undefined;
  });
}

/**
 * Puts text from a link or a share in the command input as a draft and moves
 * focus there. It is never sent: the player reads it and presses Enter, or not.
 */
export function placeLaunchText(text: string): void {
  watch();
  const input = useInputStore.getState();
  const replaced = input.text.trim() !== '' && input.text !== text;
  input.setText(text);
  focusCommandInput();
  announce(
    `${replaced ? 'Your draft was replaced. ' : ''}Command input: ${text}. Not sent; press Enter to send it.`,
    'polite',
  );
  kept = usePersonalDataStore.getState().owner ? undefined : text;
}

/** The player sent a command; a launched draft is theirs now, and no longer put back. */
export function noteCommandSent(): void {
  kept = undefined;
}

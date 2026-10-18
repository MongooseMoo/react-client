/**
 * While a voice command is listening, the client's own speech would be heard
 * by the microphone and taken as the command. Holders suspend it; the client's
 * speech producers drop what they would have said until every hold is released.
 * The screen reader's speech is outside the page's control.
 */
let holds = 0;

/**
 * Keep the client quiet until the returned release is called. It does not stop
 * speech already playing: store the release first, then cancel, so a
 * cancellation that re-enters the caller can still release the hold.
 */
export function suspendClientSpeech(): () => void {
  holds++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds--;
  };
}

export function clientSpeechSuspended(): boolean {
  return holds > 0;
}

import { create } from 'zustand';
import { useInputStore } from './inputStore';
import { useOutputStore } from './outputStore';

export interface PersonalDataOwner {
  runtime: string;
  playerUuid: string;
  playerRef: string;
}

export function ownerKey(owner: PersonalDataOwner): string {
  return JSON.stringify([owner.runtime, owner.playerUuid, owner.playerRef]);
}

interface PersonalDataState {
  owner?: PersonalDataOwner;
  reconnectingIdentity?: PersonalDataOwner;
  visitor: boolean;
  visitorWindow: boolean;
  policyReady: boolean;
  gameSessionId: string;
  identityState: 'unconfirmed' | 'confirmed' | 'reconnecting' | 'forgotten';
  forgetEpoch: number;
  confirm: (owner: PersonalDataOwner) => void;
  clear: (reason?: 'reconnect' | 'identity-change') => void;
  forget: () => void;
  /** Starts a connection while preserving a pending launch and same-owner draft. */
  clearForConnect: () => void;
  setVisitor: (visitor: boolean) => void;
}

/**
 * Output and input on screen belonged to the previous owner. `forNewOwner`
 * marks the resets where nobody's data is being protected from anyone yet (a
 * connection starting, a sign-in with nobody before), which a draft from a launch link
 * survives (see launch/placeLaunchText). Sign-out and visitor changes are
 * privacy clears and discard everything.
 */
function clearTransientData(forNewOwner: boolean): void {
  useOutputStore.getState().reset();
  if (forNewOwner) useInputStore.getState().discardForNewOwner();
  else useInputStore.getState().clear();
}

export const usePersonalDataStore = create<PersonalDataState>((set, get) => ({
  visitor: false,
  visitorWindow: false,
  policyReady: false,
  gameSessionId: '',
  identityState: 'unconfirmed',
  forgetEpoch: 0,
  confirm(owner) {
    const previous = get().owner;
    if (previous && ownerKey(previous) === ownerKey(owner) && get().identityState === 'confirmed')
      return;
    clearTransientData(!previous);
    set({ owner, reconnectingIdentity: undefined, identityState: 'confirmed' });
  },
  clear(reason = 'identity-change') {
    if (reason !== 'reconnect') {
      get().forget();
      return;
    }
    clearTransientData(true);
    set({
      owner: undefined,
      reconnectingIdentity: get().owner ?? get().reconnectingIdentity,
      identityState: 'reconnecting',
    });
  },
  forget() {
    clearTransientData(false);
    set({
      owner: undefined,
      reconnectingIdentity: undefined,
      identityState: 'forgotten',
      forgetEpoch: get().forgetEpoch + 1,
    });
  },
  clearForConnect() { get().clear('reconnect'); },
  setVisitor(visitor) {
    if (visitor === get().visitor) return;
    clearTransientData(false);
    set({ visitor });
  },
}));

export function personalStorageKey(
  kind: string,
  owner = usePersonalDataStore.getState().owner,
): string | undefined {
  const policy = usePersonalDataStore.getState();
  return owner && policy.policyReady && !policy.visitor
    ? `mongoose:personal:v2:${kind}:${ownerKey(owner)}`
    : undefined;
}

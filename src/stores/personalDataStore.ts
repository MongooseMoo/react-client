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
  reconnectingOwner?: PersonalDataOwner;
  visitor: boolean;
  visitorWindow: boolean;
  policyReady: boolean;
  gameSessionId: string;
  /** Counts `clearForConnect` calls, so a watcher can tell each new connection apart. */
  connects: number;
  confirm: (owner: PersonalDataOwner) => void;
  /** Forgets the owner and everything of theirs on screen: sign-out. */
  clear: () => void;
  /**
   * A new connection starts with nobody signed in yet. What is on screen stays
   * until a different player signs in.
   */
  clearForConnect: () => void;
  setVisitor: (visitor: boolean) => void;
}

/**
 * Output and input on screen belonged to the previous owner. `forNewOwner`
 * marks the resets where nobody's data is being protected from anyone yet (a
 * sign-in on a new connection), which a draft from a launch link
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
  connects: 0,
  confirm(owner) {
    const { owner: current, reconnectingOwner } = get();
    if (current && ownerKey(current) === ownerKey(owner)) return;
    const previous = current ?? reconnectingOwner;
    // Switching from one owner to another protects the first from the second.
    if (!previous || ownerKey(previous) !== ownerKey(owner)) clearTransientData(!current);
    set({ owner, reconnectingOwner: undefined });
  },
  clear() { clearTransientData(false); set({ owner: undefined, reconnectingOwner: undefined }); },
  clearForConnect() {
    set({ owner: undefined, reconnectingOwner: get().owner ?? get().reconnectingOwner, connects: get().connects + 1 });
  },
  setVisitor(visitor) {
    if (visitor === get().visitor) return;
    clearTransientData(false);
    set({ visitor, reconnectingOwner: undefined });
  },
}));

export function personalStorageKey(kind: string, owner = usePersonalDataStore.getState().owner): string | undefined {
  const policy = usePersonalDataStore.getState();
  return owner && policy.policyReady && !policy.visitor ? `mongoose:personal:v2:${kind}:${ownerKey(owner)}` : undefined;
}

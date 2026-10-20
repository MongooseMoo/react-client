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
  confirm: (owner: PersonalDataOwner) => void;
  /** Forgets the owner and everything of theirs on screen: sign-out. */
  clear: () => void;
  /** Forgets the owner because a new connection starts; it has nobody signed in yet. */
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
  confirm(owner) {
    const previous = get().owner;
    if (previous && ownerKey(previous) === ownerKey(owner)) return;
    // Switching from one owner to another protects the first from the second.
    clearTransientData(!previous);
    set({ owner, reconnectingOwner: undefined });
  },
  clear() { clearTransientData(false); set({ owner: undefined, reconnectingOwner: undefined }); },
  clearForConnect() {
    // Deliver the last transport's queued lines before output takes its snapshot.
    useOutputStore.getState().flush();
    const reconnectingOwner = get().owner ?? get().reconnectingOwner;
    clearTransientData(true);
    set({ owner: undefined, reconnectingOwner });
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

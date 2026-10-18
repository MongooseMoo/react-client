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
  setVisitor: (visitor: boolean) => void;
}

function clearTransientData(): void {
  useOutputStore.getState().reset();
  useInputStore.getState().clear();
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
    clearTransientData();
    set({ owner, reconnectingIdentity: undefined, identityState: 'confirmed' });
  },
  clear(reason = 'identity-change') {
    if (reason !== 'reconnect') {
      get().forget();
      return;
    }
    clearTransientData();
    set({
      owner: undefined,
      reconnectingIdentity: get().owner ?? get().reconnectingIdentity,
      identityState: 'reconnecting',
    });
  },
  forget() {
    clearTransientData();
    set({
      owner: undefined,
      reconnectingIdentity: undefined,
      identityState: 'forgotten',
      forgetEpoch: get().forgetEpoch + 1,
    });
  },
  setVisitor(visitor) {
    if (visitor === get().visitor) return;
    clearTransientData();
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

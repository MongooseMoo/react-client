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
  visitor: boolean;
  visitorWindow: boolean;
  policyReady: boolean;
  gameSessionId: string;
  confirm: (owner: PersonalDataOwner) => void;
  clear: () => void;
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
  confirm(owner) {
    const previous = get().owner;
    if (previous && ownerKey(previous) === ownerKey(owner)) return;
    clearTransientData();
    set({ owner });
  },
  clear() { clearTransientData(); set({ owner: undefined }); },
  setVisitor(visitor) {
    if (visitor === get().visitor) return;
    clearTransientData();
    set({ visitor });
  },
}));

export function personalStorageKey(kind: string, owner = usePersonalDataStore.getState().owner): string | undefined {
  const policy = usePersonalDataStore.getState();
  return owner && policy.policyReady && !policy.visitor ? `mongoose:personal:v2:${kind}:${ownerKey(owner)}` : undefined;
}

import { createStore } from 'zustand/vanilla';
import {
  newComposition,
  updateComposition,
  undoComposition,
  redoComposition,
  type CompositionDraft,
  type CompositionHistory,
} from '../composition/model';
import { CompositionStorage, validateDraft, type SavedComposition } from '../composition/storage';
import type { CompositionCapture } from '../composition/capture';
export interface PendingCapture {
  result: ReturnType<CompositionCapture['finish']>;
  overdub: boolean;
}
interface PrivateDraft {
  history: CompositionHistory;
  selectedPatternId: string;
  selectedPartId: string;
  pendingTake?: PendingCapture;
}
interface ComposerState {
  history: CompositionHistory;
  selectedPatternId: string;
  selectedPartId: string;
  saved: readonly SavedComposition[];
  owner?: string;
  confirmedOwner?: string;
  pendingTake?: PendingCapture;
  busy: boolean;
  status: string;
  error: string;
  setOwner(owner?: string, confirmedIdentity?: string): void;
  setPendingTake(take?: PendingCapture): void;
  edit(change: (draft: CompositionDraft) => CompositionDraft): boolean;
  selectPattern(id: string): void;
  selectPart(id: string): void;
  replaceDraft(draft: CompositionDraft): void;
  newDraft(): void;
  undo(): void;
  redo(): void;
  save(): Promise<void>;
  load(id: string): Promise<void>;
  removeSaved(id: string): Promise<void>;
  report(status: string, error?: string): void;
}
export function createComposerStore() {
  let ownerEpoch = 0;
  let storage: CompositionStorage | undefined;
  // At most four previous confirmed identities remain private to this editor/client.
  const privateDrafts = new Map<string, PrivateDraft>();
  const first = newComposition();
  return createStore<ComposerState>((set, get) => ({
    history: { present: first, past: [], future: [] },
    selectedPatternId: first.patterns[0].id,
    selectedPartId: first.parts[0].id,
    saved: [],
    busy: false,
    status: 'Local draft',
    error: '',
    setOwner(owner, identity = owner) {
      if (get().owner === owner && (!identity || get().confirmedOwner === identity)) return;
      const epoch = ++ownerEpoch;
      storage = owner ? new CompositionStorage(owner) : undefined;
      if (!identity) {
        set({
          owner: undefined,
          saved: [],
          busy: false,
          error: '',
          status: 'Draft retained in memory. Reconnect to the same character to save.',
        });
        return;
      }
      const current = get(),
        previousOwner = current.confirmedOwner;
      let next: PrivateDraft = current;
      if (previousOwner && previousOwner !== identity) {
        const restored = privateDrafts.get(identity);
        privateDrafts.delete(identity);
        privateDrafts.delete(previousOwner);
        privateDrafts.set(previousOwner, {
          history: current.history,
          selectedPatternId: current.selectedPatternId,
          selectedPartId: current.selectedPartId,
          pendingTake: current.pendingTake,
        });
        while (privateDrafts.size > 4) {
          const oldest = privateDrafts.keys().next().value;
          if (oldest !== undefined) privateDrafts.delete(oldest);
        }
        const draft = newComposition();
        next = restored ?? {
          history: { present: draft, past: [], future: [] },
          selectedPatternId: draft.patterns[0].id,
          selectedPartId: draft.parts[0].id,
        };
      }
      set({
        history: next.history,
        selectedPatternId: next.selectedPatternId,
        selectedPartId: next.selectedPartId,
        pendingTake: next.pendingTake,
        owner,
        confirmedOwner: identity,
        saved: [],
        busy: false,
        error: '',
        status: !owner
          ? 'Draft retained in memory. Saving is unavailable for this identity.'
          : previousOwner === identity
            ? 'Reconnected. Unsaved draft retained.'
            : 'Local drafts belong to this character.',
      });
      if (storage)
        void storage
          .list()
          .then((saved) => {
            if (epoch === ownerEpoch) set({ saved });
          })
          .catch((error) => {
            if (epoch === ownerEpoch)
              set({ error: error instanceof Error ? error.message : String(error) });
          });
    },
    setPendingTake(pendingTake) {
      set({ pendingTake });
    },
    edit(change) {
      try {
        const next = change(get().history.present);
        validateDraft(next);
        set({
          history: updateComposition(get().history, next, true),
          status: 'Unsaved local changes',
          error: '',
        });
        return true;
      } catch (error) {
        set({ error: error instanceof Error ? error.message : String(error) });
        return false;
      }
    },
    selectPattern(id) {
      if (get().history.present.patterns.some((pattern) => pattern.id === id))
        set({ selectedPatternId: id });
    },
    selectPart(id) {
      if (get().history.present.parts.some((part) => part.id === id)) set({ selectedPartId: id });
    },
    replaceDraft(draft) {
      validateDraft(draft);
      set({
        history: { present: draft, past: [], future: [] },
        selectedPatternId: draft.patterns[0]?.id ?? '',
        selectedPartId: draft.parts[0]?.id ?? '',
        status: 'Local draft loaded',
        error: '',
      });
    },
    newDraft() {
      get().replaceDraft(newComposition());
    },
    undo() {
      set({ history: undoComposition(get().history), status: 'Undone', error: '' });
    },
    redo() {
      set({ history: redoComposition(get().history), status: 'Redone', error: '' });
    },
    async save() {
      const currentStorage = storage,
        epoch = ownerEpoch,
        draft = get().history.present;
      if (!currentStorage) {
        set({ error: 'Sign in before saving local compositions.' });
        return;
      }
      set({ busy: true, error: '' });
      try {
        await currentStorage.save(draft);
        const saved = await currentStorage.list();
        if (epoch === ownerEpoch)
          set({
            saved,
            busy: false,
            status:
              get().history.present === draft
                ? 'Saved on this browser for this character.'
                : 'Saved the earlier version; newer edits are unsaved.',
          });
      } catch (error) {
        if (epoch === ownerEpoch)
          set({ busy: false, error: error instanceof Error ? error.message : String(error) });
      }
    },
    async load(id) {
      const currentStorage = storage,
        epoch = ownerEpoch,
        previous = get().history.present;
      if (!currentStorage) return;
      set({ busy: true, error: '' });
      try {
        const draft = await currentStorage.load(id);
        if (epoch !== ownerEpoch) return;
        set({ busy: false });
        if (get().history.present !== previous) {
          set({ error: 'Load cancelled because the draft changed.' });
          return;
        }
        if (draft) get().replaceDraft(draft);
        else set({ error: 'That saved draft no longer exists.' });
      } catch (error) {
        if (epoch === ownerEpoch)
          set({ busy: false, error: error instanceof Error ? error.message : String(error) });
      }
    },
    async removeSaved(id) {
      const currentStorage = storage,
        epoch = ownerEpoch;
      if (!currentStorage) return;
      set({ busy: true, error: '' });
      try {
        await currentStorage.remove(id);
        const saved = await currentStorage.list();
        if (epoch === ownerEpoch)
          set({
            saved,
            busy: false,
            status: 'Deleted the saved copy; the open draft is unchanged.',
          });
      } catch (error) {
        if (epoch === ownerEpoch)
          set({ busy: false, error: error instanceof Error ? error.message : String(error) });
      }
    },
    report(status, error = '') {
      set({ status, error });
    },
  }));
}

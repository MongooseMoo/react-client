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
interface ComposerState {
  history: CompositionHistory;
  selectedPatternId: string;
  selectedPartId: string;
  saved: readonly SavedComposition[];
  owner?: string;
  busy: boolean;
  status: string;
  error: string;
  setOwner(owner?: string): void;
  edit(change: (draft: CompositionDraft) => CompositionDraft): void;
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
  const first = newComposition();
  return createStore<ComposerState>((set, get) => ({
    history: { present: first, past: [], future: [] },
    selectedPatternId: first.patterns[0].id,
    selectedPartId: first.parts[0].id,
    saved: [],
    busy: false,
    status: 'Local draft',
    error: '',
    setOwner(owner) {
      if (get().owner === owner) return;
      const epoch = ++ownerEpoch,
        draft = newComposition();
      storage = owner ? new CompositionStorage(owner) : undefined;
      set({
        owner,
        saved: [],
        busy: false,
        error: '',
        status: owner ? 'Local drafts belong to this character.' : 'Sign in to save local drafts.',
        history: { present: draft, past: [], future: [] },
        selectedPatternId: draft.patterns[0].id,
        selectedPartId: draft.parts[0].id,
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
    edit(change) {
      try {
        const next = change(get().history.present);
        validateDraft(next);
        set({
          history: updateComposition(get().history, next, true),
          status: 'Unsaved local changes',
          error: '',
        });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : String(error) });
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

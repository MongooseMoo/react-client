import { create } from 'zustand';
import type { PropertyDetail, PropertyResult, PropertyRow, PropertyValue } from '../gmcp/Object/Properties';

interface PropertyBrowserState {
  target: string;
  targetName: string;
  rows: PropertyRow[];
  total: number;
  offset: number;
  listed: boolean;
  detail: PropertyDetail | null;
  draft: PropertyValue | null;
  ownerDraft: string;
  flagsDraft: string;
  busy: boolean;
  message: string;
  error: boolean;
  resetCount: number;
  detailCount: number;
  begin: () => void;
  fail: (message: string) => void;
  accept: (result: PropertyResult) => void;
  edit: (draft: PropertyValue) => void;
  editMetadata: (owner: string, flags: string) => void;
  cancel: () => void;
  reset: () => void;
}

const empty = {
  target: '', targetName: '', rows: [], total: 0, offset: 0, listed: false,
  detail: null, draft: null, ownerDraft: '', flagsDraft: '', busy: false, message: '', error: false,
};

/** Current authoritative view and unsaved draft only. Property data is never persisted. */
export const usePropertyBrowserStore = create<PropertyBrowserState>((set) => ({
  ...empty,
  resetCount: 0,
  detailCount: 0,
  begin: () => set({ busy: true, message: '', error: false }),
  fail: (message) => set({ busy: false, message, error: true }),
  accept: (result) => set((state) => {
    if (!result.ok) return { busy: false, message: result.message, error: true };
    const shared = { busy: false, message: result.message, error: false, target: result.target, targetName: result.targetName };
    if (result.operation === 'List') return { ...shared, rows: result.rows ?? [], total: result.total ?? 0, offset: result.offset ?? 0, listed: true, detail: null, draft: null };
    const detail = result.detail;
    if (!detail) return { busy: false, error: true, message: 'The server returned no property details.' };
    return {
      ...shared, detail, draft: detail.value, ownerDraft: detail.owner, flagsDraft: detail.flags,
      detailCount: state.detailCount + (result.operation === 'Get' ? 1 : 0),
      rows: state.rows.map((row) => row.name === detail.name ? detail : row),
    };
  }),
  edit: (draft) => set({ draft }),
  editMetadata: (ownerDraft, flagsDraft) => set({ ownerDraft, flagsDraft }),
  cancel: () => set({ detail: null, draft: null, message: '', error: false }),
  reset: () => set((state) => ({ ...empty, resetCount: state.resetCount + 1 })),
}));

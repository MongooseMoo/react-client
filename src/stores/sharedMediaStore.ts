import { create } from 'zustand';
import type { SharedMediaPresentation } from '../audio/SharedMediaService';
export const useSharedMediaStore = create<{
  sources: Readonly<Record<string, SharedMediaPresentation>>;
}>(() => ({ sources: {} }));
export function updateSharedMediaPresentation(
  value: SharedMediaPresentation | { key: string; removed: true },
): void {
  useSharedMediaStore.setState((state) => {
    const sources = { ...state.sources };
    if ('removed' in value) delete sources[value.key];
    else sources[value.key] = value;
    return { sources };
  });
}

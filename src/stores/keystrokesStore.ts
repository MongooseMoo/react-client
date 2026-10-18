import { create } from "zustand";
import {
  type Chord,
  chordsEqual,
  isTypingChord,
  matchesEvent,
  parseChord,
} from "../keystrokeChords";
import { reservedReason } from "../reservedShortcuts";
import type { KeystrokeOverrides } from "./preferencesStore";

/** One binding as the server sent it, with defaults filled in. */
export interface KeystrokeBinding {
  key: string;
  modifiers: string[];
  command: string;
  /** Older `Bind` messages may leave it out. */
  label?: string;
  autosend: boolean;
}

export interface KeystrokeLayer {
  id: string;
  label: string;
  modal: boolean;
  bindings: KeystrokeBinding[];
}

export interface ResolvedBinding {
  binding: KeystrokeBinding;
  /** The key that fires it: the player's choice if any, else the server's. */
  chord?: Chord;
  /** Why it is not installed. */
  unavailable?: string;
  /** The player chose this key. */
  changed: boolean;
}

interface KeystrokesState {
  /** In arrival order; the last one wins a key two layers bind. */
  layers: KeystrokeLayer[];
  keysMode: boolean;
  /** Adds or replaces a layer; true when its id is new. */
  putLayer: (layer: KeystrokeLayer) => boolean;
  /** Replaces a layer where it stands, or adds it at the end. */
  updateLayer: (layer: KeystrokeLayer) => void;
  removeLayer: (id: string) => KeystrokeLayer | undefined;
  clearLayers: () => void;
  setKeysMode: (on: boolean) => void;
}

export const useKeystrokesStore = create<KeystrokesState>((set, get) => ({
  layers: [],
  keysMode: false,
  putLayer: (layer) => {
    const others = get().layers.filter((existing) => existing.id !== layer.id);
    const isNew = others.length === get().layers.length;
    set({ layers: [...others, layer] });
    return isNew;
  },
  updateLayer: (layer) => {
    const { layers } = get();
    set({
      layers: layers.some((existing) => existing.id === layer.id)
        ? layers.map((existing) => (existing.id === layer.id ? layer : existing))
        : [...layers, layer],
    });
  },
  removeLayer: (id) => {
    const removed = get().layers.find((layer) => layer.id === id);
    if (removed) set({ layers: get().layers.filter((layer) => layer !== removed) });
    return removed;
  },
  clearLayers: () => set({ layers: [], keysMode: false }),
  setKeysMode: (keysMode) => set({ keysMode }),
}));

export function bindingLabel(binding: KeystrokeBinding): string {
  return binding.label ?? binding.command;
}

export function resolveLayer(layer: KeystrokeLayer, overrides: KeystrokeOverrides): ResolvedBinding[] {
  return layer.bindings.map((binding) => {
    const override = overrides[layer.id]?.[binding.command];
    const parsed = override
      ? parseChord(override.key, override.modifiers)
      : parseChord(binding.key, binding.modifiers);
    const changed = override !== undefined;
    if (!parsed.chord) return { binding, unavailable: parsed.error, changed };
    return { binding, chord: parsed.chord, unavailable: reservedReason(parsed.chord), changed };
  });
}

/** The binding a key press fires, if any: the newest layer first, the last binding in a layer first. */
export function findBinding(
  layers: readonly KeystrokeLayer[],
  overrides: KeystrokeOverrides,
  keysMode: boolean,
  event: KeyboardEvent,
): ResolvedBinding | undefined {
  if (event.repeat) return undefined;
  for (const layer of [...layers].reverse()) {
    const found = resolveLayer(layer, overrides)
      .reverse()
      .find(
        ({ chord, unavailable }) =>
          chord !== undefined &&
          unavailable === undefined &&
          (keysMode || !isTypingChord(chord)) &&
          matchesEvent(chord, event),
      );
    if (found) return found;
  }
  return undefined;
}

/** Why `chord` cannot be given to a layer's binding, or nothing when it is free. */
export function keyTakenBy(
  layers: readonly KeystrokeLayer[],
  overrides: KeystrokeOverrides,
  chord: Chord,
  layerId: string,
  command: string,
): string | undefined {
  const reserved = reservedReason(chord);
  if (reserved) return reserved;
  for (const layer of layers) {
    for (const resolved of resolveLayer(layer, overrides)) {
      if (layer.id === layerId && resolved.binding.command === command) continue;
      if (resolved.chord && chordsEqual(resolved.chord, chord)) {
        return `${layer.label}: ${bindingLabel(resolved.binding)}`;
      }
    }
  }
  return undefined;
}

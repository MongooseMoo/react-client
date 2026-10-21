# feat/auto-midi: make MIDI automatic

## Goal
MOO MIDI plays without the user setting anything up:
1. `midi.enabled` defaults to true; a storage migration turns it on once for old saved prefs, then the user's choice sticks.
2. When a MIDI message arrives from the MOO (`src/gmcp/Client/Midi.ts`), connect an output if none is connected and the user did not disconnect on purpose: saved `lastOutputDeviceId` if it is in the device list, otherwise `SOUNDFONT_OUTPUT`. One in-flight connect shared by concurrent notes.
3. Report whether `JZZ()` calls `navigator.requestMIDIAccess`; avoid initializing JZZ on the soundfont path.

## State
- Worktree `C:\Users\Q\code\react-client-auto-midi`, branch `feat/auto-midi` off origin/master b26b4bd4.
- Worktree had no node_modules; ran `npm ci` (lockfile identical to main checkout's).
- Done: tests written first and seen failing (Midi.test.ts 5 failed; preferencesStore.test.ts 3 failed), then implemented; both files pass (29 tests). Full suite/typecheck left to PR CI.
- `preferencesStore.ts`: STORAGE_VERSION 3 (131), default `midi.enabled: true` (155), migration `storedVersion < 3` sets `midi.enabled = true` (214-216).
- PR #202 open. Second commit: midi-tab gets `mountOnSelect: true` (sidebar.tsx:220), like haptics (228). Test in sidebar.test.tsx shows MidiStatus is not mounted until the MIDI tab is clicked (failed before the change, passes after).
- `Midi.ts`: `loadMidiOutput()` (128-136) shares one `outputConnecting` promise (96); `connectAutomaticOutput()` (138-149) picks saved output or `SOUNDFONT_OUTPUT`. Used by `handleNoteAsync` (291) and `sendRawToOutput` (346, renamed from `sendRawIfOutputConnected`).

## Decisions and why
- Soundfont path skips `ensureInitialized()`: `connectOutputDevice(SOUNDFONT_OUTPUT)` (MidiService.ts:293-319) never touches `this.jzz`, and `JZZ()` reaches `navigator.requestMIDIAccess` (see Surprises). JZZ is only initialized when the saved output is something other than the soundfont (a hardware port needs JZZ to appear in the device list).
- The in-flight promise is cleared when it settles, so a failed connect is retried by the next message rather than never.

## Surprises
- JZZ 1.9.6 (`node_modules/jzz/javascript/JZZ.js`): `JZZ()` (1342-1345) runs `_initJZZ` (812-818), which tries engines `node, extension, plugin, webmidi` (790); the webmidi engine `_tryWebMIDI` (697-714) calls `_requestMIDIAccess.call(_navigator, {})` (709), i.e. `navigator.requestMIDIAccess` (688-690).
- `MidiStatus` (the MIDI sidebar tab) calls `midiPackage.ensureInitialized()` on mount when MIDI is enabled (MidiStatus.tsx:219-223), and the midi tab has no `mountOnSelect` (sidebar.tsx:212-221, tabs.tsx:139), so with MIDI on by default JZZ was still initialized when the sidebar rendered. The coordinator ruled to add `mountOnSelect: true`; done in the second commit. Selecting the MIDI tab still initializes JZZ, which is expected (it lists hardware ports).
- Saved `virtual-synth` only appears in `getOutputDevices()` once `virtualMidiService.initialized` (MidiService.ts:172); otherwise the auto-connect falls back to the soundfont, per the plan's "in the device list" rule.

## Next step
Read PR #202's CI result.

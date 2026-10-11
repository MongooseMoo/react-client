# Tinysynth fork swap (branch feature/tinysynth-fork)

Goal: steps 1-3
1. dep github:xrnavigation/webaudio-tinysynth#v1.2.0, drop jzz-synth-tiny
2. VirtualMidiService owns WebAudioTinySynth on cacophony's context; MidiService output = sink interface {send, close}
3. GMCP note duration -> scheduled time on audio clock instead of setTimeout

Findings:
- jzz-synth-tiny embeds 2022 tinysynth, own AudioContext via JZZ.lib.getAudioContext
- virtual synth id 'virtual-synth' special-cased in MidiService.connectOutputDevice
- Midi.ts handleNoteAsync uses setTimeout for duration + activeNotes map (cancels pending off on retrigger)
- MidiStatus.tsx polls for virtual synth availability (JZZ has no event)

- fork scheduled noteOff resolves at send time against existing notes: retrigger OK (each note gets own duration);
  explicit early on:false can't cancel an already-scheduled release (note rings until scheduled time). Document in PR.
- cacophony instance = client.media.cacophony (per client); context/globalGainNode need `as unknown as` casts

Done:
- package.json: fork added via github: spec, jzz-synth-tiny removed
- VirtualMidiService rewritten: owns synth, setAudioOutput(), getVirtualPort() -> MidiOutputSink {send, sendAt, close}

- MidiService.scheduleNoteOff, Midi.ts uses it (timer fallback for hardware), App.tsx attaches cacophony output,
  MidiStatus poll removed, @types/jzz-synth-tiny deleted, tests updated. tsc clean, 8 MIDI tests pass.
- User asked: use Edit/Write, not python/sed (saved to memory).

- PR #132 open on react-client.
- Fork fix: issue xrnavigation/webaudio-tinysynth#45 (NO consumer context in fork issues/PRs - user preference).
  Clone in scratchpad/webaudio-tinysynth, branch fix/issue-45-earlier-note-off.
  Fork master already has nt.releaseAt + _releaseNote accepts earlier t; gap = noteOff (nt.f==0) and _allNotesOff (!nt.f).
  Plan: _keyOff(nt,t) helper w/ nt.keyOffAt; tests in test/key-off.test.cjs; npm run build (check:dist); PR "Closes #45";
  then tag v1.2.1? (v1.2.0 is 34 commits behind master) and bump dep in #132, drop limitation note.

- Fork PR xrnavigation/webaudio-tinysynth#46 open (closes #45). 91/91 tests, dist in sync, browser check ok.
- DONE: #46 merged, fork v1.3.0 published (npm version minor, pushed master + tags; Publish workflow green, release created).
  react-client #132 bumped to #v1.3.0 (commit 102834a), PR body updated, limitation removed.
Remaining: manual listen test in browser; merge #132.

(old) Next: MidiService output type -> MidiOutputSink + scheduleNoteOff; Midi.ts use it; App.tsx attach output; MidiStatus drop poll; tests; typecheck; delete src/@types/jzz-synth-tiny

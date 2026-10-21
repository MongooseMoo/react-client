# feat/sf2-synth

## Goal
Replace the MIDI.js soundfont renderer (src/midi/SoundfontOutput.ts) with a
spessasynth_lib WorkletSynthesizer playing one bank, MuseScore_General.sf3, built by
scripts/build-soundbank.mjs from MuseScore_General.sf2 (MIT). Remove the three
MIDI.js sets and the font picker. PR against master.

## State
- package.json pins spessasynth_core 4.3.22, spessasynth_lib 4.3.14, stb-vorbis 0.0.6
  (npm `latest` on 2026-10-20; `npm ls` shows the nested "latest" deps deduped onto these).
- scripts/build-soundbank.mjs written; first run in progress (quality 6).
  Source and outputs live in the session scratchpad (source/, bank/), never the repo.
- Client: SoundfontOutput.test.ts rewritten (red: 8/8 failed on the old renderer);
  SoundfontOutput.ts rewritten on WorkletSynthesizer; soundfonts.ts cut to
  SOUNDFONT_OUTPUT + SOUNDFONT_NAME. Green 8/8. Done: MidiService.ts, preferencesStore.ts
  (+test), preferences.tsx, MidiStatus.tsx card (+css), programs.ts and
  SoundfontPicker.{tsx,css} deleted, vite.config.ts globIgnores, check-soundfonts.mjs
  (fixture = core sample bank; first download 503 -> "could not load", Reconnect -> "ready"),
  docs/GMCP/packages/client-midi.md. Still to do: refactor pass, gate output, commit/PR.
  check-soundfonts.mjs was not run locally (CI runs it; rule: no local CI re-runs).

## Decisions and why
- Coordinator ruling (option 1): this PR removes `midiJsSoundfont` from
  preferencesStore.ts (:9 import, :67 field, :176 normalisation), its test
  (preferencesStore.test.ts:243-247), and the picker in preferences.tsx (:11, :404).
  It does not touch the `enabled` default, STORAGE_VERSION or `migrate` (feat/auto-midi owns those).
  No migration: a leftover `midiJsSoundfont` key is ignored.
- FLAC master is written by core as an SF3-shaped file (compressed flag 0x10, version 3)
  whose sample payloads are FLAC; named MuseScore_General.flac.sf3. Core's own loader
  would try to Vorbis-decode them, so it is a master for rebuilding, not for playback.
- FLAC is encoded to a temp file, not a pipe, so ffmpeg can fill in STREAMINFO.

- ready() resolves once the worklet module is added and the synth exists; the bank
  downloads in the background and messages go to the built-in synth until it loads
  (that is "fallback while the bank loads"). Program/CC/bend sent meanwhile are kept
  (latest per channel/controller) and replayed into the synth on load; after the switch,
  note-offs and CC 64/120/123 also go to the built-in synth so notes it started end.
- addSoundBank never resolves on a bad bank: the worklet posts `soundBankError` instead
  (lib basic_synthesizer_core.ts:386-391, basic_synthesizer.ts:846-848), so load() also
  listens for that event.
- The worklet file is a `?url` asset; vite.config.ts:31 precaches **/*.js and
  optionalChunks.ts:33 only drops chunks, so it needs a globIgnores entry to stay out of
  the service-worker install (402,596 bytes).
- CI runs scripts/check-soundfonts.mjs (build-test.yml:47 via test:audio-cache); it drove
  the MIDI.js renderer and must be rewritten. Offline fixture: core's
  BasicSoundBank.getSampleSoundBankFile() (a real one-preset SF2).

## Surprises
- core basic_sample.ts:170-185: compressSample swallows encoder errors and leaves the
  sample as PCM, so the script gates on `isCompressed` for every sample.
- core basic_sample.ts:173-176: samples under 8 kHz or over 96 kHz get resampled to
  48 kHz before encoding; the structure gate would catch that as a rate/loop mismatch.
- stb-vorbis index.ts:114,141: decode throws until `await StbVorbis.ready`.

## Gate failure (stopped here, nothing committed or pushed)
First full run (quality 6, 8m31s, exit=1), using the script before the describe()
refactor (refactor only folded the duplicated modulator description; not re-run since):
- PASS every sample FLAC-encoded; FLAC master byte-identical 1246/1246; FLAC structure all match.
- PASS every sample Vorbis-encoded; SF3 structure all match (presets 309, generators 11854,
  modulators 1769, loop points 1246).
- FAIL stb-vorbis decoded length: 1243/1246. Decoded vs source samples:
  79 Cello-G#1 37376 vs 37067; 80 Cello-F1 33920 vs 33493; 599 OcarE1 60544 vs 60416.
  Cause not investigated.
- Sizes: MuseScore_General.flac.sf3 95,679,054 B; MuseScore_General.sf3 32,986,146 B.
- Line endings: src/MidiService.ts had mixed CRLF/LF at HEAD; the edit tool rewrote it
  all-CRLF, so `git diff --stat` shows 161 lines where `--ignore-cr-at-eol` shows 9.

## Ruling on the length gate (Q, via coordinator)
Cause per coordinator: ffmpeg's last granule equals the source length and ffmpeg decodes
to it; stb-vorbis 0.0.6's final-frame trim (wasm/stb_vorbis.c:3413-3443) fails. A longer
decode now passes only if (a) offset 0 gives the lowest rms error of all shifts in
[-64, 64] (my reading of "aligns at offset 0"; reported per sample), and (b) every
instrument zone using the sample has sampleModes&3 == 1 and generators 1/12/3/50 all 0
(zone value, else the instrument global zone, else 0). Unused samples fail. Each allowed
exception is printed.

## Next step
Re-run the script end to end; if it passes, commit, push, open the PR.

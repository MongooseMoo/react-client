# Accessible player status (web client)

## Goal

Package B of the hub plan `C:\Users\Q\projects\mongoose\status-todo\plan.md`
(Q's request 2026-10-24, decisions 2026-10-24/25): replace the IRE-string
`VitalsData` with the Char.Vitals meter list, add Char.Effects and
Char.Target; status bar meters (text, not colour only), effect chips, target
meter; Alt+H/M/V/T spoken readouts via `announce()`; Mute and Volume lose
their access keys; status keys yield to the active buffer scheme's letters;
Cacophony oscillator cues (reserve tones, heartbeat bands, spoken warnings at
50/25/10 % on the way down, target blip, effect earcons); Preferences "Status"
tab with per-cue on/off and volume. Nothing else (no sound files, no extra
protocol, no rebindable status keys).

## State

- 2026-10-25: worktree `C:\Users\Q\code\react-client-status`, branch
  `feat/accessible-status` from origin/master 9fa58453.
- Built, with tests beside each piece:
  - `src/stores/characterStatusStore.ts`: meters/metersAt/effects/target,
    `meterValueAt`, `percentOf`, `metersMoving`. Old `VitalsData` deleted.
  - `src/gmcp/Char.ts`: Vitals/Effects/Target handlers write the store; the
    second vitals listener in `createConfiguredClient.ts` deleted.
  - `src/status/statusText.ts`: readout sentences.
  - `src/status/statusCues.ts`: oscillator tones via `createOscillator`.
  - `src/status/statusFeedback.ts`: store diff → cues and warnings; wired in
    `createConfiguredClient.ts` with `registerCleanup`.
  - `src/reservedShortcuts.ts`: owns `navigationKeyMaps`/`matchesNavKey`
    (moved from useChannelHistory), `statusReadoutFor`, key-help reasons;
    m and v left ACCESS_KEYS.
  - `src/hooks/useStatusKeys.ts` mounted in `App.tsx`.
  - `src/components/statusbar.tsx` + CSS; `toolbar.tsx` access keys removed;
    `preferences.tsx` Status tab and Keyboard shortcut text;
    `preferencesStore.ts` `status` section.
- Ran only the touched test files (158 tests passed). Full CI runs on the PR.

## Decisions and why

- One write path: GMCPChar handlers write the store (as Help does).
- Meter values are projected on read from `metersAt`; cues fire only on
  received updates, so regeneration never beeps.
- Reserve tone plays when a reserve moves into another tenth of its max
  (the plan says "step change" without a size).
- Heartbeat: two lub-dub beats on a band change (bands 75/50/25/10), beat
  interval 900 ms down to 300 ms. No continuous loop.
- Pitch: 200 Hz at 0 % to 800 Hz at 100 %, linear.
- The status bar redraws once a second only while some meter is still moving
  by its rate (plan: "the client moves each meter by rate"). Open question for
  the lead: the plan's exclusions say "no new timers/tickers"; I read that as
  the server, but this is a client interval.
- Effects gained/lost are earcons only (the plan's package B); no spoken
  "gained X" line.
- Key help (Alt+Shift+F1) names the status key, or the buffer key when the
  chosen scheme uses H or T; `reservedReason` reads the scheme from prefs.

## Surprises

- Input and output already preventDefault every buffer letter with Alt (h, t
  included) but not m or v; the window-level status handler preventDefaults.
- vitest 1.6 fake timers do not fake `performance` unless asked.

## Next step

Commit, push, write `agent-notes/pr-body.md` (uncommitted), report to lead.
